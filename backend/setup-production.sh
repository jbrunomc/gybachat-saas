#!/bin/bash

# Script de configuração para ambiente de produção do Gybachat
# Execute com: sudo bash setup-production.sh

echo "🚀 Iniciando configuração do ambiente de produção para Gybachat..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script precisa ser executado como root (sudo)"
  exit 1
fi

# Criar diretório para o projeto
echo "📁 Criando diretório para o projeto..."
mkdir -p /home/gybachat
cd /home/gybachat

# Criar diretório para logs
echo "📝 Configurando diretórios de logs..."
mkdir -p /var/log/gybachat
chmod 755 /var/log/gybachat

# Instalar dependências
echo "📦 Instalando dependências do sistema..."
apt update
apt install -y nginx certbot python3-certbot-nginx nodejs npm git

# Configurar NGINX
echo "🔧 Configurando NGINX..."
cp ./backend/config/nginx.conf /etc/nginx/sites-available/gybachat.conf
ln -sf /etc/nginx/sites-available/gybachat.conf /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Configurar certificado SSL
echo "🔒 Configurando certificado SSL..."
certbot --nginx -d api.gybachat.com.br --non-interactive --agree-tos --email admin@gybachat.com

# Instalar PM2 globalmente
echo "🔄 Instalando PM2..."
npm install -g pm2

# Configurar PM2 para iniciar com o sistema
echo "⚙️ Configurando PM2 para iniciar com o sistema..."
pm2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow 'Nginx Full'
ufw allow ssh
ufw allow 3001
ufw --force enable

# Configurar backup automático
echo "💾 Configurando backup automático..."
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
echo "📊 Configurando monitoramento..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true

echo "✅ Configuração do ambiente de produção concluída!"
echo "🚀 Para iniciar o servidor, execute:"
echo "   cd /home/gybachat && pm2 start ecosystem.config.js --env production"