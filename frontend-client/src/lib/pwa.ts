@@ .. @@
   }

+  // Método para registrar push subscription no backend
+  async registerPushSubscription(subscription: PushSubscription): Promise<boolean> {
+    try {
+      // TODO: Implementar no backend
+      // const response = await api.registerPushSubscription({
+      //   endpoint: subscription.endpoint,
+      //   keys: {
+      //     p256dh: subscription.getKey('p256dh'),
+      //     auth: subscription.getKey('auth')
+      //   }
+      // });
+      
+      console.log('🔔 Push subscription registrada (aguardando backend):', subscription);
+      return true;
+    } catch (error) {
+      console.error('❌ Erro ao registrar push subscription:', error);
+      return false;
+    }
+  }
+
+  // Método para solicitar permissão de notificação
+  async requestNotificationPermission(): Promise<boolean> {
+    if (!('Notification' in window)) {
+      console.warn('⚠️ Notificações não suportadas neste navegador');
+      return false;
+    }
+
+    if (Notification.permission === 'granted') {
+      return true;
+    }
+
+    if (Notification.permission === 'denied') {
+      console.warn('⚠️ Permissão de notificação negada pelo usuário');
+      return false;
+    }
+
+    const permission = await Notification.requestPermission();
+    return permission === 'granted';
+  }
+
   // Verificar se há atualizações disponíveis
   checkForUpdates(): void {
     if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
@@ .. @@
       });
     }
   }
+
+  // Método para configurar background sync (pronto para backend)
+  setupBackgroundSync(): void {
+    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
+      // Registrar sync para mensagens pendentes
+      navigator.serviceWorker.ready.then(registration => {
+        // TODO: Implementar no backend - queue de mensagens offline
+        console.log('🔄 Background sync configurado (aguardando backend)');
+      });
+    }
+  }
 }