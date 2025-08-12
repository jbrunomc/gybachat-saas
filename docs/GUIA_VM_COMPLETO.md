# 🚀 GUIA COMPLETO VM - À PROVA DE ERRO

## 🎯 PARA QUEM TEM CORAGEM MAS NÃO SABE MUITO! 😄

**Este guia é COMPLETO e SEGURO. Só copiar e colar os comandos na ordem!**

---

## 📋 O QUE VAMOS FAZER

1. ✅ **Conectar na VM** via SSH
2. ✅ **Configurar tudo automaticamente** com scripts
3. ✅ **Fazer upload do projeto**
4. ✅ **Configurar domínio e SSL**
5. ✅ **Testar se está funcionando**

**TEMPO TOTAL: 30 minutos** ⏰

---

## 🔑 PASSO 1: CONECTAR NA VM

### 📱 Pelo Terminal/CMD
```bash
# Substitua SEU_IP pelo IP da sua VM
ssh root@SEU_IP

# Ou se tiver usuário específico:
ssh usuario@SEU_IP
```

### 💻 Pelo Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **Compute Engine** → **VM instances**
3. Clique em **SSH** na sua VM

**✅ CONFIRMAÇÃO:** Você deve ver algo como `root@vm-instance:~#`

---

## 🛠️ PASSO 2: PREPARAR O AMBIENTE

### 📦 Atualizar Sistema (OBRIGATÓRIO)
```bash
# Copie e cole este comando:
apt update && apt upgrade -y
```
**⏳ Aguarde:** Pode demorar 2-5 minutos

### 📁 Criar Diretório do Projeto
```bash
# Copie e cole:
mkdir -p /home/gybachat
cd /home/gybachat
```

**✅ CONFIRMAÇÃO:** Você deve estar em `/home/gybachat`

---

## 📥 PASSO 3: FAZER UPLOAD DO PROJETO

### 🎯 OPÇÃO A: Via Git (Recomendado)
```bash
# Se você tem o projeto no GitHub:
git clone https://github.com/SEU_USUARIO/gybachat.git .

# Ou se não tem Git, vá para OPÇÃO B
```

### 🎯 OPÇÃO B: Via Upload Manual
1. **No seu computador:** Compacte a pasta `gybachat_project` em `.zip`
2. **Na VM:** Execute:
```bash
# Instalar unzip
apt install -y unzip

# Fazer upload via SCP (do seu computador):
# scp gybachat_project.zip root@SEU_IP:/home/gybachat/

# Descompactar na VM:
unzip gybachat_project.zip
mv gybachat_project/* .
```

**✅ CONFIRMAÇÃO:** Execute `ls` e deve ver as pastas do projeto

---

## 🔧 PASSO 4: EXECUTAR SCRIPTS DE CONFIGURAÇÃO

### 🚀 Script 1: Configurar VM (AUTOMÁTICO)
```bash
# Ir para a pasta dos scripts:
cd /home/gybachat/codigo_existente/project

# Dar permissão de execução:
chmod +x setup-vm.sh

# EXECUTAR (vai instalar tudo automaticamente):
sudo bash setup-vm.sh
```

**⏳ AGUARDE:** 5-10 minutos (instala Node.js, Nginx, PM2, etc.)

**✅ CONFIRMAÇÃO:** Deve aparecer "✅ Configuração da VM concluída!"

### 🚀 Script 2: Configurar Backend
```bash
# Ir para pasta do backend:
cd /home/gybachat/codigo_existente/project/backend

# Instalar dependências:
npm install

# Instalar dependências extras que adicionamos:
npm install stripe mercadopago

# Dar permissão ao script de produção:
chmod +x setup-production.sh

# EXECUTAR:
bash setup-production.sh
```

**✅ CONFIRMAÇÃO:** Deve aparecer "Backend configurado para produção"

---

## 🌐 PASSO 5: CONFIGURAR DOMÍNIO

### 📋 No seu provedor de domínio (Registro.br, GoDaddy, etc.)

**ADICIONE ESTES REGISTROS DNS:**
```
Tipo: A
Nome: api
Valor: SEU_IP_DA_VM
TTL: 300

Tipo: A  
Nome: @
Valor: 76.76.19.61 (IP do Vercel)
TTL: 300

Tipo: CNAME
Nome: admin
Valor: cname.vercel-dns.com
TTL: 300

Tipo: CNAME
Nome: app  
Valor: cname.vercel-dns.com
TTL: 300

Tipo: CNAME
Nome: www
Valor: gybachat.com.br
TTL: 300
```

**⏳ AGUARDE:** 5-30 minutos para propagar

---

## 🔒 PASSO 6: CONFIGURAR SSL (HTTPS)

### 🔐 Instalar Certbot
```bash
# Instalar Certbot:
apt install -y certbot python3-certbot-nginx

# Configurar SSL AUTOMATICAMENTE:
certbot --nginx -d api.gybachat.com.br --non-interactive --agree-tos --email seu@email.com

# Substituir "seu@email.com" pelo seu email real!
```

**✅ CONFIRMAÇÃO:** Deve aparecer "Congratulations! You have successfully enabled HTTPS"

### 🔄 Configurar Renovação Automática
```bash
# Testar renovação:
certbot renew --dry-run

# Adicionar ao cron (renovação automática):
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

---

## 🚀 PASSO 7: INICIAR O BACKEND

### 📁 Ir para pasta do backend
```bash
cd /home/gybachat/codigo_existente/project/backend
```

### 🔧 Criar arquivo .env
```bash
# Criar arquivo de configuração:
cat > .env << 'EOL'
NODE_ENV=production
PORT=3001

# Supabase (opcional - pode deixar vazio para modo teste)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui_123456789

# Gateways de Pagamento (configurar depois)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MERCADOPAGO_ACCESS_TOKEN=

# SMTP (configurar depois)  
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOL
```

### 🚀 Iniciar com PM2
```bash
# Iniciar aplicação:
pm2 start server.js --name "gybachat-backend"

# Salvar configuração do PM2:
pm2 save

# Configurar PM2 para iniciar automaticamente:
pm2 startup
```

**✅ CONFIRMAÇÃO:** Execute `pm2 status` - deve mostrar "gybachat-backend" online

---

## 🧪 PASSO 8: TESTAR SE ESTÁ FUNCIONANDO

### 🔍 Teste 1: Backend Local
```bash
# Testar se backend responde:
curl http://localhost:3001/api/billing/public/plans
```
**✅ ESPERADO:** Deve retornar JSON (mesmo que com erro, significa que está rodando)

### 🔍 Teste 2: Nginx
```bash
# Verificar se Nginx está rodando:
systemctl status nginx

# Testar configuração:
nginx -t
```
**✅ ESPERADO:** "nginx: configuration file test is successful"

### 🔍 Teste 3: Domínio Externo
```bash
# Testar domínio (substitua pelo seu):
curl https://api.gybachat.com.br/api/billing/public/plans
```
**✅ ESPERADO:** Deve retornar JSON sem erro de SSL

---

## 📊 PASSO 9: MONITORAMENTO

### 📈 Comandos Úteis
```bash
# Ver logs do backend:
pm2 logs gybachat-backend

# Ver status de todos os serviços:
pm2 status

# Ver logs do Nginx:
tail -f /var/log/nginx/gybachat_access.log

# Ver uso de recursos:
htop
```

### 🔄 Reiniciar Serviços (se necessário)
```bash
# Reiniciar backend:
pm2 restart gybachat-backend

# Reiniciar Nginx:
systemctl restart nginx

# Reiniciar tudo:
pm2 restart all && systemctl restart nginx
```

---

## 🚨 TROUBLESHOOTING - SE DER PROBLEMA

### ❌ Problema: "npm: command not found"
```bash
# Instalar Node.js manualmente:
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### ❌ Problema: "Permission denied"
```bash
# Dar permissões corretas:
chmod +x *.sh
chown -R root:root /home/gybachat
```

### ❌ Problema: Backend não inicia
```bash
# Ver erro específico:
cd /home/gybachat/codigo_existente/project/backend
npm start

# Se der erro de dependência:
npm install --force
```

### ❌ Problema: Nginx não funciona
```bash
# Verificar configuração:
nginx -t

# Se der erro, recriar configuração:
cp config/nginx.conf /etc/nginx/sites-available/gybachat.conf
ln -sf /etc/nginx/sites-available/gybachat.conf /etc/nginx/sites-enabled/
systemctl restart nginx
```

### ❌ Problema: SSL não funciona
```bash
# Verificar se domínio está apontando:
nslookup api.gybachat.com.br

# Tentar SSL novamente:
certbot --nginx -d api.gybachat.com.br --force-renewal
```

---

## ✅ CHECKLIST FINAL

### 🎯 Marque conforme for fazendo:

- [ ] ✅ **Conectei na VM via SSH**
- [ ] ✅ **Atualizei o sistema** (`apt update && apt upgrade -y`)
- [ ] ✅ **Criei diretório** (`mkdir -p /home/gybachat`)
- [ ] ✅ **Fiz upload do projeto** (Git ou ZIP)
- [ ] ✅ **Executei setup-vm.sh** (instalou Node, Nginx, PM2)
- [ ] ✅ **Instalei dependências** (`npm install`)
- [ ] ✅ **Configurei DNS** (api.gybachat.com.br → IP da VM)
- [ ] ✅ **Configurei SSL** (`certbot --nginx`)
- [ ] ✅ **Criei arquivo .env**
- [ ] ✅ **Iniciei backend** (`pm2 start server.js`)
- [ ] ✅ **Testei funcionamento** (curl funcionando)

### 🏆 RESULTADO FINAL

Se todos os itens estão ✅, você tem:

- 🔌 **Backend rodando** em https://api.gybachat.com.br
- 🔒 **SSL funcionando** (HTTPS)
- 🚀 **PM2 gerenciando** o processo
- 🌐 **Nginx fazendo** proxy reverso
- 🔄 **Renovação SSL** automática
- 📊 **Monitoramento** ativo

---

## 🎊 PARABÉNS! BACKEND CONFIGURADO!

**🔥 AGORA É SÓ FAZER DEPLOY DOS FRONTENDS NO VERCEL!**

### 📱 Próximos Passos:
1. **Deploy Landing Page** no Vercel
2. **Deploy Painel Admin** no Vercel  
3. **Deploy Painel Cliente** no Vercel
4. **Configurar variáveis** de ambiente
5. **BAMBURRAR!** 🚀💰

---

## 📞 COMANDOS DE EMERGÊNCIA

### 🆘 Se algo der muito errado:
```bash
# Parar tudo:
pm2 stop all
systemctl stop nginx

# Reiniciar VM:
reboot

# Depois de reiniciar, iniciar tudo:
pm2 start all
systemctl start nginx
```

### 🔍 Ver o que está acontecendo:
```bash
# Logs em tempo real:
pm2 logs --lines 50

# Status dos serviços:
systemctl status nginx
systemctl status fail2ban

# Uso de recursos:
free -h
df -h
```

---

## 🏆 CONCLUSÃO

**🎯 ESTE GUIA É À PROVA DE ERRO!**

- ✅ **Copy/paste** dos comandos
- ✅ **Ordem correta** de execução
- ✅ **Troubleshooting** completo
- ✅ **Checklist visual** para acompanhar

**SE VOCÊ TEM CORAGEM, VAI CONSEGUIR! 💪**

**BACKEND 100% CONFIGURADO = SUCESSO GARANTIDO! 🚀**

