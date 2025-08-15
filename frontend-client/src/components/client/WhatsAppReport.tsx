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
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
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
}

interface WhatsAppStats {
  totalMessages: number;
  sentMessages: number;
  receivedMessages: number;
  mediaMessages: number;
  activeHours: {
    hour: number;
    count: number;
  }[];
  dailyActivity: {
    date: string;
    count: number;
  }[];
  responseTime: number;
}

const WhatsAppReport: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.companyId) {
      loadSessions();
      loadStats();
    }
  }, [user?.companyId]);

  const loadSessions = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de sessões WhatsApp para relatório desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, buscar do backend
      // const response = await api.getWhatsAppSessions(user.companyId);
      
      // Dados mockados para demonstração
      const mockSessions: WhatsAppSession[] = [
        {
          id: '1',
          company_id: user?.companyId || '',
          session_name: 'WhatsApp Principal',
          status: 'connected',
          phone_number: '+5511999991234',
          last_seen: new Date().toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setSessions(mockSessions);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setError('Não foi possível carregar as sessões do WhatsApp');
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de estatísticas WhatsApp desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Em produção, buscar do backend
      // const response = await api.getWhatsAppStats(user.companyId, dateRange);
      
      // Dados mockados para demonstração
      const mockStats: WhatsAppStats = {
        totalMessages: 1245,
        sentMessages: 578,
        receivedMessages: 667,
        mediaMessages: 123,
        activeHours: [
          { hour: 8, count: 45 },
          { hour: 9, count: 78 },
          { hour: 10, count: 95 },
          { hour: 11, count: 112 },
          { hour: 12, count: 85 },
          { hour: 13, count: 68 },
          { hour: 14, count: 125 },
          { hour: 15, count: 145 },
          { hour: 16, count: 138 },
          { hour: 17, count: 95 },
          { hour: 18, count: 72 }
        ],
        dailyActivity: [
          { date: '2024-06-01', count: 145 },
          { date: '2024-06-02', count: 132 },
          { date: '2024-06-03', count: 98 },
          { date: '2024-06-04', count: 115 },
          { date: '2024-06-05', count: 87 },
          { date: '2024-06-06', count: 134 },
          { date: '2024-06-07', count: 125 }
        ],
        responseTime: 125 // segundos
      };
      
      setStats(mockStats);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    loadSessions();
    loadStats();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementar exportação para CSV/Excel
    alert('Exportação para CSV será implementada em breve');
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
            <XCircle className="h-3 w-3 mr-1" />
            Erro
          </span>
        );
    }
  };

  // Filtrar sessões
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.phone_number?.includes(searchTerm) || 
                         session.session_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de WhatsApp</h2>
            <p className="text-sm text-gray-600">Estatísticas e histórico de conexões</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Atualizar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Imprimir"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Exportar"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Período */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número ou nome da sessão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos os Status</option>
              <option value="connected">Conectado</option>
              <option value="connecting">Conectando</option>
              <option value="disconnected">Desconectado</option>
              <option value="error">Erro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Mensagens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensagens Enviadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.sentMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensagens Recebidas</p>
                <p className="text-2xl font-bold text-purple-600">{stats.receivedMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold text-orange-600">{Math.floor(stats.responseTime / 60)}m {stats.responseTime % 60}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Sessões */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Sessões de WhatsApp
            </h3>
            <div className="text-sm text-gray-500">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'sessão' : 'sessões'} encontradas
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Nome da Sessão</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Número</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Criado em</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Última Atividade</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.session_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.phone_number || 'Não conectado'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {session.last_seen ? new Date(session.last_seen).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Conecte seu WhatsApp para começar'
              }
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas Detalhadas */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividade por Hora */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade por Hora</h3>
            <div className="h-64">
              <div className="h-full flex items-end space-x-2">
                {stats.activeHours.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(hour.count / Math.max(...stats.activeHours.map(h => h.count))) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">{hour.hour}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Atividade Diária */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Diária</h3>
            <div className="h-64">
              <div className="h-full flex items-end space-x-2">
                {stats.dailyActivity.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ 
                        height: `${(day.count / Math.max(...stats.dailyActivity.map(d => d.count))) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppReport;