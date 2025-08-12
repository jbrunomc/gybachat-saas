#!/bin/bash

# Script de atualização automática para VM Google Cloud
# Uso: ./auto-update-vm.sh [install|update|status]
# Autor: Gybachat Team

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
REPO_URL="https://github.com/seu-usuario/gybachat.git"
BACKEND_DIR="/home/gybachat"
LOG_DIR="/var/log/gybachat"
LOG_FILE="$LOG_DIR/auto-update.log"
CRON_JOB="0 0 * * * /home/gybachat/auto-update-vm.sh update >> $LOG_FILE 2>&1"

# Função para imprimir mensagens
log_message() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Função para imprimir erros
log_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1" | tee -a "$LOG_FILE"
}

# Função para imprimir sucesso
log_success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCESSO:${NC} $1" | tee -a "$LOG_FILE"
}

# Função para imprimir avisos
log_warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1" | tee -a "$LOG_FILE"
}

# Verificar se o diretório de logs existe
ensure_log_dir() {
  if [ ! -d "$LOG_DIR" ]; then
    log_message "Criando diretório de logs: $LOG_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chown -R $(whoami):$(whoami) "$LOG_DIR"
  fi
  
  # Criar arquivo de log se não existir
  if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
  fi
}

# Instalar o script de atualização automática
install_auto_update() {
  log_message "Instalando script de atualização automática..."
  
  # Verificar se o cron job já existe
  if crontab -l | grep -q "auto-update-vm.sh"; then
    log_warning "Cron job já existe. Removendo antes de reinstalar."
    crontab -l | grep -v "auto-update-vm.sh" | crontab -
  fi
  
  # Adicionar cron job para executar o script todas as noites à meia-noite
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  
  # Verificar se o cron job foi instalado corretamente
  if crontab -l | grep -q "auto-update-vm.sh"; then
    log_success "Cron job instalado com sucesso. O sistema será atualizado automaticamente todas as noites à meia-noite."
  else
    log_error "Falha ao instalar o cron job."
    return 1
  fi
  
  # Tornar o script executável
  chmod +x "$0"
  
  # Copiar o script para o diretório do projeto se não estiver lá
  if [ "$(realpath $0)" != "$BACKEND_DIR/auto-update-vm.sh" ]; then
    log_message "Copiando script para o diretório do projeto..."
    cp "$0" "$BACKEND_DIR/auto-update-vm.sh"
    chmod +x "$BACKEND_DIR/auto-update-vm.sh"
  fi
  
  log_success "Instalação concluída!"
  return 0
}

# Atualizar o backend a partir do Git
update_from_git() {
  log_message "Iniciando atualização a partir do Git..."
  
  # Verificar se o diretório do projeto existe
  if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Diretório do projeto não existe: $BACKEND_DIR"
    log_message "Clonando repositório..."
    git clone "$REPO_URL" "$BACKEND_DIR"
    if [ $? -ne 0 ]; then
      log_error "Falha ao clonar o repositório."
      return 1
    fi
  fi
  
  # Navegar para o diretório do projeto
  cd "$BACKEND_DIR"
  
  # Backup da versão atual
  log_message "Criando backup da versão atual..."
  BACKUP_DIR="$BACKEND_DIR/backups/$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  
  # Backup de arquivos importantes
  if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env"
  fi
  
  # Backup do diretório de sessões do WhatsApp
  if [ -d "backend/sessions" ]; then
    mkdir -p "$BACKUP_DIR/backend"
    cp -r backend/sessions "$BACKUP_DIR/backend/"
  fi
  
  # Verificar se há atualizações no repositório
  log_message "Verificando atualizações no repositório..."
  git fetch origin main
  
  # Comparar a versão local com a remota
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  
  if [ "$LOCAL" = "$REMOTE" ]; then
    log_message "O sistema já está atualizado. Nenhuma ação necessária."
    return 0
  fi
  
  # Há atualizações disponíveis
  log_message "Novas atualizações disponíveis. Atualizando..."
  
  # Salvar lista de arquivos modificados para o log
  git diff --name-status $LOCAL $REMOTE > "$BACKUP_DIR/changes.log"
  
  # Fazer backup do package.json atual
  if [ -f "backend/package.json" ]; then
    cp backend/package.json "$BACKUP_DIR/package.json"
  fi
  
  # Atualizar o código
  git reset --hard origin/main
  
  # Restaurar arquivos importantes
  if [ -f "$BACKUP_DIR/.env" ]; then
    log_message "Restaurando arquivo .env..."
    cp "$BACKUP_DIR/.env" .env
  fi
  
  # Restaurar diretório de sessões do WhatsApp
  if [ -d "$BACKUP_DIR/backend/sessions" ]; then
    log_message "Restaurando sessões do WhatsApp..."
    mkdir -p backend/sessions
    cp -r "$BACKUP_DIR/backend/sessions/"* backend/sessions/
  fi
  
  # Verificar se houve mudanças no package.json
  if [ -f "$BACKUP_DIR/package.json" ] && [ -f "backend/package.json" ]; then
    if ! diff -q "$BACKUP_DIR/package.json" "backend/package.json" > /dev/null; then
      log_message "Detectadas mudanças no package.json. Instalando novas dependências..."
      cd backend
      npm install
      cd ..
    fi
  fi
  
  # Executar o script de deploy
  log_message "Executando script de deploy..."
  if [ -f "deploy-vm.sh" ]; then
    chmod +x deploy-vm.sh
    ./deploy-vm.sh
  else
    log_warning "Script de deploy não encontrado. Tentando reiniciar o serviço manualmente..."
    cd backend
    if command -v pm2 &> /dev/null; then
      pm2 reload gybachat-backend || pm2 restart gybachat-backend || pm2 start ecosystem.config.cjs --env production
    else
      log_error "PM2 não encontrado. Não foi possível reiniciar o serviço."
      return 1
    fi
  fi
  
  log_success "Atualização concluída com sucesso!"
  return 0
}

# Verificar status da atualização automática
check_status() {
  log_message "Verificando status da atualização automática..."
  
  # Verificar se o cron job está instalado
  if crontab -l | grep -q "auto-update-vm.sh"; then
    log_success "Atualização automática está ATIVA."
    echo "Cron job configurado:"
    crontab -l | grep "auto-update-vm.sh"
  else
    log_warning "Atualização automática está INATIVA."
  fi
  
  # Verificar último log de atualização
  if [ -f "$LOG_FILE" ]; then
    echo "Últimas 5 entradas do log:"
    tail -n 5 "$LOG_FILE"
  else
    log_warning "Arquivo de log não encontrado."
  fi
  
  # Verificar status do serviço
  if command -v pm2 &> /dev/null; then
    echo "Status do serviço:"
    pm2 status gybachat-backend
  else
    log_warning "PM2 não encontrado. Não foi possível verificar o status do serviço."
  fi
  
  return 0
}

# Função principal
main() {
  # Garantir que o diretório de logs existe
  ensure_log_dir
  
  # Processar argumentos
  case "$1" in
    install)
      install_auto_update
      ;;
    update)
      update_from_git
      ;;
    status)
      check_status
      ;;
    *)
      echo "Uso: $0 [install|update|status]"
      echo ""
      echo "  install  - Instala o script de atualização automática (cron job)"
      echo "  update   - Atualiza o sistema a partir do Git"
      echo "  status   - Verifica o status da atualização automática"
      echo ""
      echo "Exemplo: $0 install"
      ;;
  esac
}

# Executar função principal
main "$@"