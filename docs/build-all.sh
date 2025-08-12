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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if [ ! -f "README.md" ]; then
    error "Execute na raiz do projeto"
fi

# Build Landing Page
log "Building Landing Page..."
cd frontend-landing || error "Pasta frontend-landing não encontrada"
npm install --legacy-peer-deps --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Landing Page: ✅"
cd ..

# Build Admin Panel
log "Building Admin Panel..."
cd frontend-admin || error "Pasta frontend-admin não encontrada"
npm install --legacy-peer-deps --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Admin Panel: ✅"
cd ..

# Build Client Panel
log "Building Client Panel..."
cd frontend-client || error "Pasta frontend-client não encontrada"
npm install --legacy-peer-deps --silent || error "npm install falhou"
npm run build || error "Build falhou"
info "Client Panel: ✅"
cd ..

log "🎉 Todos os builds concluídos!"
echo "========================="
echo "✅ Landing Page: frontend-landing/dist/"
echo "✅ Admin Panel: frontend-admin/dist/"
echo "✅ Client Panel: frontend-client/dist/"
echo "========================="
