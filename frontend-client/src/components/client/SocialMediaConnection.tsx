import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Zap, 
  Activity, 
  BarChart3, 
  Radio, 
  Instagram, 
  Facebook, 
  Link, 
  ExternalLink, 
  Key
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { Link as RouterLink } from 'react-router-dom';

interface SocialMediaConnectionProps {
  companyId: string;
  platform: 'instagram' | 'facebook';
}

const SocialMediaConnection: React.FC<SocialMediaConnectionProps> = ({ companyId, platform }) => {
  const { user } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    id?: string;
    username?: string;
    name?: string;
    profilePicture?: string;
    connectedSince?: Date;
  }>({});
  const [connectionStats, setConnectionStats] = useState<{
    uptime?: number;
    connectedSince?: Date;
    messagesSent?: number;
    messagesReceived?: number;
  }>({});
  const [authCode, setAuthCode] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Verificar status inicial ao carregar o componente
  useEffect(() => {
    checkConnectionStatus();
  }, [companyId, platform]);

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Verificação de status de redes sociais desabilitada em desenvolvimento');
      setConnectionStatus('disconnected');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, buscar da API
      // const response = await api.getSocialMediaStatus(companyId, platform);
      
      // Dados mockados para demonstração
      setTimeout(() => {
        // Simular status desconectado
        setConnectionStatus('disconnected');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error(`Erro ao verificar status do ${platform}:`, err);
      setError(`Não foi possível verificar o status da conexão com ${platform}`);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  // Iniciar conexão
  const handleConnect = async () => {
    setShowAuthForm(true);
  };

  // Submeter código de autenticação
  const handleSubmitAuth = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Autenticação de redes sociais desabilitada em desenvolvimento');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, enviar para a API
      // const response = await api.connectSocialMedia(companyId, platform, { authCode });
      
      // Simular conexão bem-sucedida após 2 segundos
      setTimeout(() => {
        setConnectionStatus('connected');
        setShowAuthForm(false);
        
        // Simular dados da conta conectada
        setAccountInfo({
          id: platform === 'instagram' ? '12345678' : '87654321',
          username: platform === 'instagram' ? 'empresa_demo' : 'Empresa Demo',
          name: 'Empresa Demo',
          profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
          connectedSince: new Date()
        });
        
        // Simular estatísticas de conexão
        setConnectionStats({
          uptime: 0, // Acabou de conectar
          connectedSince: new Date(),
          messagesSent: 0,
          messagesReceived: 0
        });
        
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      console.error(`Erro ao conectar ${platform}:`, err);
      setError(`Erro ao conectar com ${platform}`);
      setIsLoading(false);
    }
  };

  // Desconectar
  const handleDisconnect = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Desconexão de redes sociais desabilitada em desenvolvimento');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, enviar para a API
      // const response = await api.disconnectSocialMedia(companyId, platform);
      
      // Simular desconexão após 1 segundo
      setTimeout(() => {
        setConnectionStatus('disconnected');
        setAccountInfo({});
        setConnectionStats({});
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error(`Erro ao desconectar ${platform}:`, err);
      setError(`Erro ao desconectar ${platform}`);
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
        return `${platform === 'instagram' ? 'Instagram' : 'Facebook'} Conectado`;
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro na Conexão';
      default:
        return `${platform === 'instagram' ? 'Instagram' : 'Facebook'} Desconectado`;
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
        return `Seu ${platform === 'instagram' ? 'Instagram' : 'Facebook'} está conectado à conta @${accountInfo.username}`;
      case 'connecting':
        return `Conectando ao ${platform === 'instagram' ? 'Instagram' : 'Facebook'}...`;
      case 'error':
        return `Ocorreu um erro ao conectar com o ${platform === 'instagram' ? 'Instagram' : 'Facebook'}`;
      default:
        return `Conecte seu ${platform === 'instagram' ? 'Instagram' : 'Facebook'} para começar a receber mensagens`;
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

  const getPlatformIcon = () => {
    return platform === 'instagram' ? (
      <Instagram className="h-12 w-12 text-pink-600" />
    ) : (
      <Facebook className="h-12 w-12 text-blue-600" />
    );
  };

  const getPlatformColor = () => {
    return platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-blue-600';
  };

  const getPlatformName = () => {
    return platform === 'instagram' ? 'Instagram Direct' : 'Facebook Messenger';
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
                className="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{ backgroundColor: platform === 'instagram' ? '#E1306C' : '#1877F2' }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Conectar ${getPlatformName()}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Form */}
      {showAuthForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-6">
          <div className="mb-6">
            {getPlatformIcon()}
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              Conectar {getPlatformName()}
            </h3>
            <p className="text-gray-600 mb-4">
              Para conectar sua conta, precisamos de um token de acesso
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 text-left mb-1">
                Token de Acesso
              </label>
              <input
                type="text"
                id="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cole seu token de acesso aqui"
              />
            </div>

            <div className="flex justify-between mb-6">
              <button
                onClick={() => setShowAuthForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSubmitAuth}
                disabled={!authCode.trim() || isLoading}
                className="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{ backgroundColor: platform === 'instagram' ? '#E1306C' : '#1877F2' }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Conectar'
                )}
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Como obter seu token de acesso:
              </h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal pl-5">
                <li>Acesse o <a href={platform === 'instagram' ? 'https://developers.facebook.com/docs/instagram-api/' : 'https://developers.facebook.com/docs/messenger-platform/'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  Painel de Desenvolvedores {platform === 'instagram' ? 'Instagram' : 'Facebook'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a></li>
                <li>Crie ou selecione um aplicativo</li>
                <li>Configure as permissões necessárias para mensagens</li>
                <li>Gere um token de acesso de longa duração</li>
                <li>Copie e cole o token no campo acima</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Connected State */}
      {connectionStatus === 'connected' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden">
              {accountInfo.profilePicture ? (
                <img 
                  src={accountInfo.profilePicture} 
                  alt={accountInfo.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white ${getPlatformColor()}`}>
                  {platform === 'instagram' ? (
                    <Instagram className="h-10 w-10" />
                  ) : (
                    <Facebook className="h-10 w-10" />
                  )}
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getPlatformName()} Conectado com Sucesso!
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
                <div className="font-semibold text-blue-900">Conta</div>
                <div className="text-blue-700">@{accountInfo.username}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="font-semibold text-purple-900">ID</div>
                <div className="text-purple-700">{accountInfo.id}</div>
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
              <RouterLink 
                to={`/client/${platform}-monitoring`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Acessar Monitoramento</span>
              </RouterLink>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Dicas para integração com {getPlatformName()}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Certifique-se de que sua conta tem permissões para mensagens</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Use tokens de acesso de longa duração para evitar desconexões</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Responda às mensagens dentro de 24 horas para manter a janela de mensagens ativa</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Siga as políticas de uso da plataforma para evitar bloqueios</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaConnection;