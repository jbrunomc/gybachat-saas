import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Filter,
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Star,
  Clock,
  CheckCircle2,
  Check,
  User,
  Bot,
  AlertTriangle,
  Zap,
  Users,
  ArrowLeft,
  Image,
  File,
  Mic,
  X,
  Download,
  Eye,
  Tag,
  Plus,
  Hash,
  Edit,
  Trash2,
  Save,
  Palette,
  Flame,
  TrendingUp,
  TrendingDown,
  Target,
  Crown,
  Shield,
  Brain,
  Sparkles,
  Radar,
  Activity,
  RefreshCw,
  ScanLine,
  Crosshair,
  MousePointer2,
  Lightbulb,
  Gauge,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface Message {
  id: string;
  conversation_id: string;
  company_id: string;
  content: string;
  timestamp: Date;
  sender: 'customer' | 'agent' | 'bot';
  sender_name: string;
  sender_id?: string;
  status: 'sent' | 'delivered' | 'read';
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_avatar_url?: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  status: 'active' | 'waiting' | 'closed' | 'transferred' | 'bot';
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  source: 'whatsapp' | 'telegram' | 'webchat' | 'instagram' | 'facebook';
  created_at: Date;
  updated_at: Date;
  customer_metadata?: Record<string, any>;
  internal_notes?: string;
  aiInsights?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: number;
    customerValue: 'bronze' | 'silver' | 'gold' | 'platinum';
    predictedResolution: number;
    riskScore: number;
    intent: string;
    keywords: string[];
  };
}

interface SmartFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  description: string;
  condition: (conv: Conversation) => boolean;
  priority: number;
}

interface TagTemplate {
  id: string;
  name: string;
  color: string;
  category: 'status' | 'priority' | 'department' | 'custom';
  description?: string;
  isDefault: boolean;
}

const ConversationsModule: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState('#3B82F6');
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tagTemplates, setTagTemplates] = useState<TagTemplate[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cores disponíveis para tags
  const tagColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#C084FC', '#E879F9', '#F472B6', '#FB7185'
  ];

  // Carregar conversas ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadConversations();
      loadTags();
    }
  }, [user?.companyId]);

  // Carregar mensagens quando uma conversa é selecionada
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Rolar para o final das mensagens
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh em tempo real
  useEffect(() => {
    if (!autoRefresh || !realTimeMode) return;

    const interval = setInterval(() => {
      if (user?.companyId) {
        loadConversations();
        if (selectedConversation) {
          loadMessages(selectedConversation);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, realTimeMode, user?.companyId, selectedConversation]);

  // Carregar conversas da API
  const loadConversations = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de conversas desabilitado em desenvolvimento');
      setIsLoadingConversations(false);
      return;
    }

    if (!user?.companyId) return;
    
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      const response = await api.getConversations(user.companyId);
      
      if (response.success && response.data) {
        // Converter datas de string para Date
        const formattedConversations = response.data.map((conv: any) => ({
          ...conv,
          last_message_time: new Date(conv.last_message_time),
          created_at: new Date(conv.created_at),
          updated_at: new Date(conv.updated_at)
        }));
        
        setConversations(formattedConversations);
      }
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      setError('Não foi possível carregar as conversas. Tente novamente mais tarde.');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Carregar mensagens da API
  const loadMessages = async (conversationId: string) => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de mensagens desabilitado em desenvolvimento');
      setIsLoadingMessages(false);
      return;
    }

    if (!user?.companyId) return;
    
    try {
      setIsLoadingMessages(true);
      
      const response = await api.getMessages(user.companyId, conversationId);
      
      if (response.success && response.data) {
        // Converter datas de string para Date
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
        
        // Marcar conversa como lida
        await api.updateConversation(user.companyId, conversationId, {
          unread_count: 0
        });
        
        // Atualizar lista de conversas para refletir a mudança
        loadConversations();
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Carregar tags da API
  const loadTags = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de tags desabilitado em desenvolvimento');
      return;
    }

    if (!user?.companyId) return;
    
    try {
      const response = await api.getTags(user.companyId);
      
      if (response.success && response.data) {
        setTagTemplates(response.data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          category: tag.category,
          description: tag.description,
          isDefault: tag.is_default
        })));
      }
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enviar mensagem
  const sendMessage = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Envio de mensagem desabilitado em desenvolvimento');
      setMessageInput('');
      return;
    }

    if (!messageInput.trim() || !selectedConversation || !user?.companyId) return;
    
    try {
      setIsLoading(true);
      
      const messageData = {
        content: messageInput,
        message_type: 'text',
        sender_name: user.name
      };
      
      const response = await api.sendMessage(user.companyId, selectedConversation, messageData);
      
      if (response.success) {
        setMessageInput('');
        loadMessages(selectedConversation);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para toggle de filtros
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Função para limpar filtros
  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
  };

  // Função para adicionar tag a uma conversa
  const addTagToConversation = async (conversationId: string, tagName: string) => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Adição de tag desabilitada em desenvolvimento');
      return;
    }

    if (!user?.companyId) return;
    
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const updatedTags = [...conversation.tags];
      if (!updatedTags.includes(tagName)) {
        updatedTags.push(tagName);
      }
      
      await api.updateConversation(user.companyId, conversationId, {
        tags: updatedTags
      });
      
      // Atualizar lista de conversas
      loadConversations();
    } catch (err) {
      console.error('Erro ao adicionar tag:', err);
    }
  };

  // Função para remover tag de uma conversa
  const removeTagFromConversation = async (conversationId: string, tagName: string) => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Remoção de tag desabilitada em desenvolvimento');
      return;
    }

    if (!user?.companyId) return;
    
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const updatedTags = conversation.tags.filter(tag => tag !== tagName);
      
      await api.updateConversation(user.companyId, conversationId, {
        tags: updatedTags
      });
      
      // Atualizar lista de conversas
      loadConversations();
    } catch (err) {
      console.error('Erro ao remover tag:', err);
    }
  };

  // Função para criar nova tag
  const createNewTag = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Criação de tag desabilitada em desenvolvimento');
      setNewTag('');
      setSelectedTagColor('#3B82F6');
      return;
    }

    if (!newTag.trim() || !user?.companyId) return;
    
    try {
      const tagData = {
        name: newTag.toLowerCase().replace(/\s+/g, '-'),
        color: selectedTagColor,
        category: 'custom',
        description: `Tag personalizada: ${newTag}`,
        is_default: false,
        keywords: newTag.split(' ').filter(word => word.length > 2)
      };
      
      const response = await api.createTag(user.companyId, tagData);
      
      if (response.success) {
        setNewTag('');
        setSelectedTagColor('#3B82F6');
        loadTags();
      }
    } catch (err) {
      console.error('Erro ao criar tag:', err);
    }
  };

  // Função para obter cor da tag
  const getTagColor = (tagName: string) => {
    const template = tagTemplates.find(t => t.name === tagName);
    return template?.color || '#6B7280';
  };

  // Filtros Inteligentes Dinâmicos
  const smartFilters: SmartFilter[] = React.useMemo(() => [
    {
      id: 'critical',
      name: 'Críticas',
      icon: <Flame className="h-4 w-4" />,
      count: conversations.filter(conv => conv.priority === 'urgent').length,
      color: 'bg-red-500',
      description: 'Conversas que precisam de atenção imediata',
      condition: (conv) => conv.priority === 'urgent',
      priority: 1
    },
    {
      id: 'hot-leads',
      name: 'Hot Leads',
      icon: <Crosshair className="h-4 w-4" />,
      count: conversations.filter(conv => conv.tags.includes('hot-lead')).length,
      color: 'bg-green-500',
      description: 'Clientes com alta intenção de compra',
      condition: (conv) => conv.tags.includes('hot-lead'),
      priority: 2
    },
    {
      id: 'vip-customers',
      name: 'VIP',
      icon: <Crown className="h-4 w-4" />,
      count: conversations.filter(conv => conv.tags.includes('vip')).length,
      color: 'bg-purple-500',
      description: 'Clientes VIP',
      condition: (conv) => conv.tags.includes('vip'),
      priority: 3
    },
    {
      id: 'unassigned',
      name: 'Não Atribuídas',
      icon: <Users className="h-4 w-4" />,
      count: conversations.filter(conv => !conv.assigned_agent_id && conv.status === 'waiting').length,
      color: 'bg-blue-500',
      description: 'Conversas aguardando atribuição',
      condition: (conv) => !conv.assigned_agent_id && conv.status === 'waiting',
      priority: 6
    },
    {
      id: 'new-customers',
      name: 'Novos',
      icon: <Star className="h-4 w-4" />,
      count: conversations.filter(conv => conv.tags.includes('novo-cliente')).length,
      color: 'bg-cyan-500',
      description: 'Novos clientes - primeira interação',
      condition: (conv) => conv.tags.includes('novo-cliente'),
      priority: 7
    },
    {
      id: 'support-issues',
      name: 'Suporte',
      icon: <Shield className="h-4 w-4" />,
      count: conversations.filter(conv => conv.tags.includes('suporte')).length,
      color: 'bg-indigo-500',
      description: 'Questões de suporte técnico',
      condition: (conv) => conv.tags.includes('suporte'),
      priority: 8
    }
  ], [conversations]);

  // Filtrar conversas
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    // Aplicar busca por texto
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer_phone.includes(searchTerm) ||
        conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aplicar filtros inteligentes
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(conv => {
        return selectedFilters.some(filterId => {
          const filter = smartFilters.find(f => f.id === filterId);
          return filter ? filter.condition(conv) : false;
        });
      });
    }

    // Ordenar por prioridade e data
    return filtered.sort((a, b) => {
      // Primeiro por prioridade
      const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por mensagens não lidas
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count;
      }
      
      // Por último por tempo da última mensagem
      return b.last_message_time.getTime() - a.last_message_time.getTime();
    });
  }, [conversations, searchTerm, selectedFilters, smartFilters]);

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Componente de Tag
  const TagComponent: React.FC<{ 
    tag: string; 
    onRemove?: () => void; 
    onClick?: () => void;
    size?: 'sm' | 'md';
    showRemove?: boolean;
  }> = ({ tag, onRemove, onClick, size = 'sm', showRemove = false }) => {
    const color = getTagColor(tag);
    const template = tagTemplates.find(t => t.name === tag);
    
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
          size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs'
        }`}
        style={{ 
          backgroundColor: color + '20', 
          color: color,
          border: `1px solid ${color}40`
        }}
        onClick={onClick}
        title={template?.description}
      >
        <Hash className="h-3 w-3" />
        {tag}
        {showRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  };

  // Componente de Filtros Inteligentes
  const SmartFiltersComponent = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Radar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros Inteligentes</h3>
          {realTimeMode && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">TEMPO REAL</span>
            </div>
          )}
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

      {/* Filtros Dinâmicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
        {smartFilters
          .sort((a, b) => a.priority - b.priority)
          .map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`relative flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                selectedFilters.includes(filter.id)
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
              
              {selectedFilters.includes(filter.id) && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"></div>
              )}
            </button>
          ))}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Lista de Conversas */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-r border-gray-200 flex flex-col`}>
          {/* Header da Lista */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTagManager(!showTagManager)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Gerenciar Tags"
                >
                  <Tag className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Busca Inteligente */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Busca inteligente: nome, tags, sentimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* Filtros Rápidos */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {smartFilters.slice(0, 4).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center space-x-2 p-2 rounded-lg text-xs transition-all ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-1 rounded ${filter.color} text-white`}>
                    {filter.icon}
                  </div>
                  <span>{filter.name} ({filter.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      {conversation.customer_avatar_url ? (
                        <img
                          src={conversation.customer_avatar_url}
                          alt={conversation.customer_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.customer_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message_time.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message}
                      </p>

                      {/* Tags da conversa */}
                      {conversation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conversation.tags.slice(0, 3).map((tag) => (
                            <TagComponent key={tag} tag={tag} size="sm" />
                          ))}
                          {conversation.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{conversation.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {conversation.unread_count > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa encontrada</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedFilters.length > 0
                    ? 'Tente ajustar os filtros de busca'
                    : 'Aguardando novas conversas...'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Área de Chat */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header do Chat */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    {currentConversation?.customer_avatar_url ? (
                      <img
                        src={currentConversation.customer_avatar_url}
                        alt={currentConversation.customer_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {currentConversation?.customer_name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{currentConversation?.customer_phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingTags(!editingTags)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Editar Tags"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowConversationInfo(!showConversationInfo)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tags da conversa atual */}
              {currentConversation && currentConversation.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentConversation.tags.map((tag) => (
                    <TagComponent
                      key={tag}
                      tag={tag}
                      size="md"
                      showRemove={editingTags}
                      onRemove={() => removeTagFromConversation(currentConversation.id, tag)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`mb-4 flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'customer' 
                          ? 'bg-gray-100 text-gray-800' 
                          : message.sender === 'bot'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-primary-100 text-primary-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {message.message_type === 'text' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : message.message_type === 'image' && message.file_url ? (
                        <div>
                          <img 
                            src={message.file_url} 
                            alt="Imagem" 
                            className="rounded-md max-h-60 mb-1" 
                          />
                          {message.content && <p className="text-sm mt-1">{message.content}</p>}
                        </div>
                      ) : message.message_type === 'file' && message.file_url ? (
                        <div className="bg-white rounded-md p-2 flex items-center space-x-2">
                          <File className="h-5 w-5 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {message.file_size ? `${Math.round(message.file_size / 1024)} KB` : 'Arquivo'}
                            </p>
                          </div>
                          <a 
                            href={message.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Nenhuma mensagem nesta conversa
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="h-4 w-4" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Smile className="h-4 w-4" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex flex-col">
            {/* Filtros Inteligentes quando nenhuma conversa está selecionada */}
            <div className="p-6">
              <SmartFiltersComponent />
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500">
                  Use os filtros inteligentes para encontrar conversas específicas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Informações */}
        {showConversationInfo && currentConversation && (
          <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações</h3>
              <button
                onClick={() => setShowConversationInfo(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informações do Cliente */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Cliente</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <span className="ml-2 text-gray-900">{currentConversation.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Telefone:</span>
                    <span className="ml-2 text-gray-900">{currentConversation.customer_phone}</span>
                  </div>
                  {currentConversation.customer_email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">{currentConversation.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {currentConversation.tags.map((tag) => (
                    <TagComponent key={tag} tag={tag} size="md" />
                  ))}
                  {currentConversation.tags.length === 0 && (
                    <span className="text-sm text-gray-500 italic">Nenhuma tag</span>
                  )}
                </div>
                <button
                  onClick={() => setEditingTags(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Editar tags
                </button>
              </div>

              {/* Notas Internas */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notas Internas</h4>
                <textarea
                  placeholder="Adicionar nota interna..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  defaultValue={currentConversation.internal_notes}
                  onBlur={async (e) => {
                    if (e.target.value !== currentConversation.internal_notes && user?.companyId) {
                      try {
                        await api.updateConversation(user.companyId, currentConversation.id, {
                          internal_notes: e.target.value
                        });
                        loadConversations();
                      } catch (err) {
                        console.error('Erro ao atualizar notas:', err);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModule;