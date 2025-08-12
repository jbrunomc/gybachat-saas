#!/bin/bash

# Script de deploy para Google VM
# Uso: ./deploy-vm.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKEND_DIR="/home/gybachat/backend"
LOG_DIR="/var/log/gybachat"

# Função para imprimir mensagens
print_message() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Função para imprimir erros
print_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1"
}

# Função para imprimir sucesso
print_success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCESSO:${NC} $1"
}

# Função para imprimir avisos
print_warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1"
}

# Verificar se o diretório existe
if [ ! -d "$BACKEND_DIR" ]; then
  print_error "Diretório do backend não existe: $BACKEND_DIR"
  print_message "Criando diretório..."
  mkdir -p "$BACKEND_DIR"
fi

# Criar diretório de logs se não existir
if [ ! -d "$LOG_DIR" ]; then
  print_message "Criando diretório de logs: $LOG_DIR"
  sudo mkdir -p "$LOG_DIR"
  sudo chown -R $(whoami):$(whoami) "$LOG_DIR"
fi

print_message "Iniciando deploy do backend no Google VM..."

# Backup da versão anterior (opcional)
if [ -d "$BACKEND_DIR/node_modules" ]; then
  print_message "Fazendo backup do package.json e .env..."
  cp "$BACKEND_DIR/package.json" "$BACKEND_DIR/package.json.bak" 2>/dev/null
  cp "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.bak" 2>/dev/null
fi

# Limpar diretório (mantendo backups)
print_message "Limpando diretório do backend..."
find "$BACKEND_DIR" -mindepth 1 -not -name "*.bak" -not -name "sessions" -not -name ".env" -delete

# Copiar arquivos do backend
print_message "Copiando arquivos do backend..."
cp -r ./backend/* "$BACKEND_DIR/"

# Restaurar .env se não existir
if [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$BACKEND_DIR/.env.bak" ]; then
  print_message "Restaurando arquivo .env do backup..."
  cp "$BACKEND_DIR/.env.bak" "$BACKEND_DIR/.env"
fi

# Navegar para o diretório backend
cd "$BACKEND_DIR"

# Instalar dependências
print_message "Instalando dependências..."
npm install

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
  print_warning "PM2 não encontrado. Instalando..."
  npm install -g pm2
fi

# Verificar se o backend já está rodando no PM2
if pm2 list | grep -q "gybachat-backend"; then
  print_message "Reiniciando serviço do backend..."
  pm2 reload gybachat-backend
else
  print_message "Iniciando serviço do backend pela primeira vez..."
  pm2 start ecosystem.config.cjs --env production
fi

# Salvar configuração do PM2
print_message "Salvando configuração do PM2..."
pm2 save

# Configurar PM2 para iniciar com o sistema
print_message "Configurando PM2 para iniciar com o sistema..."
pm2 startup

# Verificar status do serviço
if pm2 list | grep -q "gybachat-backend" && pm2 list | grep -q "online"; then
  print_success "Backend está rodando com sucesso!"
  
  # Mostrar informações do serviço
  print_message "Informações do serviço:"
  pm2 show gybachat-backend
  
  # Mostrar URL do serviço
  print_message "O backend está disponível em: http://$(hostname -I | awk '{print $1}'):3001"
  print_message "Verifique se a porta 3001 está aberta no firewall do Google Cloud."
else
  print_error "Houve um problema ao iniciar o serviço. Verifique os logs."
  pm2 logs gybachat-backend --lines 20
fi

print_message "Deploy concluído!"