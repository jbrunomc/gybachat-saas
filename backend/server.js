import express from 'express';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente PRIMEIRO
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pino from 'pino';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { authenticateToken, verifyCompany } from './middleware/auth.js';
import { generalRateLimit } from './middleware/rateLimit.js';

// Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import companiesRoutes from './routes/companies.js';
import conversationsRoutes from './routes/conversations.js';
import whatsappRoutes from './routes/whatsapp.js';
import socialMediaRoutes from './routes/social-media.js';
import tagsRoutes from './routes/tags.js';
import campaignsRoutes from './routes/campaigns.js';
import automationsRoutes from './routes/automations.js';
import uploadsRoutes from './routes/uploads.js';
import analyticsRoutes from './routes/analytics.js';
import billingRoutes from './routes/billing.js';
import landingRoutes from './routes/landing.js';

// Services
import { DatabaseManager } from './services/DatabaseManager.js';
import { SocketManager } from './services/SocketManager.js';
import { WhatsAppManager } from './services/WhatsAppManager.js';
import { SocialMediaManager } from './services/SocialMediaManager.js';
import { ConversationManager } from './services/ConversationManager.js';
import { ContactsManager } from './services/ContactsManager.js';
import { AutomationManager } from './services/AutomationManager.js';
import { MonitoringService } from './services/MonitoringService.js';
import { BackupService } from './services/BackupService.js';
import { BillingManager } from './services/BillingManager.js';

// Inicializar logger
const logger = pino({
  name: 'server',
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Inicializar app Express
const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Inicializar serviços
const databaseManager = new DatabaseManager();
const socketManager = new SocketManager(io, databaseManager);
const whatsAppManager = new WhatsAppManager(socketManager, databaseManager);
const socialMediaManager = new SocialMediaManager(socketManager, databaseManager);
const conversationManager = new ConversationManager(socketManager, databaseManager);
const contactsManager = new ContactsManager(databaseManager);
const automationManager = new AutomationManager(socketManager, databaseManager);
const monitoringService = new MonitoringService(
  databaseManager, 
  whatsAppManager, 
  socialMediaManager, 
  conversationManager
);
const backupService = new BackupService(databaseManager);
const billingManager = new BillingManager(databaseManager);

// Disponibilizar serviços para as rotas
app.locals.databaseManager = databaseManager;
app.locals.socketManager = socketManager;
app.locals.whatsAppManager = whatsAppManager;
app.locals.socialMediaManager = socialMediaManager;
app.locals.conversationManager = conversationManager;
app.locals.contactsManager = contactsManager;
app.locals.automationManager = automationManager;
app.locals.monitoringService = monitoringService;
app.locals.backupService = backupService;
app.locals.billingManager = billingManager;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID']
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger(logger));
app.use(generalRateLimit);

// Rotas públicas
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: databaseManager?.isHealthy() || false,
      whatsapp: whatsAppManager?.getHealthStatus() || 'unknown',
      socialMedia: socialMediaManager?.getHealthStatus() || 'unknown',
      socket: socketManager?.isHealthy() || false
    }
  };
  
  res.json(healthStatus);
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/companies', authenticateToken, companiesRoutes);
app.use('/api/conversations', authenticateToken, conversationsRoutes);
app.use('/api/whatsapp', authenticateToken, whatsappRoutes);
app.use('/api/social-media', authenticateToken, socialMediaRoutes);
app.use('/api/tags', authenticateToken, tagsRoutes);
app.use('/api/campaigns', authenticateToken, campaignsRoutes);
app.use('/api/automations', authenticateToken, automationsRoutes);
app.use('/api/uploads', authenticateToken, uploadsRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/landing', landingRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar serviços e iniciar servidor
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Inicializar conexão com o banco de dados
    await databaseManager.initialize();
    logger.info('Conexão com o banco de dados estabelecida');
    
    // Inicializar Socket.IO (já inicializado no construtor)
    logger.info('Socket.IO inicializado');
    
    // Inicializar WhatsApp Manager
    await whatsAppManager.initialize();
    logger.info('WhatsApp Manager inicializado');
    
    // Inicializar Social Media Manager
    await socialMediaManager.initialize();
    logger.info('Social Media Manager inicializado');
    
    // Inicializar serviços adicionais
    await conversationManager.initialize();
    await contactsManager.initialize();
    await automationManager.initialize();
    await monitoringService.initialize();
    await backupService.initialize();
    
    // Iniciar servidor HTTP
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Servidor rodando em http://${HOST}:${PORT}`);
    });
    
    // Configurar tratamento de encerramento
    setupGracefulShutdown();
    
  } catch (error) {
    logger.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Configurar encerramento gracioso
const setupGracefulShutdown = () => {
  const shutdown = async (signal) => {
    logger.info(`Recebido sinal ${signal}. Iniciando encerramento gracioso...`);
    
    // Notificar clientes
    socketManager.broadcastSystemAlert({
      type: 'shutdown',
      message: 'O servidor será reiniciado em breve. Por favor, salve seu trabalho.'
    });
    
    // Aguardar para que os clientes recebam a notificação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Encerrar serviços
    httpServer.close(() => {
      logger.info('Servidor HTTP encerrado');
      
      // Encerrar outros serviços
      Promise.all([
        whatsAppManager.shutdown(),
        socialMediaManager.shutdown(),
        databaseManager.shutdown(),
        backupService.shutdown()
      ])
      .then(() => {
        logger.info('Todos os serviços encerrados com sucesso');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Erro ao encerrar serviços:', error);
        process.exit(1);
      });
    });
    
    // Se o servidor não encerrar em 10 segundos, forçar encerramento
    setTimeout(() => {
      logger.error('Timeout ao encerrar o servidor. Forçando encerramento.');
      process.exit(1);
    }, 10000);
  };
  
  // Capturar sinais de encerramento
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Capturar exceções não tratadas
  process.on('uncaughtException', (error) => {
    logger.error('Exceção não tratada:', error);
    shutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Rejeição não tratada:', reason);
    shutdown('unhandledRejection');
  });
};

// Iniciar servidor
startServer();