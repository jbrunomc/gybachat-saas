import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class BillingManager {
  constructor(databaseManager) {
    this.db = databaseManager;
    
    // Configuração do Supabase (modo de teste se não configurado)
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        this.supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY
        );
      } else {
        console.log('⚠️ Supabase não configurado. Usando modo de teste para BillingManager.');
        this.supabase = null;
      }
    } catch (error) {
      console.log('⚠️ Erro ao conectar Supabase. Usando modo de teste para BillingManager.');
      this.supabase = null;
    }
    
    // Inicializar gateways de pagamento
    this.stripe = process.env.STRIPE_SECRET_KEY ? 
      new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    
    this.mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  // ==================== GESTÃO DE PLANOS ====================

  async getPlans(activeOnly = true) {
    try {
      let query = this.supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  async getPlanById(planId) {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      throw error;
    }
  }

  async createPlan(planData) {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .insert([{
          name: planData.name,
          description: planData.description,
          price_monthly: planData.price_monthly,
          price_yearly: planData.price_yearly,
          trial_days: planData.trial_days || 14,
          features: planData.features || [],
          limits: planData.limits || {},
          add_ons: planData.add_ons || {},
          sort_order: planData.sort_order || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  }

  async updatePlan(planId, planData) {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .update({
          ...planData,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  }

  // ==================== GESTÃO DE ASSINATURAS ====================

  async getSubscriptionByCompany(companyId) {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans(*),
          company:companies(*)
        `)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  async createSubscription(subscriptionData) {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert([{
          company_id: subscriptionData.company_id,
          plan_id: subscriptionData.plan_id,
          status: subscriptionData.status || 'trial',
          trial_ends_at: subscriptionData.trial_ends_at,
          current_period_start: subscriptionData.current_period_start || new Date(),
          current_period_end: subscriptionData.current_period_end,
          gateway: subscriptionData.gateway,
          gateway_subscription_id: subscriptionData.gateway_subscription_id,
          gateway_customer_id: subscriptionData.gateway_customer_id,
          payment_method: subscriptionData.payment_method || {}
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar referência na empresa
      await this.supabase
        .from('companies')
        .update({ 
          subscription_id: data.id,
          trial_ends_at: subscriptionData.trial_ends_at 
        })
        .eq('id', subscriptionData.company_id);

      return data;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  async updateSubscriptionStatus(subscriptionId, status, metadata = {}) {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .update({
          status,
          ...metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      throw error;
    }
  }

  // ==================== VERIFICAÇÃO DE LIMITES ====================

  async checkPlanLimits(companyId, resource) {
    try {
      const subscription = await this.getSubscriptionByCompany(companyId);
      if (!subscription || !subscription.plan) {
        throw new Error('Assinatura não encontrada');
      }

      const limits = subscription.plan.limits;
      const currentUsage = await this.getCurrentUsage(companyId);

      const result = {
        allowed: true,
        current: currentUsage[resource] || 0,
        limit: limits[resource] || 0,
        remaining: limits[resource] === -1 ? -1 : (limits[resource] - currentUsage[resource]),
        upgrade_options: {
          add_on_price: subscription.plan.add_ons[`${resource}_extra_price`] || 0,
          next_plan: await this.getNextPlan(subscription.plan_id)
        }
      };

      // Verificar se excedeu o limite (-1 significa ilimitado)
      if (limits[resource] !== -1 && currentUsage[resource] >= limits[resource]) {
        result.allowed = false;
      }

      return result;
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      throw error;
    }
  }

  async getCurrentUsage(companyId) {
    try {
      // Buscar uso atual de usuários
      const { data: users } = await this.supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId)
        .eq('status', 'active');

      // Buscar uso atual de números WhatsApp
      const { data: whatsappNumbers } = await this.supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('company_id', companyId)
        .eq('status', 'connected');

      // Buscar mensagens do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: messages } = await this.supabase
        .from('messages')
        .select('id')
        .eq('company_id', companyId)
        .gte('created_at', startOfMonth.toISOString());

      return {
        users: users?.length || 0,
        whatsapp_numbers: whatsappNumbers?.length || 0,
        messages_month: messages?.length || 0,
        storage_gb: 0 // TODO: Implementar cálculo de storage
      };
    } catch (error) {
      console.error('Erro ao calcular uso atual:', error);
      return {
        users: 0,
        whatsapp_numbers: 0,
        messages_month: 0,
        storage_gb: 0
      };
    }
  }

  async getNextPlan(currentPlanId) {
    try {
      const currentPlan = await this.getPlanById(currentPlanId);
      const { data: nextPlan } = await this.supabase
        .from('plans')
        .select('*')
        .gt('sort_order', currentPlan.sort_order)
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

      return nextPlan;
    } catch (error) {
      return null;
    }
  }

  // ==================== PAGAMENTOS STRIPE ====================

  async createStripeCheckoutSession(companyData, planId, billingPeriod = 'monthly') {
    if (!this.stripe) {
      throw new Error('Stripe não configurado');
    }

    try {
      const plan = await this.getPlanById(planId);
      const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: companyData.admin_email,
        client_reference_id: companyData.company_id || uuidv4(),
        metadata: {
          company_name: companyData.company_name,
          admin_name: companyData.admin_name,
          admin_email: companyData.admin_email,
          plan_id: planId,
          billing_period: billingPeriod
        },
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${plan.name} - ${billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}`,
              description: plan.description
            },
            unit_amount: Math.round(price * 100), // Stripe usa centavos
            recurring: {
              interval: billingPeriod === 'yearly' ? 'year' : 'month'
            }
          },
          quantity: 1
        }],
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
        trial_period_days: plan.trial_days
      });

      return {
        checkout_url: session.url,
        session_id: session.id
      };
    } catch (error) {
      console.error('Erro ao criar sessão Stripe:', error);
      throw error;
    }
  }

  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleStripeCheckoutCompleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleStripePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleStripePaymentFailed(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleStripeSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionDeleted(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar webhook Stripe:', error);
      throw error;
    }
  }

  async handleStripeCheckoutCompleted(session) {
    try {
      const metadata = session.metadata;
      
      // Criar empresa se não existir
      let companyId = metadata.company_id;
      if (!companyId) {
        const company = await this.createCompanyFromCheckout(metadata);
        companyId = company.id;
      }

      // Criar assinatura
      const plan = await this.getPlanById(metadata.plan_id);
      const trialEnd = plan.trial_days > 0 ? 
        new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000) : null;

      const subscription = await this.createSubscription({
        company_id: companyId,
        plan_id: metadata.plan_id,
        status: plan.trial_days > 0 ? 'trial' : 'active',
        trial_ends_at: trialEnd,
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gateway: 'stripe',
        gateway_subscription_id: session.subscription,
        gateway_customer_id: session.customer
      });

      // Registrar pagamento
      await this.recordPayment({
        subscription_id: subscription.id,
        company_id: companyId,
        amount: session.amount_total / 100,
        status: 'paid',
        gateway: 'stripe',
        gateway_payment_id: session.payment_intent,
        description: `Assinatura ${plan.name}`
      });

      return { companyId, subscription };
    } catch (error) {
      console.error('Erro ao processar checkout Stripe:', error);
      throw error;
    }
  }

  // ==================== PAGAMENTOS MERCADOPAGO ====================

  async createMercadoPagoPreference(companyData, planId, billingPeriod = 'monthly') {
    if (!this.mercadoPagoAccessToken) {
      throw new Error('MercadoPago não configurado');
    }

    try {
      const plan = await this.getPlanById(planId);
      const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;

      const preference = {
        items: [{
          title: `${plan.name} - ${billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}`,
          description: plan.description,
          quantity: 1,
          unit_price: price,
          currency_id: 'BRL'
        }],
        payer: {
          email: companyData.admin_email,
          name: companyData.admin_name
        },
        metadata: {
          company_name: companyData.company_name,
          admin_name: companyData.admin_name,
          admin_email: companyData.admin_email,
          plan_id: planId,
          billing_period: billingPeriod,
          company_id: companyData.company_id || uuidv4()
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/checkout/success`,
          failure: `${process.env.FRONTEND_URL}/checkout/cancel`,
          pending: `${process.env.FRONTEND_URL}/checkout/pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`
      };

      const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        preference,
        {
          headers: {
            'Authorization': `Bearer ${this.mercadoPagoAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        preference_id: response.data.id,
        checkout_url: response.data.init_point
      };
    } catch (error) {
      console.error('Erro ao criar preferência MercadoPago:', error);
      throw error;
    }
  }

  // ==================== PROVISIONING AUTOMÁTICO ====================

  async createCompanyFromCheckout(metadata) {
    try {
      const slug = this.generateSlug(metadata.company_name);
      
      const { data: company, error } = await this.supabase
        .from('companies')
        .insert([{
          name: metadata.company_name,
          slug: slug,
          custom_domain: `${slug}.gybachat.com.br`,
          status: 'active',
          settings: {
            created_from_checkout: true,
            admin_email: metadata.admin_email
          }
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar usuário admin
      await this.createAdminUser(company.id, metadata);

      // Criar branding padrão
      await this.createDefaultBranding(company.id);

      return company;
    } catch (error) {
      console.error('Erro ao criar empresa do checkout:', error);
      throw error;
    }
  }

  async createAdminUser(companyId, metadata) {
    try {
      const password = this.generateSecurePassword();
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      const { data: user, error } = await this.supabase
        .from('users')
        .insert([{
          company_id: companyId,
          name: metadata.admin_name,
          email: metadata.admin_email,
          password: hashedPassword,
          role: 'admin',
          permissions: [
            'manage_users', 'manage_campaigns', 'manage_settings',
            'view_all_conversations', 'manage_integrations', 'view_analytics',
            'manage_automations', 'manage_contacts', 'export_data',
            'manage_billing', 'view_admin_dashboard'
          ],
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Enviar email com credenciais
      await this.sendWelcomeEmail({
        to: metadata.admin_email,
        company_name: metadata.company_name,
        admin_name: metadata.admin_name,
        password: password,
        login_url: `https://${companyId}.gybachat.com.br`
      });

      return user;
    } catch (error) {
      console.error('Erro ao criar usuário admin:', error);
      throw error;
    }
  }

  async createDefaultBranding(companyId) {
    try {
      const { data, error } = await this.supabase
        .from('company_branding')
        .insert([{
          company_id: companyId,
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          accent_color: '#06b6d4',
          background_color: '#0f172a',
          surface_color: '#1e293b',
          text_color: '#f1f5f9',
          font_family: 'Inter, sans-serif'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar branding padrão:', error);
      throw error;
    }
  }

  // ==================== UTILITÁRIOS ====================

  generateSlug(companyName) {
    return companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .substring(0, 20) // Limita a 20 caracteres
      .replace(/-$/, ''); // Remove hífen no final
  }

  generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async recordPayment(paymentData) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(emailData) {
    // TODO: Implementar envio de email
    console.log('Email de boas-vindas:', emailData);
  }
}

