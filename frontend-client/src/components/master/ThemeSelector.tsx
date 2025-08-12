import React from 'react';
import { useThemeStore, themes } from '../../stores/themeStore';
import { Check, Palette, Eye, Sparkles, Zap } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Palette className="h-6 w-6 text-gray-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Temas Globais</h2>
          <p className="text-sm text-gray-600">Configure a aparência visual de toda a plataforma</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              🎨 Sistema de Temas Global
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Os temas selecionados aqui são aplicados automaticamente em <strong>TODA a plataforma</strong>, 
              incluindo todos os painéis de clientes, interfaces de usuário e componentes do sistema.
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-700">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Aplicação em tempo real</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Visualização instantânea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(themes).map((theme) => (
          <div
            key={theme.name}
            className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              currentTheme.name === theme.name
                ? 'border-primary-500 ring-4 ring-primary-200 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setTheme(theme.name)}
            style={{
              borderColor: currentTheme.name === theme.name ? theme.colors.primary[500] : undefined
            }}
          >
            {currentTheme.name === theme.name && (
              <div 
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: theme.colors.primary[500] }}
              >
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{theme.displayName}</h3>
                {currentTheme.name === theme.name && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    ATIVO
                  </span>
                )}
              </div>
              
              {/* Color Palette Preview */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">Paleta de Cores:</p>
                <div className="grid grid-cols-5 gap-1">
                  {[100, 300, 500, 700, 900].map((shade) => (
                    <div
                      key={shade}
                      className="aspect-square rounded-lg shadow-sm border border-gray-200"
                      style={{ backgroundColor: theme.colors.primary[shade as keyof typeof theme.colors.primary] }}
                      title={`${theme.name}-${shade}: ${theme.colors.primary[shade as keyof typeof theme.colors.primary]}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview Components */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">Prévia dos Componentes:</p>
                
                <div 
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium text-center transition-all hover:shadow-md"
                  style={{ backgroundColor: theme.colors.primary[600] }}
                >
                  Botão Primário
                </div>
                
                <div 
                  className="px-4 py-2 rounded-lg border text-sm font-medium text-center transition-all hover:shadow-sm"
                  style={{ 
                    borderColor: theme.colors.primary[300],
                    color: theme.colors.primary[700],
                    backgroundColor: theme.colors.primary[50]
                  }}
                >
                  Botão Secundário
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.primary[500] }}
                    />
                    <span className="text-sm text-gray-600">Status Ativo</span>
                  </div>
                  <div 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: theme.colors.primary[100],
                      color: theme.colors.primary[800]
                    }}
                  >
                    Badge
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Theme Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tema Atual: {currentTheme.displayName}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(currentTheme.colors.primary).map(([shade, color]) => (
            <div key={shade} className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <p className="text-sm font-medium text-gray-900">{shade}</p>
              <p className="text-xs text-gray-500 font-mono">{color}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Aplicação Global</h4>
          <p className="text-sm text-gray-600">
            Este tema está sendo aplicado em tempo real em todos os componentes da plataforma, 
            incluindo painéis de clientes, interfaces administrativas e todos os elementos visuais do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;