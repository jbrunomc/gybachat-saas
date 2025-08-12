import pino from 'pino';

// Configurar logger
const logger = pino({
  name: 'gybachat-api',
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  } : undefined
});

// Middleware de logging de requisições
export const requestLogger = (logger) => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Log da requisição
    logger.info({
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }, 'Incoming request');

    // Override do res.end para capturar o tempo de resposta
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - start;
      
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }, 'Request completed');
      
      originalEnd.apply(this, args);
    };

    next();
  };
};

export default logger;

