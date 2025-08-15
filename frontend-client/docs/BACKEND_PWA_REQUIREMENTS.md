# 📱 PWA Backend Requirements - Gybachat

## 🎯 **RESUMO EXECUTIVO**
O frontend PWA está **100% implementado** e aguardando apenas a implementação backend para funcionalidades completas de push notifications e sincronização.

---

## 🔔 **1. PUSH NOTIFICATIONS**

### **Endpoints Necessários:**

#### `POST /api/pwa/push-subscription`
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64-encoded-key",
    "auth": "base64-encoded-key"
  },
  "userId": "user-123",
  "companyId": "company-456",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Win32",
    "language": "pt-BR"
  }
}
```

#### `DELETE /api/pwa/push-subscription`
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

#### `GET /api/pwa/vapid-key`
```json
{
  "success": true,
  "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f53NXYkNiS6lZjqrFuuM5GL8fJwQBJ_VkPPK9bPKgLRdJrMOaOI"
}
```

#### `POST /api/pwa/send-notification`
```json
{
  "userId": "user-123",
  "companyId": "company-456", 
  "title": "Nova mensagem",
  "body": "Cliente João enviou uma mensagem",
  "url": "/client/conversations/conv-123",
  "urgent": true,
  "data": {
    "conversationId": "conv-123",
    "customerId": "customer-456"
  }
}
```

### **Configuração VAPID:**
```bash
# Gerar chaves VAPID
npm install web-push
npx web-push generate-vapid-keys

# Configurar no backend:
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f53NXYkNiS6lZjqrFuuM5GL8fJwQBJ_VkPPK9bPKgLRdJrMOaOI
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:admin@gybachat.com
```

---

## 🔄 **2. BACKGROUND SYNC**

### **Tabela de Queue Offline:**
```sql
CREATE TABLE offline_queue (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id VARCHAR(255) NOT NULL,
  type ENUM('send_message', 'update_conversation', 'mark_read', 'add_tag') NOT NULL,
  data JSON NOT NULL,
  timestamp BIGINT NOT NULL,
  retries INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Endpoints para Sync:**

#### `POST /api/pwa/sync/messages`
```json
{
  "items": [
    {
      "id": "msg_offline_123",
      "conversationId": "conv-456",
      "content": "Mensagem enviada offline",
      "timestamp": 1640995200000,
      "messageType": "text"
    }
  ]
}
```

#### `POST /api/pwa/sync/conversations`
```json
{
  "items": [
    {
      "id": "conv_update_123",
      "conversationId": "conv-456", 
      "updates": {
        "status": "closed",
        "tags": ["resolvido", "satisfeito"]
      },
      "timestamp": 1640995200000
    }
  ]
}
```

---

## 📊 **3. EVENTOS PARA PUSH NOTIFICATIONS**

### **Quando Enviar Notificações:**

1. **Nova Mensagem Recebida:**
```javascript
// Quando cliente envia mensagem
await api.sendPushNotification({
  userId: assignedAgentId,
  title: `Nova mensagem de ${customerName}`,
  body: messagePreview,
  url: `/client/conversations/${conversationId}`,
  urgent: priority === 'urgent',
  data: { conversationId, customerId }
});
```

2. **Conversa Atribuída:**
```javascript
// Quando conversa é atribuída a agente
await api.sendPushNotification({
  userId: agentId,
  title: 'Nova conversa atribuída',
  body: `Conversa com ${customerName} foi atribuída a você`,
  url: `/client/conversations/${conversationId}`,
  data: { conversationId, priority }
});
```

3. **Conversa Escalada:**
```javascript
// Quando conversa é escalada
await api.sendPushNotification({
  userId: supervisorId,
  title: 'Conversa escalada',
  body: `${agentName} escalou uma conversa`,
  url: `/client/conversations/${conversationId}`,
  urgent: true,
  data: { conversationId, escalatedBy: agentId }
});
```

---

## 🛠️ **4. IMPLEMENTAÇÃO BACKEND SUGERIDA**

### **Node.js + Express:**
```javascript
const webpush = require('web-push');

// Configurar VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Endpoint para registrar subscription
app.post('/api/pwa/push-subscription', async (req, res) => {
  const { endpoint, keys, userId, companyId, deviceInfo } = req.body;
  
  // Salvar no banco de dados
  await PushSubscription.create({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    user_id: userId,
    company_id: companyId,
    device_info: deviceInfo
  });
  
  res.json({ success: true, message: 'Subscription registrada' });
});

// Função para enviar notificação
async function sendPushNotification(userId, payload) {
  const subscriptions = await PushSubscription.findAll({
    where: { user_id: userId }
  });
  
  const promises = subscriptions.map(sub => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    };
    
    return webpush.sendNotification(pushSubscription, JSON.stringify(payload));
  });
  
  await Promise.allSettled(promises);
}
```

---

## 📋 **5. CHECKLIST PARA BACKEND**

### **Configuração Inicial:**
- [ ] Instalar `web-push` package
- [ ] Gerar chaves VAPID
- [ ] Configurar variáveis de ambiente
- [ ] Criar tabela `push_subscriptions`
- [ ] Criar tabela `offline_queue`

### **Endpoints PWA:**
- [ ] `POST /api/pwa/push-subscription` - Registrar device
- [ ] `DELETE /api/pwa/push-subscription` - Remover device  
- [ ] `GET /api/pwa/vapid-key` - Obter chave pública
- [ ] `POST /api/pwa/send-notification` - Enviar notificação
- [ ] `POST /api/pwa/sync/messages` - Sync mensagens offline
- [ ] `POST /api/pwa/sync/conversations` - Sync conversas offline

### **Integração com Eventos:**
- [ ] Enviar push quando nova mensagem chega
- [ ] Enviar push quando conversa é atribuída
- [ ] Enviar push quando conversa é escalada
- [ ] Enviar push para alertas do sistema

### **Segurança:**
- [ ] Validar tokens JWT em todos endpoints PWA
- [ ] Verificar permissões por company_id
- [ ] Rate limiting para push notifications
- [ ] Validação de subscription endpoints

---

## 🚀 **RESULTADO FINAL**

**Frontend PWA:** ✅ 100% Completo
**Backend PWA:** ❌ 0% Implementado

**Com o backend implementado, teremos:**
- 📱 App instalável nativo
- 🔔 Push notifications reais
- 📶 Funciona 100% offline
- 🔄 Sync automático quando volta online
- ⚡ Performance nativa mobile
- 🎯 Shortcuts funcionais

**PRONTO PARA PRODUÇÃO!** 🎉