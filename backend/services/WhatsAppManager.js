import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import qrcode from 'qrcode';

export class WhatsAppManager {
  constructor(socketManager, databaseManager) {
    this.socketManager = socketManager;
    this.databaseManager = databaseManager;
    this.logger = pino({ name: 'WhatsAppManager' });
    this.sessions = new Map(); // companyId -> session
    this.sessionsPath = process.env.WHATSAPP_SESSION_PATH || './sessions';
    this.maxSessions = parseInt(process.env.WHATSAPP_MAX_SESSIONS) || 100;
    
    // Evolution API configuration
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
    this.messageQueue = new Map(); // companyId -> queue
    this.messageRateLimits = new Map(); // companyId -> { lastSent, count }
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.78',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15'
    ];
    
    // Official API configuration (placeholder for future implementation)
    this.officialApiUrl = process.env.OFFICIAL_API_URL || '';
    this.officialApiKey = process.env.OFFICIAL_API_KEY || '';
  }

  async initialize() {
    try {
      // Criar diretório de sessões se não existir
      await fs.mkdir(this.sessionsPath, { recursive: true });
      
      // Carregar sessões existentes do banco
      await this.loadExistingSessions();
      
      // Iniciar processamento da fila de mensagens
      this.startMessageQueueProcessing();
      
      this.logger.info('WhatsApp Manager inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar WhatsApp Manager:', error);
      throw error;
    }
  }

  async loadExistingSessions() {
    try {
      const { data: sessions, error } = await this.databaseManager.supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('status', 'connected');

      if (error) {
        this.logger.error('Erro ao buscar sessões do banco:', error);
        return;
      }

      this.logger.info(`Encontradas ${sessions.length} sessões para carregar`);

      for (const sessionData of sessions) {
        try {
          await this.createSession(sessionData.company_id, sessionData);
          this.logger.info(`Sessão carregada para empresa ${sessionData.company_id}`);
        } catch (error) {
          this.logger.error(`Erro ao carregar sessão ${sessionData.company_id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao carregar sessões existentes:', error);
    }
  }

  async createSession(companyId, existingSession = null) {
    try {
      if (this.sessions.has(companyId)) {
        this.logger.warn(`Sessão já existe para empresa ${companyId}`);
        return this.sessions.get(companyId);
      }

      if (this.sessions.size >= this.maxSessions) {
        throw new Error('Limite máximo de sessões atingido');
      }

      const sessionPath = path.join(this.sessionsPath, companyId);
      await fs.mkdir(sessionPath, { recursive: true });

      // Determinar o tipo de conexão a ser usado
      const connectionType = existingSession?.connection_type || 'evolution';
      
      const session = {
        companyId,
        status: 'disconnected',
        qrCode: null,
        phoneNumber: null,
        lastSeen: null,
        connectionLogs: [],
        createdAt: new Date(),
        instanceName: `instance_${companyId}`,
        messageQueue: [],
        connectionType // 'evolution' ou 'official'
      };

      // Configurar session com dados existentes se disponíveis
      if (existingSession) {
        session.status = existingSession.status;
        session.phoneNumber = existingSession.phone_number;
        session.lastSeen = existingSession.last_seen ? new Date(existingSession.last_seen) : null;
      }

      // Iniciar conexão baseado no tipo
      if (session.status !== 'connected') {
        try {
          if (connectionType === 'evolution') {
            await this.initializeEvolutionSession(session);
          } else if (connectionType === 'official') {
            await this.initializeOfficialSession(session);
          } else {
            throw new Error(`Tipo de conexão desconhecido: ${connectionType}`);
          }
        } catch (error) {
          this.logger.error(`Erro ao inicializar sessão ${connectionType} para ${companyId}:`, error);
          session.status = 'error';
        }
      }

      // Iniciar fila de mensagens para esta empresa
      this.messageQueue.set(companyId, []);
      this.messageRateLimits.set(companyId, { lastSent: 0, count: 0 });

      this.sessions.set(companyId, session);

      // Salvar/atualizar no banco
      await this.saveSessionToDatabase(companyId, session);

      this.logger.info(`Sessão criada para empresa ${companyId} usando ${connectionType}`);
      return session;

    } catch (error) {
      this.logger.error(`Erro ao criar sessão para empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Inicializar sessão usando Evolution API
  async initializeEvolutionSession(session) {
    // Verificar se a instância já existe na Evolution API
    const instanceExists = await this.checkInstanceExists(session.instanceName);
    
    if (!instanceExists) {
      // Criar nova instância na Evolution API
      await this.createEvolutionInstance(session.instanceName, session.companyId);
    }

    // Configurar webhook para receber mensagens
    await this.configureWebhook(session.instanceName, session.companyId);

    // Iniciar conexão com a Evolution API
    const connectionResult = await this.connectEvolutionInstance(session.instanceName);
    
    if (connectionResult.qrcode) {
      session.qrCode = connectionResult.qrcode;
      session.status = 'connecting';
      
      // Emitir QR Code via Socket.IO
      this.socketManager.emitToCompany(session.companyId, 'whatsapp:qr-code', {
        qrCode: session.qrCode,
        companyId: session.companyId
      });
    } else if (connectionResult.connected) {
      session.status = 'connected';
      session.phoneNumber = connectionResult.phone || null;
      
      // Emitir status conectado
      this.socketManager.emitToCompany(session.companyId, 'whatsapp:connected', {
        companyId: session.companyId,
        phoneNumber: session.phoneNumber,
        status: 'connected'
      });
    }
  }

  // Inicializar sessão usando API Oficial (placeholder para implementação futura)
  async initializeOfficialSession(session) {
    // Placeholder para implementação futura da API Oficial
    this.logger.info(`Iniciando sessão com API Oficial para ${session.companyId}`);
    
    // Verificar se as credenciais da API Oficial estão configuradas
    if (!this.officialApiUrl || !this.officialApiKey) {
      throw new Error('Credenciais da API Oficial não configuradas');
    }
    
    // Aqui seria a implementação da conexão com a API Oficial
    // Por enquanto, apenas simulamos um QR Code para demonstração
    
    // Gerar QR Code de demonstração
    const qrData = `official-api-demo-${session.companyId}-${Date.now()}`;
    const qrCodeImage = await qrcode.toDataURL(qrData);
    
    session.qrCode = qrCodeImage;
    session.status = 'connecting';
    
    // Emitir QR Code via Socket.IO
    this.socketManager.emitToCompany(session.companyId, 'whatsapp:qr-code', {
      qrCode: session.qrCode,
      companyId: session.companyId
    });
    
    // Nota: Em uma implementação real, aqui seria feita a conexão com a API Oficial
    // e o processamento do QR Code ou outro método de autenticação
  }

  async checkInstanceExists(instanceName) {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/fetchInstances`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });
      
      if (response.data && Array.isArray(response.data.instances)) {
        return response.data.instances.some(instance => instance.instanceName === instanceName);
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Erro ao verificar instância ${instanceName}:`, error);
      return false;
    }
  }

  async createEvolutionInstance(instanceName, companyId) {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const webhookUrl = `${backendUrl}/api/whatsapp/webhook/${companyId}`;
      
      const response = await axios.post(`${this.evolutionApiUrl}/instance/create`, {
        instanceName,
        token: uuidv4(),
        webhook: webhookUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });
      
      if (response.data && response.data.status === 'success') {
        this.logger.info(`Instância ${instanceName} criada com sucesso na Evolution API`);
        return true;
      } else {
        this.logger.error(`Erro ao criar instância ${instanceName}:`, response.data);
        return false;
      }
    } catch (error) {
      this.logger.error(`Erro ao criar instância ${instanceName}:`, error);
      throw error;
    }
  }

  async connectEvolutionInstance(instanceName) {
    try {
      // Primeiro, verificar status da instância
      const statusResponse = await axios.get(`${this.evolutionApiUrl}/instance/connectionState/${instanceName}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });
      
      if (statusResponse.data && statusResponse.data.state === 'open') {
        // Já está conectado
        return { 
          connected: true,
          phone: statusResponse.data.phone || null
        };
      }
      
      // Se não estiver conectado, iniciar conexão
      const response = await axios.post(`${this.evolutionApiUrl}/instance/connect/${instanceName}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });
      
      if (response.data && response.data.qrcode) {
        // Retornar QR Code para escanear
        return { 
          qrcode: response.data.qrcode,
          connected: false
        };
      } else if (response.data && response.data.state === 'open') {
        // Já está conectado
        return { 
          connected: true,
          phone: response.data.phone || null
        };
      } else {
        this.logger.error(`Resposta inesperada ao conectar instância ${instanceName}:`, response.data);
        throw new Error('Resposta inesperada da Evolution API');
      }
    } catch (error) {
      this.logger.error(`Erro ao conectar instância ${instanceName}:`, error);
      throw error;
    }
  }

  async configureWebhook(instanceName, companyId) {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const webhookUrl = `${backendUrl}/api/whatsapp/webhook/${companyId}`;
      
      const response = await axios.post(`${this.evolutionApiUrl}/webhook/set/${instanceName}`, {
        url: webhookUrl,
        events: ['messages.upsert', 'connection.update', 'qr', 'messages.update', 'presence.update']
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });
      
      if (response.data && response.data.status === 'success') {
        this.logger.info(`Webhook configurado com sucesso para ${instanceName}`);
        return true;
      } else {
        this.logger.error(`Erro ao configurar webhook para ${instanceName}:`, response.data);
        return false;
      }
    } catch (error) {
      this.logger.error(`Erro ao configurar webhook para ${instanceName}:`, error);
      return false;
    }
  }

  async processWebhook(companyId, eventData) {
    try {
      const session = this.sessions.get(companyId);
      if (!session) {
        this.logger.warn(`Recebido webhook para empresa não registrada: ${companyId}`);
        return;
      }

      // Processar apenas se for uma sessão Evolution API
      if (session.connectionType !== 'evolution') {
        this.logger.warn(`Recebido webhook para sessão não-Evolution: ${companyId}`);
        return;
      }

      // Processar diferentes tipos de eventos
      if (eventData.event === 'connection.update') {
        await this.handleConnectionUpdate(companyId, eventData.data);
      } else if (eventData.event === 'qr') {
        await this.handleQrCode(companyId, eventData.data);
      } else if (eventData.event === 'messages.upsert') {
        await this.handleNewMessage(companyId, eventData.data);
      } else if (eventData.event === 'messages.update') {
        await this.handleMessageUpdate(companyId, eventData.data);
      }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook para ${companyId}:`, error);
    }
  }

  async handleConnectionUpdate(companyId, data) {
    const session = this.sessions.get(companyId);
    if (!session) return;

    if (data.state === 'open') {
      session.status = 'connected';
      session.phoneNumber = data.phone || session.phoneNumber;
      session.lastSeen = new Date();
      session.qrCode = null;

      // Emitir status conectado
      this.socketManager.emitToCompany(companyId, 'whatsapp:connected', {
        companyId,
        phoneNumber: session.phoneNumber,
        status: 'connected'
      });

      // Atualizar no banco
      await this.saveSessionToDatabase(companyId, session);
      
      this.logger.info(`WhatsApp conectado para empresa ${companyId} - ${session.phoneNumber}`);
    } else if (data.state === 'close') {
      session.status = 'disconnected';
      session.qrCode = null;

      // Emitir status desconectado
      this.socketManager.emitToCompany(companyId, 'whatsapp:disconnected', {
        companyId,
        reason: data.reason || 'Desconectado',
        shouldReconnect: true
      });

      // Atualizar no banco
      await this.saveSessionToDatabase(companyId, session);
      
      this.logger.info(`WhatsApp desconectado para empresa ${companyId}: ${data.reason || 'Desconectado'}`);
      
      // Tentar reconectar automaticamente após 5 segundos
      setTimeout(() => {
        this.reconnectSession(companyId);
      }, 5000);
    }
  }

  async handleQrCode(companyId, data) {
    const session = this.sessions.get(companyId);
    if (!session) return;

    if (data.qrcode) {
      session.qrCode = data.qrcode;
      session.status = 'connecting';
      
      // Emitir QR Code via Socket.IO
      this.socketManager.emitToCompany(companyId, 'whatsapp:qr-code', {
        qrCode: session.qrCode,
        companyId
      });

      // Atualizar no banco
      await this.saveSessionToDatabase(companyId, session);
      
      this.logger.info(`QR Code gerado para empresa ${companyId}`);
    }
  }

  async handleNewMessage(companyId, data) {
    try {
      if (!data.messages || !data.messages.length) return;
      
      const message = data.messages[0];
      
      // Ignorar mensagens próprias
      if (message.key.fromMe) return;

      // Processar mensagem
      const processedMessage = await this.formatIncomingMessage(companyId, message);
      
      // Salvar no banco
      await this.saveMessageToDatabase(companyId, processedMessage);

      // Emitir via Socket.IO
      this.socketManager.emitToCompany(companyId, 'conversation:new-message', processedMessage);

      // Atualizar conversa
      await this.updateConversation(companyId, processedMessage);

      this.logger.info(`Mensagem processada para empresa ${companyId}: ${message.key.id}`);
    } catch (error) {
      this.logger.error(`Erro ao processar nova mensagem para ${companyId}:`, error);
    }
  }

  async handleMessageUpdate(companyId, data) {
    try {
      if (!data.messages || !data.messages.length) return;
      
      const message = data.messages[0];
      
      // Atualizar status da mensagem no banco
      if (message.update.status) {
        await this.updateMessageStatus(companyId, message.key.id, message.update.status);
        
        // Emitir atualização via Socket.IO
        this.socketManager.emitToCompany(companyId, 'message:status-update', {
          messageId: message.key.id,
          status: message.update.status
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao processar atualização de mensagem para ${companyId}:`, error);
    }
  }

  async updateMessageStatus(companyId, messageId, status) {
    try {
      const { error } = await this.databaseManager.supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId)
        .eq('company_id', companyId);

      if (error) throw error;
    } catch (error) {
      this.logger.error(`Erro ao atualizar status da mensagem ${messageId}:`, error);
    }
  }

  async formatIncomingMessage(companyId, message) {
    const messageId = message.key.id;
    const customerPhone = message.key.remoteJid.split('@')[0];
    const timestamp = new Date(message.messageTimestamp * 1000);

    let content = '';
    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let thumbnailUrl = null;

    // Processar diferentes tipos de mensagem
    if (message.message.conversation) {
      content = message.message.conversation;
    } else if (message.message.extendedTextMessage) {
      content = message.message.extendedTextMessage.text;
    } else if (message.message.imageMessage) {
      messageType = 'image';
      content = message.message.imageMessage.caption || '';
      fileName = `image_${messageId}.${message.message.imageMessage.mimetype.split('/')[1]}`;
      fileSize = message.message.imageMessage.fileLength;
      
      // Baixar mídia da Evolution API
      const mediaData = await this.downloadMedia(companyId, messageId);
      if (mediaData) {
        const uploadResult = await this.uploadFile(companyId, mediaData.buffer, fileName, messageType);
        fileUrl = uploadResult.url;
        thumbnailUrl = uploadResult.thumbnailUrl;
      }
    } else if (message.message.audioMessage) {
      messageType = 'audio';
      fileName = `audio_${messageId}.${message.message.audioMessage.mimetype.split('/')[1]}`;
      fileSize = message.message.audioMessage.fileLength;
      
      // Baixar mídia da Evolution API
      const mediaData = await this.downloadMedia(companyId, messageId);
      if (mediaData) {
        const uploadResult = await this.uploadFile(companyId, mediaData.buffer, fileName, messageType);
        fileUrl = uploadResult.url;
      }
    } else if (message.message.videoMessage) {
      messageType = 'video';
      content = message.message.videoMessage.caption || '';
      fileName = `video_${messageId}.${message.message.videoMessage.mimetype.split('/')[1]}`;
      fileSize = message.message.videoMessage.fileLength;
      
      // Baixar mídia da Evolution API
      const mediaData = await this.downloadMedia(companyId, messageId);
      if (mediaData) {
        const uploadResult = await this.uploadFile(companyId, mediaData.buffer, fileName, messageType);
        fileUrl = uploadResult.url;
        thumbnailUrl = uploadResult.thumbnailUrl;
      }
    } else if (message.message.documentMessage) {
      messageType = 'file';
      content = message.message.documentMessage.caption || '';
      fileName = message.message.documentMessage.fileName || `file_${messageId}`;
      fileSize = message.message.documentMessage.fileLength;
      
      // Baixar mídia da Evolution API
      const mediaData = await this.downloadMedia(companyId, messageId);
      if (mediaData) {
        const uploadResult = await this.uploadFile(companyId, mediaData.buffer, fileName, messageType);
        fileUrl = uploadResult.url;
      }
    } else if (message.message.stickerMessage) {
      messageType = 'image';
      fileName = `sticker_${messageId}.webp`;
      
      // Baixar mídia da Evolution API
      const mediaData = await this.downloadMedia(companyId, messageId);
      if (mediaData) {
        const uploadResult = await this.uploadFile(companyId, mediaData.buffer, fileName, messageType);
        fileUrl = uploadResult.url;
        thumbnailUrl = uploadResult.url;
      }
    }

    return {
      id: messageId,
      company_id: companyId,
      customer_phone: customerPhone,
      content,
      timestamp,
      sender: 'customer',
      sender_name: message.pushName || customerPhone,
      message_type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      thumbnail_url: thumbnailUrl,
      status: 'received',
      metadata: {
        whatsapp_message_id: messageId,
        whatsapp_remote_jid: message.key.remoteJid,
        raw_message: message
      }
    };
  }

  async downloadMedia(companyId, messageId) {
    try {
      const session = this.sessions.get(companyId);
      if (!session) throw new Error(`Sessão não encontrada para empresa ${companyId}`);

      // Verificar tipo de conexão
      if (session.connectionType === 'evolution') {
        return await this.downloadMediaFromEvolution(session.instanceName, messageId);
      } else if (session.connectionType === 'official') {
        return await this.downloadMediaFromOfficial(session.instanceName, messageId);
      } else {
        throw new Error(`Tipo de conexão desconhecido: ${session.connectionType}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao baixar mídia para mensagem ${messageId}:`, error);
      return null;
    }
  }

  async downloadMediaFromEvolution(instanceName, messageId) {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/message/download/${instanceName}`, {
        params: {
          messageId
        },
        headers: {
          'apikey': this.evolutionApiKey
        },
        responseType: 'arraybuffer'
      });

      if (response.status === 200) {
        return {
          buffer: Buffer.from(response.data),
          mimetype: response.headers['content-type']
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Erro ao baixar mídia da Evolution API:`, error);
      throw error;
    }
  }

  async downloadMediaFromOfficial(instanceName, messageId) {
    // Placeholder para implementação futura da API Oficial
    this.logger.info(`Download de mídia da API Oficial não implementado ainda`);
    return null;
  }

  async uploadFile(companyId, buffer, fileName, fileType) {
    try {
      // Upload para Supabase Storage
      const fileId = uuidv4();
      const fileExtension = path.extname(fileName);
      const storagePath = `${companyId}/messages/${fileId}${fileExtension}`;

      const { data, error } = await this.databaseManager.supabase.storage
        .from('company-files')
        .upload(storagePath, buffer, {
          contentType: this.getMimeType(fileExtension),
          upsert: false
        });

      if (error) throw error;

      // Gerar URL pública
      const { data: urlData } = this.databaseManager.supabase.storage
        .from('company-files')
        .getPublicUrl(storagePath);

      const result = {
        url: urlData.publicUrl,
        path: storagePath,
        size: buffer.length
      };

      // Gerar thumbnail para imagens e vídeos
      if (fileType === 'image' || fileType === 'video') {
        try {
          const thumbnailBuffer = await this.generateThumbnail(buffer, fileType);
          const thumbnailPath = `${companyId}/thumbnails/${fileId}_thumb.jpg`;
          
          await this.databaseManager.supabase.storage
            .from('company-files')
            .upload(thumbnailPath, thumbnailBuffer, {
              contentType: 'image/jpeg'
            });

          const { data: thumbUrlData } = this.databaseManager.supabase.storage
            .from('company-files')
            .getPublicUrl(thumbnailPath);

          result.thumbnailUrl = thumbUrlData.publicUrl;
        } catch (error) {
          this.logger.error('Erro ao gerar thumbnail:', error);
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }

  async generateThumbnail(buffer, fileType) {
    // Implementar geração de thumbnail usando Sharp
    const sharp = (await import('sharp')).default;
    
    if (fileType === 'image') {
      return await sharp(buffer)
        .resize(200, 200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
    }
    
    // Para vídeos, seria necessário usar FFmpeg
    // Por simplicidade, retornamos um placeholder
    return buffer;
  }

  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.mp4': 'video/mp4',
      '.avi': 'video/avi',
      '.webp': 'image/webp'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  async sendMessage(companyId, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    try {
      const session = this.sessions.get(companyId);
      if (!session || session.status !== 'connected') {
        throw new Error('WhatsApp não conectado para esta empresa');
      }

      // Adicionar à fila de mensagens com prioridade normal
      return await this.queueMessage(companyId, {
        to,
        content,
        messageType,
        fileBuffer,
        fileName,
        priority: 'normal',
        retries: 0
      });
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async queueMessage(companyId, messageData) {
    const queue = this.messageQueue.get(companyId) || [];
    const messageId = uuidv4();
    
    queue.push({
      id: messageId,
      ...messageData,
      status: 'queued',
      queuedAt: new Date()
    });
    
    this.messageQueue.set(companyId, queue);
    this.logger.info(`Mensagem ${messageId} adicionada à fila para ${companyId}`);
    
    return { success: true, messageId };
  }

  startMessageQueueProcessing() {
    // Processar filas de mensagens a cada 1 segundo
    setInterval(() => {
      this.sessions.forEach((session, companyId) => {
        this.processMessageQueue(companyId);
      });
    }, 1000);
  }

  async processMessageQueue(companyId) {
    const queue = this.messageQueue.get(companyId) || [];
    if (queue.length === 0) return;
    
    const session = this.sessions.get(companyId);
    if (!session || session.status !== 'connected') return;
    
    // Verificar rate limits
    const rateLimitInfo = this.messageRateLimits.get(companyId) || { lastSent: 0, count: 0 };
    const now = Date.now();
    
    // Resetar contador a cada minuto
    if (now - rateLimitInfo.lastSent > 60000) {
      rateLimitInfo.count = 0;
    }
    
    // Limitar a 20 mensagens por minuto (configurável)
    const maxPerMinute = parseInt(process.env.WHATSAPP_RATE_LIMIT) || 20;
    if (rateLimitInfo.count >= maxPerMinute) {
      return;
    }
    
    // Pegar a próxima mensagem da fila
    const message = queue.shift();
    this.messageQueue.set(companyId, queue);
    
    try {
      // Enviar mensagem baseado no tipo de conexão
      let result;
      if (session.connectionType === 'evolution') {
        result = await this.sendMessageToEvolution(
          session.instanceName,
          message.to,
          message.content,
          message.messageType,
          message.fileBuffer,
          message.fileName
        );
      } else if (session.connectionType === 'official') {
        result = await this.sendMessageToOfficial(
          session.instanceName,
          message.to,
          message.content,
          message.messageType,
          message.fileBuffer,
          message.fileName
        );
      } else {
        throw new Error(`Tipo de conexão desconhecido: ${session.connectionType}`);
      }
      
      // Atualizar rate limits
      rateLimitInfo.lastSent = now;
      rateLimitInfo.count++;
      this.messageRateLimits.set(companyId, rateLimitInfo);
      
      // Salvar mensagem enviada no banco
      if (result.success) {
        const messageData = {
          id: result.messageId || message.id,
          company_id: companyId,
          customer_phone: message.to,
          content: message.content,
          timestamp: new Date(),
          sender: 'agent',
          message_type: message.messageType,
          status: 'sent',
          metadata: {
            whatsapp_message_id: result.messageId,
            whatsapp_remote_jid: message.to.includes('@') ? message.to : `${message.to}@s.whatsapp.net`
          }
        };

        await this.saveMessageToDatabase(companyId, messageData);
        this.logger.info(`Mensagem enviada para ${message.to} da empresa ${companyId}`);
      } else {
        // Se falhou, tentar novamente até 3 vezes com delay exponencial
        if (message.retries < 3) {
          message.retries++;
          message.priority = 'high'; // Aumentar prioridade
          
          // Adicionar de volta à fila com delay exponencial
          setTimeout(() => {
            const queue = this.messageQueue.get(companyId) || [];
            queue.push(message);
            this.messageQueue.set(companyId, queue);
          }, 1000 * Math.pow(2, message.retries));
          
          this.logger.warn(`Falha ao enviar mensagem para ${message.to}. Tentativa ${message.retries}/3`);
        } else {
          this.logger.error(`Falha ao enviar mensagem para ${message.to} após 3 tentativas`);
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem da fila para ${companyId}:`, error);
      
      // Recolocar na fila se ainda houver tentativas
      if (message.retries < 3) {
        message.retries++;
        
        // Adicionar de volta à fila com delay exponencial
        setTimeout(() => {
          const queue = this.messageQueue.get(companyId) || [];
          queue.push(message);
          this.messageQueue.set(companyId, queue);
        }, 1000 * Math.pow(2, message.retries));
      }
    }
  }

  async sendMessageToEvolution(instanceName, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    try {
      // Normalizar número de telefone
      const normalizedPhone = this.normalizePhone(to);
      
      // Selecionar User-Agent aleatório para evitar detecção de padrões
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      let response;
      
      switch (messageType) {
        case 'text':
          response = await axios.post(`${this.evolutionApiUrl}/message/sendText/${instanceName}`, {
            number: normalizedPhone,
            options: {
              delay: 1000, // Delay para simular comportamento humano
              presence: 'composing' // Mostrar "digitando..."
            },
            textMessage: {
              text: content
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
              'User-Agent': userAgent
            }
          });
          break;
          
        case 'image':
          if (!fileBuffer) throw new Error('Buffer do arquivo é obrigatório para imagens');
          
          // Converter buffer para base64
          const base64Image = fileBuffer.toString('base64');
          
          response = await axios.post(`${this.evolutionApiUrl}/message/sendMedia/${instanceName}`, {
            number: normalizedPhone,
            options: {
              delay: 1000,
              presence: 'composing'
            },
            mediaMessage: {
              mediatype: 'image',
              caption: content,
              media: base64Image
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
              'User-Agent': userAgent
            }
          });
          break;
          
        case 'document':
        case 'file':
          if (!fileBuffer) throw new Error('Buffer do arquivo é obrigatório para documentos');
          
          // Converter buffer para base64
          const base64Doc = fileBuffer.toString('base64');
          
          response = await axios.post(`${this.evolutionApiUrl}/message/sendMedia/${instanceName}`, {
            number: normalizedPhone,
            options: {
              delay: 1000,
              presence: 'composing'
            },
            mediaMessage: {
              mediatype: 'document',
              caption: content,
              media: base64Doc,
              fileName: fileName || 'document'
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
              'User-Agent': userAgent
            }
          });
          break;
          
        case 'audio':
          if (!fileBuffer) throw new Error('Buffer do arquivo é obrigatório para áudios');
          
          // Converter buffer para base64
          const base64Audio = fileBuffer.toString('base64');
          
          response = await axios.post(`${this.evolutionApiUrl}/message/sendMedia/${instanceName}`, {
            number: normalizedPhone,
            options: {
              delay: 1000,
              presence: 'recording' // Mostrar "gravando áudio..."
            },
            mediaMessage: {
              mediatype: 'audio',
              media: base64Audio
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
              'User-Agent': userAgent
            }
          });
          break;
          
        case 'video':
          if (!fileBuffer) throw new Error('Buffer do arquivo é obrigatório para vídeos');
          
          // Converter buffer para base64
          const base64Video = fileBuffer.toString('base64');
          
          response = await axios.post(`${this.evolutionApiUrl}/message/sendMedia/${instanceName}`, {
            number: normalizedPhone,
            options: {
              delay: 1000,
              presence: 'composing'
            },
            mediaMessage: {
              mediatype: 'video',
              caption: content,
              media: base64Video
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.evolutionApiKey,
              'User-Agent': userAgent
            }
          });
          break;
          
        default:
          throw new Error(`Tipo de mensagem não suportado: ${messageType}`);
      }

      if (response.data && response.data.key && response.data.key.id) {
        return { 
          success: true, 
          messageId: response.data.key.id 
        };
      } else {
        this.logger.error(`Resposta inesperada ao enviar mensagem:`, response.data);
        return { success: false };
      }
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem via Evolution API:`, error);
      return { success: false };
    }
  }

  async sendMessageToOfficial(instanceName, to, content, messageType = 'text', fileBuffer = null, fileName = null) {
    // Placeholder para implementação futura da API Oficial
    this.logger.info(`Envio de mensagem via API Oficial não implementado ainda`);
    
    // Simular sucesso para demonstração
    return { 
      success: true, 
      messageId: `official-${Date.now()}-${Math.random().toString(36).substring(2, 15)}` 
    };
  }

  normalizePhone(phone) {
    if (!phone) return '';
    
    // Remover caracteres especiais
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Adicionar código do país se não tiver
    if (!normalized.startsWith('+')) {
      if (normalized.startsWith('55')) {
        normalized = '+' + normalized;
      } else if (normalized.length === 11 && normalized.startsWith('11')) {
        normalized = '+55' + normalized;
      } else if (normalized.length === 10) {
        normalized = '+5511' + normalized;
      } else {
        normalized = '+55' + normalized;
      }
    }
    
    return normalized;
  }

  async saveMessageToDatabase(companyId, messageData) {
    try {
      // Primeiro, verificar/criar conversa
      let conversationId = await this.getOrCreateConversation(companyId, messageData.customer_phone);

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
      this.logger.error('Erro ao salvar mensagem no banco:', error);
      throw error;
    }
  }

  async getOrCreateConversation(companyId, customerPhone) {
    try {
      // Buscar conversa existente
      const { data: existingConversation, error } = await this.databaseManager.supabase
        .from('conversations')
        .select('id')
        .eq('company_id', companyId)
        .eq('customer_phone', customerPhone)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (existingConversation) {
        return existingConversation.id;
      }

      // Criar nova conversa
      const conversationData = {
        company_id: companyId,
        customer_name: customerPhone, // Será atualizado depois
        customer_phone: customerPhone,
        status: 'active',
        source: 'whatsapp',
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
      this.logger.error('Erro ao criar/buscar conversa:', error);
      throw error;
    }
  }

  async updateConversation(companyId, messageData) {
    try {
      const conversationId = await this.getOrCreateConversation(companyId, messageData.customer_phone);

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
      this.logger.error('Erro ao atualizar conversa:', error);
    }
  }

  async saveSessionToDatabase(companyId, session) {
    try {
      const sessionData = {
        company_id: companyId,
        session_name: `session_${companyId}`,
        status: session.status,
        qr_code: session.qrCode,
        phone_number: session.phoneNumber,
        last_seen: session.lastSeen,
        connection_logs: session.connectionLogs,
        connection_type: session.connectionType, // Novo campo para tipo de conexão
        updated_at: new Date().toISOString()
      };

      // Verificar se a sessão já existe
      const { data: existingSession, error: checkError } = await this.databaseManager.supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('company_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        this.logger.error('Erro ao verificar sessão existente:', checkError);
        return;
      }

      if (existingSession) {
        // Atualizar sessão existente
        const { error } = await this.databaseManager.supabase
          .from('whatsapp_sessions')
          .update(sessionData)
          .eq('company_id', companyId);

        if (error) {
          this.logger.error('Erro ao atualizar sessão no banco:', error);
        } else {
          this.logger.info(`Sessão atualizada no banco para empresa ${companyId}`);
        }
      } else {
        // Inserir nova sessão
        const { error } = await this.databaseManager.supabase
          .from('whatsapp_sessions')
          .insert({
            ...sessionData,
            created_at: new Date().toISOString()
          });

        if (error) {
          this.logger.error('Erro ao inserir sessão no banco:', error);
        } else {
          this.logger.info(`Sessão inserida no banco para empresa ${companyId}`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao salvar sessão no banco:', error);
    }
  }

  async disconnectSession(companyId) {
    try {
      const session = this.sessions.get(companyId);
      if (!session) {
        throw new Error(`Sessão não encontrada para empresa ${companyId}`);
      }

      // Desconectar baseado no tipo de conexão
      if (session.connectionType === 'evolution') {
        await this.disconnectEvolutionSession(session.instanceName);
      } else if (session.connectionType === 'official') {
        await this.disconnectOfficialSession(session.instanceName);
      } else {
        throw new Error(`Tipo de conexão desconhecido: ${session.connectionType}`);
      }

      // Atualizar status da sessão
      session.status = 'disconnected';
      session.qrCode = null;
      session.phoneNumber = null;
      session.lastSeen = new Date();

      // Emitir evento de desconexão
      this.socketManager.emitToCompany(companyId, 'whatsapp:disconnected', {
        companyId,
        status: 'disconnected'
      });

      // Atualizar no banco
      await this.saveSessionToDatabase(companyId, session);

      this.logger.info(`Sessão desconectada para empresa ${companyId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao desconectar sessão para empresa ${companyId}:`, error);
      throw error;
    }
  }

  async disconnectEvolutionSession(instanceName) {
    try {
      const response = await axios.delete(`${this.evolutionApiUrl}/instance/logout/${instanceName}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      if (response.data && response.data.status === 'success') {
        this.logger.info(`Instância ${instanceName} desconectada com sucesso da Evolution API`);
        return true;
      } else {
        this.logger.error(`Erro ao desconectar instância ${instanceName}:`, response.data);
        return false;
      }
    } catch (error) {
      this.logger.error(`Erro ao desconectar instância ${instanceName}:`, error);
      throw error;
    }
  }

  async disconnectOfficialSession(instanceName) {
    // Placeholder para implementação futura da API Oficial
    this.logger.info(`Desconexão da API Oficial não implementada ainda`);
    return true;
  }

  async reconnectSession(companyId) {
    try {
      const session = this.sessions.get(companyId);
      if (!session) {
        throw new Error(`Sessão não encontrada para empresa ${companyId}`);
      }

      // Reconectar baseado no tipo de conexão
      if (session.connectionType === 'evolution') {
        await this.initializeEvolutionSession(session);
      } else if (session.connectionType === 'official') {
        await this.initializeOfficialSession(session);
      } else {
        throw new Error(`Tipo de conexão desconhecido: ${session.connectionType}`);
      }

      this.logger.info(`Tentativa de reconexão para empresa ${companyId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao reconectar sessão para empresa ${companyId}:`, error);
      return false;
    }
  }

  async getSessionStatus(companyId) {
    try {
      const session = this.sessions.get(companyId);
      
      if (!session) {
        // Tentar buscar do banco
        const { data, error } = await this.databaseManager.supabase
          .from('whatsapp_sessions')
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          return {
            connected: data.status === 'connected',
            status: data.status,
            phoneNumber: data.phone_number,
            qrCode: data.qr_code,
            lastSeen: data.last_seen,
            connectionType: data.connection_type || 'evolution'
          };
        }

        // Se não encontrou no banco, retornar status desconectado
        return {
          connected: false,
          status: 'disconnected',
          phoneNumber: null,
          qrCode: null,
          lastSeen: null,
          connectionType: 'evolution'
        };
      }

      return {
        connected: session.status === 'connected',
        status: session.status,
        phoneNumber: session.phoneNumber,
        qrCode: session.qrCode,
        lastSeen: session.lastSeen,
        connectionType: session.connectionType
      };
    } catch (error) {
      this.logger.error(`Erro ao obter status da sessão para empresa ${companyId}:`, error);
      throw error;
    }
  }

  getAvailableConnectionTypes() {
    return [
      {
        id: 'evolution',
        name: 'Evolution API',
        description: 'Conexão via QR Code usando Evolution API (recomendado)'
      },
      {
        id: 'official',
        name: 'API Oficial',
        description: 'Conexão via API Oficial do WhatsApp Business'
      }
    ];
  }

  getHealthStatus() {
    const healthStatus = {
      totalSessions: this.sessions.size,
      connectedSessions: 0,
      disconnectedSessions: 0,
      connectingSessions: 0,
      errorSessions: 0,
      sessionsByType: {
        evolution: 0,
        official: 0
      },
      sessions: []
    };

    this.sessions.forEach((session, companyId) => {
      // Contar por status
      if (session.status === 'connected') healthStatus.connectedSessions++;
      else if (session.status === 'disconnected') healthStatus.disconnectedSessions++;
      else if (session.status === 'connecting') healthStatus.connectingSessions++;
      else if (session.status === 'error') healthStatus.errorSessions++;

      // Contar por tipo
      if (session.connectionType === 'evolution') healthStatus.sessionsByType.evolution++;
      else if (session.connectionType === 'official') healthStatus.sessionsByType.official++;

      // Adicionar detalhes da sessão
      healthStatus.sessions.push({
        companyId,
        status: session.status,
        phoneNumber: session.phoneNumber,
        lastSeen: session.lastSeen,
        connectionType: session.connectionType
      });
    });

    return healthStatus;
  }
}