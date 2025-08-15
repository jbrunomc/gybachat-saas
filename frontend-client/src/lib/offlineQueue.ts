/**
 * Gerenciador de Queue Offline
 * PRONTO PARA BACKEND - aguardando endpoints de sync
 */

interface QueueItem {
  id: string;
  type: 'send_message' | 'update_conversation' | 'mark_read' | 'add_tag';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export class OfflineQueueManager {
  private queue: QueueItem[] = [];
  private isProcessing = false;

  async initialize(): Promise<void> {
    this.loadFromStorage();
    this.setupOnlineListener();
    console.log('📦 Offline Queue Manager inicializado (aguardando backend)');
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('gybachat-offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar queue offline:', error);
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('gybachat-offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('❌ Erro ao salvar queue offline:', error);
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      if (this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  addToQueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>): void {
    const queueItem: QueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      ...item
    };

    this.queue.push(queueItem);
    this.saveToStorage();
    
    console.log('📦 Item adicionado à queue offline:', queueItem.type);

    // Tentar processar imediatamente se estiver online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log('🔄 Processando queue offline...');

    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        // TODO: Implementar sync com backend quando estiver pronto
        console.log('🔄 Sync será implementado com backend:', item.type);
        
        // Remover item da queue após sucesso
        this.removeFromQueue(item.id);
        
      } catch (error) {
        console.error('❌ Erro ao processar item da queue:', error);
        
        // Incrementar tentativas
        item.retries++;
        
        if (item.retries >= item.maxRetries) {
          console.error('❌ Item removido da queue após máximo de tentativas:', item.id);
          this.removeFromQueue(item.id);
        }
      }
    }

    this.isProcessing = false;
    this.saveToStorage();
  }

  private removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter(item => item.id !== itemId);
  }

  get queueSize(): number {
    return this.queue.length;
  }

  get hasItems(): boolean {
    return this.queue.length > 0;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveToStorage();
  }
}

// Instância singleton
export const offlineQueueManager = new OfflineQueueManager();

export default offlineQueueManager;