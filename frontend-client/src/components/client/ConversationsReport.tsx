import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  MessageCircle, 
  BarChart3, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Printer,
  RefreshCw,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Tag,
  Smartphone,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface Conversation {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: 'active' | 'waiting' | 'closed' | 'transferred' | 'bot';
  assigned_agent_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  source: string;
  created_at: string;
  updated_at: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  message_count?: number;
  resolution_time?: number;
}

interface ConversationStats {
  total: number;
  active: number;
  waiting: number;
  closed: number;
  avgResolutionTime: number;
  bySource: Record<string, number>;
  byPriority: Record<string, number>;
  byTag: Record<string, number>;
  byAgent: Record<string, {count: number, avgResolutionTime: number}>;
}

const ConversationsReport: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (user?.companyId) {
      loadConversations();
    }
  }, [user?.companyId, dateRange, filterStatus, filterSource, filterPriority]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, buscar do backend
      // const response = await api.getConversationsReport(user.companyId, {
      //   dateFrom: dateRange.start,
      //   dateTo: dateRange.end,
      //   status: filterStatus !== 'all' ? filterStatus : undefined,
      //   source: filterSource !== 'all' ? filterSource : undefined,
      //   priority: filterPriority !== 'all' ? filterPriority : undefined
      // });
      
      // Dados mockados para demonstração
      const mockConversations: Conversation[] = Array.from({ length: 50 }, (_, i) => {
        const status = ['active', 'waiting', 'closed', 'transferred'][Math.floor(Math.random() * 4)] as 'active' | 'waiting' | 'closed' | 'transferred';
        const priority = ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'urgent';
        const source = ['whatsapp', 'telegram', 'webchat', 'instagram'][Math.floor(Math.random() * 4)];
        const agents = ['Carlos Lima', 'Maria Santos', 'João Silva', null];
        const agentName = agents[Math.floor(Math.random() * agents.length)];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
        const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString();
        const tags = [];
        if (Math.random() > 0.5) tags.push('suporte');
        if (Math.random() > 0.7) tags.push('vip');
        if (Math.random() > 0.8) tags.push('urgente');
        
        return {
          id: `conv-${i+1}`,
          customer_name: `Cliente ${i+1}`,
          customer_phone: `+55119${Math.floor(10000000 + Math.random() * 90000000)}`,
          status,
          assigned_agent_name: agentName,
          priority,
          tags,
          source,
          created_at: createdAt,
          updated_at: updatedAt,
          last_message: `Última mensagem da conversa ${i+1}`,
          last_message_time: updatedAt,
          unread_count: status === 'active' || status === 'waiting' ? Math.floor(Math.random() * 5) : 0,
          message_count: Math.floor(5 + Math.random() * 50),
          resolution_time: status === 'closed' ? Math.floor(1800 + Math.random() * 7200) : undefined // 30min - 2h em segundos
        };
      });
      
      // Calcular estatísticas
      const statsData: ConversationStats = {
        total: mockConversations.length,
        active: mockConversations.filter(c => c.status === 'active').length,
        waiting: mockConversations.filter(c => c.status === 'waiting').length,
        closed: mockConversations.filter(c => c.status === 'closed').length,
        avgResolutionTime: Math.floor(
          mockConversations
            .filter(c => c.resolution_time)
            .reduce((sum, c) => sum + (c.resolution_time || 0), 0) / 
          mockConversations.filter(c => c.resolution_time).length || 0
        ),
        bySource: {},
        byPriority: {},
        byTag: {},
        byAgent: {}
      };
      
      // Calcular distribuição por fonte
      mockConversations.forEach(c => {
        // Por fonte
        if (!statsData.bySource[c.source]) statsData.bySource[c.source] = 0;
        statsData.bySource[c.source]++;
        
        // Por prioridade
        if (!statsData.byPriority[c.priority]) statsData.byPriority[c.priority] = 0;
        statsData.byPriority[c.priority]++;
        
        // Por tag
        c.tags.forEach(tag => {
          if (!statsData.byTag[tag]) statsData.byTag[tag] = 0;
          statsData.byTag[tag]++;
        });
        
        // Por agente
        if (c.assigned_agent_name) {
          if (!statsData.byAgent[c.assigned_agent_name]) {
            statsData.byAgent[c.assigned_agent_name] = {
              count: 0,
              avgResolutionTime: 0
            };
          }
          statsData.byAgent[c.assigned_agent_name].count++;
          
          if (c.resolution_time) {
            const agent = statsData.byAgent[c.assigned_agent_name];
            const totalTime = agent.avgResolutionTime * (agent.count - 1) + c.resolution_time;
            agent.avgResolutionTime = Math.floor(totalTime / agent.count);
          }
        }
      });
      
      setConversations(mockConversations);
      setStats(statsData);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      setError('Não foi possível carregar o relatório de conversas');
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
    loadConversations();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementar exportação para CSV/Excel
    alert('Exportação para CSV será implementada em breve');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Aguardando
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Fechado
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1" />
            Transferido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <MessageCircle className="h-3 w-3 mr-1" />
            Bot
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Urgente
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Alta
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Média
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Baixa
          </span>
        );
      default:
        return null;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'telegram':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'webchat':
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'instagram':
        return <MessageCircle className="h-4 w-4 text-pink-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Filtrar e ordenar conversas
  const filteredAndSortedConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conv.customer_phone.includes(searchTerm) ||
                           (conv.assigned_agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                           conv.last_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
      const matchesSource = filterSource === 'all' || conv.source === filterSource;
      const matchesPriority = filterPriority === 'all' || conv.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'customer_name':
          comparison = a.customer_name.localeCompare(b.customer_name);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'message_count':
          comparison = (a.message_count || 0) - (b.message_count || 0);
          break;
        case 'resolution_time':
          comparison = (a.resolution_time || 0) - (b.resolution_time || 0);
          break;
        default:
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Conversas</h2>
            <p className="text-sm text-gray-600">Análise e estatísticas de atendimentos</p>
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
              placeholder="Buscar por cliente, agente, mensagem ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtros */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="waiting">Aguardando</option>
            <option value="closed">Fechado</option>
            <option value="transferred">Transferido</option>
            <option value="bot">Bot</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas as Fontes</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="webchat">Web Chat</option>
            <option value="instagram">Instagram</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio Resolução</p>
                <p className="text-2xl font-bold text-purple-600">{formatDuration(stats.avgResolutionTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Conversas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversas
            </h3>
            <div className="text-sm text-gray-500">
              {filteredAndSortedConversations.length} {filteredAndSortedConversations.length === 1 ? 'conversa' : 'conversas'} encontradas
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Cliente</span>
                      {sortBy === 'customer_name' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criada em</span>
                      {sortBy === 'created_at' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('updated_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Última Atividade</span>
                      {sortBy === 'updated_at' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('message_count')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Mensagens</span>
                      {sortBy === 'message_count' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('resolution_time')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tempo Resolução</span>
                      {sortBy === 'resolution_time' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedConversations.map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{conversation.customer_name}</div>
                          <div className="text-sm text-gray-500">{conversation.customer_phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(conversation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversation.assigned_agent_name || 'Não atribuído'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSourceIcon(conversation.source)}
                        <span className="ml-1.5 text-sm text-gray-900">
                          {conversation.source.charAt(0).toUpperCase() + conversation.source.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(conversation.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(conversation.updated_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversation.message_count || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDuration(conversation.resolution_time)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredAndSortedConversations.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterSource !== 'all' || filterPriority !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Não há conversas no período selecionado'
              }
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas Detalhadas */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Fonte */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Fonte</h3>
            <div className="space-y-4">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      {getSourceIcon(source)}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{count} ({Math.round((count / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        source === 'whatsapp' ? 'bg-green-500' :
                        source === 'telegram' ? 'bg-blue-500' :
                        source === 'webchat' ? 'bg-purple-500' :
                        'bg-pink-500'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Prioridade */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Prioridade</h3>
            <div className="space-y-4">
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {priority === 'urgent' ? 'Urgente' :
                       priority === 'high' ? 'Alta' :
                       priority === 'medium' ? 'Média' :
                       'Baixa'}
                    </span>
                    <span className="text-sm text-gray-500">{count} ({Math.round((count / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'urgent' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas por Agente */}
      {stats && Object.keys(stats.byAgent).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Agente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversas Atendidas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo Médio de Resolução
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % do Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.byAgent).map(([agent, data]) => (
                  <tr key={agent} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{data.count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDuration(data.avgResolutionTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round((data.count / stats.total) * 100)}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribuição por Tag */}
      {stats && Object.keys(stats.byTag).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags Mais Utilizadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byTag)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 9)
              .map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{tag}</span>
                  </div>
                  <span className="text-sm text-gray-500">{count} conversas</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsReport;