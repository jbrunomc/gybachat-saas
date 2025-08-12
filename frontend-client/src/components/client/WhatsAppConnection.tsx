import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, CheckCircle, AlertCircle, RefreshCw, Loader2, Zap, Activity, BarChart3, Radio } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

interface WhatsAppConnectionProps {
  companyId: string;
}

const WhatsAppConnection: React.FC<WhatsAppConnectionProps> = ({ companyId }) => {
  const { user } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [connectionStats, setConnectionStats] = useState<{
    uptime?: number;
    connectedSince?: Date;
    reconnectCount?: number;
    messagesSent?: number;
    messagesReceived?: number;
  }>({});
  const [availableConnectionTypes, setAvailableConnectionTypes] = useState<{id: string, name: string, description: string}[]>([]);
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>('evolution');

  // Carregar tipos de conexão disponíveis
  useEffect(() => {
    const loadConnectionTypes = async () => {
      try {
        // Em produção, buscar da API
        // const response = await api.getWhatsAppConnectionTypes();
        // if (response.success) {
        //   setAvailableConnectionTypes(response.data);
        // }

        // Dados mockados para demonstração
        setAvailableConnectionTypes([
          {
            id: 'evolution',
            name: 'Evolution API',
            description: 'Conexão via QR Code usando Evolution API (recomendado)'
          },
          {
            id: 'official',
            name: 'API Oficial',
            description: 'Conexão via API Oficial do WhatsApp Business'
          }
        ]);
      } catch (err) {
        console.error('Erro ao carregar tipos de conexão:', err);
      }
    };

    loadConnectionTypes();
  }, []);

  // Verificar status inicial ao carregar o componente
  useEffect(() => {
    checkConnectionStatus();
    
    // Configurar listeners para eventos de WebSocket
    window.addEventListener('whatsapp:qr-code', handleQrCodeEvent);
    window.addEventListener('whatsapp:connected', handleConnectedEvent);
    window.addEventListener('whatsapp:disconnected', handleDisconnectedEvent);
    
    return () => {
      // Limpar listeners ao desmontar
      window.removeEventListener('whatsapp:qr-code', handleQrCodeEvent);
      window.removeEventListener('whatsapp:connected', handleConnectedEvent);
      window.removeEventListener('whatsapp:disconnected', handleDisconnectedEvent);
    };
  }, [companyId]);

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getWhatsAppStatus(companyId);
      
      if (response.success) {
        setConnectionStatus(response.data.connected ? 'connected' : 'disconnected');
        setPhoneNumber(response.data.phoneNumber || null);
        
        if (response.data.qrCode) {
          setQrCode(response.data.qrCode);
          setConnectionStatus('connecting');
        }
        
        // Definir o tipo de conexão atual
        if (response.data.connectionType) {
          setSelectedConnectionType(response.data.connectionType);
        }
        
        // Simular estatísticas de conexão para demonstração
        if (response.data.connected) {
          setConnectionStats({
            uptime: Math.floor(Math.random() * 86400), // Até 24 horas em segundos
            connectedSince: new Date(Date.now() - Math.random() * 86400000), // Até 24 horas atrás
            reconnectCount: Math.floor(Math.random() * 5),
            messagesSent: Math.floor(Math.random() * 500),
            messagesReceived: Math.floor(Math.random() * 800)
          });
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status do WhatsApp:', err);
      setError('Não foi possível verificar o status da conexão');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para eventos de WebSocket
  const handleQrCodeEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.companyId === companyId) {
      setQrCode(customEvent.detail.qrCode);
      setConnectionStatus('connecting');
      setError(null);
    }
  };

  const handleConnectedEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.companyId === companyId) {
      setConnectionStatus('connected');
      setPhoneNumber(customEvent.detail.phoneNumber || null);
      setQrCode('');
      setError(null);
      setRetryCount(0);
      
      // Simular estatísticas de conexão para demonstração
      setConnectionStats({
        uptime: 0, // Acabou de conectar
        connectedSince: new Date(),
        reconnectCount: 0,
        messagesSent: 0,
        messagesReceived: 0
      });
    }
  };

  const handleDisconnectedEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.companyId === companyId) {
      setConnectionStatus('disconnected');
      setPhoneNumber(null);
      setQrCode('');
      setConnectionStats({});
    }
  };

  // Iniciar conexão
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.connectWhatsApp(companyId, { connectionType: selectedConnectionType });
      
      if (response.success) {
        setConnectionStatus('connecting');
        if (response.data && response.data.qrCode) {
          setQrCode(response.data.qrCode);
        } else {
          // Se não recebeu QR code, tentar novamente após um breve delay
          setTimeout(() => refreshQrCode(), 2000);
        }
      } else {
        setError('Não foi possível iniciar a conexão');
      }
    } catch (err) {
      console.error('Erro ao conectar WhatsApp:', err);
      setError('Erro ao iniciar conexão com WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  // Desconectar
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.disconnectWhatsApp(companyId);
      
      if (response.success) {
        setConnectionStatus('disconnected');
        setQrCode('');
        setPhoneNumber(null);
        setConnectionStats({});
      } else {
        setError('Não foi possível desconectar');
      }
    } catch (err) {
      console.error('Erro ao desconectar WhatsApp:', err);
      setError('Erro ao desconectar WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar QR Code
  const refreshQrCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getWhatsAppQRCode(companyId);
      
      if (response.success && response.data.qrCode) {
        setQrCode(response.data.qrCode);
        setConnectionStatus('connecting');
        setRetryCount(0);
      } else {
        // Se não conseguiu obter QR code e ainda não tentou muitas vezes
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => refreshQrCode(), 3000);
        } else {
          setError('Não foi possível obter novo QR Code após várias tentativas. Tente reiniciar o processo.');
        }
      }
    } catch (err) {
      console.error('Erro ao obter QR Code:', err);
      setError('Erro ao atualizar QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'WhatsApp Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro na Conexão';
      default:
        return 'WhatsApp Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'connecting':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusDescription = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Seu WhatsApp está conectado ao número ${phoneNumber || 'desconhecido'}`;
      case 'connecting':
        return selectedConnectionType === 'evolution' 
          ? 'Escaneie o QR Code com seu WhatsApp para conectar' 
          : 'Conectando via API Oficial...';
      case 'error':
        return 'Ocorreu um erro ao conectar com o WhatsApp';
      default:
        return 'Conecte seu WhatsApp para começar a receber mensagens';
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getConnectionTypeDescription = (typeId: string) => {
    const type = availableConnectionTypes.find(t => t.id === typeId);
    return type?.description || '';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status Card */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{getStatusText()}</h3>
              <p className="text-sm text-gray-600">
                {getStatusDescription()}
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {connectionStatus === 'connected' ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMonitoring(!showMonitoring)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Monitoramento</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Desconectar'
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Conectar WhatsApp'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seletor de Tipo de Conexão */}
      {connectionStatus === 'disconnected' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha o Tipo de Conexão</h3>
          
          <div className="space-y-4">
            {availableConnectionTypes.map((type) => (
              <div 
                key={type.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedConnectionType === type.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedConnectionType(type.id)}
              >
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="radio"
                    checked={selectedConnectionType === type.id}
                    onChange={() => setSelectedConnectionType(type.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 cursor-pointer">
                    {type.name}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center">
              <Radio className="h-4 w-4 mr-2 text-blue-600" />
              <span>
                Você pode mudar o tipo de conexão a qualquer momento, mas precisará reconectar o WhatsApp.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* QR Code Section */}
      {connectionStatus === 'connecting' && selectedConnectionType === 'evolution' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Escaneie o QR Code
            </h3>
            <p className="text-gray-600">
              Abra o WhatsApp no seu celular e escaneie o código abaixo
            </p>
          </div>

          {/* QR Code Display */}
          <div className="bg-gray-50 rounded-lg p-8 mb-6 inline-block">
            {qrCode ? (
              <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                <img 
                  src={qrCode} 
                  alt="QR Code para conexão do WhatsApp" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <p className="text-sm text-gray-500">Carregando QR Code...</p>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshQrCode}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mb-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar QR Code</span>
              </div>
            )}
          </button>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Como conectar:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Abra o WhatsApp no seu celular</li>
                  <li>2. Toque em "Mais opções" (⋮) e depois em "Aparelhos conectados"</li>
                  <li>3. Toque em "Conectar um aparelho"</li>
                  <li>4. Aponte a câmera para este QR code</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Oficial Connection Section */}
      {connectionStatus === 'connecting' && selectedConnectionType === 'official' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Conectando via API Oficial
            </h3>
            <p className="text-gray-600">
              Aguarde enquanto configuramos sua conexão com a API Oficial do WhatsApp
            </p>
          </div>

          {/* Loading Indicator */}
          <div className="bg-gray-50 rounded-lg p-8 mb-6 inline-block">
            <div className="w-64 h-64 flex flex-col items-center justify-center">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-700">Estabelecendo conexão...</p>
              <p className="text-xs text-gray-500 mt-2">Isso pode levar alguns minutos</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Informações sobre a API Oficial:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A API Oficial requer verificação e aprovação da Meta</li>
                  <li>• Não é necessário escanear QR Code</li>
                  <li>• Oferece maior estabilidade e suporte oficial</li>
                  <li>• Requer um plano de assinatura da API do WhatsApp Business</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected State */}
      {connectionStatus === 'connected' && !showMonitoring && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              WhatsApp Conectado com Sucesso!
            </h3>
            <p className="text-gray-600 mb-6">
              Agora você pode receber e enviar mensagens através da plataforma
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-green-900">Status</div>
                <div className="text-green-700">Online</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-semibold text-blue-900">Número</div>
                <div className="text-blue-700">{phoneNumber || 'Não disponível'}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="font-semibold text-purple-900">Tipo de Conexão</div>
                <div className="text-purple-700">
                  {selectedConnectionType === 'evolution' ? 'Evolution API' : 'API Oficial'}
                </div>
              </div>
            </div>
            
            {connectionStats.uptime !== undefined && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Tempo Conectado</div>
                  <div className="text-gray-700">{formatUptime(connectionStats.uptime)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Mensagens Enviadas</div>
                  <div className="text-gray-700">{connectionStats.messagesSent}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">Mensagens Recebidas</div>
                  <div className="text-gray-700">{connectionStats.messagesReceived}</div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Link 
                to="/client/whatsapp-monitoring" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Acessar Monitoramento Avançado</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring View */}
      {connectionStatus === 'connected' && showMonitoring && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monitoramento do WhatsApp</h3>
            <button
              onClick={() => setShowMonitoring(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Tempo Conectado</p>
                  <p className="text-xl font-bold text-blue-800">{formatUptime(connectionStats.uptime)}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">Mensagens Enviadas</p>
                  <p className="text-xl font-bold text-green-800">{connectionStats.messagesSent}</p>
                </div>
                <Send className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600">Mensagens Recebidas</p>
                  <p className="text-xl font-bold text-purple-800">{connectionStats.messagesReceived}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-600">Reconexões</p>
                  <p className="text-xl font-bold text-yellow-800">{connectionStats.reconnectCount || 0}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Status da Conexão</h4>
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <span className="text-sm font-medium text-green-600">Excelente</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações do Dispositivo</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plataforma:</span>
                  <span className="text-sm font-medium">Android</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <span className="text-sm font-medium">Samsung Galaxy S21</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Versão do WhatsApp:</span>
                  <span className="text-sm font-medium">2.22.24.78</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bateria:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Estatísticas de Mensagens</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                  <span className="text-sm font-medium text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Leitura:</span>
                  <span className="text-sm font-medium text-green-600">87.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Resposta:</span>
                  <span className="text-sm font-medium text-yellow-600">76.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Médio de Resposta:</span>
                  <span className="text-sm font-medium">2m 34s</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              to="/client/whatsapp-monitoring" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Acessar Monitoramento Avançado</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Dicas para uma conexão estável
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Mantenha o celular conectado à energia e Wi-Fi estável</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Não desconecte o WhatsApp Web em outros dispositivos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Mantenha o aplicativo do WhatsApp aberto no celular</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Evite trocar de rede Wi-Fi ou 4G durante a conexão</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnection;