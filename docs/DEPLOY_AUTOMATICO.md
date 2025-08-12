# 🚀 Deploy Automático - GybaChat SaaS

## 📋 Scripts de Deploy Automatizado

Este guia contém scripts prontos para deploy automático de todo o sistema GybaChat.

## 🔧 1. Script de Deploy Completo

### `deploy-complete.sh`

```bash
#!/bin/bash

echo "🚀 INICIANDO DEPLOY COMPLETO DO GYBACHAT SAAS"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "README.md" ] || [ ! -d "frontend-landing" ]; then
    error "Execute este script na raiz do projeto gybachat-saas"
fi

log "Verificando dependências..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale npm"
fi

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

log "Dependências verificadas ✅"

# Build de todos os frontends
log "Fazendo build dos frontends..."

# Landing Page
info "Building Landing Page..."
cd frontend-landing
npm install --silent
npm run build || error "Falha no build da Landing Page"
cd ..

# Admin Panel
info "Building Admin Panel..."
cd frontend-admin
npm install --silent
npm run build || error "Falha no build do Admin Panel"
cd ..

# Client Panel
info "Building Client Panel..."
cd frontend-client
npm install --silent
npm run build || error "Falha no build do Client Panel"
cd ..

log "Todos os builds concluídos ✅"

# Deploy no Vercel
log "Iniciando deploy no Vercel..."

# Deploy Landing Page
info "Deploying Landing Page..."
cd frontend-landing
vercel --prod --yes || error "Falha no deploy da Landing Page"
cd ..

# Deploy Admin Panel
info "Deploying Admin Panel..."
cd frontend-admin
vercel --prod --yes || error "Falha no deploy do Admin Panel"
cd ..

# Deploy Client Panel
info "Deploying Client Panel..."
cd frontend-client
vercel --prod --yes || error "Falha no deploy do Client Panel"
cd ..

log "Deploy dos frontends concluído ✅"

# Verificar backend
log "Verificando backend..."
if [ -f "backend/server.js" ]; then
    info "Backend encontrado. Execute o deploy da VM separadamente:"
    info "bash docs/setup-vm.sh"
    info "bash docs/deploy-vm.sh"
else
    warning "Backend não encontrado na pasta backend/"
fi

log "🎉 DEPLOY COMPLETO FINALIZADO!"
echo "=============================================="
echo "📱 Frontends deployados no Vercel"
echo "🔌 Backend: Execute scripts da VM"
echo "🌐 Configure os domínios conforme documentação"
echo "=============================================="
```

## 🔧 2. Script de Build Local

### `build-all.sh`

```bash
#!/bin/bash

echo "🔨 BUILDING ALL FRONTENDS"
echo "========================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar diretório
if [ ! -f "README.md" ]; then
    error "Execute na raiz do projeto"
fi

# Build Landing Page
log "Building Landing Page..."
cd frontend-landing || error "Pasta frontend-landing não encontrada"
npm install --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Landing Page: ✅"
cd ..

# Build Admin Panel
log "Building Admin Panel..."
cd frontend-admin || error "Pasta frontend-admin não encontrada"
npm install --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Admin Panel: ✅"
cd ..

# Build Client Panel
log "Building Client Panel..."
cd frontend-client || error "Pasta frontend-client não encontrada"
npm install --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Client Panel: ✅"
cd ..

log "🎉 Todos os builds concluídos!"
echo "========================="
echo "✅ Landing Page: frontend-landing/dist/"
echo "✅ Admin Panel: frontend-admin/dist/"
echo "✅ Client Panel: frontend-client/dist/"
echo "========================="
```

## 🔧 3. Script de Desenvolvimento

### `dev-all.sh`

```bash
#!/bin/bash

echo "🚀 INICIANDO AMBIENTE DE DESENVOLVIMENTO"
echo "========================================"

# Função para matar processos ao sair
cleanup() {
    echo "🛑 Parando servidores..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Verificar diretório
if [ ! -f "README.md" ]; then
    echo "❌ Execute na raiz do projeto"
    exit 1
fi

echo "🔌 Iniciando Backend..."
cd backend
npm install --silent
npm run dev &
BACKEND_PID=$!
cd ..

echo "🏠 Iniciando Landing Page (porta 3000)..."
cd frontend-landing
npm install --silent
npm run dev -- --port 3000 &
LANDING_PID=$!
cd ..

echo "👑 Iniciando Admin Panel (porta 3001)..."
cd frontend-admin
npm install --silent
npm run dev -- --port 3001 &
ADMIN_PID=$!
cd ..

echo "🏢 Iniciando Client Panel (porta 3002)..."
cd frontend-client
npm install --silent
npm run dev -- --port 3002 &
CLIENT_PID=$!
cd ..

echo "========================================"
echo "🎉 Ambiente de desenvolvimento ativo!"
echo "========================================"
echo "🏠 Landing Page:  http://localhost:3000"
echo "👑 Admin Panel:   http://localhost:3001"
echo "🏢 Client Panel:  http://localhost:3002"
echo "🔌 Backend API:   http://localhost:3001/api"
echo "========================================"
echo "Pressione Ctrl+C para parar todos os serviços"

# Aguardar
wait
```

## 🔧 4. Script de Verificação

### `verify-system.sh`

```bash
#!/bin/bash

echo "🔍 VERIFICAÇÃO DO SISTEMA GYBACHAT"
echo "=================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

ERRORS=0

# Verificar estrutura
info "Verificando estrutura do projeto..."
[ -d "frontend-landing" ]; check "Pasta frontend-landing"
[ -d "frontend-admin" ]; check "Pasta frontend-admin"
[ -d "frontend-client" ]; check "Pasta frontend-client"
[ -d "backend" ]; check "Pasta backend"
[ -d "docs" ]; check "Pasta docs"
[ -d "assets" ]; check "Pasta assets"
[ -f "README.md" ]; check "README.md"

# Verificar dependências
info "Verificando dependências..."
command -v node >/dev/null 2>&1; check "Node.js instalado"
command -v npm >/dev/null 2>&1; check "npm instalado"
command -v git >/dev/null 2>&1; check "Git instalado"

# Verificar builds
info "Verificando builds..."
[ -d "frontend-landing/dist" ]; check "Build Landing Page"
[ -d "frontend-admin/dist" ]; check "Build Admin Panel"
[ -d "frontend-client/dist" ]; check "Build Client Panel"

# Verificar configurações
info "Verificando configurações..."
[ -f "backend/.env" ]; check "Arquivo .env do backend"
[ -f "backend/package.json" ]; check "package.json do backend"

# Verificar documentação
info "Verificando documentação..."
[ -f "docs/MANUAL_DEPLOY_VERCEL.md" ]; check "Manual Deploy Vercel"
[ -f "docs/GUIA_VM_COMPLETO.md" ]; check "Guia VM Completo"
[ -f "docs/setup-vm.sh" ]; check "Script setup-vm.sh"
[ -f "docs/deploy-vm.sh" ]; check "Script deploy-vm.sh"

echo "=================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Sistema verificado com sucesso!${NC}"
    echo -e "${GREEN}✅ Pronto para deploy!${NC}"
else
    echo -e "${RED}❌ Encontrados $ERRORS problemas${NC}"
    echo -e "${YELLOW}⚠️  Corrija os problemas antes do deploy${NC}"
fi
echo "=================================="
```

## 📋 Como Usar

### 1. Tornar scripts executáveis

```bash
chmod +x docs/deploy-complete.sh
chmod +x docs/build-all.sh
chmod +x docs/dev-all.sh
chmod +x docs/verify-system.sh
```

### 2. Deploy completo

```bash
# Deploy automático completo
bash docs/deploy-complete.sh
```

### 3. Desenvolvimento local

```bash
# Iniciar ambiente de desenvolvimento
bash docs/dev-all.sh
```

### 4. Build local

```bash
# Build de todos os frontends
bash docs/build-all.sh
```

### 5. Verificação

```bash
# Verificar sistema
bash docs/verify-system.sh
```

## 🔧 Personalização

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Configurações de deploy
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID_LANDING=landing_project_id
VERCEL_PROJECT_ID_ADMIN=admin_project_id
VERCEL_PROJECT_ID_CLIENT=client_project_id

# Domínios
DOMAIN_LANDING=gybachat.com.br
DOMAIN_ADMIN=admin.gybachat.com.br
DOMAIN_CLIENT=app.gybachat.com.br
DOMAIN_API=api.gybachat.com.br
```

### Configuração Automática

Os scripts detectam automaticamente:
- ✅ Dependências instaladas
- ✅ Estrutura do projeto
- ✅ Configurações necessárias
- ✅ Status dos builds

## 🆘 Troubleshooting

### Problemas Comuns

1. **Script não executa**
   ```bash
   chmod +x docs/script-name.sh
   ```

2. **Build falha**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vercel CLI não encontrado**
   ```bash
   npm install -g vercel
   ```

4. **Permissões negadas**
   ```bash
   sudo chown -R $USER:$USER .
   ```

---

**🚀 Deploy automatizado para máxima eficiência!**

