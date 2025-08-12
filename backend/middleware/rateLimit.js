import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter geral
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // 100 requests
  duration: 60, // por 60 segundos
});

// Rate limiter para login
const loginLimiter = new RateLimiterMemory({
  keyPrefix: 'login',
  points: 5, // 5 tentativas
  duration: 900, // por 15 minutos
  blockDuration: 900, // bloquear por 15 minutos
});

// Rate limiter para WhatsApp
const whatsappLimiter = new RateLimiterMemory({
  keyPrefix: 'whatsapp',
  points: 30, // 30 mensagens
  duration: 60, // por minuto
});

// Middleware geral de rate limiting
export const generalRateLimit = async (req, res, next) => {
  try {
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em alguns segundos.',
      retryAfter: secs
    });
  }
};

// Middleware para login
export const loginRateLimit = async (req, res, next) => {
  try {
    const key = req.ip;
    await loginLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: secs
    });
  }
};

// Middleware para WhatsApp
export const whatsappRateLimit = async (req, res, next) => {
  try {
    const key = `${req.ip}_${req.companyId || 'unknown'}`;
    await whatsappLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Limite de mensagens WhatsApp excedido. Aguarde um minuto.',
      retryAfter: secs
    });
  }
};

