import React from 'react';
import { useThemeStore } from '../../stores/themeStore';
import ThemeSelector from './ThemeSelector';
import GlobalSettings from './GlobalSettings';
import CompanyManagement from './CompanyManagement';
import SystemStats from './SystemStats';
import { Settings, Building2, BarChart3, Palette, Shield } from 'lucide-react';

const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('stats');

  const tabs = [
    { id: 'stats', name: 'Dashboard', icon: BarChart3 },
    { id: 'companies', name: 'Gestão de Contas', icon: Building2 },
    { id: 'themes', name: 'Temas Globais', icon: Palette },
    { id: 'settings', name: 'Configurações Globais', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <SystemStats />;
      case 'companies':
        return <CompanyManagement />;
      case 'themes':
        return <ThemeSelector />;
      case 'settings':
        return <GlobalSettings />;
      default:
        return <SystemStats />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-primary-600" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contas Gybachat</h1>
        </div>
        <p className="text-gray-600">
          Painel administrativo para gerenciar todas as empresas, configurações globais e temas da plataforma
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Sistema Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Tema Global Ativo</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Multi-tenant Habilitado</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : undefined,
                    color: activeTab === tab.id ? 'var(--color-primary)' : undefined
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;