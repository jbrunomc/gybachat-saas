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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

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
npm install --legacy-peer-deps --silent
npm run build || error "Falha no build da Landing Page"
cd ..

# Admin Panel
info "Building Admin Panel..."
cd frontend-admin
npm install --legacy-peer-deps --silent
npm run build || error "Falha no build do Admin Panel"
cd ..

# Client Panel
info "Building Client Panel..."
cd frontend-client
npm install --legacy-peer-deps --silent
npm run build || error "Falha no build do Client Panel"
cd ..

log "Todos os builds concluídos ✅"

log "🎉 DEPLOY COMPLETO FINALIZADO!"
echo "=============================================="
echo "📱 Frontends prontos para deploy no Vercel"
echo "🔌 Backend: Execute scripts da VM separadamente"
echo "🌐 Configure os domínios conforme documentação"
echo "=============================================="
