import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

// Declaração global para acessar o socket de qualquer lugar
declare global {
  interface Window {
    socket: Socket | null;
  }
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string, companyId: string, userId: string, role: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔌 Conectando ao Socket.IO:', serverUrl);
    console.log('🔑 Dados de autenticação:', { companyId, userId, role });
    
    this.socket = io(serverUrl, {
      auth: {
        token,
        companyId,
        userId,
        role
      },
      transports: ['websocket', 'polling'],
      timeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT || '20000'),
      forceNew: true,
      reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECT_ATTEMPTS || '5')
    });

    // Disponibilizar o socket globalmente
    window.socket = this.socket;

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Autenticar socket
      this.socket?.emit('authenticate', {
        userId: this.socket.auth.userId,
        companyId: this.socket.auth.companyId,
        role: this.socket.auth.role,
        token: this.socket.auth.token
      });
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket autenticado:', data);
      
      // Entrar na sala da empresa
      this.socket?.emit('join-company', this.socket.auth.companyId);
    });

    this.socket.on('authentication-error', (error) => {
      console.error('❌ Erro na autenticação do socket:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão do socket:', error);
      this.reconnect();
    });

    // Eventos específicos da aplicação
    this.socket.on('whatsapp:qr-code', (data) => {
      console.log('📱 QR Code recebido:', data);
      window.dispatchEvent(new CustomEvent('whatsapp:qr-code', { detail: data }));
    });

    this.socket.on('whatsapp:connected', (data) => {
      console.log('✅ WhatsApp conectado:', data);
      window.dispatchEvent(new CustomEvent('whatsapp:connected', { detail: data }));
    });

    this.socket.on('whatsapp:disconnected', (data) => {
      console.log('🔌 WhatsApp desconectado:', data);
      window.dispatchEvent(new CustomEvent('whatsapp:disconnected', { detail: data }));
    });

    this.socket.on('conversation:new-message', (data) => {
      console.log('💬 Nova mensagem:', data);
      window.dispatchEvent(new CustomEvent('conversation:new-message', { detail: data }));
    });

    this.socket.on('conversation:typing', (data) => {
      window.dispatchEvent(new CustomEvent('conversation:typing', { detail: data }));
    });

    this.socket.on('message:status-update', (data) => {
      window.dispatchEvent(new CustomEvent('message:status-update', { detail: data }));
    });

    this.socket.on('presence:update', (data) => {
      window.dispatchEvent(new CustomEvent('presence:update', { detail: data }));
    });

    this.socket.on('user:joined', (data) => {
      console.log('👤 Usuário entrou:', data);
      window.dispatchEvent(new CustomEvent('user:joined', { detail: data }));
    });

    this.socket.on('user:left', (data) => {
      console.log('👤 Usuário saiu:', data);
      window.dispatchEvent(new CustomEvent('user:left', { detail: data }));
    });

    this.socket.on('system:alert', (data) => {
      console.log('🚨 Alerta do sistema:', data);
      window.dispatchEvent(new CustomEvent('system:alert', { detail: data }));
    });

    this.socket.on('server:shutdown', (data) => {
      console.log('🛑 Servidor será reiniciado:', data);
      window.dispatchEvent(new CustomEvent('server:shutdown', { detail: data }));
    });
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
    
    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  // Métodos para emitir eventos
  joinConversation(conversationId: string) {
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('conversation:leave', conversationId);
  }

  sendTyping(conversationId: string, isTyping: boolean, userName: string) {
    this.socket?.emit('conversation:typing', {
      conversationId,
      isTyping,
      userName
    });
  }

  updatePresence(status: 'online' | 'away' | 'busy' | 'offline') {
    this.socket?.emit('presence:update', status);
  }

  // Getters
  get connected() {
    return this.isConnected && this.socket?.connected;
  }

  get socketId() {
    return this.socket?.id;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      window.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }
}

// Instância singleton
export const socketManager = new SocketManager();

// Inicializar socket quando o usuário fizer login
export const initializeSocket = () => {
  const { user } = useAuthStore.getState();
  
  if (user && user.token) {
    console.log('🔌 Inicializando Socket.IO após login');
    socketManager.connect(
      user.token,
      user.companyId || 'master',
      user.id,
      user.role
    );
  }
};

// Hook para usar o socket em componentes React
export const useSocket = () => {
  return socketManager;
};

export default socketManager;