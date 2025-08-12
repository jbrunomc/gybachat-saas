# IMPLEMENTAÇÃO TÉCNICA: NÚMERO WHATSAPP COMO PORTAL

## INFRAESTRUTURA NECESSÁRIA

### 1. WhatsApp Business API (Meta)

#### Requisitos
- **Conta Meta Business** verificada
- **Número de telefone** dedicado (+55 11 99999-8888)
- **Verificação empresarial** (documentos CNPJ)
- **WhatsApp Business API** ativada

#### Configuração Meta Business
```javascript
// Configuração do webhook
const WEBHOOK_CONFIG = {
  url: "https://gyba-ai-service.com/webhook/whatsapp",
  verify_token: "GYBA_WEBHOOK_SECRET_2024",
  fields: ["messages", "message_deliveries", "message_reads"]
};

// Configuração da API
const WHATSAPP_API = {
  phone_number_id: "123456789012345",
  business_account_id: "987654321098765",
  access_token: "EAAG...long_token",
  api_version: "v18.0"
};
```

### 2. Servidor Webhook (Node.js)

#### Estrutura Principal
```javascript
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificação do webhook (Meta exige)
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recebimento de mensagens
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    
    // Verificar se é uma mensagem
    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(entry => {
        entry.changes.forEach(change => {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            if (messages) {
              messages.forEach(message => {
                processIncomingMessage(message, change.value);
              });
            }
          }
        });
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro interno');
  }
});
```

#### Processamento de Mensagens
```javascript
const processIncomingMessage = async (message, metadata) => {
  const senderPhone = message.from;
  const messageText = message.text?.body || '';
  const messageType = message.type; // text, image, document, etc.
  
  console.log(`Mensagem de ${senderPhone}: ${messageText}`);
  
  try {
    // 1. Identificar usuário
    const user = await identifyUser(senderPhone);
    
    if (!user) {
      return sendWelcomeMessage(senderPhone);
    }
    
    // 2. Gerenciar sessão
    const session = await getOrCreateSession(senderPhone, user);
    
    // 3. Processar comando
    const response = await processCommand(messageText, user, session);
    
    // 4. Enviar resposta
    await sendMessage(senderPhone, response);
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    await sendMessage(senderPhone, 'Desculpe, ocorreu um erro. Tente novamente.');
  }
};
```

### 3. Sistema de Identificação de Usuários

#### Busca por Telefone
```javascript
const identifyUser = async (phone) => {
  // Normalizar telefone (remover +, espaços, etc.)
  const normalizedPhone = normalizePhone(phone);
  
  // Buscar no banco de dados
  const user = await db.query(`
    SELECT u.*, uc.company_id, uc.role, uc.permissions, c.name as company_name
    FROM users u
    JOIN user_companies uc ON u.id = uc.user_id
    JOIN companies c ON uc.company_id = c.id
    WHERE u.phone = ? AND u.phone_verified_at IS NOT NULL AND uc.active = true
  `, [normalizedPhone]);
  
  return user.length > 0 ? user : null;
};

const normalizePhone = (phone) => {
  // Remover caracteres especiais e padronizar
  return phone.replace(/\D/g, '').replace(/^55/, '');
};
```

#### Mensagem de Boas-vindas
```javascript
const sendWelcomeMessage = async (phone) => {
  const message = `🏢 *Bem-vindo ao GYBA ERP!*

Para usar este serviço, você precisa:

1️⃣ Ter uma conta no sistema GYBA
2️⃣ Cadastrar este número no seu perfil
3️⃣ Verificar o número via SMS

📱 *Como cadastrar:*
• Acesse o painel GYBA
• Vá em "Configurações" → "WhatsApp"
• Cadastre este número: ${phone}
• Confirme o código SMS

🔗 *Acesse:* https://app.gyba.com.br

Precisa de ajuda? Entre em contato com o suporte.`;

  return sendMessage(phone, message);
};
```

### 4. Sistema de Sessões

#### Gerenciamento de Estado
```javascript
const getOrCreateSession = async (phone, user) => {
  let session = await redis.get(`session:${phone}`);
  
  if (!session) {
    session = {
      phone: phone,
      user_id: user.id,
      company_id: user.company_id,
      state: 'idle',
      context: {},
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    };
    
    await redis.setex(`session:${phone}`, 1800, JSON.stringify(session));
  } else {
    session = JSON.parse(session);
    
    // Renovar expiração
    session.expires_at = new Date(Date.now() + 30 * 60 * 1000);
    await redis.setex(`session:${phone}`, 1800, JSON.stringify(session));
  }
  
  return session;
};
```

#### Estados de Conversa
```javascript
const SESSION_STATES = {
  IDLE: 'idle',                    // Aguardando comando
  SELECTING_COMPANY: 'selecting_company',  // Escolhendo empresa
  CHAT_MODE: 'chat_mode',          // Modo chat IA
  ERP_ACCOUNTS_PAYABLE: 'erp_ap',  // Contas a pagar
  ERP_ACCOUNTS_RECEIVABLE: 'erp_ar', // Contas a receber
  ERP_SALES: 'erp_sales',          // Vendas
  WAITING_INPUT: 'waiting_input'    // Aguardando entrada específica
};
```

### 5. Processamento de Comandos

#### Detector de Intenções
```javascript
const processCommand = async (message, user, session) => {
  // Detectar intenção usando IA
  const intent = await detectIntent(message, session.context);
  
  switch (intent.type) {
    case 'help':
      return generateHelpMessage(user);
    
    case 'chat':
      return processChatMessage(message, user, session);
    
    case 'erp_accounts_payable':
      return processAccountsPayable(message, user, session);
    
    case 'erp_accounts_receivable':
      return processAccountsReceivable(message, user, session);
    
    case 'erp_sales':
      return processSales(message, user, session);
    
    case 'erp_inventory':
      return processInventory(message, user, session);
    
    case 'erp_reports':
      return processReports(message, user, session);
    
    default:
      return generateMainMenu(user);
  }
};

const detectIntent = async (message, context) => {
  const prompt = `
Analise a mensagem do usuário e determine a intenção:

Mensagem: "${message}"
Contexto: ${JSON.stringify(context)}

Intenções possíveis:
- help: ajuda, como usar, comandos
- chat: conversa geral, dúvidas sobre produtos
- erp_accounts_payable: contas a pagar, vencimentos, pagamentos
- erp_accounts_receivable: contas a receber, cobranças, recebimentos
- erp_sales: vendas, orçamentos, propostas, pedidos
- erp_inventory: estoque, produtos, movimentações
- erp_reports: relatórios, dashboards, análises

Responda apenas com o tipo da intenção.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50
  });
  
  return { type: response.choices[0].message.content.trim() };
};
```

### 6. Menu Principal Interativo

#### Geração do Menu
```javascript
const generateMainMenu = (user) => {
  const permissions = user.permissions || [];
  
  let menu = `🏢 *${user.company_name}*\n`;
  menu += `👋 Olá, ${user.name}!\n\n`;
  menu += `📋 *O que você gostaria de fazer?*\n\n`;
  
  // Chat IA sempre disponível
  menu += `💬 *Chat Inteligente*\n`;
  menu += `• Digite sua dúvida ou "chat"\n\n`;
  
  // Módulos ERP baseados em permissões
  if (permissions.includes('erp.accounts_payable')) {
    menu += `💰 *Contas a Pagar*\n`;
    menu += `• "contas a pagar" ou "vencimentos"\n\n`;
  }
  
  if (permissions.includes('erp.accounts_receivable')) {
    menu += `💵 *Contas a Receber*\n`;
    menu += `• "contas a receber" ou "cobranças"\n\n`;
  }
  
  if (permissions.includes('erp.sales')) {
    menu += `📊 *Vendas*\n`;
    menu += `• "vendas", "orçamentos" ou "propostas"\n\n`;
  }
  
  if (permissions.includes('erp.inventory')) {
    menu += `📦 *Estoque*\n`;
    menu += `• "estoque" ou "produtos"\n\n`;
  }
  
  if (permissions.includes('erp.reports')) {
    menu += `📈 *Relatórios*\n`;
    menu += `• "relatórios" ou "dashboards"\n\n`;
  }
  
  menu += `❓ *Ajuda*\n`;
  menu += `• Digite "ajuda" ou "comandos"\n\n`;
  menu += `🔄 *Menu Principal*\n`;
  menu += `• Digite "menu" a qualquer momento`;
  
  return menu;
};
```

### 7. Envio de Mensagens

#### API WhatsApp
```javascript
const sendMessage = async (to, message) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: message
    }
  };
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Mensagem enviada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    throw error;
  }
};
```

#### Mensagens com Botões (Interativas)
```javascript
const sendInteractiveMessage = async (to, header, body, buttons) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: header
      },
      body: {
        text: body
      },
      action: {
        buttons: buttons.map((button, index) => ({
          type: "reply",
          reply: {
            id: `btn_${index}`,
            title: button
          }
        }))
      }
    }
  };
  
  return axios.post(url, data, {
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};
```

### 8. Configuração de Ambiente

#### Variáveis de Ambiente
```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAG...long_token
PHONE_NUMBER_ID=123456789012345
BUSINESS_ACCOUNT_ID=987654321098765
WEBHOOK_VERIFY_TOKEN=GYBA_WEBHOOK_SECRET_2024

# Servidor
PORT=3000
NODE_ENV=production

# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost:5432/gyba
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
```

#### Docker Compose
```yaml
version: '3.8'
services:
  whatsapp-portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gyba
      POSTGRES_USER: gyba
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 9. Monitoramento e Logs

#### Sistema de Logs
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsapp-portal' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log de mensagens
const logMessage = (phone, message, direction) => {
  logger.info('WhatsApp Message', {
    phone: phone,
    message: message,
    direction: direction, // 'incoming' | 'outgoing'
    timestamp: new Date()
  });
};
```

#### Health Check
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

### 10. Segurança

#### Validação de Webhook
```javascript
const crypto = require('crypto');

const validateWebhook = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).send('Unauthorized');
  }
  
  next();
};

app.post('/webhook/whatsapp', validateWebhook, async (req, res) => {
  // Processar webhook...
});
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 mensagens por minuto por IP
  message: 'Muitas mensagens. Tente novamente em 1 minuto.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/webhook/whatsapp', limiter);
```

## RESUMO DA IMPLEMENTAÇÃO

### Fluxo Completo
1. **Meta Business API** recebe mensagem no número GYBA
2. **Webhook** processa mensagem no servidor Node.js
3. **Sistema identifica** usuário pelo telefone
4. **Sessão** é criada/recuperada do Redis
5. **IA detecta** intenção da mensagem
6. **Módulo específico** processa comando
7. **Resposta** é enviada via WhatsApp API
8. **Logs** registram toda interação

### Vantagens
- ✅ **Escalabilidade** ilimitada
- ✅ **Sessões** persistentes
- ✅ **Multi-empresa** isolado
- ✅ **Permissões** granulares
- ✅ **Monitoramento** completo
- ✅ **Segurança** robusta

### Custos Estimados
- **WhatsApp Business API**: $0.005-0.009 por mensagem
- **Servidor**: R$ 200-500/mês (dependendo do volume)
- **Meta Business**: Gratuito (verificação empresarial)
- **Total**: R$ 300-800/mês para 10.000 mensagens

O número WhatsApp funciona exatamente como um site, mas dentro do aplicativo mais usado do Brasil!

