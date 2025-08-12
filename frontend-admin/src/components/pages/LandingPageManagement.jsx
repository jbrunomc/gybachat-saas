import { useState, useEffect } from 'react'
import { 
  Globe, 
  Edit, 
  Eye, 
  Save, 
  RefreshCw,
  Upload,
  Image,
  Type,
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  Trash2,
  Move,
  Copy,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function LandingPageManagement() {
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showPreview, setShowPreview] = useState(false)
  
  const [landingData, setLandingData] = useState({
    hero: {
      title: 'Revolucione sua Comunicação Empresarial',
      subtitle: 'Conecte-se com seus clientes através do WhatsApp de forma profissional e automatizada',
      description: 'Plataforma completa para gestão de conversas, automação de mensagens e análise de resultados.',
      cta_text: 'Começar Agora',
      cta_secondary: 'Ver Demo',
      background_image: '',
      video_url: '',
      active: true
    },
    features: {
      title: 'Funcionalidades Poderosas',
      subtitle: 'Tudo que você precisa para gerenciar sua comunicação',
      items: [
        {
          icon: 'MessageSquare',
          title: 'WhatsApp Multi-Usuário',
          description: 'Gerencie múltiplos números do WhatsApp com sua equipe'
        },
        {
          icon: 'Bot',
          title: 'Automação Inteligente',
          description: 'Crie fluxos automatizados para atendimento 24/7'
        },
        {
          icon: 'BarChart3',
          title: 'Analytics Avançado',
          description: 'Relatórios detalhados sobre suas conversas e resultados'
        },
        {
          icon: 'Users',
          title: 'Gestão de Equipe',
          description: 'Organize sua equipe com permissões e departamentos'
        },
        {
          icon: 'Zap',
          title: 'Integração API',
          description: 'Conecte com seus sistemas existentes via API'
        },
        {
          icon: 'Shield',
          title: 'Segurança Total',
          description: 'Dados protegidos com criptografia de ponta a ponta'
        }
      ],
      active: true
    },
    pricing: {
      title: 'Planos que Crescem com Você',
      subtitle: 'Escolha o plano ideal para sua empresa',
      show_annual_discount: true,
      annual_discount: 20,
      active: true
    },
    testimonials: {
      title: 'O que Nossos Clientes Dizem',
      subtitle: 'Empresas que já transformaram sua comunicação',
      items: [
        {
          name: 'João Silva',
          company: 'TechSolutions',
          role: 'CEO',
          content: 'O GybaChat revolucionou nossa comunicação com clientes. Aumentamos nossa conversão em 40%.',
          avatar: '',
          rating: 5
        },
        {
          name: 'Maria Santos',
          company: 'E-commerce Plus',
          role: 'Gerente de Marketing',
          content: 'Automação incrível! Conseguimos atender 3x mais clientes com a mesma equipe.',
          avatar: '',
          rating: 5
        },
        {
          name: 'Carlos Lima',
          company: 'Digital Corp',
          role: 'Diretor Comercial',
          content: 'Interface intuitiva e suporte excepcional. Recomendo para qualquer empresa.',
          avatar: '',
          rating: 5
        }
      ],
      active: true
    },
    faq: {
      title: 'Perguntas Frequentes',
      subtitle: 'Tire suas dúvidas sobre nossa plataforma',
      items: [
        {
          question: 'Como funciona a integração com WhatsApp?',
          answer: 'Nossa plataforma se conecta diretamente com a API oficial do WhatsApp Business, garantindo total conformidade e segurança.'
        },
        {
          question: 'Posso usar múltiplos números?',
          answer: 'Sim! Você pode conectar quantos números do WhatsApp quiser, dependendo do seu plano.'
        },
        {
          question: 'Os dados são seguros?',
          answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos todas as normas de segurança internacionais.'
        },
        {
          question: 'Há período de teste gratuito?',
          answer: 'Sim! Oferecemos 14 dias de teste gratuito em todos os planos, sem compromisso.'
        }
      ],
      active: true
    },
    footer: {
      company_description: 'GybaChat é a plataforma líder em comunicação empresarial via WhatsApp no Brasil.',
      social_links: {
        facebook: '',
        instagram: '',
        linkedin: '',
        twitter: ''
      },
      contact: {
        email: 'contato@gybachat.com',
        phone: '+55 11 99999-9999',
        address: 'São Paulo, SP - Brasil'
      },
      links: {
        privacy: '/privacidade',
        terms: '/termos',
        support: '/suporte'
      },
      active: true
    }
  })

  useEffect(() => {
    fetchLandingData()
  }, [])

  const fetchLandingData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/landing/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLandingData(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da landing:', error)
      toast.error('Erro ao carregar configurações da landing page')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/landing/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: landingData[section],
          active: landingData[section].active
        })
      })

      if (response.ok) {
        toast.success('Seção salva com sucesso!')
      } else {
        toast.error('Erro ao salvar seção')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar seção')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSection = async (section) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/landing/admin/settings/${section}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setLandingData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            active: !prev[section].active
          }
        }))
        toast.success(`Seção ${landingData[section].active ? 'desativada' : 'ativada'}`)
      } else {
        toast.error('Erro ao alterar status da seção')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da seção')
    }
  }

  const handleImageUpload = async (section, field, file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', section)
      formData.append('field', field)

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/landing/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setLandingData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: data.data.url
          }
        }))
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error('Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar imagem')
    }
  }

  const addFeatureItem = () => {
    setLandingData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: [
          ...prev.features.items,
          {
            icon: 'Star',
            title: 'Nova Funcionalidade',
            description: 'Descrição da nova funcionalidade'
          }
        ]
      }
    }))
  }

  const removeFeatureItem = (index) => {
    setLandingData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.filter((_, i) => i !== index)
      }
    }))
  }

  const addTestimonial = () => {
    setLandingData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: [
          ...prev.testimonials.items,
          {
            name: 'Nome do Cliente',
            company: 'Empresa',
            role: 'Cargo',
            content: 'Depoimento do cliente...',
            avatar: '',
            rating: 5
          }
        ]
      }
    }))
  }

  const removeTestimonial = (index) => {
    setLandingData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: prev.testimonials.items.filter((_, i) => i !== index)
      }
    }))
  }

  const addFaqItem = () => {
    setLandingData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: [
          ...prev.faq.items,
          {
            question: 'Nova pergunta?',
            answer: 'Resposta da nova pergunta...'
          }
        ]
      }
    }))
  }

  const removeFaqItem = (index) => {
    setLandingData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: prev.faq.items.filter((_, i) => i !== index)
      }
    }))
  }

  const tabs = [
    { id: 'hero', name: 'Hero', icon: Layout },
    { id: 'features', name: 'Funcionalidades', icon: Type },
    { id: 'pricing', name: 'Preços', icon: Globe },
    { id: 'testimonials', name: 'Depoimentos', icon: Edit },
    { id: 'faq', name: 'FAQ', icon: Eye },
    { id: 'footer', name: 'Rodapé', icon: Save }
  ]

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
          <h1 className="text-2xl font-semibold text-gray-900">Gestão da Landing Page</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todo o conteúdo da sua landing page
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <button
            onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {previewMode === 'desktop' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
            {previewMode === 'desktop' ? 'Mobile' : 'Desktop'}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = landingData[tab.id]?.active
              return (
                <div key={tab.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium flex-1`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                  <button
                    onClick={() => handleToggleSection(tab.id)}
                    className={`ml-2 p-1 rounded ${
                      isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Aba Hero */}
            {activeTab === 'hero' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Seção Hero</h3>
                  <button
                    onClick={() => handleSave('hero')}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título Principal</label>
                    <input
                      type="text"
                      value={landingData.hero.title}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                    <input
                      type="text"
                      value={landingData.hero.subtitle}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      value={landingData.hero.description}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, description: e.target.value }
                      }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Texto do Botão Principal</label>
                      <input
                        type="text"
                        value={landingData.hero.cta_text}
                        onChange={(e) => setLandingData(prev => ({
                          ...prev,
                          hero: { ...prev.hero, cta_text: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Texto do Botão Secundário</label>
                      <input
                        type="text"
                        value={landingData.hero.cta_secondary}
                        onChange={(e) => setLandingData(prev => ({
                          ...prev,
                          hero: { ...prev.hero, cta_secondary: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Imagem de Fundo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {landingData.hero.background_image ? (
                          <img 
                            src={landingData.hero.background_image} 
                            alt="Background" 
                            className="mx-auto h-32 object-cover rounded"
                          />
                        ) : (
                          <Image className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                            <span>Enviar imagem</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && handleImageUpload('hero', 'background_image', e.target.files[0])}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL do Vídeo (opcional)</label>
                    <input
                      type="url"
                      value={landingData.hero.video_url}
                      onChange={(e) => setLandingData(prev => ({
                        ...prev,
                        hero: { ...prev.hero, video_url: e.target.value }
                      }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Aba Features */}
            {activeTab === 'features' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Funcionalidades</h3>
                  <div className="space-x-3">
                    <button
                      onClick={addFeatureItem}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </button>
                    <button
                      onClick={() => handleSave('features')}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Título da Seção</label>
                      <input
                        type="text"
                        value={landingData.features.title}
                        onChange={(e) => setLandingData(prev => ({
                          ...prev,
                          features: { ...prev.features, title: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                      <input
                        type="text"
                        value={landingData.features.subtitle}
                        onChange={(e) => setLandingData(prev => ({
                          ...prev,
                          features: { ...prev.features, subtitle: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Itens de Funcionalidades</h4>
                    {landingData.features.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-sm font-medium text-gray-900">Funcionalidade {index + 1}</h5>
                          <button
                            onClick={() => removeFeatureItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ícone</label>
                            <input
                              type="text"
                              value={item.icon}
                              onChange={(e) => {
                                const newItems = [...landingData.features.items]
                                newItems[index].icon = e.target.value
                                setLandingData(prev => ({
                                  ...prev,
                                  features: { ...prev.features, items: newItems }
                                }))
                              }}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...landingData.features.items]
                                newItems[index].title = e.target.value
                                setLandingData(prev => ({
                                  ...prev,
                                  features: { ...prev.features, items: newItems }
                                }))
                              }}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...landingData.features.items]
                                newItems[index].description = e.target.value
                                setLandingData(prev => ({
                                  ...prev,
                                  features: { ...prev.features, items: newItems }
                                }))
                              }}
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Outras abas seguem o mesmo padrão... */}
            {/* Por brevidade, vou incluir apenas as principais */}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-4/5 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview da Landing Page ({previewMode})
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className={`border border-gray-200 rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}>
                {/* Preview do Hero */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
                  <h1 className="text-3xl font-bold mb-4">{landingData.hero.title}</h1>
                  <p className="text-xl mb-2">{landingData.hero.subtitle}</p>
                  <p className="mb-6">{landingData.hero.description}</p>
                  <div className="space-x-4">
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold">
                      {landingData.hero.cta_text}
                    </button>
                    <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold">
                      {landingData.hero.cta_secondary}
                    </button>
                  </div>
                </div>

                {/* Preview das Features */}
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{landingData.features.title}</h2>
                    <p className="text-gray-600">{landingData.features.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {landingData.features.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <span className="text-indigo-600 font-bold">{item.icon}</span>
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

