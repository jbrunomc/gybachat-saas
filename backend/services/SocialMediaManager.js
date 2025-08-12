import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export class SocialMediaManager {
  constructor(socketManager, databaseManager) {
    this.socketManager = socketManager;
    this.databaseManager = databaseManager;
    this.logger = pino({ name: 'SocialMediaManager' });
    this.sessions = new Map(); // companyId_platform -> session
    this.messageQueue = new Map(); // companyId_platform -> queue
    this.messageRateLimits = new Map(); // companyId_platform -> { lastSent, count }
    
    // Instagram API configuration
    this.instagramApiUrl = process.env.INSTAGRAM_API_URL || '';
    this.instagramApiKey = process.env.INSTAGRAM_API_KEY || '';
    
    // Facebook API configuration
    this.facebookApiUrl = process.env.FACEBOOK_API_URL || '';
    this.facebookApiKey = process.env.FACEBOOK_API_KEY || '';
  }

  async initialize() {
    try {
      // Carregar sessões existentes do banco
      await this.loadExistingSessions();
      
      // Iniciar processamento da fila de mensagens
      this.startMessageQueueProcessing();
      
      this.logger.info('Social Media Manager inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Social Media Manager:', error);
      throw error;
    }
  }

  async loadExistingSessions() {
    try {
      const { data: sessions, error } = await this.databaseManager.supabase
        .from('social_media_sessions')
        .select('*')
        .eq('status', 'connected');

      if (error) {
        this.logger.error('Erro ao buscar sessões do banco:', error);
        return;
      }

      this.logger.info(`Encontradas ${sessions.length} sessões para carregar`);

      for (const sessionData of sessions) {
        try {
          const sessionKey = `${sessionData.company_id}_${sessionData.platform}`;
          this.sessions.set(sessionKey, {
            companyId: sessionData.company_id,
            platform: sessionData.platform,
            status: sessionData.status,
            accountId: sessionData.account_id,
            accountName: sessionData.account_name,
            accountUsername: sessionData.account_username,
            profilePictureUrl: sessionData.profile_picture_url,
            lastSeen: sessionData.last_seen ? new Date(sessionData.last_seen) : null,
            createdAt: new Date(sessionData.created_at),
            updatedAt: new Date(sessionData.updated_at),
            authToken: sessionData.auth_token,
            refreshToken: sessionData.refresh_token,
            tokenExpiry: sessionData.token_expiry ? new Date(sessionData.token_expiry) : null
          });
          
          // Iniciar fila de mensagens para esta sessão
          this.messageQueue.set(sessionKey, []);
          this.messageRateLimits.set(sessionKey, { lastSent: 0, count: 0 });
          
          this.logger.info(`Sessão ${sessionData.platform} carregada para empresa ${sessionData.company_id}`);
        } catch (error) {
          this.logger.error(`Erro ao carregar sessão ${sessionData.company_id}_${sessionData.platform}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao carregar sessões existentes:', error);
    }
  }

  async connect(companyId, platform, authCode) {
    try {
      const sessionKey = `${companyId}_${platform}`;
      
      // Verificar se já existe uma sessão
      if (this.sessions.has(sessionKey)) {
        const existingSession = this.sessions.get(sessionKey);
        if (existingSession.status === 'connected') {
          this.logger.info(`Sessão ${platform} já está conectada para empresa ${companyId}`);
          return {
            status: 'connected',
            accountId: existingSession.accountId,
            accountName: existingSession.accountName,
            accountUsername: existingSession.accountUsername,
            profilePictureUrl: existingSession.profilePictureUrl
          };
        }
      }
      
      // Conectar à plataforma usando o código de autenticação
      let accountInfo;
      if (platform === 'instagram') {
        accountInfo = await this.connectToInstagram(authCode);
      } else if (platform === 'facebook') {
        accountInfo = await this.connectToFacebook(authCode);
      } else {
        throw new Error(`Plataforma não suportada: ${platform}`);
      }
      
      // Criar sessão
      const session = {
        companyId,
        platform,
        status: 'connected',
        accountId: accountInfo.id,
        accountName: accountInfo.name,
        accountUsername: accountInfo.username,
        profilePictureUrl: accountInfo.profile_picture_url,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        authToken: accountInfo.access_token,
        refreshToken: accountInfo.refresh_token,
        tokenExpiry: accountInfo.token_expiry ? new Date(accountInfo.token_expiry) : null
      };
      
      this.sessions.set(sessionKey, session);
      
      // Iniciar fila de mensagens para esta sessão
      this.messageQueue.set(sessionKey, []);
      this.messageRateLimits.set(sessionKey, { lastSent: 0, count: 0 });
      
      // Salvar no banco
      await this.saveSessionToDatabase(companyId, platform, session);
      
      // Configurar webhook
      await this.configureWebhook(companyId, platform, accountInfo.id);
      
      this.logger.info(`Sessão ${platform} conectada para empresa ${companyId}`);
      
      return {
        status: 'connected',
        accountId: accountInfo.id,
        accountName: accountInfo.name,
        accountUsername: accountInfo.username,
        profilePictureUrl: accountInfo.profile_picture_url
      };
    } catch (error) {
      this.logger.error(`Erro ao conectar ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async connectToInstagram(authCode) {
    try {
      // Em produção, trocar por chamada real à API do Instagram
      this.logger.info('Conectando ao Instagram com código de autenticação');
      
      // Simulação para desenvolvimento
      return {
        id: '12345678',
        name: 'Empresa Demo',
        username: 'empresa_demo',
        profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
        access_token: 'instagram-mock-token-' + uuidv4(),
        refresh_token: 'instagram-mock-refresh-token-' + uuidv4(),
        token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 dias
      };
    } catch (error) {
      this.logger.error('Erro ao conectar ao Instagram:', error);
      throw error;
    }
  }

  async connectToFacebook(authCode) {
    try {
      // Em produção, trocar por chamada real à API do Facebook
      this.logger.info('Conectando ao Facebook com código de autenticação');
      
      // Simulação para desenvolvimento
      return {
        id: '87654321',
        name: 'Empresa Demo',
        username: 'Empresa Demo',
        profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
        access_token: 'facebook-mock-token-' + uuidv4(),
        refresh_token: 'facebook-mock-refresh-token-' + uuidv4(),
        token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 dias
      };
    } catch (error) {
      this.logger.error('Erro ao conectar ao Facebook:', error);
      throw error;
    }
  }

  async configureWebhook(companyId, platform, accountId) {
    try {
      // Em produção, configurar webhook real
      this.logger.info(`Configurando webhook para ${platform} da empresa ${companyId}`);
      
      // Simulação para desenvolvimento
      return true;
    } catch (error) {
      this.logger.error(`Erro ao configurar webhook para ${platform}:`, error);
      return false;
    }
  }

  async disconnect(companyId, platform) {
    try {
      const sessionKey = `${companyId}_${platform}`;
      const session = this.sessions.get(sessionKey);
      
      if (!session) {
        throw new Error(`Sessão ${platform} não encontrada para empresa ${companyId}`);
      }
      
      // Desconectar da plataforma
      if (platform === 'instagram') {
        await this.disconnectFromInstagram(session.authToken);
      } else if (platform === 'facebook') {
        await this.disconnectFromFacebook(session.authToken);
      } else {
        throw new Error(`Plataforma não suportada: ${platform}`);
      }
      
      // Atualizar status da sessão
      session.status = 'disconnected';
      session.lastSeen = new Date();
      session.updatedAt = new Date();
      
      // Atualizar no banco
      await this.saveSessionToDatabase(companyId, platform, session);
      
      // Remover da memória
      this.sessions.delete(sessionKey);
      this.messageQueue.delete(sessionKey);
      this.messageRateLimits.delete(sessionKey);
      
      this.logger.info(`Sessão ${platform} desconectada para empresa ${companyId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Erro ao desconectar ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async disconnectFromInstagram(authToken) {
    try {
      // Em produção, trocar por chamada real à API do Instagram
      this.logger.info('Desconectando do Instagram');
      
      // Simulação para desenvolvimento
      return true;
    } catch (error) {
      this.logger.error('Erro ao desconectar do Instagram:', error);
      throw error;
    }
  }

  async disconnectFromFacebook(authToken) {
    try {
      // Em produção, trocar por chamada real à API do Facebook
      this.logger.info('Desconectando do Facebook');
      
      // Simulação para desenvolvimento
      return true;
    } catch (error) {
      this.logger.error('Erro ao desconectar do Facebook:', error);
      throw error;
    }
  }

  async getConnectionStatus(companyId, platform) {
    try {
      const sessionKey = `${companyId}_${platform}`;
      const session = this.sessions.get(sessionKey);
      
      if (!session) {
        // Tentar buscar do banco
        const { data, error } = await this.databaseManager.supabase
          .from('social_media_sessions')
          .select('*')
          .eq('company_id', companyId)
          .eq('platform', platform)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          return {
            connected: data.status === 'connected',
            status: data.status,
            accountId: data.account_id,
            accountName: data.account_name,
            accountUsername: data.account_username,
            profilePictureUrl: data.profile_picture_url,
            lastSeen: data.last_seen
          };
        }

        // Se não encontrou no banco, retornar status desconectado
        return {
          connected: false,
          status: 'disconnected',
          accountId: null,
          accountName: null,
          accountUsername: null,
          profilePictureUrl: null,
          lastSeen: null
        };
      }

      return {
        connected: session.status === 'connected',
        status: session.status,
        accountId: session.accountId,
        accountName: session.accountName,
        accountUsername: session.accountUsername,
        profilePictureUrl: session.profilePictureUrl,
        lastSeen: session.lastSeen
      };
    } catch (error) {
      this.logger.error(`Erro ao obter status da conexão ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async getSessions(companyId, platform) {
    try {
      // Buscar do banco
      const { data, error } = await this.databaseManager.supabase
        .from('social_media_sessions')
        .select('*')
        .eq('company_id', companyId)
        .eq('platform', platform);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Erro ao obter sessões ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async getStats(companyId, platform, dateRange = {}) {
    try {
      // Em produção, buscar estatísticas reais
      this.logger.info(`Obtendo estatísticas ${platform} para empresa ${companyId}`);
      
      // Simulação para desenvolvimento
      return {
        totalMessages: 1245,
        sentMessages: 578,
        receivedMessages: 667,
        mediaMessages: 123,
        activeHours: [
          { hour: 8, count: 45 },
          { hour: 9, count: 78 },
          { hour: 10, count: 95 },
          { hour: 11, count: 112 },
          { hour: 12, count: 85 },
          { hour: 13, count: 68 },
          { hour: 14, count: 125 },
          { hour: 15, count: 145 },
          { hour: 16, count: 138 },
          { hour: 17, count: 95 },
          { hour: 18, count: 72 }
        ],
        dailyActivity: [
          { date: '2024-06-01', count: 145 },
          { date: '2024-06-02', count: 132 },
          { date: '2024-06-03', count: 98 },
          { date: '2024-06-04', count: 115 },
          { date: '2024-06-05', count: 87 },
          { date: '2024-06-06', count: 134 },
          { date: '2024-06-07', count: 125 }
        ],
        responseTime: 125 // segundos
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async sendMessage(companyId, platform, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    try {
      const sessionKey = `${companyId}_${platform}`;
      const session = this.sessions.get(sessionKey);
      
      if (!session || session.status !== 'connected') {
        throw new Error(`${platform} não conectado para esta empresa`);
      }
      
      // Adicionar à fila de mensagens com prioridade normal
      return await this.queueMessage(companyId, platform, {
        to,
        content,
        messageType,
        fileBuffer,
        fileName,
        priority: 'normal',
        retries: 0
      });
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem ${platform} para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async queueMessage(companyId, platform, messageData) {
    const sessionKey = `${companyId}_${platform}`;
    const queue = this.messageQueue.get(sessionKey) || [];
    const messageId = uuidv4();
    
    queue.push({
      id: messageId,
      ...messageData,
      status: 'queued',
      queuedAt: new Date()
    });
    
    this.messageQueue.set(sessionKey, queue);
    this.logger.info(`Mensagem ${messageId} adicionada à fila ${platform} para ${companyId}`);
    
    return { success: true, messageId };
  }

  startMessageQueueProcessing() {
    // Processar filas de mensagens a cada 1 segundo
    setInterval(() => {
      this.sessions.forEach((session, sessionKey) => {
        const [companyId, platform] = sessionKey.split('_');
        this.processMessageQueue(companyId, platform);
      });
    }, 1000);
  }

  async processMessageQueue(companyId, platform) {
    const sessionKey = `${companyId}_${platform}`;
    const queue = this.messageQueue.get(sessionKey) || [];
    if (queue.length === 0) return;
    
    const session = this.sessions.get(sessionKey);
    if (!session || session.status !== 'connected') return;
    
    // Verificar rate limits
    const rateLimitInfo = this.messageRateLimits.get(sessionKey) || { lastSent: 0, count: 0 };
    const now = Date.now();
    
    // Resetar contador a cada minuto
    if (now - rateLimitInfo.lastSent > 60000) {
      rateLimitInfo.count = 0;
    }
    
    // Limitar mensagens por minuto (configurável)
    const maxPerMinute = platform === 'instagram' ? 15 : 20; // Instagram tem limite menor
    if (rateLimitInfo.count >= maxPerMinute) {
      return;
    }
    
    // Pegar a próxima mensagem da fila
    const message = queue.shift();
    this.messageQueue.set(sessionKey, queue);
    
    try {
      // Enviar mensagem
      let result;
      if (platform === 'instagram') {
        result = await this.sendMessageToInstagram(
          session.authToken,
          message.to,
          message.content,
          message.messageType,
          message.fileBuffer,
          message.fileName
        );
      } else if (platform === 'facebook') {
        result = await this.sendMessageToFacebook(
          session.authToken,
          message.to,
          message.content,
          message.messageType,
          message.fileBuffer,
          message.fileName
        );
      } else {
        throw new Error(`Plataforma não suportada: ${platform}`);
      }
      
      // Atualizar rate limits
      rateLimitInfo.lastSent = now;
      rateLimitInfo.count++;
      this.messageRateLimits.set(sessionKey, rateLimitInfo);
      
      // Salvar mensagem enviada no banco
      if (result.success) {
        const messageData = {
          id: result.messageId || message.id,
          company_id: companyId,
          customer_id: message.to,
          content: message.content,
          timestamp: new Date(),
          sender: 'agent',
          message_type: message.messageType,
          status: 'sent',
          platform,
          metadata: {
            message_id: result.messageId,
            platform
          }
        };

        await this.saveMessageToDatabase(companyId, platform, messageData);
        this.logger.info(`Mensagem ${platform} enviada para ${message.to} da empresa ${companyId}`);
      } else {
        // Se falhou, tentar novamente até 3 vezes com delay exponencial
        if (message.retries < 3) {
          message.retries++;
          message.priority = 'high'; // Aumentar prioridade
          
          // Adicionar de volta à fila com delay exponencial
          setTimeout(() => {
            const queue = this.messageQueue.get(sessionKey) || [];
            queue.push(message);
            this.messageQueue.set(sessionKey, queue);
          }, 1000 * Math.pow(2, message.retries));
          
          this.logger.warn(`Falha ao enviar mensagem ${platform} para ${message.to}. Tentativa ${message.retries}/3`);
        } else {
          this.logger.error(`Falha ao enviar mensagem ${platform} para ${message.to} após 3 tentativas`);
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem da fila ${platform} para ${companyId}:`, error);
      
      // Recolocar na fila se ainda houver tentativas
      if (message.retries < 3) {
        message.retries++;
        
        // Adicionar de volta à fila com delay exponencial
        setTimeout(() => {
          const queue = this.messageQueue.get(sessionKey) || [];
          queue.push(message);
          this.messageQueue.set(sessionKey, queue);
        }, 1000 * Math.pow(2, message.retries));
      }
    }
  }

  async sendMessageToInstagram(authToken, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    try {
      // Em produção, trocar por chamada real à API do Instagram
      this.logger.info(`Enviando mensagem Instagram para ${to}`);
      
      // Simulação para desenvolvimento
      return { 
        success: true, 
        messageId: `instagram-${Date.now()}-${Math.random().toString(36).substring(2, 15)}` 
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem via Instagram:', error);
      return { success: false };
    }
  }

  async sendMessageToFacebook(authToken, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    try {
      // Em produção, trocar por chamada real à API do Facebook
      this.logger.info(`Enviando mensagem Facebook para ${to}`);
      
      // Simulação para desenvolvimento
      return { 
        success: true, 
        messageId: `facebook-${Date.now()}-${Math.random().toString(36).substring(2, 15)}` 
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem via Facebook:', error);
      return { success: false };
    }
  }

  async processWebhook(companyId, platform, eventData) {
    try {
      const sessionKey = `${companyId}_${platform}`;
      const session = this.sessions.get(sessionKey);
      
      if (!session) {
        this.logger.warn(`Recebido webhook para empresa não registrada: ${companyId}_${platform}`);
        return;
      }
      
      // Processar diferentes tipos de eventos
      if (eventData.object === 'instagram' && eventData.entry) {
        await this.processInstagramWebhook(companyId, eventData);
      } else if (eventData.object === 'page' && eventData.entry) {
        await this.processFacebookWebhook(companyId, eventData);
      } else {
        this.logger.warn(`Tipo de evento desconhecido: ${JSON.stringify(eventData)}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook ${platform} para ${companyId}:`, error);
    }
  }

  async processInstagramWebhook(companyId, eventData) {
    try {
      // Processar mensagens do Instagram
      for (const entry of eventData.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message) {
              // Processar mensagem recebida
              const processedMessage = await this.formatIncomingMessage(
                companyId,
                'instagram',
                messagingEvent
              );
              
              // Salvar no banco
              await this.saveMessageToDatabase(companyId, 'instagram', processedMessage);
              
              // Emitir via Socket.IO
              this.socketManager.emitToCompany(companyId, 'conversation:new-message', processedMessage);
              
              // Atualizar conversa
              await this.updateConversation(companyId, 'instagram', processedMessage);
              
              this.logger.info(`Mensagem Instagram processada para empresa ${companyId}`);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook Instagram para ${companyId}:`, error);
    }
  }

  async processFacebookWebhook(companyId, eventData) {
    try {
      // Processar mensagens do Facebook
      for (const entry of eventData.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message) {
              // Processar mensagem recebida
              const processedMessage = await this.formatIncomingMessage(
                companyId,
                'facebook',
                messagingEvent
              );
              
              // Salvar no banco
              await this.saveMessageToDatabase(companyId, 'facebook', processedMessage);
              
              // Emitir via Socket.IO
              this.socketManager.emitToCompany(companyId, 'conversation:new-message', processedMessage);
              
              // Atualizar conversa
              await this.updateConversation(companyId, 'facebook', processedMessage);
              
              this.logger.info(`Mensagem Facebook processada para empresa ${companyId}`);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook Facebook para ${companyId}:`, error);
    }
  }

  async formatIncomingMessage(companyId, platform, messagingEvent) {
    const messageId = messagingEvent.message.mid;
    const senderId = messagingEvent.sender.id;
    const timestamp = new Date(messagingEvent.timestamp);
    const senderName = messagingEvent.sender.name || senderId;

    let content = '';
    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let thumbnailUrl = null;

    // Processar diferentes tipos de mensagem
    if (messagingEvent.message.text) {
      content = messagingEvent.message.text;
    } else if (messagingEvent.message.attachments) {
      const attachment = messagingEvent.message.attachments[0];
      
      if (attachment.type === 'image') {
        messageType = 'image';
        fileUrl = attachment.payload.url;
        thumbnailUrl = attachment.payload.url;
      } else if (attachment.type === 'video') {
        messageType = 'video';
        fileUrl = attachment.payload.url;
      } else if (attachment.type === 'audio') {
        messageType = 'audio';
        fileUrl = attachment.payload.url;
      } else if (attachment.type === 'file') {
        messageType = 'file';
        fileUrl = attachment.payload.url;
        fileName = attachment.title || `file_${messageId}`;
      }
    }

    return {
      id: messageId,
      company_id: companyId,
      customer_id: senderId,
      content,
      timestamp,
      sender: 'customer',
      sender_name: senderName,
      message_type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      thumbnail_url: thumbnailUrl,
      status: 'received',
      platform,
      metadata: {
        message_id: messageId,
        sender_id: senderId,
        raw_message: messagingEvent
      }
    };
  }

  async saveMessageToDatabase(companyId, platform, messageData) {
    try {
      // Primeiro, verificar/criar conversa
      let conversationId = await this.getOrCreateConversation(companyId, platform, messageData.customer_id);

      // Salvar mensagem
      const { error } = await this.databaseManager.supabase
        .from('messages')
        .insert({
          ...messageData,
          conversation_id: conversationId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

    } catch (error) {
      this.logger.error(`Erro ao salvar mensagem ${platform} no banco:`, error);
      throw error;
    }
  }

  async getOrCreateConversation(companyId, platform, customerId) {
    try {
      // Buscar conversa existente
      const { data: existingConversation, error } = await this.databaseManager.supabase
        .from('conversations')
        .select('id')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .eq('source', platform)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (existingConversation) {
        return existingConversation.id;
      }

      // Criar nova conversa
      const conversationData = {
        company_id: companyId,
        customer_name: customerId, // Será atualizado depois
        customer_id: customerId,
        status: 'active',
        source: platform,
        priority: 'medium',
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.databaseManager.supabase
        .from('conversations')
        .insert(conversationData)
        .select('id')
        .single();

      if (insertError) throw insertError;

      return data.id;

    } catch (error) {
      this.logger.error(`Erro ao criar/buscar conversa ${platform}:`, error);
      throw error;
    }
  }

  async updateConversation(companyId, platform, messageData) {
    try {
      const conversationId = await this.getOrCreateConversation(companyId, platform, messageData.customer_id);

      // Atualizar última mensagem e timestamp
      const { error } = await this.databaseManager.supabase
        .from('conversations')
        .update({
          last_message: messageData.content,
          last_message_time: messageData.timestamp,
          updated_at: new Date().toISOString(),
          unread_count: messageData.sender === 'customer' ? 1 : 0 // Incrementar se for do cliente
        })
        .eq('id', conversationId);

      if (error) throw error;

    } catch (error) {
      this.logger.error(`Erro ao atualizar conversa ${platform}:`, error);
    }
  }

  async saveSessionToDatabase(companyId, platform, session) {
    try {
      const sessionData = {
        company_id: companyId,
        platform,
        status: session.status,
        account_id: session.accountId,
        account_name: session.accountName,
        account_username: session.accountUsername,
        profile_picture_url: session.profilePictureUrl,
        last_seen: session.lastSeen,
        auth_token: session.authToken,
        refresh_token: session.refreshToken,
        token_expiry: session.tokenExpiry,
        updated_at: new Date().toISOString()
      };

      // Verificar se a sessão já existe
      const { data: existingSession, error: checkError } = await this.databaseManager.supabase
        .from('social_media_sessions')
        .select('id')
        .eq('company_id', companyId)
        .eq('platform', platform)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        this.logger.error('Erro ao verificar sessão existente:', checkError);
        return;
      }

      if (existingSession) {
        // Atualizar sessão existente
        const { error } = await this.databaseManager.supabase
          .from('social_media_sessions')
          .update(sessionData)
          .eq('company_id', companyId)
          .eq('platform', platform);

        if (error) {
          this.logger.error(`Erro ao atualizar sessão ${platform} no banco:`, error);
        } else {
          this.logger.info(`Sessão ${platform} atualizada no banco para empresa ${companyId}`);
        }
      } else {
        // Inserir nova sessão
        const { error } = await this.databaseManager.supabase
          .from('social_media_sessions')
          .insert({
            ...sessionData,
            created_at: new Date().toISOString()
          });

        if (error) {
          this.logger.error(`Erro ao inserir sessão ${platform} no banco:`, error);
        } else {
          this.logger.info(`Sessão ${platform} inserida no banco para empresa ${companyId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao salvar sessão ${platform} no banco:`, error);
    }
  }

  getHealthStatus() {
    const healthStatus = {
      totalSessions: this.sessions.size,
      connectedSessions: 0,
      disconnectedSessions: 0,
      errorSessions: 0,
      sessionsByPlatform: {
        instagram: 0,
        facebook: 0
      },
      sessions: []
    };

    this.sessions.forEach((session, sessionKey) => {
      const [companyId, platform] = sessionKey.split('_');
      
      // Contar por status
      if (session.status === 'connected') healthStatus.connectedSessions++;
      else if (session.status === 'disconnected') healthStatus.disconnectedSessions++;
      else if (session.status === 'error') healthStatus.errorSessions++;

      // Contar por plataforma
      if (platform === 'instagram') healthStatus.sessionsByPlatform.instagram++;
      else if (platform === 'facebook') healthStatus.sessionsByPlatform.facebook++;

      // Adicionar detalhes da sessão
      healthStatus.sessions.push({
        companyId,
        platform,
        status: session.status,
        accountId: session.accountId,
        accountName: session.accountName,
        lastSeen: session.lastSeen
      });
    });

    return healthStatus;
  }
}