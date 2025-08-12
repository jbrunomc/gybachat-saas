import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar usuários (admin)
router.get('/', generalRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', company_id = '' } = req.query;
    
    // Simulação de dados para demonstração
    const mockUsers = [
      {
        id: 'user-001',
        name: 'João Silva',
        email: 'joao@techsolutions.com',
        phone: '+55 11 99999-1111',
        role: 'admin',
        company: {
          id: 'comp-001',
          name: 'TechSolutions Ltda'
        },
        status: 'active',
        permissions: ['manage_users', 'manage_conversations', 'view_analytics', 'manage_settings'],
        last_login: '2024-12-29T14:22:00Z',
        created_at: '2024-01-15T10:30:00Z',
        settings: {
          notifications_enabled: true,
          two_factor_enabled: false,
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        },
        usage: {
          conversations_this_month: 45,
          messages_sent: 1250,
          login_count: 89
        }
      },
      {
        id: 'user-002',
        name: 'Maria Santos',
        email: 'maria@techsolutions.com',
        phone: '+55 11 88888-2222',
        role: 'agent',
        company: {
          id: 'comp-001',
          name: 'TechSolutions Ltda'
        },
        status: 'active',
        permissions: ['manage_conversations', 'view_analytics'],
        last_login: '2024-12-28T16:45:00Z',
        created_at: '2024-02-20T09:15:00Z',
        settings: {
          notifications_enabled: true,
          two_factor_enabled: true,
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        },
        usage: {
          conversations_this_month: 78,
          messages_sent: 2340,
          login_count: 156
        }
      },
      {
        id: 'user-003',
        name: 'Carlos Lima',
        email: 'carlos@ecommerceplus.com',
        phone: '+55 11 77777-3333',
        role: 'admin',
        company: {
          id: 'comp-002',
          name: 'E-commerce Plus'
        },
        status: 'blocked',
        permissions: ['manage_users', 'manage_conversations', 'view_analytics'],
        last_login: '2024-12-25T10:30:00Z',
        created_at: '2024-03-10T11:00:00Z',
        settings: {
          notifications_enabled: false,
          two_factor_enabled: false,
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        },
        usage: {
          conversations_this_month: 12,
          messages_sent: 340,
          login_count: 23
        }
      }
    ];

    // Filtrar por status se especificado
    let filteredUsers = mockUsers;
    if (status !== 'all') {
      filteredUsers = mockUsers.filter(user => user.status === status);
    }

    // Filtrar por empresa se especificado
    if (company_id) {
      filteredUsers = filteredUsers.filter(user => user.company.id === company_id);
    }

    // Filtrar por busca se especificado
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.company.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: filteredUsers.length,
          total_pages: Math.ceil(filteredUsers.length / limit)
        },
        summary: {
          total_users: mockUsers.length,
          active_users: mockUsers.filter(u => u.status === 'active').length,
          blocked_users: mockUsers.filter(u => u.status === 'blocked').length,
          admin_users: mockUsers.filter(u => u.role === 'admin').length,
          agent_users: mockUsers.filter(u => u.role === 'agent').length
        }
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulação de busca de usuário
    const mockUser = {
      id: id,
      name: 'João Silva',
      email: 'joao@techsolutions.com',
      phone: '+55 11 99999-1111',
      role: 'admin',
      company: {
        id: 'comp-001',
        name: 'TechSolutions Ltda',
        plan: 'Professional'
      },
      status: 'active',
      permissions: ['manage_users', 'manage_conversations', 'view_analytics', 'manage_settings'],
      last_login: '2024-12-29T14:22:00Z',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-12-20T08:15:00Z',
      settings: {
        notifications_enabled: true,
        two_factor_enabled: false,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        theme: 'light'
      },
      usage: {
        conversations_this_month: 45,
        messages_sent: 1250,
        login_count: 89,
        last_activity: '2024-12-29T14:22:00Z'
      },
      activity_log: [
        {
          action: 'login',
          timestamp: '2024-12-29T14:22:00Z',
          ip: '192.168.1.100'
        },
        {
          action: 'sent_message',
          timestamp: '2024-12-29T14:20:00Z',
          details: 'Mensagem para cliente ABC'
        }
      ]
    };

    res.json({
      success: true,
      data: mockUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      company_id,
      permissions = [],
      settings = {}
    } = req.body;

    // Validações básicas
    if (!name || !email || !role || !company_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, email, role, company_id'
      });
    }

    // Simulação de criação
    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      role,
      company: {
        id: company_id,
        name: 'TechSolutions Ltda' // Buscar do banco
      },
      status: 'active',
      permissions,
      created_at: new Date().toISOString(),
      settings: {
        notifications_enabled: true,
        two_factor_enabled: false,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        ...settings
      }
    };

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Simulação de atualização
    const updatedUser = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Bloquear/Desbloquear usuário
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
      message: blocked ? 'Usuário bloqueado com sucesso' : 'Usuário desbloqueado com sucesso'
    });
  } catch (error) {
    console.error('Toggle block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Alterar permissões do usuário
router.patch('/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'permissions deve ser um array'
      });
    }

    // Simulação de alteração de permissões
    res.json({
      success: true,
      data: {
        user_id: id,
        permissions,
        updated_at: new Date().toISOString()
      },
      message: 'Permissões atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter atividade do usuário
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d', limit = 50 } = req.query;

    // Simulação de dados de atividade
    const activityData = {
      user_id: id,
      period,
      activities: [
        {
          id: 'act-001',
          action: 'login',
          timestamp: '2024-12-29T14:22:00Z',
          ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0...'
        },
        {
          id: 'act-002',
          action: 'sent_message',
          timestamp: '2024-12-29T14:20:00Z',
          details: {
            conversation_id: 'conv-123',
            message_type: 'text',
            recipient: '+55 11 99999-9999'
          }
        },
        {
          id: 'act-003',
          action: 'created_conversation',
          timestamp: '2024-12-29T13:15:00Z',
          details: {
            conversation_id: 'conv-124',
            contact_name: 'Cliente ABC'
          }
        }
      ],
      summary: {
        total_activities: 156,
        logins: 23,
        messages_sent: 89,
        conversations_created: 12
      }
    };

    res.json({
      success: true,
      data: activityData
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Resetar senha do usuário
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { send_email = true } = req.body;

    // Simulação de reset de senha
    const temporaryPassword = 'temp-' + Math.random().toString(36).substring(2, 10);

    res.json({
      success: true,
      data: {
        user_id: id,
        temporary_password: temporaryPassword,
        email_sent: send_email,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      },
      message: 'Senha resetada com sucesso'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar usuário (soft delete)
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
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

