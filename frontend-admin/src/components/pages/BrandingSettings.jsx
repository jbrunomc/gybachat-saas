import { useState, useEffect } from 'react'
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  RefreshCw,
  Image,
  Type,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Copy,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function BrandingSettings() {
  const [brandingData, setBrandingData] = useState({
    logo: {
      primary: null,
      secondary: null,
      favicon: null
    },
    colors: {
      primary: '#4F46E5',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280'
    },
    typography: {
      primary_font: 'Inter',
      secondary_font: 'Inter',
      heading_size: '2xl',
      body_size: 'base'
    },
    layout: {
      header_style: 'modern',
      sidebar_style: 'compact',
      card_style: 'rounded',
      button_style: 'rounded'
    },
    customization: {
      show_logo: true,
      show_company_name: true,
      custom_css: '',
      custom_js: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [activeTab, setActiveTab] = useState('colors')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    fetchBrandingData()
  }, [])

  const fetchBrandingData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/branding', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBrandingData(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de branding:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandingData)
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleColorChange = (colorKey, value) => {
    setBrandingData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  const handleFileUpload = async (type, file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/branding/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setBrandingData(prev => ({
          ...prev,
          logo: {
            ...prev.logo,
            [type]: data.url
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Copiado para a área de transferência!')
    setTimeout(() => setCopied(''), 2000)
  }

  const generateCSS = () => {
    return `
/* GybaChat Custom Branding */
:root {
  --primary-color: ${brandingData.colors.primary};
  --secondary-color: ${brandingData.colors.secondary};
  --accent-color: ${brandingData.colors.accent};
  --background-color: ${brandingData.colors.background};
  --text-color: ${brandingData.colors.text};
  --muted-color: ${brandingData.colors.muted};
  --primary-font: '${brandingData.typography.primary_font}', sans-serif;
  --secondary-font: '${brandingData.typography.secondary_font}', sans-serif;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.text-primary {
  color: var(--primary-color);
}

.bg-primary {
  background-color: var(--primary-color);
}
    `.trim()
  }

  const tabs = [
    { id: 'colors', name: 'Cores', icon: Palette },
    { id: 'logos', name: 'Logos', icon: Image },
    { id: 'typography', name: 'Tipografia', icon: Type },
    { id: 'layout', name: 'Layout', icon: Monitor },
    { id: 'custom', name: 'Personalização', icon: Globe }
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
          <h1 className="text-2xl font-semibold text-gray-900">Configurações de Branding</h1>
          <p className="mt-2 text-sm text-gray-700">
            Personalize a aparência e identidade visual do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <button
            onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {previewMode === 'desktop' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
            {previewMode === 'desktop' ? 'Mobile' : 'Desktop'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Aba Cores */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Paleta de Cores</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Primária
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={brandingData.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-12 h-12 rounded-md border border-gray-300"
                        />
                        <input
                          type="text"
                          value={brandingData.colors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => copyToClipboard(brandingData.colors.primary, 'primary')}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {copied === 'primary' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Secundária
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={brandingData.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-12 h-12 rounded-md border border-gray-300"
                        />
                        <input
                          type="text"
                          value={brandingData.colors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => copyToClipboard(brandingData.colors.secondary, 'secondary')}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {copied === 'secondary' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor de Destaque
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={brandingData.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-12 h-12 rounded-md border border-gray-300"
                        />
                        <input
                          type="text"
                          value={brandingData.colors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => copyToClipboard(brandingData.colors.accent, 'accent')}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {copied === 'accent' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor de Fundo
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={brandingData.colors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="w-12 h-12 rounded-md border border-gray-300"
                        />
                        <input
                          type="text"
                          value={brandingData.colors.background}
                          onChange={(e) => handleColorChange('background', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => copyToClipboard(brandingData.colors.background, 'background')}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {copied === 'background' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview das cores */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview da Paleta</h4>
                    <div className="flex space-x-4">
                      {Object.entries(brandingData.colors).map(([key, color]) => (
                        <div key={key} className="text-center">
                          <div 
                            className="w-16 h-16 rounded-lg border border-gray-200 mb-2"
                            style={{ backgroundColor: color }}
                          ></div>
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Logos */}
              {activeTab === 'logos' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Logos e Ícones</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Principal
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingData.logo.primary ? (
                          <img 
                            src={brandingData.logo.primary} 
                            alt="Logo Principal" 
                            className="mx-auto h-16 object-contain mb-2"
                          />
                        ) : (
                          <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload('primary', e.target.files[0])}
                          className="hidden"
                          id="logo-primary"
                        />
                        <label
                          htmlFor="logo-primary"
                          className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Enviar Logo
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Secundário
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingData.logo.secondary ? (
                          <img 
                            src={brandingData.logo.secondary} 
                            alt="Logo Secundário" 
                            className="mx-auto h-16 object-contain mb-2"
                          />
                        ) : (
                          <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload('secondary', e.target.files[0])}
                          className="hidden"
                          id="logo-secondary"
                        />
                        <label
                          htmlFor="logo-secondary"
                          className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Enviar Logo
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingData.logo.favicon ? (
                          <img 
                            src={brandingData.logo.favicon} 
                            alt="Favicon" 
                            className="mx-auto h-16 object-contain mb-2"
                          />
                        ) : (
                          <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload('favicon', e.target.files[0])}
                          className="hidden"
                          id="logo-favicon"
                        />
                        <label
                          htmlFor="logo-favicon"
                          className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Enviar Favicon
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Custom CSS */}
              {activeTab === 'custom' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">CSS Personalizado</h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        CSS Gerado Automaticamente
                      </label>
                      <button
                        onClick={() => copyToClipboard(generateCSS(), 'css')}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {copied === 'css' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copiar CSS
                      </button>
                    </div>
                    <textarea
                      value={generateCSS()}
                      readOnly
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS Personalizado Adicional
                    </label>
                    <textarea
                      value={brandingData.customization.custom_css}
                      onChange={(e) => setBrandingData(prev => ({
                        ...prev,
                        customization: {
                          ...prev.customization,
                          custom_css: e.target.value
                        }
                      }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                      placeholder="/* Adicione seu CSS personalizado aqui */"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 sticky top-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            </div>
            <div className="p-6">
              <div 
                className={`border border-gray-200 rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}
                style={{ backgroundColor: brandingData.colors.background }}
              >
                {/* Header Preview */}
                <div 
                  className="px-4 py-3 border-b"
                  style={{ backgroundColor: brandingData.colors.primary }}
                >
                  <div className="flex items-center space-x-3">
                    {brandingData.logo.primary && (
                      <img 
                        src={brandingData.logo.primary} 
                        alt="Logo" 
                        className="h-8 object-contain"
                      />
                    )}
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: brandingData.colors.background,
                        fontFamily: brandingData.typography.primary_font
                      }}
                    >
                      GybaChat
                    </span>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4 space-y-4">
                  <div>
                    <h4 
                      className="font-semibold mb-2"
                      style={{ 
                        color: brandingData.colors.text,
                        fontFamily: brandingData.typography.primary_font
                      }}
                    >
                      Dashboard
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: brandingData.colors.muted }}
                    >
                      Bem-vindo ao painel administrativo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button 
                      className="w-full px-3 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: brandingData.colors.primary }}
                    >
                      Botão Primário
                    </button>
                    <button 
                      className="w-full px-3 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: brandingData.colors.secondary }}
                    >
                      Botão Secundário
                    </button>
                    <button 
                      className="w-full px-3 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: brandingData.colors.accent }}
                    >
                      Botão de Destaque
                    </button>
                  </div>

                  <div 
                    className="p-3 rounded border"
                    style={{ borderColor: brandingData.colors.primary + '20' }}
                  >
                    <p 
                      className="text-sm"
                      style={{ color: brandingData.colors.text }}
                    >
                      Card de exemplo com as cores personalizadas aplicadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

