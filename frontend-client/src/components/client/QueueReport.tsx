import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowUpDown,
  FileSpreadsheet,
  Printer,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  BarChart3,
  Gauge,
  UserCheck,
  MessageCircle,
  Calendar
} from 'lucide-react';
import api from '../../lib/api';

interface QueueItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAvatar?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  category: string;
  source: 'whatsapp' | 'webchat' | 'telegram' | 'phone' | 'email';
  waitTime: number;
  estimatedWaitTime: number;
  aiPredictedWaitTime?: number;
  assignedAgent?: string;
  status: 'waiting' | 'assigned' | 'in_progress' | 'escalated' | 'transferred';
  tags: string[];
  customerValue: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastInteraction?: Date;
  urgencyScore: number;
  satisfactionHistory: number;
  conversationPreview: string;
  createdAt: Date;
}

interface Agent {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentLoad: number;
  maxLoad: number;
  avgResponseTime: number;
  satisfactionScore: number;
  efficiency: number;
}

interface QueueStats {
  totalInQueue: number;
  avgWaitTime: number;
  criticalItems: number;
  agentsAvailable: number;
  throughputPerHour: number;
  satisfactionTrend: number;
  escalationRate: number;
  aiAccuracy: number;
}

const QueueReport: React.FC = () => {
  const { user } = useAuthStore();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<QueueItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalInQueue: 0,
    avgWaitTime: 0,
    criticalItems: 0,
    agentsAvailable: 0,
    throughputPerHour: 0,
    satisfactionTrend: 0,
    escalationRate: 0,
    aiAccuracy: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'waitTime' | 'customerValue'>('urgency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');

  // Carregar dados da fila ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadQueueData();
      loadAgents();
    }
  }, [user?.companyId, dateRange]);

  // Filtrar itens quando os filtros mudarem
  useEffect(() => {
    filterQueueItems();
  }, [queueItems, searchTerm, filterPriority, filterStatus, sortBy, sortOrder]);

  // Carregar dados da fila da API
  const loadQueueData = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de dados da fila desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Aqui seria a chamada real para a API
      // const response = await api.getQueueItems(user.companyId, dateRange);
      
      // Simulação de dados para demonstração
      setTimeout(() => {
        const mockQueueItems: QueueItem[] = [
          {
            id: '1',
            customerName: 'Maria Silva',
            customerPhone: '+55 11 99999-1234',
            customerEmail: 'maria@email.com',
            customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            priority: 'urgent',
            department: 'vendas',
            category: 'produto-premium',
            source: 'whatsapp',
            waitTime: 15,
            estimatedWaitTime: 3,
            aiPredictedWaitTime: 2,
            status: 'waiting',
            tags: ['vip', 'produto-premium', 'urgente', 'hot-lead'],
            customerValue: 'platinum',
            urgencyScore: 95,
            satisfactionHistory: 4.8,
            conversationPreview: 'Preciso de informações sobre o produto premium que vi no site...',
            createdAt: new Date(Date.now() - 15 * 60 * 1000)
          },
          {
            id: '2',
            customerName: 'João Santos',
            customerPhone: '+55 11 98888-5678',
            priority: 'high',
            department: 'suporte',
            category: 'problema-tecnico',
            source: 'webchat',
            waitTime: 8,
            estimatedWaitTime: 5,
            aiPredictedWaitTime: 4,
            assignedAgent: 'Carlos Lima',
            status: 'assigned',
            tags: ['problema-tecnico', 'cliente-recorrente', 'escalado'],
            customerValue: 'gold',
            urgencyScore: 78,
            satisfactionHistory: 4.2,
            conversationPreview: 'Estou com dificuldades para acessar minha conta...',
            createdAt: new Date(Date.now() - 8 * 60 * 1000)
          },
          {
            id: '3',
            customerName: 'Ana Costa',
            customerPhone: '+55 11 97777-9012',
            priority: 'medium',
            department: 'vendas',
            category: 'informacoes-gerais',
            source: 'whatsapp',
            waitTime: 22,
            estimatedWaitTime: 8,
            aiPredictedWaitTime: 6,
            status: 'waiting',
            tags: ['novo-cliente', 'interessado', 'lead-qualificado'],
            customerValue: 'bronze',
            urgencyScore: 45,
            satisfactionHistory: 0,
            conversationPreview: 'Gostaria de saber mais sobre os planos disponíveis...',
            createdAt: new Date(Date.now() - 22 * 60 * 1000)
          }
        ];
        
        setQueueItems(mockQueueItems);
        
        // Estatísticas da fila
        setQueueStats({
          totalInQueue: mockQueueItems.length,
          avgWaitTime: Math.round(mockQueueItems.reduce((sum, item) => sum + item.waitTime, 0) / mockQueueItems.length),
          criticalItems: mockQueueItems.filter(item => item.urgencyScore >= 80).length,
          agentsAvailable: 3,
          throughputPerHour: 45,
          satisfactionTrend: 4.6,
          escalationRate: 12,
          aiAccuracy: 87
        });
        
        setIsLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Erro ao carregar dados da fila:', err);
      setError('Não foi possível carregar os dados da fila. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  // Carregar agentes da API
  const loadAgents = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de agentes desabilitado em desenvolvimento');
      return;
    }

    if (!user?.companyId) return;
    
    try {
      // Aqui seria a chamada real para a API
      // const response = await api.getAgents(user.companyId);
      
      // Simulação de dados para demonstração
      setTimeout(() => {
        setAgents([
          {
            id: 'agent-1',
            name: 'Carlos Lima',
            status: 'online',
            currentLoad: 3,
            maxLoad: 5,
            avgResponseTime: 95,
            satisfactionScore: 4.7,
            efficiency: 92
          },
          {
            id: 'agent-2',
            name: 'Maria Santos',
            status: 'busy',
            currentLoad: 5,
            maxLoad: 5,
            avgResponseTime: 78,
            satisfactionScore: 4.9,
            efficiency: 96
          },
          {
            id: 'agent-3',
            name: 'Ana Costa',
            status: 'online',
            currentLoad: 2,
            maxLoad: 4,
            avgResponseTime: 112,
            satisfactionScore: 4.5,
            efficiency: 89
          }
        ]);
      }, 500);
      
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
    }
  };

  // Filtrar e ordenar itens da fila
  const filterQueueItems = () => {
    let filtered = [...queueItems];
    
    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm) ||
        (item.customerEmail && item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.conversationPreview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar filtro de prioridade
    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }
    
    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'urgency':
          comparison = a.urgencyScore - b.urgencyScore;
          break;
        case 'waitTime':
          comparison = a.waitTime - b.waitTime;
          break;
        case 'customerValue':
          const valueOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
          comparison = (valueOrder[a.customerValue] || 0) - (valueOrder[b.customerValue] || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredItems(filtered);
  };

  // Alternar ordem de classificação
  const toggleSort = (field: 'urgency' | 'waitTime' | 'customerValue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Formatar tempo de espera
  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    }
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Cliente', 'Telefone', 'Email', 'Prioridade', 'Departamento', 'Categoria', 'Fonte', 'Tempo de Espera', 'Status', 'Tags', 'Valor do Cliente', 'Urgência', 'Criado em'];
    const csvRows = [headers];
    
    filteredItems.forEach(item => {
      csvRows.push([
        item.customerName,
        item.customerPhone,
        item.customerEmail || '',
        item.priority,
        item.department,
        item.category,
        item.source,
        formatWaitTime(item.waitTime),
        item.status,
        item.tags.join('; '),
        item.customerValue,
        item.urgencyScore.toString(),
        item.createdAt.toLocaleString('pt-BR')
      ]);
    });
    
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fila_atendimento_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir relatório
  const printReport = () => {
    window.print();
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter nome do status
  const getStatusName = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'assigned': return 'Atribuído';
      case 'in_progress': return 'Em Progresso';
      case 'escalated': return 'Escalado';
      case 'transferred': return 'Transferido';
      default: return status;
    }
  };

  // Obter nome da prioridade
  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  // Obter cor do valor do cliente
  const getCustomerValueColor = (value: string) => {
    switch (value) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor da urgência
  const getUrgencyColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório da Fila de Atendimento</h2>
            <p className="text-sm text-gray-600">
              {filteredItems.length} itens encontrados
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
          </select>
          
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          
          <button
            onClick={loadQueueData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Atualizar"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-32 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={exportToCSV}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </button>
                <button
                  onClick={printReport}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-900">{queueStats.totalInQueue}</div>
          <div className="text-xs text-blue-700">Na Fila</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-900">{queueStats.avgWaitTime}min</div>
          <div className="text-xs text-green-700">Tempo Médio</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-900">{queueStats.criticalItems}</div>
          <div className="text-xs text-red-700">Críticos</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-900">{queueStats.agentsAvailable}</div>
          <div className="text-xs text-purple-700">Agentes Livres</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-yellow-900">{queueStats.throughputPerHour}</div>
          <div className="text-xs text-yellow-700">Por Hora</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-indigo-900">{queueStats.satisfactionTrend}</div>
          <div className="text-xs text-indigo-700">Satisfação</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-orange-900">{queueStats.escalationRate}%</div>
          <div className="text-xs text-orange-700">Escalação</div>
        </div>
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-teal-900">{queueStats.aiAccuracy}%</div>
          <div className="text-xs text-teal-700">IA Precisão</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Prioridade */}
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

          {/* Filtro de Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="waiting">Aguardando</option>
            <option value="assigned">Atribuído</option>
            <option value="in_progress">Em Progresso</option>
            <option value="escalated">Escalado</option>
            <option value="transferred">Transferido</option>
          </select>
        </div>
      </div>

      {/* Tabela da Fila */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('waitTime')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tempo de Espera</span>
                      {sortBy === 'waitTime' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('urgency')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Urgência</span>
                      {sortBy === 'urgency' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('customerValue')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Valor do Cliente</span>
                      {sortBy === 'customerValue' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {item.customerAvatar ? (
                            <img
                              src={item.customerAvatar}
                              alt={item.customerName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                          <div className="text-sm text-gray-500">{item.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.department}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {getPriorityName(item.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusName(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatWaitTime(item.waitTime)}</span>
                      </div>
                      {item.aiPredictedWaitTime && (
                        <div className="text-xs text-blue-600">
                          IA: {formatWaitTime(item.aiPredictedWaitTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getUrgencyColor(item.urgencyScore)}`}>
                        {item.urgencyScore}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.urgencyScore >= 80 ? 'Crítica' : 
                         item.urgencyScore >= 60 ? 'Alta' : 
                         item.urgencyScore >= 40 ? 'Média' : 'Baixa'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerValueColor(item.customerValue)}`}>
                        {item.customerValue.toUpperCase()}
                      </span>
                      {item.satisfactionHistory > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Satisfação: {item.satisfactionHistory.toFixed(1)}/5
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{item.source}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item na fila encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || filterPriority !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'A fila de atendimento está vazia no momento'
              }
            </p>
          </div>
        )}
      </div>

      {/* Resumo dos Agentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Agentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo de Resposta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eficiência
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      agent.status === 'online' ? 'bg-green-100 text-green-800' :
                      agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      agent.status === 'away' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status === 'online' ? 'Online' :
                       agent.status === 'busy' ? 'Ocupado' :
                       agent.status === 'away' ? 'Ausente' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (agent.currentLoad / agent.maxLoad) > 0.8 ? 'bg-red-500' :
                            (agent.currentLoad / agent.maxLoad) > 0.5 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(agent.currentLoad / agent.maxLoad) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {agent.currentLoad}/{agent.maxLoad}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.avgResponseTime}s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.satisfactionScore.toFixed(1)}/5</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            agent.efficiency > 90 ? 'bg-green-500' :
                            agent.efficiency > 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${agent.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {agent.efficiency}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo por Prioridade e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Prioridade</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Urgente</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.priority === 'urgent').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-sm text-gray-600">Alta</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.priority === 'high').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Média</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.priority === 'medium').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Baixa</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.priority === 'low').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Aguardando</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.status === 'waiting').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-600">Atribuído</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.status === 'assigned').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Em Progresso</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.status === 'in_progress').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">Escalado</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.status === 'escalated').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-sm text-gray-600">Transferido</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {queueItems.filter(item => item.status === 'transferred').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueReport;