/**
 * Gerenciador de atualizações PWA
 * Detecta e aplica atualizações do Service Worker
 */

export class UpdateManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker não suportado');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      this.setupUpdateListeners();
      console.log('✅ Update Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Update Manager:', error);
    }
  }

  private setupUpdateListeners(): void {
    if (!this.registration) return;

    // Detectar nova versão disponível
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.updateAvailable = true;
          this.notifyUpdateAvailable();
        }
      });
    });

    // Detectar quando nova versão assume controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  private notifyUpdateAvailable(): void {
    // Disparar evento customizado para componentes React
    window.dispatchEvent(new CustomEvent('pwa:update-available', {
      detail: {
        version: 'Nova versão',
        features: [
          'Melhorias de performance',
          'Correções de bugs',
          'Novas funcionalidades'
        ]
      }
    }));
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      console.warn('⚠️ Nenhuma atualização disponível');
      return;
    }

    const newWorker = this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  get hasUpdate(): boolean {
    return this.updateAvailable;
  }
}

// Instância singleton
export const updateManager = new UpdateManager();

export default updateManager;