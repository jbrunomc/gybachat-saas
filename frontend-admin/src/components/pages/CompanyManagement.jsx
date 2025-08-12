import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  ShieldOff,
  CreditCard,
  MessageSquare,
  Calendar,
  Globe,
  Mail,
  Phone
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data.data)
      } else {
        // Dados mockados para demonstração
        const mockCompanies = [
          {
            id: '1',
            name: 'TechSolutions Ltda',
            slug: 'techsolutions',
            email: 'admin@techsolutions.com',
            phone: '+55 11 99999-9999',
            status: 'active',
            plan: 'Enterprise',
            subscription_status: 'active',
            trial_ends_at: null,
            created_at: '2024-12-01T10:00:00Z',
            last_login: '2025-01-06T08:30:00Z',
            users_count: 45,
            messages_count: 12500,
            whatsapp_numbers: 8,
            custom_domain: 'chat.techsolutions.com',
            monthly_revenue: 1999.00,
            usage: {
              users: 45,
              whatsapp_numbers: 8,
              messages_month: 12500,
              storage_gb: 15.2
            },
            limits: {
              users: -1,
              whatsapp_numbers: 10,
              messages_month: 25000,
              storage_gb: 25
            }
          },
          {
            id: '2',
            name: 'E-commerce Plus',
            slug: 'ecommerce-plus',
            email: 'contato@ecommerceplus.com',
            phone: '+55 21 88888-8888',
            status: 'active',
            plan: 'Professional',
            subscription_status: 'trial',
            trial_ends_at: '2025-01-20T23:59:59Z',
            created_at: '2025-01-01T14:30:00Z',
            last_login: '2025-01-06T07:15:00Z',
            users_count: 12,
            messages_count: 8900,
            whatsapp_numbers: 3,
            custom_domain: null,
            monthly_revenue: 0,
            usage: {
              users: 12,
              whatsapp_numbers: 3,
              messages_month: 8900,
              storage_gb: 4.8
            },
            limits: {
              users: 15,
              whatsapp_numbers: 3,
              messages_month: 5000,
              storage_gb: 5
            }
          },
          {
            id: '3',
            name: 'Digital Corp',
            slug: 'digital-corp',
            email: 'admin@digitalcorp.com.br',
            phone: '+55 31 77777-7777',
            status: 'suspended',
            plan: 'Starter',
            subscription_status: 'past_due',
            trial_ends_at: null,
            created_at: '2024-11-15T09:20:00Z',
            last_login: '2025-01-04T16:45:00Z',
            users_count: 5,
            messages_count: 2100,
            whatsapp_numbers: 1,
            custom_domain: null,
            monthly_revenue: 49.90,
            usage: {
              users: 5,
              whatsapp_numbers: 1,
              messages_month: 2100,
              storage_gb: 1.2
            },
            limits: {
              users: 5,
              whatsapp_numbers: 1,
              messages_month: 1000,
              storage_gb: 1
            }
          }
        ]
        setCompanies(mockCompanies)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (company) => {
    try {
      const newStatus = company.status === 'active' ? 'suspended' : 'active'
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`/api/admin/companies/${company.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(`Empresa ${newStatus === 'active' ? 'ativada' : 'suspensa'} com sucesso`)
        fetchCompanies()
      } else {
        toast.error('Erro ao alterar status da empresa')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da empresa')
    }
  }

  const handleViewDetails = (company) => {
    setSelectedCompany(company)
    setShowDetailsModal(true)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      suspended: 'text-red-600 bg-red-100',
      trial: 'text-blue-600 bg-blue-100',
      past_due: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircle,
      suspended: XCircle,
      trial: Clock,
      past_due: AlertTriangle
    }
    const Icon = icons[status] || AlertTriangle
    return <Icon className="w-4 h-4" />
  }

  const getPlanColor = (plan) => {
    const colors = {
      'Starter': 'bg-gray-100 text-gray-800',
      'Professional': 'bg-blue-100 text-blue-800',
      'Enterprise': 'bg-purple-100 text-purple-800'
    }
    return colors[plan] || 'bg-gray-100 text-gray-800'
  }

  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0 // Ilimitado
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus
    const matchesPlan = filterPlan === 'all' || company.plan === filterPlan
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestão de Empresas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="trial">Trial</option>
              <option value="past_due">Em atraso</option>
            </select>
          </div>
          <div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos os planos</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensagens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(company.plan)}`}>
                      {company.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      {getStatusIcon(company.status)}
                      <span className="ml-1 capitalize">{company.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span>{company.users_count}</span>
                      {company.limits.users !== -1 && (
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(company.usage.users, company.limits.users))}`}
                            style={{ width: `${getUsagePercentage(company.usage.users, company.limits.users)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.messages_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(company.monthly_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.last_login).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(company)}
                        className={`${company.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {company.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Empresa
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCompany.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCompany.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCompany.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domínio Personalizado</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCompany.custom_domain || 'Não configurado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedCompany.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uso e Limites */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Uso e Limites</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usuários</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {selectedCompany.usage.users} / {selectedCompany.limits.users === -1 ? '∞' : selectedCompany.limits.users}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(selectedCompany.usage.users, selectedCompany.limits.users))}`}
                            style={{ width: `${getUsagePercentage(selectedCompany.usage.users, selectedCompany.limits.users)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Números WhatsApp</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {selectedCompany.usage.whatsapp_numbers} / {selectedCompany.limits.whatsapp_numbers}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(selectedCompany.usage.whatsapp_numbers, selectedCompany.limits.whatsapp_numbers))}`}
                            style={{ width: `${getUsagePercentage(selectedCompany.usage.whatsapp_numbers, selectedCompany.limits.whatsapp_numbers)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mensagens/Mês</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {formatNumber(selectedCompany.usage.messages_month)} / {formatNumber(selectedCompany.limits.messages_month)}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(selectedCompany.usage.messages_month, selectedCompany.limits.messages_month))}`}
                            style={{ width: `${getUsagePercentage(selectedCompany.usage.messages_month, selectedCompany.limits.messages_month)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {selectedCompany.usage.storage_gb} GB / {selectedCompany.limits.storage_gb} GB
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(selectedCompany.usage.storage_gb, selectedCompany.limits.storage_gb))}`}
                            style={{ width: `${getUsagePercentage(selectedCompany.usage.storage_gb, selectedCompany.limits.storage_gb)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Editar Empresa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

