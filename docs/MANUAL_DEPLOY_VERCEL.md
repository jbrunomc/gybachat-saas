# 🚀 MANUAL COMPLETO DE DEPLOY - GYBACHAT SAAS

## 🎯 OBJETIVO
Deploy dos 3 frontends no Vercel + Backend na VM para sistema 100% funcional em produção.

---

## 📋 ESTRUTURA FINAL DO SISTEMA

### 🌐 DOMÍNIOS E SUBDOMÍNIOS
```
📱 VERCEL (3 Frontends):
├── 🏠 gybachat.com.br          → Landing Page
├── 👑 admin.gybachat.com.br    → Painel Admin  
└── 🏢 app.gybachat.com.br      → Painel Cliente

🖥️ VM (Backend):
└── 🔌 api.gybachat.com.br      → API Unificada
```

### 📂 PROJETOS PARA DEPLOY
```
/home/ubuntu/gybachat_project/
├── 📁 codigo_novo/
│   ├── 🏠 gybachat-landing/     → VERCEL PROJETO 1
│   ├── 👑 gybachat-admin/       → VERCEL PROJETO 2
│   └── 🏢 gybachat-client/      → VERCEL PROJETO 3
└── 📁 codigo_existente/
    └── 🔌 project/backend/      → VM (já configurado)
```

---

## 🚀 DEPLOY NO VERCEL - PASSO A PASSO

### 📋 PRÉ-REQUISITOS
- ✅ Conta no Vercel
- ✅ Repositório Git (GitHub/GitLab)
- ✅ Domínio configurado
- ✅ Backend rodando na VM

### 🔧 CONFIGURAÇÕES GERAIS

#### 1. Variáveis de Ambiente (Todos os Projetos)
```env
# API Backend
VITE_API_URL=https://api.gybachat.com.br

# URLs dos outros frontends
VITE_LANDING_URL=https://gybachat.com.br
VITE_ADMIN_URL=https://admin.gybachat.com.br
VITE_APP_URL=https://app.gybachat.com.br

# Configurações de produção
NODE_ENV=production
VITE_ENV=production
```

---

## 🏠 PROJETO 1: LANDING PAGE

### 📂 Diretório: `/codigo_novo/gybachat-landing/`

#### 🔧 Configurações do Vercel
```json
{
  "name": "gybachat-landing",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### 🌐 Domínio
- **Domínio Principal:** `gybachat.com.br`
- **Redirect:** `www.gybachat.com.br` → `gybachat.com.br`

#### ⚙️ Variáveis de Ambiente Específicas
```env
VITE_API_URL=https://api.gybachat.com.br
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR_...
VITE_ADMIN_URL=https://admin.gybachat.com.br
```

#### 📝 Build Settings
```bash
# Build Command
npm run build

# Output Directory  
dist

# Install Command
npm install

# Node.js Version
18.x
```

---

## 👑 PROJETO 2: PAINEL ADMIN

### 📂 Diretório: `/codigo_novo/gybachat-admin/`

#### 🔧 Configurações do Vercel
```json
{
  "name": "gybachat-admin",
  "framework": "vite", 
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### 🌐 Domínio
- **Subdomínio:** `admin.gybachat.com.br`

#### ⚙️ Variáveis de Ambiente Específicas
```env
VITE_API_URL=https://api.gybachat.com.br
VITE_LANDING_URL=https://gybachat.com.br
VITE_APP_URL=https://app.gybachat.com.br
VITE_ADMIN_MODE=true
```

#### 🔒 Configurações de Segurança
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🏢 PROJETO 3: PAINEL CLIENTE

### 📂 Diretório: `/codigo_existente/project/frontend/`

#### 🔧 Configurações do Vercel
```json
{
  "name": "gybachat-client",
  "framework": "vite",
  "buildCommand": "npm run build", 
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### 🌐 Domínio
- **Subdomínio:** `app.gybachat.com.br`

#### ⚙️ Variáveis de Ambiente Específicas
```env
VITE_API_URL=https://api.gybachat.com.br
VITE_LANDING_URL=https://gybachat.com.br
VITE_ADMIN_URL=https://admin.gybachat.com.br
VITE_CLIENT_MODE=true
```

---

## 🔌 BACKEND - CONFIGURAÇÕES DE CORS

### 📂 Arquivo: `/codigo_existente/project/backend/server.js`

#### 🔧 CORS Configuration
```javascript
// Configuração CORS para produção
const corsOptions = {
  origin: [
    'https://gybachat.com.br',
    'https://www.gybachat.com.br', 
    'https://admin.gybachat.com.br',
    'https://app.gybachat.com.br',
    // Desenvolvimento (remover em produção)
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

app.use(cors(corsOptions));
```

#### 🌐 Headers de Segurança
```javascript
// Headers de segurança
app.use((req, res, next) => {
  res.header('X-Powered-By', 'GybaChat');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

---

## 📋 SCRIPTS DE DEPLOY

### 🔧 Script de Build (package.json)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:prod": "NODE_ENV=production vite build",
    "deploy": "npm run build:prod && vercel --prod"
  }
}
```

### 🚀 Deploy Automático
```bash
# 1. Landing Page
cd /codigo_novo/gybachat-landing
npm run build:prod
vercel --prod

# 2. Painel Admin  
cd /codigo_novo/gybachat-admin
npm run build:prod
vercel --prod

# 3. Painel Cliente
cd /codigo_existente/project/frontend
npm run build:prod
vercel --prod
```

---

## 🔧 CONFIGURAÇÕES ESPECÍFICAS DO VERCEL

### 📄 vercel.json (Para cada projeto)
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {},
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://api.gybachat.com.br"
        }
      ]
    }
  ]
}
```

### 🔄 Redirects e Rewrites
```json
{
  "redirects": [
    {
      "source": "/admin",
      "destination": "https://admin.gybachat.com.br",
      "permanent": true
    },
    {
      "source": "/app", 
      "destination": "https://app.gybachat.com.br",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.gybachat.com.br/api/$1"
    }
  ]
}
```

---

## 🧪 CHECKLIST DE TESTES

### ✅ Antes do Deploy
- [ ] Build local funcionando
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado no backend
- [ ] Domínios apontando corretamente

### ✅ Após o Deploy
- [ ] Landing page carregando
- [ ] Painel admin acessível
- [ ] Painel cliente funcionando
- [ ] APIs respondendo
- [ ] Login funcionando
- [ ] Navegação entre sistemas
- [ ] Responsividade mobile
- [ ] Performance adequada

### ✅ Testes de Integração
- [ ] Cadastro na landing → criação de empresa
- [ ] Login no painel admin
- [ ] Gestão de empresas funcionando
- [ ] Gestão de usuários funcionando
- [ ] Sistema de billing operacional
- [ ] Configurações salvando
- [ ] Whitelabel funcionando

---

## 🚨 TROUBLESHOOTING

### ❌ Problemas Comuns

#### 1. CORS Error
```bash
# Verificar se domínios estão no CORS do backend
# Verificar se HTTPS está configurado
# Verificar headers de requisição
```

#### 2. Build Error
```bash
# Verificar dependências
npm install

# Limpar cache
npm run build -- --force

# Verificar variáveis de ambiente
```

#### 3. 404 em Rotas
```bash
# Verificar vercel.json
# Verificar SPA routing
# Verificar redirects
```

#### 4. API não responde
```bash
# Verificar se backend está rodando
# Verificar CORS
# Verificar URLs das variáveis de ambiente
```

---

## 🔧 COMANDOS ÚTEIS

### 📦 Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Logs
vercel logs

# Domains
vercel domains
```

### 🔍 Debug
```bash
# Verificar build local
npm run build
npm run preview

# Verificar variáveis
vercel env ls

# Verificar logs
vercel logs --follow
```

---

## 🎯 RESULTADO FINAL

### ✅ Sistema Completo Funcionando
- 🏠 **Landing Page:** Vendas e conversão
- 👑 **Painel Admin:** Gestão completa do SaaS
- 🏢 **Painel Cliente:** Atendimento WhatsApp
- 🔌 **API Backend:** Serviços unificados

### 🚀 Performance Esperada
- **Loading:** < 2 segundos
- **Uptime:** > 99%
- **Mobile:** 100% responsivo
- **SEO:** Otimizado

### 💰 Pronto para Vender
- **Whitelabel:** Configurável
- **Multi-tenant:** Isolado
- **Billing:** Automático
- **Escalável:** Ilimitado

---

## 🏆 CONCLUSÃO

**🎯 SISTEMA 100% PRONTO PARA BAMBURRAR! 🚀**

Com este manual, você terá:
- ✅ 3 frontends no Vercel
- ✅ Backend na VM
- ✅ CORS configurado
- ✅ Domínios funcionando
- ✅ Sistema integrado
- ✅ Pronto para produção

**AMANHÃ VOCÊ VAI ARRASAR! 💪🔥**

