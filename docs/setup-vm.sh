#!/bin/bash

# Script de configuração para VM Google Cloud
# Uso: sudo bash setup-vm.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  print_error "Este script precisa ser executado como root (sudo)"
  exit 1
fi

print_message "🚀 Iniciando configuração da VM Google Cloud para Gybachat..."

# Atualizar sistema
print_message "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
print_message "📦 Instalando dependências..."
apt install -y curl git nginx ufw fail2ban

# Instalar Node.js 18
print_message "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar versão do Node.js
node_version=$(node -v)
print_success "Node.js instalado: $node_version"

# Instalar PM2 globalmente
print_message "📦 Instalando PM2..."
npm install -g pm2

# Configurar firewall
print_message "🔥 Configurando firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 3001/tcp
ufw --force enable

# Configurar Fail2ban
print_message "🔒 Configurando Fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Criar diretório para o projeto
print_message "📁 Criando diretório para o projeto..."
mkdir -p /home/gybachat
mkdir -p /var/log/gybachat

# Configurar NGINX
print_message "🌐 Configurando NGINX..."
cat > /etc/nginx/sites-available/gybachat.conf << 'EOL'
server {
    listen 80;
    server_name api.gybachat.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
EOL

# Ativar configuração do NGINX
ln -sf /etc/nginx/sites-available/gybachat.conf /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Configurar backup automático
print_message "💾 Configurando backup automático..."
cat > /etc/cron.daily/gybachat-backup << 'EOL'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/gybachat"
mkdir -p $BACKUP_DIR
cd /home/gybachat
tar -czf $BACKUP_DIR/gybachat_$TIMESTAMP.tar.gz .
find $BACKUP_DIR -type f -name "gybachat_*.tar.gz" -mtime +30 -delete
EOL
chmod +x /etc/cron.daily/gybachat-backup

# Configurar monitoramento
print_message "📊 Configurando monitoramento..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true

print_success "✅ Configuração da VM concluída!"
print_message "🚀 Próximos passos:"
print_message "1. Clone seu repositório: git clone https://github.com/seu-usuario/gybachat.git /home/gybachat"
print_message "2. Configure o arquivo .env no backend"
print_message "3. Execute o script de deploy: ./deploy-vm.sh"
print_message "4. Configure seu domínio para apontar para o IP desta VM"
print_message "5. Configure SSL com Certbot: sudo certbot --nginx -d api.gybachat.com.br"