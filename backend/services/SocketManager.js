import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> { socket, companyId, role }
    this.companyRooms = new Map(); // companyId -> Set of userIds
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Nova conexão socket: ${socket.id}`);

      // Autenticação do socket
      socket.on('authenticate', async (data) => {
        try {
          const { token, companyId } = data;
          
          if (!token || !companyId) {
            socket.emit('auth_error', { message: 'Token e companyId são obrigatórios' });
            return;
          }

          // Verificar token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // Buscar usuário
          const { data: user, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

          if (error || !user) {
            socket.emit('auth_error', { message: 'Usuário não encontrado' });
            return;
          }

          // Verificar se usuário pertence à empresa
          const { data: userCompany, error: companyError } = await this.supabase
            .from('user_companies')
            .select('role')
            .eq('user_id', user.id)
            .eq('company_id', companyId)
            .single();

          if (companyError || !userCompany) {
            socket.emit('auth_error', { message: 'Acesso negado à empresa' });
            return;
          }

          // Armazenar informações do usuário
          this.connectedUsers.set(user.id, {
            socket,
            companyId,
            role: userCompany.role,
            user
          });

          // Adicionar à sala da empresa
          socket.join(`company_${companyId}`);
          
          // Adicionar ao mapa de salas
          if (!this.companyRooms.has(companyId)) {
            this.companyRooms.set(companyId, new Set());
          }
          this.companyRooms.get(companyId).add(user.id);

          socket.userId = user.id;
          socket.companyId = companyId;

          socket.emit('authenticated', {
            user: {
              id: user.id,
              name: user.name,
              role: userCompany.role
            }
          });

          // Notificar outros usuários da empresa
          socket.to(`company_${companyId}`).emit('user_online', {
            userId: user.id,
            name: user.name
          });

          console.log(`✅ Usuário autenticado: ${user.name} (${user.id}) na empresa ${companyId}`);

        } catch (error) {
          console.error('Erro na autenticação do socket:', error);
          socket.emit('auth_error', { message: 'Token inválido' });
        }
      });

      // Entrar em conversa específica
      socket.on('join_conversation', (conversationId) => {
        if (socket.userId && socket.companyId) {
          socket.join(`conversation_${conversationId}`);
          console.log(`👥 Usuário ${socket.userId} entrou na conversa ${conversationId}`);
        }
      });

      // Sair de conversa específica
      socket.on('leave_conversation', (conversationId) => {
        if (socket.userId && socket.companyId) {
          socket.leave(`conversation_${conversationId}`);
          console.log(`👋 Usuário ${socket.userId} saiu da conversa ${conversationId}`);
        }
      });

      // Usuário está digitando
      socket.on('typing', (data) => {
        if (socket.userId && socket.companyId) {
          socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
            userId: socket.userId,
            conversationId: data.conversationId
          });
        }
      });

      // Usuário parou de digitar
      socket.on('stop_typing', (data) => {
        if (socket.userId && socket.companyId) {
          socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
            userId: socket.userId,
            conversationId: data.conversationId
          });
        }
      });

      // Desconexão
      socket.on('disconnect', () => {
        if (socket.userId && socket.companyId) {
          // Remover do mapa de usuários conectados
          this.connectedUsers.delete(socket.userId);
          
          // Remover da sala da empresa
          const companyUsers = this.companyRooms.get(socket.companyId);
          if (companyUsers) {
            companyUsers.delete(socket.userId);
            if (companyUsers.size === 0) {
              this.companyRooms.delete(socket.companyId);
            }
          }

          // Notificar outros usuários
          socket.to(`company_${socket.companyId}`).emit('user_offline', {
            userId: socket.userId
          });

          console.log(`🔌 Usuário ${socket.userId} desconectado`);
        }
      });
    });
  }

  // Enviar notificação para usuário específico
  notifyUser(userId, event, data) {
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection) {
      userConnection.socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Enviar notificação para toda a empresa
  notifyCompany(companyId, event, data, excludeUserId = null) {
    const companyUsers = this.companyRooms.get(companyId);
    if (companyUsers) {
      companyUsers.forEach(userId => {
        if (userId !== excludeUserId) {
          this.notifyUser(userId, event, data);
        }
      });
    }
  }

  // Enviar notificação para conversa específica
  notifyConversation(conversationId, event, data, excludeUserId = null) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  // Nova mensagem recebida
  newMessage(message) {
    // Notificar usuários na conversa
    this.notifyConversation(message.conversation_id, 'new_message', message);
    
    // Notificar empresa sobre nova mensagem
    this.notifyCompany(message.company_id, 'conversation_updated', {
      conversationId: message.conversation_id,
      lastMessage: message.content,
      updatedAt: message.created_at
    });
  }

  // Status da conversa alterado
  conversationStatusChanged(conversationId, companyId, status, assignedTo) {
    this.notifyConversation(conversationId, 'conversation_status_changed', {
      conversationId,
      status,
      assignedTo
    });

    this.notifyCompany(companyId, 'conversation_updated', {
      conversationId,
      status,
      assignedTo
    });
  }

  // Nova conversa criada
  newConversation(conversation) {
    this.notifyCompany(conversation.company_id, 'new_conversation', conversation);
  }

  // Obter usuários online da empresa
  getOnlineUsers(companyId) {
    const companyUsers = this.companyRooms.get(companyId);
    if (!companyUsers) return [];

    return Array.from(companyUsers).map(userId => {
      const connection = this.connectedUsers.get(userId);
      return connection ? {
        id: userId,
        name: connection.user.name,
        role: connection.role
      } : null;
    }).filter(Boolean);
  }

  // Estatísticas de conexões
  getStats() {
    return {
      totalConnections: this.connectedUsers.size,
      companiesWithUsers: this.companyRooms.size,
      connectionsByCompany: Array.from(this.companyRooms.entries()).map(([companyId, users]) => ({
        companyId,
        userCount: users.size
      }))
    };
  }
}

