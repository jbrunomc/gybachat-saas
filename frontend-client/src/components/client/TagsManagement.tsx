import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Hash,
  Palette,
  Star,
  Target,
  Users,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Layers,
  Sparkles,
  Brain,
  Zap,
  Crown,
  Shield,
  Award,
  Activity,
  Flame,
  Lightbulb,
  Gauge,
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Settings,
  Info,
  Radar,
  ScanLine,
  MousePointer2,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface TagTemplate {
  id: string;
  name: string;
  color: string;
  category: 'status' | 'priority' | 'department' | 'custom' | 'ai-generated';
  description?: string;
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  createdBy: string;
  lastUsed?: Date;
  aiSuggested?: boolean;
  keywords?: string[];
}

interface TagUsageStats {
  totalTags: number;
  activelyUsed: number;
  mostUsed: TagTemplate[];
  recentlyCreated: TagTemplate[];
  categoryDistribution: { [key: string]: number };
  usageTrend: { date: string; count: number }[];
}

const TagsManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagTemplate | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [newTagCategory, setNewTagCategory] = useState<TagTemplate['category']>('custom');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created' | 'category'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagTemplates, setTagTemplates] = useState<TagTemplate[]>([]);

  // Carregar tags ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadTags();
    }
  }, [user?.companyId]);

  // Carregar tags da API
  const loadTags = async () => {
    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getTags(user.companyId);
      
      if (response.success && response.data) {
        // Converter dados da API para o formato do componente
        const formattedTags: TagTemplate[] = response.data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          category: tag.category,
          description: tag.description,
          isDefault: tag.is_default,
          usageCount: tag.usage_count || 0,
          createdAt: new Date(tag.created_at),
          createdBy: tag.created_by_name || 'Sistema',
          lastUsed: tag.last_used ? new Date(tag.last_used) : undefined,
          aiSuggested: tag.category === 'ai-generated',
          keywords: tag.keywords || []
        }));
        
        setTagTemplates(formattedTags);
      }
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
      setError('Não foi possível carregar as tags. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cores disponíveis para tags
  const tagColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#C084FC', '#E879F9', '#F472B6', '#FB7185'
  ];

  // Estatísticas de uso
  const tagUsageStats: TagUsageStats = useMemo(() => {
    const totalTags = tagTemplates.length;
    const activelyUsed = tagTemplates.filter(tag => tag.usageCount > 0).length;
    const mostUsed = [...tagTemplates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
    const recentlyCreated = [...tagTemplates]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    const categoryDistribution = tagTemplates.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Dados para tendência de uso (seria buscado da API em produção)
    const usageTrend = [
      { date: '2024-11-15', count: 45 },
      { date: '2024-11-16', count: 52 },
      { date: '2024-11-17', count: 48 },
      { date: '2024-11-18', count: 67 },
      { date: '2024-11-19', count: 73 },
      { date: '2024-11-20', count: 89 },
      { date: '2024-11-21', count: 94 }
    ];

    return {
      totalTags,
      activelyUsed,
      mostUsed,
      recentlyCreated,
      categoryDistribution,
      usageTrend
    };
  }, [tagTemplates]);

  // Filtrar e ordenar tags
  const filteredAndSortedTags = useMemo(() => {
    let filtered = tagTemplates.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tag.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || tag.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = a.usageCount - b.usageCount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tagTemplates, searchTerm, filterCategory, sortBy, sortOrder]);

  // Função para criar nova tag
  const createNewTag = async () => {
    if (!newTagName.trim() || !user?.companyId) return;
    
    try {
      setIsLoading(true);
      
      const tagData = {
        name: newTagName.toLowerCase().replace(/\s+/g, '-'),
        color: newTagColor,
        category: newTagCategory,
        description: newTagDescription || `Tag personalizada: ${newTagName}`,
        is_default: false,
        keywords: newTagName.split(' ').filter(word => word.length > 2)
      };
      
      const response = await api.createTag(user.companyId, tagData);
      
      if (response.success) {
        setNewTagName('');
        setNewTagDescription('');
        setNewTagColor('#3B82F6');
        setNewTagCategory('custom');
        setShowCreateModal(false);
        
        // Recarregar tags
        loadTags();
      }
    } catch (err) {
      console.error('Erro ao criar tag:', err);
      setError('Não foi possível criar a tag. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para editar tag
  const saveEditedTag = async () => {
    if (!editingTag || !newTagName.trim() || !user?.companyId) return;
    
    try {
      setIsLoading(true);
      
      const tagData = {
        name: newTagName.toLowerCase().replace(/\s+/g, '-'),
        color: newTagColor,
        category: newTagCategory,
        description: newTagDescription,
        keywords: newTagName.split(' ').filter(word => word.length > 2)
      };
      
      const response = await api.updateTag(user.companyId, editingTag.id, tagData);
      
      if (response.success) {
        setEditingTag(null);
        setNewTagName('');
        setNewTagDescription('');
        setNewTagColor('#3B82F6');
        setNewTagCategory('custom');
        setShowCreateModal(false);
        
        // Recarregar tags
        loadTags();
      }
    } catch (err) {
      console.error('Erro ao editar tag:', err);
      setError('Não foi possível editar a tag. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar tag
  const deleteTag = async (tagId: string) => {
    if (!user?.companyId) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tag?')) {
      try {
        setIsLoading(true);
        
        const response = await api.deleteTag(user.companyId, tagId);
        
        if (response.success) {
          // Recarregar tags
          loadTags();
        }
      } catch (err) {
        console.error('Erro ao deletar tag:', err);
        setError('Não foi possível excluir a tag. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Função para duplicar tag
  const duplicateTag = async (tag: TagTemplate) => {
    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      
      const tagData = {
        name: `${tag.name}-copy`,
        color: tag.color,
        category: tag.category,
        description: tag.description ? `${tag.description} (cópia)` : `Cópia de: ${tag.name}`,
        is_default: false,
        keywords: tag.keywords
      };
      
      const response = await api.createTag(user.companyId, tagData);
      
      if (response.success) {
        // Recarregar tags
        loadTags();
      }
    } catch (err) {
      console.error('Erro ao duplicar tag:', err);
      setError('Não foi possível duplicar a tag. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para toggle de seleção
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Função para selecionar todas as tags
  const selectAllTags = () => {
    setSelectedTags(filteredAndSortedTags.map(tag => tag.id));
  };

  // Função para limpar seleção
  const clearSelection = () => {
    setSelectedTags([]);
  };

  // Função para ações em lote
  const bulkDeleteTags = async () => {
    if (!user?.companyId) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${selectedTags.length} tags selecionadas?`)) {
      try {
        setIsLoading(true);
        
        // Excluir tags uma por uma
        for (const tagId of selectedTags) {
          await api.deleteTag(user.companyId, tagId);
        }
        
        setSelectedTags([]);
        
        // Recarregar tags
        loadTags();
      } catch (err) {
        console.error('Erro ao excluir tags em lote:', err);
        setError('Não foi possível excluir as tags selecionadas. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCategoryBadge = (category: TagTemplate['category']) => {
    const styles = {
      status: 'bg-green-100 text-green-800',
      priority: 'bg-red-100 text-red-800',
      department: 'bg-blue-100 text-blue-800',
      custom: 'bg-purple-100 text-purple-800',
      'ai-generated': 'bg-indigo-100 text-indigo-800'
    };

    const labels = {
      status: 'Status',
      priority: 'Prioridade',
      department: 'Departamento',
      custom: 'Personalizada',
      'ai-generated': 'IA Gerada'
    };

    const icons = {
      status: <CheckCircle className="h-3 w-3 mr-1" />,
      priority: <AlertTriangle className="h-3 w-3 mr-1" />,
      department: <Users className="h-3 w-3 mr-1" />,
      custom: <Star className="h-3 w-3 mr-1" />,
      'ai-generated': <Brain className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[category]}`}>
        {icons[category]}
        {labels[category]}
      </span>
    );
  };

  const getUsageIndicator = (usageCount: number) => {
    if (usageCount === 0) return { color: 'text-gray-400', label: 'Não usada' };
    if (usageCount < 10) return { color: 'text-yellow-600', label: 'Pouco usada' };
    if (usageCount < 50) return { color: 'text-blue-600', label: 'Moderadamente usada' };
    if (usageCount < 100) return { color: 'text-green-600', label: 'Muito usada' };
    return { color: 'text-purple-600', label: 'Extremamente usada' };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Tags</h2>
            <p className="text-sm text-gray-600">Organize e gerencie todas as tags do sistema</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingTag(null);
              setNewTagName('');
              setNewTagDescription('');
              setNewTagColor('#3B82F6');
              setNewTagCategory('custom');
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="h-4 w-4" />
            <span>Nova Tag</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tags</p>
              <p className="text-2xl font-bold text-gray-900">{tagUsageStats.totalTags}</p>
            </div>
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Uso</p>
              <p className="text-2xl font-bold text-green-600">{tagUsageStats.activelyUsed}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Geradas por IA</p>
              <p className="text-2xl font-bold text-purple-600">
                {tagUsageStats.categoryDistribution['ai-generated'] || 0}
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mais Usada</p>
              <p className="text-lg font-bold text-orange-600">
                {tagUsageStats.mostUsed[0]?.usageCount || 0} usos
              </p>
              <p className="text-xs text-gray-500">{tagUsageStats.mostUsed[0]?.name}</p>
            </div>
            <Award className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou palavras-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Categoria */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="status">Status</option>
            <option value="priority">Prioridade</option>
            <option value="department">Departamento</option>
            <option value="custom">Personalizada</option>
            <option value="ai-generated">IA Gerada</option>
          </select>

          {/* Ordenação */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="usage-desc">Mais Usadas</option>
            <option value="usage-asc">Menos Usadas</option>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="created-desc">Mais Recentes</option>
            <option value="created-asc">Mais Antigas</option>
            <option value="category-asc">Categoria A-Z</option>
          </select>
        </div>

        {/* Ações em Lote */}
        {selectedTags.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedTags.length} tag(s) selecionada(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={bulkDeleteTags}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
              >
                Excluir Selecionadas
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Tags */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tags ({filteredAndSortedTags.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectedTags.length === filteredAndSortedTags.length ? clearSelection : selectAllTags}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedTags.length === filteredAndSortedTags.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>
            </div>
          </div>
        </div>

        {isLoading && filteredAndSortedTags.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedTags.map((tag) => {
              const usageIndicator = getUsageIndicator(tag.usageCount);
              
              return (
                <div key={tag.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />

                      {/* Tag Preview */}
                      <div className="flex items-center space-x-3">
                        <span 
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: tag.color + '20', 
                            color: tag.color,
                            border: `1px solid ${tag.color}40`
                          }}
                        >
                          <Hash className="h-3 w-3" />
                          {tag.name}
                        </span>
                        
                        {tag.aiSuggested && (
                          <div className="flex items-center space-x-1 text-purple-600">
                            <Brain className="h-3 w-3" />
                            <span className="text-xs">IA</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{tag.name}</h4>
                          {getCategoryBadge(tag.category)}
                          {tag.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Padrão
                            </span>
                          )}
                        </div>
                        
                        {tag.description && (
                          <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span className={usageIndicator.color}>
                              {tag.usageCount} usos ({usageIndicator.label})
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Criada em {tag.createdAt.toLocaleDateString('pt-BR')}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>por {tag.createdBy}</span>
                          </span>
                          {tag.lastUsed && (
                            <span className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>
                                Última vez: {tag.lastUsed.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Keywords */}
                        {tag.keywords && tag.keywords.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Palavras-chave: </span>
                            {tag.keywords.map((keyword, index) => (
                              <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 mr-1">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Indicador de Cor */}
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: tag.color }}
                        title={`Cor: ${tag.color}`}
                      />
                      
                      {/* Ações */}
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            setEditingTag(tag);
                            setNewTagName(tag.name);
                            setNewTagColor(tag.color);
                            setNewTagCategory(tag.category);
                            setNewTagDescription(tag.description || '');
                            setShowCreateModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" 
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => duplicateTag(tag)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg" 
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {!tag.isDefault && (
                          <button 
                            onClick={() => deleteTag(tag.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredAndSortedTags.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tag encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira tag'
              }
            </p>
          </div>
        )}
      </div>

      {/* Tags Mais Usadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Tags Mais Usadas
          </h3>
          <div className="space-y-3">
            {tagUsageStats.mostUsed.map((tag, index) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: tag.color + '20', 
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    <Hash className="h-2 w-2" />
                    {tag.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{tag.usageCount} usos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
            Tags Recentes
          </h3>
          <div className="space-y-3">
            {tagUsageStats.recentlyCreated.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: tag.color + '20', 
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    <Hash className="h-2 w-2" />
                    {tag.name}
                  </span>
                  {tag.aiSuggested && (
                    <Brain className="h-3 w-3 text-purple-600" title="Sugerida pela IA" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {tag.createdAt.toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTag ? 'Editar Tag' : 'Nova Tag'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTag(null);
                  setNewTagName('');
                  setNewTagDescription('');
                  setNewTagColor('#3B82F6');
                  setNewTagCategory('custom');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Tag
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: cliente-vip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  placeholder="Descrição opcional da tag..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value as TagTemplate['category'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="custom">Personalizada</option>
                  <option value="status">Status</option>
                  <option value="priority">Prioridade</option>
                  <option value="department">Departamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {tagColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          newTagColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <span 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: newTagColor + '20', 
                    color: newTagColor,
                    border: `1px solid ${newTagColor}40`
                  }}
                >
                  <Hash className="h-3 w-3" />
                  {newTagName || 'nome-da-tag'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTag(null);
                  setNewTagName('');
                  setNewTagDescription('');
                  setNewTagColor('#3B82F6');
                  setNewTagCategory('custom');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={editingTag ? saveEditedTag : createNewTag}
                disabled={!newTagName.trim() || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <span>{editingTag ? 'Salvar' : 'Criar Tag'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsManagement;