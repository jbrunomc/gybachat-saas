import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar todas as empresas (admin)
router.get('/', generalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    // Simulação de dados para demonstração
    const mockCompanies = [
      {
        id: 'comp-001',
        name: 'TechSolutions Ltda',
        email: 'contato@techsolutions.com',
        phone: '+55 11 99999-1111',
        document: '12.345.678/0001-90',
        plan: {
          id: 'plan-pro',
          name: 'Professional',
          price: 999.00,
          limits: {
            users: 50,
            whatsapp_numbers: 5,
            messages_per_month: 10000
          }
        },
        usage: {
          users: 12,
          whatsapp_numbers: 2,
          messages_this_month: 3450
        },
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-12-29T14:22:00Z',
        subscription: {
          status: 'active',
          next_billing: '2025-01-15T00:00:00Z',
          payment_method: 'credit_card'
        },
        settings: {
          blocked: false,
          trial_used: true,
          notifications_enabled: true
        }
      },
      {
        id: 'comp-002',
        name: 'E-commerce Plus',
        email: 'admin@ecommerceplus.com',
        phone: '+55 11 88888-2222',
        document: '98.765.432/0001-10',
        plan: {
          id: 'plan-starter',
          name: 'Starter',
          price: 49.90,
          limits: {
            users: 5,
            whatsapp_numbers: 1,
            messages_per_month: 1000
          }
        },
        usage: {
          users: 3,
          whatsapp_numbers: 1,
          messages_this_month: 890
        },
        status: 'active',
        created_at: '2024-02-20T09:15:00Z',
        last_login: '2024-12-28T16:45:00Z',
        subscription: {
          status: 'active',
          next_billing: '2025-02-20T00:00:00Z',
          payment_method: 'pix'
        },
        settings: {
          blocked: false,
          trial_used: false,
          notifications_enabled: true
        }
      },
      {
        id: 'comp-003',
        name: 'Digital Corp',
        email: 'contato@digitalcorp.com',
        phone: '+55 11 77777-3333',
        document: '11.222.333/0001-44',
        plan: {
          id: 'plan-enterprise',
          name: 'Enterprise',
          price: 1999.00,
          limits: {
            users: 200,
            whatsapp_numbers: 20,
            messages_per_month: 50000
          }
        },
        usage: {
          users: 45,
          whatsapp_numbers: 8,
          messages_this_month: 12500
        },
        status: 'blocked',
        created_at: '2024-03-10T11:00:00Z',
        last_login: '2024-12-25T10:30:00Z',
        subscription: {
          status: 'overdue',
          next_billing: '2024-12-10T00:00:00Z',
          payment_method: 'boleto'
        },
        settings: {
          blocked: true,
          trial_used: true,
          notifications_enabled: false
        }
      }
    ];

    // Filtrar por status se especificado
    let filteredCompanies = mockCompanies;
    if (status !== 'all') {
      filteredCompanies = mockCompanies.filter(company => company.status === status);
    }

    // Filtrar por busca se especificado
    if (search) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.email.toLowerCase().includes(search.toLowerCase()) ||
        company.document.includes(search)
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        companies: paginatedCompanies,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: filteredCompanies.length,
          total_pages: Math.ceil(filteredCompanies.length / limit)
        },
        summary: {
          total_companies: mockCompanies.length,
          active_companies: mockCompanies.filter(c => c.status === 'active').length,
          blocked_companies: mockCompanies.filter(c => c.status === 'blocked').length,
          trial_companies: mockCompanies.filter(c => c.status === 'trial').length
        }
      }
    });
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar empresa específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulação de busca de empresa
    const mockCompany = {
      id: id,
      name: 'TechSolutions Ltda',
      email: 'contato@techsolutions.com',
      phone: '+55 11 99999-1111',
      document: '12.345.678/0001-90',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        country: 'Brasil'
      },
      plan: {
        id: 'plan-pro',
        name: 'Professional',
        price: 999.00,
        limits: {
          users: 50,
          whatsapp_numbers: 5,
          messages_per_month: 10000,
          storage_gb: 100,
          api_calls_per_day: 5000
        }
      },
      usage: {
        users: 12,
        whatsapp_numbers: 2,
        messages_this_month: 3450,
        storage_used_gb: 23.5,
        api_calls_today: 1250
      },
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
      last_login: '2024-12-29T14:22:00Z',
      subscription: {
        status: 'active',
        started_at: '2024-01-15T10:30:00Z',
        next_billing: '2025-01-15T00:00:00Z',
        payment_method: 'credit_card',
        auto_renew: true
      },
      settings: {
        blocked: false,
        trial_used: true,
        notifications_enabled: true,
        api_access: true,
        webhook_url: 'https://techsolutions.com/webhook',
        timezone: 'America/Sao_Paulo'
      },
      billing_history: [
        {
          id: 'inv-001',
          amount: 999.00,
          status: 'paid',
          date: '2024-12-15T00:00:00Z',
          method: 'credit_card'
        },
        {
          id: 'inv-002',
          amount: 999.00,
          status: 'paid',
          date: '2024-11-15T00:00:00Z',
          method: 'credit_card'
        }
      ]
    };

    res.json({
      success: true,
      data: mockCompany
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar nova empresa
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      document,
      plan_id,
      address,
      settings = {}
    } = req.body;

    // Validações básicas
    if (!name || !email || !document || !plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, email, document, plan_id'
      });
    }

    // Simulação de criação
    const newCompany = {
      id: 'comp-' + Date.now(),
      name,
      email,
      phone,
      document,
      address,
      plan: {
        id: plan_id,
        name: 'Professional', // Buscar do banco
        price: 999.00
      },
      status: 'active',
      created_at: new Date().toISOString(),
      settings: {
        blocked: false,
        trial_used: false,
        notifications_enabled: true,
        ...settings
      }
    };

    res.status(201).json({
      success: true,
      data: newCompany,
      message: 'Empresa criada com sucesso'
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Simulação de atualização
    const updatedCompany = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedCompany,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Bloquear/Desbloquear empresa
router.patch('/:id/toggle-block', async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked, reason = '' } = req.body;

    // Simulação de bloqueio/desbloqueio
    res.json({
      success: true,
      data: {
        id,
        blocked,
        reason,
        updated_at: new Date().toISOString()
      },
      message: blocked ? 'Empresa bloqueada com sucesso' : 'Empresa desbloqueada com sucesso'
    });
  } catch (error) {
    console.error('Toggle block company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Alterar plano da empresa
router.patch('/:id/change-plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id, effective_date = new Date().toISOString() } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'plan_id é obrigatório'
      });
    }

    // Simulação de mudança de plano
    res.json({
      success: true,
      data: {
        company_id: id,
        old_plan_id: 'plan-pro',
        new_plan_id: plan_id,
        effective_date,
        updated_at: new Date().toISOString()
      },
      message: 'Plano alterado com sucesso'
    });
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter uso/estatísticas da empresa
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Simulação de dados de uso
    const usageData = {
      company_id: id,
      period,
      current_usage: {
        users: 12,
        whatsapp_numbers: 2,
        messages_this_month: 3450,
        storage_used_gb: 23.5,
        api_calls_today: 1250
      },
      limits: {
        users: 50,
        whatsapp_numbers: 5,
        messages_per_month: 10000,
        storage_gb: 100,
        api_calls_per_day: 5000
      },
      usage_percentage: {
        users: 24,
        whatsapp_numbers: 40,
        messages: 34.5,
        storage: 23.5,
        api_calls: 25
      },
      historical_data: [
        { date: '2024-12-01', messages: 2800, api_calls: 980 },
        { date: '2024-12-02', messages: 3100, api_calls: 1120 },
        { date: '2024-12-03', messages: 2950, api_calls: 1050 }
      ]
    };

    res.json({
      success: true,
      data: usageData
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar empresa (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Simulação de soft delete
    res.json({
      success: true,
      data: {
        id,
        deleted_at: new Date().toISOString()
      },
      message: 'Empresa removida com sucesso'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

