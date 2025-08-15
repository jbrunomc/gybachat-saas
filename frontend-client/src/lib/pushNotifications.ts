/**
 * Gerenciador de Push Notifications PWA
 * PRONTO PARA BACKEND - aguardando endpoints
 */

export class PushNotificationManager {
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Push notifications não suportadas');
      return;
    }

    try {
      // TODO: Buscar VAPID key do backend quando estiver pronto
      // const response = await api.getVapidPublicKey();
      // this.vapidPublicKey = response.publicKey;
      
      console.log('🔔 Push Notification Manager inicializado (aguardando backend)');
    } catch (error) {
      console.error('❌ Erro ao inicializar Push Manager:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notificações não suportadas');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Permissão de notificação negada');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribe(): Promise<boolean> {
    // TODO: Implementar quando backend estiver pronto
    console.log('🔔 Subscribe será implementado com backend');
    return false;
  }

  async unsubscribe(): Promise<boolean> {
    // TODO: Implementar quando backend estiver pronto
    console.log('🔔 Unsubscribe será implementado com backend');
    return false;
  }

  get isSubscribed(): boolean {
    return this.subscription !== null;
  }

  get hasPermission(): boolean {
    return Notification.permission === 'granted';
  }
}

// Instância singleton
export const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;