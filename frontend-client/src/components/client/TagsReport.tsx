import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Tag, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowUpDown,
  FileSpreadsheet,
  Printer,
  Loader2,
  BarChart3,
  Hash,
  Calendar,
  Activity,
  Users,
  Clock,
  Palette
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

const TagsReport: React.FC = () => {
  const { user } = useAuthStore();
  const [tags, setTags] = useState<TagTemplate[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created' | 'category'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Carregar tags ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadTags();
    }
  }, [user?.companyId]);

  // Filtrar tags quando os filtros mudarem
  useEffect(() => {
    filterTags();
  }, [tags, searchTerm, filterCategory, sortBy, sortOrder]);

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
        
        setTags(formattedTags);
      }
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
      setError('Não foi possível carregar as tags. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar e ordenar tags
  const filterTags = () => {
    let filtered = tags.filter(tag => {
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

    setFilteredTags(filtered);
  };

  // Alternar ordem de classificação
  const toggleSort = (field: 'name' | 'usage' | 'created' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Categoria', 'Descrição', 'Cor', 'Usos', 'Padrão', 'Criado em', 'Criado por', 'Palavras-chave'];
    const csvRows = [headers];
    
    filteredTags.forEach(tag => {
      csvRows.push([
        tag.name,
        tag.category,
        tag.description || '',
        tag.color,
        tag.usageCount.toString(),
        tag.isDefault ? 'Sim' : 'Não',
        formatDate(tag.createdAt),
        tag.createdBy,
        tag.keywords?.join('; ') || ''
      ]);
    });
    
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tags_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir relatório
  const printReport = () => {
    window.print();
  };

  // Obter nome da categoria
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'status': return 'Status';
      case 'priority': return 'Prioridade';
      case 'department': return 'Departamento';
      case 'custom': return 'Personalizada';
      case 'ai-generated': return 'IA Gerada';
      default: return category;
    }
  };

  // Obter cor da categoria
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'status': return 'bg-green-100 text-green-800';
      case 'priority': return 'bg-red-100 text-red-800';
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      case 'ai-generated': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular estatísticas
  const calculateStats = () => {
    const totalTags = tags.length;
    const activelyUsed = tags.filter(tag => tag.usageCount > 0).length;
    
    const categoryDistribution = tags.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const mostUsed = [...tags]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
    
    return {
      totalTags,
      activelyUsed,
      categoryDistribution,
      mostUsed
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Tags</h2>
            <p className="text-sm text-gray-600">
              {filteredTags.length} tags encontradas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          
          <button
            onClick={loadTags}
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

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTags}</p>
            </div>
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Uso</p>
              <p className="text-2xl font-bold text-green-600">{stats.activelyUsed}</p>
              <p className="text-xs text-gray-500">
                {stats.totalTags > 0 ? ((stats.activelyUsed / stats.totalTags) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Geradas por IA</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.categoryDistribution['ai-generated'] || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mais Usada</p>
              <p className="text-lg font-bold text-orange-600">
                {stats.mostUsed[0]?.usageCount || 0} usos
              </p>
              <p className="text-xs text-gray-500">{stats.mostUsed[0]?.name || 'N/A'}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
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
      </div>

      {/* Tabela de Tags */}
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tag</span>
                      {sortBy === 'name' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Categoria</span>
                      {sortBy === 'category' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cor
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('usage')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Usos</span>
                      {sortBy === 'usage' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('created')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criado em</span>
                      {sortBy === 'created' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: tag.color + '20', 
                            color: tag.color,
                            border: `1px solid ${tag.color}40`
                          }}
                        >
                          <Hash className="h-3 w-3" />
                          {tag.name}
                        </span>
                        {tag.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                            Padrão
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tag.category)}`}>
                        {getCategoryName(tag.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {tag.description || <span className="text-gray-500 italic">Sem descrição</span>}
                      </div>
                      {tag.keywords && tag.keywords.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tag.keywords.map((keyword, index) => (
                            <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="text-sm text-gray-500 font-mono">{tag.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tag.usageCount}</div>
                      <div className="text-xs text-gray-500">
                        {tag.usageCount === 0 ? 'Nunca usada' : 
                         tag.usageCount === 1 ? 'Usada 1 vez' : 
                         `Usada ${tag.usageCount} vezes`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDate(tag.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        por {tag.createdBy}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredTags.length === 0 && (
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

      {/* Resumo por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(category)}`}>
                    {getCategoryName(category)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${(count / stats.totalTags) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {count} ({((count / stats.totalTags) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags Mais Usadas</h3>
          <div className="space-y-3">
            {stats.mostUsed.map((tag, index) => (
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
            {stats.mostUsed.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Nenhuma tag com uso registrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsReport;