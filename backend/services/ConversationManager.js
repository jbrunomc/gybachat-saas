import { createClient } from '@supabase/supabase-js';

export class ConversationManager {
  constructor(socketManager, databaseManager) {
    this.socketManager = socketManager;
    this.databaseManager = databaseManager;
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  // Inicializar serviço
  async initialize() {
    console.log('✅ ConversationManager inicializado');
  }

  // Criar nova conversa
  async createConversation(contactId, companyId, platform = 'whatsapp', metadata = {}) {
    try {
      const conversationData = {
        contact_id: contactId,
        company_id: companyId,
        platform,
        status: 'open',
        unread_count: 0,
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const conversation = await this.databaseManager.createConversation(conversationData);
      
      // Notificar via socket
      if (this.socketManager) {
        this.socketManager.newConversation(conversation);
      }

      return conversation;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }

  // Buscar ou criar conversa
  async findOrCreateConversation(contactId, companyId, platform = 'whatsapp') {
    try {
      // Buscar conversa existente ativa
      const { data: existingConversation, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('contact_id', contactId)
        .eq('company_id', companyId)
        .eq('platform', platform)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingConversation && !error) {
        return existingConversation;
      }

      // Se não existe, criar nova
      return await this.createConversation(contactId, companyId, platform);
    } catch (error) {
      console.error('Erro ao buscar/criar conversa:', error);
      throw error;
    }
  }

  // Adicionar mensagem à conversa
  async addMessage(conversationId, messageData) {
    try {
      // Buscar conversa
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        throw new Error('Conversa não encontrada');
      }

      // Criar mensagem
      const message = await this.databaseManager.createMessage({
        conversation_id: conversationId,
        company_id: conversation.company_id,
        ...messageData,
        created_at: new Date().toISOString()
      });

      // Atualizar conversa
      const updateData = {
        last_message: messageData.content,
        updated_at: new Date().toISOString()
      };

      // Incrementar contador de não lidas se for mensagem recebida
      if (messageData.direction === 'inbound') {
        updateData.unread_count = conversation.unread_count + 1;
      }

      await this.supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      // Notificar via socket
      if (this.socketManager) {
        this.socketManager.newMessage(message);
      }

      return message;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      throw error;
    }
  }

  // Atribuir conversa a um agente
  async assignConversation(conversationId, userId, companyId) {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({
          assigned_to: userId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('company_id', companyId);

      if (error) throw error;

      // Notificar via socket
      if (this.socketManager) {
        this.socketManager.conversationStatusChanged(
          conversationId,
          companyId,
          'assigned',
          userId
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error);
      throw error;
    }
  }

  // Alterar status da conversa
  async updateConversationStatus(conversationId, status, companyId) {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'closed' && { closed_at: new Date().toISOString() })
        })
        .eq('id', conversationId)
        .eq('company_id', companyId);

      if (error) throw error;

      // Notificar via socket
      if (this.socketManager) {
        this.socketManager.conversationStatusChanged(
          conversationId,
          companyId,
          status
        );
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
      throw error;
    }
  }

  // Marcar conversa como lida
  async markAsRead(conversationId, companyId) {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({
          unread_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }

  // Buscar conversas da empresa
  async getCompanyConversations(companyId, filters = {}) {
    try {
      let query = this.supabase
        .from('conversations')
        .select(`
          *,
          contacts (
            id,
            name,
            phone,
            avatar
          ),
          users (
            id,
            name,
            avatar
          )
        `)
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: conversations, error } = await query;

      if (error) throw error;
      return conversations;
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      throw error;
    }
  }

  // Buscar mensagens de uma conversa
  async getConversationMessages(conversationId, companyId, limit = 50) {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return messages;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  // Distribuição automática de conversas
  async autoAssignConversation(conversationId, companyId) {
    try {
      // Buscar agentes disponíveis
      const { data: agents, error } = await this.supabase
        .from('user_companies')
        .select(`
          user_id,
          users (
            id,
            name,
            active
          )
        `)
        .eq('company_id', companyId)
        .in('role', ['agent', 'supervisor'])
        .eq('users.active', true);

      if (error || !agents.length) {
        console.log('Nenhum agente disponível para atribuição automática');
        return false;
      }

      // Buscar agente com menos conversas ativas
      const agentLoads = await Promise.all(
        agents.map(async (agent) => {
          const { count } = await this.supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', agent.user_id)
            .eq('company_id', companyId)
            .in('status', ['open', 'assigned']);

          return {
            userId: agent.user_id,
            load: count || 0
          };
        })
      );

      // Encontrar agente com menor carga
      const selectedAgent = agentLoads.reduce((min, agent) => 
        agent.load < min.load ? agent : min
      );

      // Atribuir conversa
      return await this.assignConversation(
        conversationId,
        selectedAgent.userId,
        companyId
      );
    } catch (error) {
      console.error('Erro na distribuição automática:', error);
      return false;
    }
  }

  // Estatísticas de conversas
  async getConversationStats(companyId, period = '7d') {
    try {
      const startDate = new Date();
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Total de conversas
      const { count: totalConversations } = await this.supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', startDate.toISOString());

      // Conversas por status
      const { data: statusData } = await this.supabase
        .from('conversations')
        .select('status')
        .eq('company_id', companyId)
        .gte('created_at', startDate.toISOString());

      const statusCounts = statusData.reduce((acc, conv) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1;
        return acc;
      }, {});

      // Tempo médio de primeira resposta
      const { data: responseTimeData } = await this.supabase
        .from('conversations')
        .select('first_response_time')
        .eq('company_id', companyId)
        .not('first_response_time', 'is', null)
        .gte('created_at', startDate.toISOString());

      const avgResponseTime = responseTimeData.length > 0
        ? responseTimeData.reduce((sum, conv) => sum + conv.first_response_time, 0) / responseTimeData.length
        : 0;

      return {
        totalConversations: totalConversations || 0,
        statusCounts,
        avgResponseTime: Math.round(avgResponseTime),
        period
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

