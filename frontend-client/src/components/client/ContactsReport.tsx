import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Tag,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileSpreadsheet,
  Printer,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'blocked' | 'inactive';
  tags: string[];
  last_interaction?: string;
  created_at: string;
  custom_fields: Record<string, any>;
}

const ContactsReport: React.FC = () => {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'last_interaction'>('last_interaction');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Carregar contatos ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadContacts();
    }
  }, [user?.companyId]);

  // Filtrar contatos quando os filtros mudarem
  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, filterStatus, filterTag, sortBy, sortOrder]);

  // Extrair tags disponíveis dos contatos
  useEffect(() => {
    if (contacts.length > 0) {
      const tags = new Set<string>();
      contacts.forEach(contact => {
        contact.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    }
  }, [contacts]);

  // Carregar contatos da API
  const loadContacts = async () => {
    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getContacts(user.companyId);
      
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
      setError('Não foi possível carregar os contatos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar e ordenar contatos
  const filterContacts = () => {
    let filtered = [...contacts];
    
    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(contact => contact.status === filterStatus);
    }
    
    // Aplicar filtro de tag
    if (filterTag !== 'all') {
      filtered = filtered.filter(contact => contact.tags.includes(filterTag));
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'last_interaction':
          const aTime = a.last_interaction ? new Date(a.last_interaction).getTime() : 0;
          const bTime = b.last_interaction ? new Date(b.last_interaction).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredContacts(filtered);
  };

  // Alternar ordem de classificação
  const toggleSort = (field: 'name' | 'created_at' | 'last_interaction') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatar hora
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Status', 'Tags', 'Última Interação', 'Criado em'];
    const csvRows = [headers];
    
    filteredContacts.forEach(contact => {
      csvRows.push([
        contact.name,
        contact.phone,
        contact.email || '',
        contact.status,
        contact.tags.join('; '),
        contact.last_interaction ? formatDate(contact.last_interaction) : 'N/A',
        formatDate(contact.created_at)
      ]);
    });
    
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contatos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir relatório
  const printReport = () => {
    window.print();
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'blocked': return <XCircle className="h-3 w-3 mr-1" />;
      case 'inactive': return <XCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Contatos</h2>
            <p className="text-sm text-gray-600">
              {filteredContacts.length} contatos encontrados
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
            onClick={loadContacts}
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

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
            <option value="inactive">Inativos</option>
          </select>

          {/* Filtro de Tag */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas as Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Contatos */}
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
                      <span>Nome</span>
                      {sortBy === 'name' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('last_interaction')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Última Interação</span>
                      {sortBy === 'last_interaction' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criado em</span>
                      {sortBy === 'created_at' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {getStatusIcon(contact.status)}
                        {contact.status === 'active' ? 'Ativo' : 
                         contact.status === 'blocked' ? 'Bloqueado' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length === 0 && (
                          <span className="text-xs text-gray-500">Sem tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.last_interaction ? (
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1 text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(contact.last_interaction)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{formatTime(contact.last_interaction)}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nunca</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(contact.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterTag !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando contatos ao sistema'
              }
            </p>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
          <div className="text-sm text-gray-500">Total de Contatos</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {contacts.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-500">Contatos Ativos</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {contacts.filter(c => c.status === 'blocked').length}
          </div>
          <div className="text-sm text-gray-500">Contatos Bloqueados</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {availableTags.length}
          </div>
          <div className="text-sm text-gray-500">Tags Utilizadas</div>
        </div>
      </div>
    </div>
  );
};

export default ContactsReport;