import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  Clock, 
  Target, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  UserCheck,
  MessageCircle,
  Timer,
  Award,
  Filter,
  Search,
  MoreVertical,
  ArrowRight,
  Star,
  Shield,
  Brain,
  Sparkles,
  Gauge,
  Bell,
  Eye,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  Hash,
  Layers,
  GitBranch,
  Shuffle,
  FastForward,
  SkipForward,
  ArrowRightLeft,
  Bot,
  Cpu,
  Network,
  Send,
  UserPlus,
  X,
  Plus,
  Edit,
  Trash2,
  Sliders,
  Flame,
  Lightbulb,
  Radar,
  Crosshair,
  Workflow,
  Magnet,
  Layers3,
  ScanLine,
  Zap as ZapIcon,
  Wand2,
  MousePointer2,
  Loader2
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
  metadata: Record<string, any>;
  createdAt: Date;
  transferHistory?: TransferRecord[];
  aiInsights?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'low' | 'medium' | 'high';
    suggestedAgent?: string;
    estimatedDuration: number;
    keywords: string[];
    customerIntent: string;
    riskScore: number;
  };
}

interface TransferRecord {
  id: string;
  fromAgent: string;
  toAgent: string;
  reason: string;
  timestamp: Date;
  notes?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  department: string;
  specialties: string[];
  currentLoad: number;
  maxLoad: number;
  avgResponseTime: number;
  satisfactionScore: number;
  efficiency: number;
  languages: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  skills: {
    [key: string]: number;
  };
  tags: string[];
}

interface SmartFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  count: number;
  color: string;
  description: string;
  condition: (item: QueueItem) => boolean;
  priority: number;
}

interface RealTimeMetrics {
  totalInQueue: number;
  avgWaitTime: number;
  criticalItems: number;
  agentsAvailable: number;
  throughputPerHour: number;
  satisfactionTrend: number;
  escalationRate: number;
  aiAccuracy: number;
}

const QueueManagement: React.FC = () => {
  const { user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // segundos
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissões
  if (!hasPermission('manage_users')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-500">
          Você não tem permissão para acessar a fila de atendimento.
        </p>
      </div>
    );
  }

  // Carregar dados da fila e agentes ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadQueueData();
      loadAgents();
    }
  }, [user?.companyId]);

  // Auto-refresh em tempo real
  useEffect(() => {
    if (!autoRefresh || !realTimeMode) return;

    const interval = setInterval(() => {
      if (user?.companyId) {
        loadQueueData();
        loadAgents();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, realTimeMode, refreshInterval, user?.companyId]);

  // Carregar dados da fila da API
  const loadQueueData = async () => {
    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Aqui seria a chamada real para a API
      // const response = await api.getQueueItems(user.companyId);
      
      // Simulação de dados para demonstração
      // Em produção, estes dados viriam da API
      setTimeout(() => {
        setQueueItems([
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
            metadata: { lastPurchase: '2024-10-15', totalSpent: 15000 },
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
            aiInsights: {
              sentiment: 'positive',
              complexity: 'medium',
              suggestedAgent: 'Maria Santos',
              estimatedDuration: 12,
              keywords: ['produto premium', 'compra', 'urgente'],
              customerIntent: 'purchase_intent',
              riskScore: 15
            }
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
            metadata: { accountType: 'premium', issueType: 'login' },
            createdAt: new Date(Date.now() - 8 * 60 * 1000),
            aiInsights: {
              sentiment: 'negative',
              complexity: 'high',
              suggestedAgent: 'Carlos Lima',
              estimatedDuration: 18,
              keywords: ['login', 'acesso', 'problema'],
              customerIntent: 'support_request',
              riskScore: 75
            }
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
            metadata: { leadSource: 'google-ads', interest: 'plano-basico' },
            createdAt: new Date(Date.now() - 22 * 60 * 1000),
            aiInsights: {
              sentiment: 'neutral',
              complexity: 'low',
              suggestedAgent: 'João Silva',
              estimatedDuration: 8,
              keywords: ['planos', 'informações', 'preço'],
              customerIntent: 'information_seeking',
              riskScore: 25
            }
          }
        ]);
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
    if (!user?.companyId) return;
    
    try {
      // Aqui seria a chamada real para a API
      // const response = await api.getAgents(user.companyId);
      
      // Simulação de dados para demonstração
      // Em produção, estes dados viriam da API
      setTimeout(() => {
        setAgents([
          {
            id: 'agent-1',
            name: 'Carlos Lima',
            email: 'carlos@empresa.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            status: 'online',
            department: 'suporte',
            specialties: ['problema-tecnico', 'configuracao'],
            currentLoad: 3,
            maxLoad: 5,
            avgResponseTime: 95,
            satisfactionScore: 4.7,
            efficiency: 92,
            languages: ['pt-BR', 'en'],
            workingHours: { start: '08:00', end: '18:00', timezone: 'America/Sao_Paulo' },
            skills: { 'problema-tecnico': 95, 'configuracao': 88, 'vendas': 45 },
            tags: ['senior', 'tecnico', 'especialista']
          },
          {
            id: 'agent-2',
            name: 'Maria Santos',
            email: 'maria@empresa.com',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            status: 'busy',
            department: 'vendas',
            specialties: ['produto-premium', 'consultoria'],
            currentLoad: 5,
            maxLoad: 5,
            avgResponseTime: 78,
            satisfactionScore: 4.9,
            efficiency: 96,
            languages: ['pt-BR', 'en', 'es'],
            workingHours: { start: '09:00', end: '19:00', timezone: 'America/Sao_Paulo' },
            skills: { 'vendas': 98, 'produto-premium': 95, 'consultoria': 90 },
            tags: ['senior', 'vendas', 'consultora']
          },
          {
            id: 'agent-3',
            name: 'Ana Costa',
            email: 'ana@empresa.com',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            status: 'online',
            department: 'financeiro',
            specialties: ['cobranca', 'pagamentos'],
            currentLoad: 2,
            maxLoad: 4,
            avgResponseTime: 112,
            satisfactionScore: 4.5,
            efficiency: 89,
            languages: ['pt-BR'],
            workingHours: { start: '08:00', end: '17:00', timezone: 'America/Sao_Paulo' },
            skills: { 'cobranca': 92, 'pagamentos': 88, 'financeiro': 85 },
            tags: ['pleno', 'financeiro', 'cobranca']
          }
        ]);
      }, 500);
      
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
    }
  };

  // Filtros Inteligentes Dinâmicos
  const smartFilters: SmartFilter[] = useMemo(() => [
    {
      id: 'critical',
      name: 'Críticos',
      icon: <Flame className="h-4 w-4" />,
      active: selectedFilters.includes('critical'),
      count: queueItems.filter(item => item.urgencyScore >= 80 || item.priority === 'urgent').length,
      color: 'bg-red-500',
      description: 'Conversas que precisam de atenção imediata',
      condition: (item) => item.urgencyScore >= 80 || item.priority === 'urgent',
      priority: 1
    },
    {
      id: 'vip',
      name: 'VIP',
      icon: <Star className="h-4 w-4" />,
      active: selectedFilters.includes('vip'),
      count: queueItems.filter(item => item.customerValue === 'platinum' || item.customerValue === 'gold').length,
      color: 'bg-yellow-500',
      description: 'Clientes VIP e Gold',
      condition: (item) => item.customerValue === 'platinum' || item.customerValue === 'gold',
      priority: 2
    },
    {
      id: 'ai-risk',
      name: 'Alto Risco',
      icon: <AlertTriangle className="h-4 w-4" />,
      active: selectedFilters.includes('ai-risk'),
      count: queueItems.filter(item => (item.aiInsights?.riskScore || 0) >= 70).length,
      color: 'bg-orange-500',
      description: 'IA detectou alto risco de insatisfação',
      condition: (item) => (item.aiInsights?.riskScore || 0) >= 70,
      priority: 3
    },
    {
      id: 'hot-leads',
      name: 'Hot Leads',
      icon: <Crosshair className="h-4 w-4" />,
      active: selectedFilters.includes('hot-leads'),
      count: queueItems.filter(item => item.aiInsights?.customerIntent === 'purchase_intent').length,
      color: 'bg-green-500',
      description: 'Clientes com alta intenção de compra',
      condition: (item) => item.aiInsights?.customerIntent === 'purchase_intent',
      priority: 4
    },
    {
      id: 'waiting-long',
      name: 'Espera Longa',
      icon: <Clock className="h-4 w-4" />,
      active: selectedFilters.includes('waiting-long'),
      count: queueItems.filter(item => item.waitTime > 20).length,
      color: 'bg-purple-500',
      description: 'Aguardando há mais de 20 minutos',
      condition: (item) => item.waitTime > 20,
      priority: 5
    },
    {
      id: 'negative-sentiment',
      name: 'Sentimento Negativo',
      icon: <TrendingDown className="h-4 w-4" />,
      active: selectedFilters.includes('negative-sentiment'),
      count: queueItems.filter(item => item.aiInsights?.sentiment === 'negative').length,
      color: 'bg-red-400',
      description: 'IA detectou sentimento negativo',
      condition: (item) => item.aiInsights?.sentiment === 'negative',
      priority: 6
    },
    {
      id: 'first-time',
      name: 'Primeira Vez',
      icon: <UserPlus className="h-4 w-4" />,
      active: selectedFilters.includes('first-time'),
      count: queueItems.filter(item => item.tags.includes('primeira-vez') || item.tags.includes('novo-cliente')).length,
      color: 'bg-blue-500',
      description: 'Novos clientes - primeira interação',
      condition: (item) => item.tags.includes('primeira-vez') || item.tags.includes('novo-cliente'),
      priority: 7
    },
    {
      id: 'escalated',
      name: 'Escalados',
      icon: <ArrowRight className="h-4 w-4" />,
      active: selectedFilters.includes('escalated'),
      count: queueItems.filter(item => item.status === 'escalated').length,
      color: 'bg-indigo-500',
      description: 'Conversas escaladas para supervisão',
      condition: (item) => item.status === 'escalated',
      priority: 8
    }
  ], [queueItems, selectedFilters]);

  // Métricas em Tempo Real
  const realTimeMetrics: RealTimeMetrics = useMemo(() => ({
    totalInQueue: queueItems.filter(item => item.status === 'waiting').length,
    avgWaitTime: Math.round(queueItems.reduce((sum, item) => sum + item.waitTime, 0) / queueItems.length) || 0,
    criticalItems: queueItems.filter(item => item.urgencyScore >= 80).length,
    agentsAvailable: agents.filter(agent => agent.status === 'online' && agent.currentLoad < agent.maxLoad).length,
    throughputPerHour: 45, // Simulado
    satisfactionTrend: 4.6,
    escalationRate: 12,
    aiAccuracy: 87
  }), [queueItems, agents]);

  // Filtrar itens baseado nos filtros selecionados
  const filteredItems = useMemo(() => {
    let items = queueItems;

    // Aplicar busca por texto
    if (searchTerm) {
      items = items.filter(item =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm) ||
        item.conversationPreview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aplicar filtros inteligentes
    if (selectedFilters.length > 0) {
      items = items.filter(item => {
        return selectedFilters.some(filterId => {
          const filter = smartFilters.find(f => f.id === filterId);
          return filter ? filter.condition(item) : false;
        });
      });
    }

    // Ordenar por prioridade inteligente
    return items.sort((a, b) => {
      // Primeiro por urgência
      if (a.urgencyScore !== b.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      // Depois por tempo de espera
      if (a.waitTime !== b.waitTime) {
        return b.waitTime - a.waitTime;
      }
      // Por último por valor do cliente
      const valueOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
      return valueOrder[b.customerValue] - valueOrder[a.customerValue];
    });
  }, [queueItems, searchTerm, selectedFilters, smartFilters]);

  // Função para toggle de filtros
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
  };

  const renderSmartFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Radar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros Inteligentes</h3>
          <div className="flex items-center space-x-2">
            {realTimeMode && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">TEMPO REAL</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              realTimeMode 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {realTimeMode ? 'Tempo Real ON' : 'Tempo Real OFF'}
          </button>
          
          {selectedFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
            >
              Limpar ({selectedFilters.length})
            </button>
          )}
        </div>
      </div>

      {/* Busca Inteligente */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Busca inteligente: nome, telefone, tags, sentimentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtros Dinâmicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {smartFilters
          .sort((a, b) => a.priority - b.priority)
          .map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`relative flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                filter.active
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              title={filter.description}
            >
              <div className={`p-1 rounded ${filter.color} text-white`}>
                {filter.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">{filter.name}</div>
                <div className="text-xs text-gray-500">{filter.count} itens</div>
              </div>
              
              {filter.count > 0 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${filter.color} text-white text-xs rounded-full flex items-center justify-center font-bold`}>
                  {filter.count}
                </div>
              )}
              
              {filter.active && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"></div>
              )}
            </button>
          ))}
      </div>

      {/* Métricas Rápidas */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-900">{realTimeMetrics.totalInQueue}</div>
          <div className="text-xs text-blue-700">Na Fila</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-900">{realTimeMetrics.avgWaitTime}min</div>
          <div className="text-xs text-green-700">Tempo Médio</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-900">{realTimeMetrics.criticalItems}</div>
          <div className="text-xs text-red-700">Críticos</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-900">{realTimeMetrics.agentsAvailable}</div>
          <div className="text-xs text-purple-700">Agentes Livres</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-yellow-900">{realTimeMetrics.throughputPerHour}</div>
          <div className="text-xs text-yellow-700">Por Hora</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-indigo-900">{realTimeMetrics.satisfactionTrend}</div>
          <div className="text-xs text-indigo-700">Satisfação</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-orange-900">{realTimeMetrics.escalationRate}%</div>
          <div className="text-xs text-orange-700">Escalação</div>
        </div>
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-3 rounded-lg">
          <div className="text-lg font-bold text-teal-900">{realTimeMetrics.aiAccuracy}%</div>
          <div className="text-xs text-teal-700">IA Precisão</div>
        </div>
      </div>
    </div>
  );

  const renderQueueItem = (item: QueueItem) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-gray-500';
      }
    };

    const getCustomerValueBadge = (value: string) => {
      const colors = {
        platinum: 'bg-purple-100 text-purple-800',
        gold: 'bg-yellow-100 text-yellow-800',
        silver: 'bg-gray-100 text-gray-800',
        bronze: 'bg-orange-100 text-orange-800'
      };

      const icons = {
        platinum: '💎',
        gold: '🥇',
        silver: '🥈',
        bronze: '🥉'
      };

      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
          {icons[value as keyof typeof icons]} {value.toUpperCase()}
        </span>
      );
    };

    const getSentimentIcon = (sentiment?: string) => {
      switch (sentiment) {
        case 'positive': return <span className="text-green-500">😊</span>;
        case 'negative': return <span className="text-red-500">😠</span>;
        case 'neutral': return <span className="text-gray-500">😐</span>;
        default: return <span className="text-gray-400">❓</span>;
      }
    };

    return (
      <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar e Info do Cliente */}
            <div className="relative">
              {item.customerAvatar ? (
                <img
                  src={item.customerAvatar}
                  alt={item.customerName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getPriorityColor(item.priority)}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900">{item.customerName}</h4>
                {getCustomerValueBadge(item.customerValue)}
                <div className="flex items-center space-x-1">
                  {getSentimentIcon(item.aiInsights?.sentiment)}
                  <span className="text-xs text-gray-500">
                    {item.aiInsights?.sentiment}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                <span className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{item.customerPhone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Layers className="h-3 w-3" />
                  <span>{item.department}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {item.waitTime}min aguardando
                    {item.aiPredictedWaitTime && (
                      <span className="text-blue-600 ml-1">
                        (IA: {item.aiPredictedWaitTime}min)
                      </span>
                    )}
                  </span>
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{item.conversationPreview}</p>
              
              {/* Tags Inteligentes */}
              <div className="flex items-center space-x-2 mb-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <Hash className="h-2 w-2 mr-1" />
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{item.tags.length - 3} mais</span>
                )}
              </div>

              {/* Insights da IA */}
              {item.aiInsights && (
                <div className="bg-purple-50 rounded-lg p-2 mt-2">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-800">
                        Intenção: {item.aiInsights.customerIntent}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-800">
                        Risco: {item.aiInsights.riskScore}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Timer className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-800">
                        Duração estimada: {item.aiInsights.estimatedDuration}min
                      </span>
                    </div>
                  </div>
                  {item.aiInsights.keywords.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs text-purple-700">
                        Palavras-chave: {item.aiInsights.keywords.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Score de Urgência */}
            <div className="text-center">
              <div className={`text-lg font-bold ${
                item.urgencyScore >= 80 ? 'text-red-600' :
                item.urgencyScore >= 60 ? 'text-orange-600' :
                item.urgencyScore >= 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {item.urgencyScore}
              </div>
              <div className="text-xs text-gray-500">Urgência</div>
            </div>
            
            {/* Agente Sugerido pela IA */}
            {item.aiInsights?.suggestedAgent && (
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600">
                  {item.aiInsights.suggestedAgent}
                </div>
                <div className="text-xs text-gray-500">IA Sugere</div>
              </div>
            )}
            
            {/* Ações */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Visualizar">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Atribuir">
                <UserCheck className="h-4 w-4" />
              </button>
              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Transferir">
                <ArrowRightLeft className="h-4 w-4" />
              </button>
              <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Priorizar">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Radar className="h-8 w-8 text-primary-600" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-bold text-gray-900">Fila Inteligente com IA</h1>
        </div>
        <p className="text-gray-600">
          Sistema avançado de distribuição com filtros dinâmicos e insights em tempo real
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>IA Ativa</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Filtros Inteligentes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Predição em Tempo Real</span>
          </div>
        </div>
      </div>

      {/* Filtros Inteligentes */}
      {renderSmartFilters()}

      {/* Lista da Fila */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Fila de Atendimento 
              {filteredItems.length !== queueItems.length && (
                <span className="ml-2 text-blue-600">
                  ({filteredItems.length} de {queueItems.length})
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                <Wand2 className="h-3 w-3" />
                <span>Auto-Distribuir</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                <Zap className="h-3 w-3" />
                <span>Otimizar IA</span>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map(renderQueueItem)}
          </div>
        )}
        
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Radar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFilters.length > 0 || searchTerm ? 'Nenhum item encontrado' : 'Fila vazia'}
            </h3>
            <p className="text-gray-500">
              {selectedFilters.length > 0 || searchTerm
                ? 'Tente ajustar os filtros ou busca'
                : 'Não há clientes aguardando atendimento no momento'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;