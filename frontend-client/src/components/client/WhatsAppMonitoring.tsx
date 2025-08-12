import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Smartphone, 
  BarChart3, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Calendar,
  Activity,
  AlertTriangle,
  Zap,
  Users,
  Eye,
  Send,
  Download,
  Loader2,
  Gauge,
  Signal,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
  Phone,
  ArrowLeft,
  Link
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../lib/api';

interface WhatsAppSession {
  id: string;
  company_id: string;
  session_name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  phone_number?: string;
  last_seen?: string;
  created_at: string;
  updated_at: string;
  device_info?: {
    platform?: string;
    phone_version?: string;
    device_manufacturer?: string;
    device_model?: string;
    os_version?: string;
    wa_version?: string;
    battery?: number;
  };
  connection_stats?: {
    uptime: number;
    connected_since: string;
    reconnect_count: number;
    last_reconnect?: string;
  };
  message_stats?: {
    sent_today: number;
    received_today: number;
    sent_total: number;
    received_total: number;
    delivery_rate: number;
    read_rate: number;
    response_rate: number;
  };
  health_status?: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    last_check: string;
  };
}

interface InstanceMonitoring {
  instance_name: string;
  status: string;
  phone: string;
  battery: {
    level: number;
    charging: boolean;
  };
  connection: {
    type: string;
    strength: number;
  };
  memory_usage: {
    used: number;
    total: number;
  };
  cpu_usage: number;
  messages: {
    sent_today: number;
    received_today: number;
    sent_total: number;
    received_total: number;
    delivery_rate: number;
    read_rate: number;
  };
  uptime: number;
  version: string;
  last_activity: string;
  health_score: number;
  issues: string[];
}

const WhatsAppMonitoring: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDetailedStats, setShowDetailedStats] = useState<boolean>(false);
  const [instanceMonitoring, setInstanceMonitoring] = useState<InstanceMonitoring | null>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState<boolean>(false);

  // Load sessions on component mount
  useEffect(() => {
    if (user?.companyId) {
      loadSessions();
    }
  }, [user?.companyId]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      loadSessions();
      if (selectedSession && sessions.length > 0) {
        const session = sessions.find(s => s.id === selectedSession);
        if (session) {
          loadInstanceMonitoring(session.session_name);
        }
      }
      setLastRefreshed(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, selectedSession, sessions]);

  // Load instance monitoring when a session is selected
  useEffect(() => {
    if (selectedSession && sessions.length > 0) {
      const session = sessions.find(s => s.id === selectedSession);
      if (session) {
        loadInstanceMonitoring(session.session_name);
      }
    }
  }, [selectedSession, sessions]);

  const loadSessions = async () => {
    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In production, fetch from backend
      // const response = await api.getWhatsAppSessions(user.companyId);
      
      // Mock data for demonstration
      const mockSessions: WhatsAppSession[] = [
        {
          id: '1',
          company_id: user.companyId,
          session_name: 'instance_' + user.companyId,
          status: 'connected',
          phone_number: '+5511999991234',
          last_seen: new Date().toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          device_info: {
            platform: 'android',
            phone_version: 'Android 12',
            device_manufacturer: 'Samsung',
            device_model: 'Galaxy S21',
            os_version: '12.0',
            wa_version: '2.22.24.78',
            battery: 85
          },
          connection_stats: {
            uptime: 86400, // 24 hours in seconds
            connected_since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            reconnect_count: 2,
            last_reconnect: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          message_stats: {
            sent_today: 156,
            received_today: 243,
            sent_total: 3456,
            received_total: 4567,
            delivery_rate: 98.5,
            read_rate: 87.2,
            response_rate: 76.4
          },
          health_status: {
            status: 'healthy',
            issues: [],
            last_check: new Date().toISOString()
          }
        }
      ];
      
      setSessions(mockSessions);
      
      // If there's only one session, select it automatically
      if (mockSessions.length === 1 && !selectedSession) {
        setSelectedSession(mockSessions[0].id);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading WhatsApp sessions:', err);
      setError('Failed to load WhatsApp sessions. Please try again later.');
      setIsLoading(false);
    }
  };

  const loadInstanceMonitoring = async (instanceName: string) => {
    if (!user?.companyId) return;
    
    try {
      setIsLoadingMonitoring(true);
      
      // In production, fetch from backend
      // const response = await api.getWhatsAppMonitoring(user.companyId, instanceName);
      
      // Mock data for demonstration
      const mockMonitoring: InstanceMonitoring = {
        instance_name: instanceName,
        status: 'connected',
        phone: '+5511999991234',
        battery: {
          level: 85,
          charging: true
        },
        connection: {
          type: 'wifi',
          strength: 90
        },
        memory_usage: {
          used: 1.2,
          total: 4
        },
        cpu_usage: 15,
        messages: {
          sent_today: 156,
          received_today: 243,
          sent_total: 3456,
          received_total: 4567,
          delivery_rate: 98.5,
          read_rate: 87.2
        },
        uptime: 86400, // 24 hours in seconds
        version: '2.22.24.78',
        last_activity: new Date().toISOString(),
        health_score: 95,
        issues: []
      };
      
      setInstanceMonitoring(mockMonitoring);
      setIsLoadingMonitoring(false);
    } catch (err) {
      console.error('Error loading instance monitoring:', err);
      setIsLoadingMonitoring(false);
    }
  };

  const handleRefresh = () => {
    loadSessions();
    if (selectedSession && sessions.length > 0) {
      const session = sessions.find(s => s.id === selectedSession);
      if (session) {
        loadInstanceMonitoring(session.session_name);
      }
    }
    setLastRefreshed(new Date());
  };

  const formatUptime = (seconds: number) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Conectando
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Desconectado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Erro
          </span>
        );
    }
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Saudável
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Atenção
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Crítico
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Eye className="h-3 w-3 mr-1" />
            Desconhecido
          </span>
        );
    }
  };

  const getMessageTrend = (session: WhatsAppSession) => {
    if (!session.message_stats) return null;
    
    const stats = session.message_stats;
    const sentRate = stats.sent_today > 0 ? Math.round((stats.sent_today / stats.sent_total) * 100) : 0;
    const receivedRate = stats.received_today > 0 ? Math.round((stats.received_today / stats.received_total) * 100) : 0;
    
    const isHighSent = sentRate > 20; // If today's messages are more than 20% of total
    const isHighReceived = receivedRate > 20;
    
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Send className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-sm text-gray-700">{stats.sent_today}</span>
          {isHighSent ? (
            <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
          )}
        </div>
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 text-purple-500 mr-1" />
          <span className="text-sm text-gray-700">{stats.received_today}</span>
          {isHighReceived ? (
            <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
          )}
        </div>
      </div>
    );
  };

  const selectedSessionData = selectedSession 
    ? sessions.find(s => s.id === selectedSession) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monitoramento de WhatsApp</h2>
            <p className="text-sm text-gray-600">
              {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'} encontradas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <RouterLink 
            to="/client/whatsapp" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Conexão</span>
          </RouterLink>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto-refresh:</span>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md p-1"
              disabled={!autoRefresh}
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="300">5m</option>
            </select>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Atualizar"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Last refreshed info */}
      <div className="text-xs text-gray-500 text-right">
        Última atualização: {lastRefreshed.toLocaleTimeString()}
      </div>

      {/* Sessions Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral das Sessões</h3>
        
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-gray-500">
              Conecte seu WhatsApp para começar a monitorar
            </p>
            <RouterLink 
              to="/client/whatsapp" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Conectar WhatsApp
            </RouterLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedSession === session.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                }`}
                onClick={() => setSelectedSession(session.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">{session.session_name}</h4>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{session.phone_number || 'Não conectado'}</span>
                  </div>
                  
                  {session.connection_stats && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        Uptime: {formatUptime(session.connection_stats.uptime)}
                      </span>
                    </div>
                  )}
                  
                  {session.message_stats && getMessageTrend(session)}
                  
                  {session.health_status && (
                    <div className="flex items-center space-x-2 text-sm mt-2">
                      {getHealthStatusBadge(session.health_status.status)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Session Stats */}
      {selectedSessionData && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalhes da Sessão: {selectedSessionData.session_name}
            </h3>
            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetailedStats ? 'Mostrar Menos' : 'Mostrar Mais'}
            </button>
          </div>
          
          <div className="p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações Básicas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium">{getStatusBadge(selectedSessionData.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Número:</span>
                    <span className="text-sm font-medium">{selectedSessionData.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Criado em:</span>
                    <span className="text-sm font-medium">{formatDate(selectedSessionData.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Última atividade:</span>
                    <span className="text-sm font-medium">{selectedSessionData.last_seen ? formatDate(selectedSessionData.last_seen) : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {selectedSessionData.connection_stats && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3">Estatísticas de Conexão</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Uptime:</span>
                      <span className="text-sm font-medium">{formatUptime(selectedSessionData.connection_stats.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Conectado desde:</span>
                      <span className="text-sm font-medium">{formatDate(selectedSessionData.connection_stats.connected_since)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Reconexões:</span>
                      <span className="text-sm font-medium">{selectedSessionData.connection_stats.reconnect_count}</span>
                    </div>
                    {selectedSessionData.connection_stats.last_reconnect && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Última reconexão:</span>
                        <span className="text-sm font-medium">{formatDate(selectedSessionData.connection_stats.last_reconnect)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedSessionData.message_stats && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-3">Estatísticas de Mensagens</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Enviadas hoje:</span>
                      <span className="text-sm font-medium">{selectedSessionData.message_stats.sent_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Recebidas hoje:</span>
                      <span className="text-sm font-medium">{selectedSessionData.message_stats.received_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Taxa de entrega:</span>
                      <span className="text-sm font-medium">{selectedSessionData.message_stats.delivery_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Taxa de leitura:</span>
                      <span className="text-sm font-medium">{selectedSessionData.message_stats.read_rate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Detailed Stats (expandable) */}
            {showDetailedStats && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Device Info */}
                  {selectedSessionData.device_info && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações do Dispositivo</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Plataforma:</span>
                          <span className="text-sm font-medium">{selectedSessionData.device_info.platform || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fabricante:</span>
                          <span className="text-sm font-medium">{selectedSessionData.device_info.device_manufacturer || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Modelo:</span>
                          <span className="text-sm font-medium">{selectedSessionData.device_info.device_model || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Versão do OS:</span>
                          <span className="text-sm font-medium">{selectedSessionData.device_info.os_version || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Versão do WhatsApp:</span>
                          <span className="text-sm font-medium">{selectedSessionData.device_info.wa_version || 'N/A'}</span>
                        </div>
                        {selectedSessionData.device_info.battery && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Bateria:</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    selectedSessionData.device_info.battery > 50 ? 'bg-green-500' :
                                    selectedSessionData.device_info.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${selectedSessionData.device_info.battery}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{selectedSessionData.device_info.battery}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Health Status */}
                  {selectedSessionData.health_status && (
                    <div className={`rounded-lg p-4 ${
                      selectedSessionData.health_status.status === 'healthy' ? 'bg-green-50' :
                      selectedSessionData.health_status.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <h4 className={`text-sm font-semibold mb-3 ${
                        selectedSessionData.health_status.status === 'healthy' ? 'text-green-700' :
                        selectedSessionData.health_status.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
                      }`}>Status de Saúde</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${
                            selectedSessionData.health_status.status === 'healthy' ? 'text-green-600' :
                            selectedSessionData.health_status.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>Status:</span>
                          <span className="text-sm font-medium">{getHealthStatusBadge(selectedSessionData.health_status.status)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className={`text-sm ${
                            selectedSessionData.health_status.status === 'healthy' ? 'text-green-600' :
                            selectedSessionData.health_status.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>Última verificação:</span>
                          <span className="text-sm font-medium">{formatDate(selectedSessionData.health_status.last_check)}</span>
                        </div>
                        
                        {selectedSessionData.health_status.issues.length > 0 && (
                          <div className="mt-2">
                            <span className={`text-sm ${
                              selectedSessionData.health_status.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`}>Problemas detectados:</span>
                            <ul className="mt-1 space-y-1">
                              {selectedSessionData.health_status.issues.map((issue, index) => (
                                <li key={index} className="text-sm flex items-start">
                                  <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 text-red-500" />
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message Stats Detailed */}
                {selectedSessionData.message_stats && (
                  <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Estatísticas Detalhadas de Mensagens</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-blue-600">Total Enviadas</p>
                            <p className="text-xl font-bold text-blue-800">{selectedSessionData.message_stats.sent_total.toLocaleString()}</p>
                          </div>
                          <Send className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-purple-600">Total Recebidas</p>
                            <p className="text-xl font-bold text-purple-800">{selectedSessionData.message_stats.received_total.toLocaleString()}</p>
                          </div>
                          <MessageCircle className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-green-600">Taxa de Entrega</p>
                            <p className="text-xl font-bold text-green-800">{selectedSessionData.message_stats.delivery_rate}%</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-orange-600">Taxa de Resposta</p>
                            <p className="text-xl font-bold text-orange-800">{selectedSessionData.message_stats.response_rate}%</p>
                          </div>
                          <BarChart2 className="h-8 w-8 text-orange-500" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Connection Quality Indicators */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Qualidade da Conexão</h5>
                        <div className="flex items-center space-x-2">
                          <Signal className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">Excelente</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Status da Rede</h5>
                        <div className="flex items-center space-x-2">
                          <Wifi className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Conectado</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Saúde da Sessão</h5>
                        <div className="flex items-center space-x-2">
                          <Gauge className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Ótima</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Advanced Monitoring */}
                {instanceMonitoring && (
                  <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-600" />
                      Monitoramento Avançado
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Uso de Recursos</h5>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">CPU</span>
                                <span className="text-xs text-gray-600">{instanceMonitoring.cpu_usage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    instanceMonitoring.cpu_usage > 80 ? 'bg-red-500' :
                                    instanceMonitoring.cpu_usage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${instanceMonitoring.cpu_usage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Memória</span>
                                <span className="text-xs text-gray-600">
                                  {instanceMonitoring.memory_usage.used.toFixed(1)} / {instanceMonitoring.memory_usage.total} GB
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    (instanceMonitoring.memory_usage.used / instanceMonitoring.memory_usage.total) > 0.8 ? 'bg-red-500' :
                                    (instanceMonitoring.memory_usage.used / instanceMonitoring.memory_usage.total) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${(instanceMonitoring.memory_usage.used / instanceMonitoring.memory_usage.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Conexão</h5>
                          <div className="flex items-center space-x-2">
                            {instanceMonitoring.connection.type === 'wifi' ? (
                              <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                              <Signal className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="text-sm text-gray-700">
                              {instanceMonitoring.connection.type.toUpperCase()} - {instanceMonitoring.connection.strength}% de sinal
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Saúde do Sistema</h5>
                          <div className="flex items-center space-x-2 mb-2">
                            <Gauge className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Score de Saúde: {instanceMonitoring.health_score}/100</span>
                          </div>
                          
                          {instanceMonitoring.issues.length > 0 ? (
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <h6 className="text-xs font-medium text-yellow-800 mb-1">Problemas Detectados:</h6>
                              <ul className="space-y-1">
                                {instanceMonitoring.issues.map((issue, index) => (
                                  <li key={index} className="text-xs text-yellow-700 flex items-start">
                                    <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 text-yellow-500" />
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                <span className="text-xs text-green-700">Nenhum problema detectado</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Atividade</h5>
                          <div className="text-sm text-gray-700">
                            Última atividade: {formatDate(instanceMonitoring.last_activity)}
                          </div>
                          <div className="text-sm text-gray-700">
                            Versão: {instanceMonitoring.version}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Reconectar</span>
                  </button>
                  
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Backup da Sessão</span>
                  </button>
                  
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Diagnóstico Completo</span>
                  </button>
                  
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2">
                    <XCircle className="h-4 w-4" />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips and Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-md font-semibold text-blue-900 mb-2">
              Dicas para Manter seu WhatsApp Saudável
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Mantenha o celular conectado à energia e Wi-Fi estável</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Evite enviar mais de 20 mensagens por minuto</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Mantenha o WhatsApp do celular atualizado</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Faça backup regular da sessão para evitar perda de conexão</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMonitoring;