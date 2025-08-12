import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// ==================== ROTAS PÚBLICAS (LANDING PAGE) ====================

// Buscar planos ativos para landing page
router.get('/public/plans', generalRateLimit, async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    const plans = await billingManager.getPlans(true);
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos públicos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Criar checkout session
router.post('/public/checkout', generalRateLimit, async (req, res) => {
  try {
    const { plan_id, billing_period, gateway, company_data } = req.body;
    
    // Validar dados obrigatórios
    if (!plan_id || !gateway || !company_data) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    if (!company_data.company_name || !company_data.admin_name || !company_data.admin_email) {
      return res.status(400).json({
        success: false,
        error: 'Dados da empresa incompletos'
      });
    }

    const billingManager = req.app.locals.billingManager;
    let checkoutData;

    if (gateway === 'stripe') {
      checkoutData = await billingManager.createStripeCheckoutSession(
        company_data, 
        plan_id, 
        billing_period
      );
    } else if (gateway === 'mercadopago') {
      checkoutData = await billingManager.createMercadoPagoPreference(
        company_data, 
        plan_id, 
        billing_period
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'Gateway de pagamento não suportado'
      });
    }

    res.json({
      success: true,
      data: checkoutData
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Webhook Stripe
router.post('/public/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const billingManager = req.app.locals.billingManager;
    
    if (!billingManager.stripe) {
      return res.status(400).json({ error: 'Stripe não configurado' });
    }

    const event = billingManager.stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await billingManager.handleStripeWebhook(event);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Stripe:', error);
    res.status(400).json({ error: error.message });
  }
});

// Webhook MercadoPago
router.post('/public/webhook/mercadopago', async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    await billingManager.handleMercadoPagoWebhook(req.body);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no webhook MercadoPago:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS AUTENTICADAS ====================

// Middleware de autenticação para rotas protegidas
router.use(authenticateToken);

// Buscar assinatura da empresa
router.get('/subscription', async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    const subscription = await billingManager.getSubscriptionByCompany(req.user.companyId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Assinatura não encontrada'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar uso atual da empresa
router.get('/usage', async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    const usage = await billingManager.getCurrentUsage(req.user.companyId);
    
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Erro ao buscar uso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar limites para um recurso específico
router.get('/limits/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    const billingManager = req.app.locals.billingManager;
    const limits = await billingManager.checkPlanLimits(req.user.companyId, resource);
    
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error('Erro ao verificar limites:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar histórico de pagamentos
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const billingManager = req.app.locals.billingManager;
    
    const { data: payments, error } = await billingManager.supabase
      .from('payments')
      .select('*')
      .eq('company_id', req.user.companyId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS ADMINISTRATIVAS (MASTER) ====================

// Middleware para verificar permissões de master
const masterOnly = (req, res, next) => {
  if (req.user.userType !== 'master' && !req.user.permissions.includes('all')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado'
    });
  }
  next();
};

// Buscar todos os planos (incluindo inativos)
router.get('/admin/plans', masterOnly, async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    const plans = await billingManager.getPlans(false);
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo plano
router.post('/admin/plans', masterOnly, async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    const plan = await billingManager.createPlan(req.body);
    
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Atualizar plano
router.put('/admin/plans/:id', masterOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const billingManager = req.app.locals.billingManager;
    const plan = await billingManager.updatePlan(id, req.body);
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Buscar todas as assinaturas
router.get('/admin/subscriptions', masterOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const billingManager = req.app.locals.billingManager;
    
    let query = billingManager.supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*),
        company:companies(*)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: subscriptions, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar assinaturas admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar estatísticas de billing
router.get('/admin/stats', masterOnly, async (req, res) => {
  try {
    const billingManager = req.app.locals.billingManager;
    
    // Buscar estatísticas básicas
    const [
      { data: totalSubscriptions },
      { data: activeSubscriptions },
      { data: trialSubscriptions },
      { data: monthlyRevenue }
    ] = await Promise.all([
      billingManager.supabase.from('subscriptions').select('id', { count: 'exact' }),
      billingManager.supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      billingManager.supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'trial'),
      billingManager.supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    const stats = {
      total_subscriptions: totalSubscriptions?.length || 0,
      active_subscriptions: activeSubscriptions?.length || 0,
      trial_subscriptions: trialSubscriptions?.length || 0,
      monthly_revenue: monthlyRevenue?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;

