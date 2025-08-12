import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Instagram, Facebook, MessageCircle, Settings, Info, AlertCircle } from 'lucide-react';
import SocialMediaConnection from './SocialMediaConnection';
import { useAuthStore } from '../../stores/authStore';

const SocialMediaIntegration: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('instagram');
  const companyId = user?.companyId || 'company-1';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Integração com Redes Sociais</h2>
        <p className="text-gray-600">
          Conecte suas contas de Instagram e Facebook para gerenciar todas as mensagens em um único lugar
        </p>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Integração Unificada
              </h3>
              <p className="text-sm text-blue-800">
                Todas as mensagens de diferentes canais serão unificadas na mesma interface de atendimento, 
                permitindo que você gerencie WhatsApp, Instagram e Facebook em um único lugar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('instagram')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'instagram'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <span>Instagram Direct</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('facebook')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'facebook'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Facebook className="h-4 w-4" />
                <span>Facebook Messenger</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-b-2 border-gray-500 text-gray-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'instagram' && (
            <SocialMediaConnection companyId={companyId} platform="instagram" />
          )}
          
          {activeTab === 'facebook' && (
            <SocialMediaConnection companyId={companyId} platform="facebook" />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Integração</h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Distribuição de Mensagens</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure como as mensagens de diferentes canais serão distribuídas para os agentes
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="unified-queue"
                          checked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="unified-queue" className="text-sm text-gray-700">
                          Fila unificada para todos os canais
                        </label>
                      </div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Recomendado
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="separate-queues"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="separate-queues" className="ml-2 text-sm text-gray-700">
                        Filas separadas por canal
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="agent-specialization"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="agent-specialization" className="ml-2 text-sm text-gray-700">
                        Permitir especialização de agentes por canal
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Automações</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure automações específicas para cada canal
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="welcome-message"
                        checked={true}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="welcome-message" className="ml-2 text-sm text-gray-700">
                        Mensagem de boas-vindas automática
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="away-message"
                        checked={true}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="away-message" className="ml-2 text-sm text-gray-700">
                        Mensagem de ausência fora do horário comercial
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto-tagging"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto-tagging" className="ml-2 text-sm text-gray-700">
                        Tagging automático baseado no canal
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Limites e Restrições</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="message-limit" className="block text-sm text-gray-700 mb-1">
                        Limite de mensagens por minuto (Instagram)
                      </label>
                      <input
                        type="number"
                        id="message-limit"
                        defaultValue={15}
                        min={1}
                        max={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recomendado: 15 mensagens/minuto para evitar limitações da API
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="message-limit-fb" className="block text-sm text-gray-700 mb-1">
                        Limite de mensagens por minuto (Facebook)
                      </label>
                      <input
                        type="number"
                        id="message-limit-fb"
                        defaultValue={20}
                        min={1}
                        max={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recomendado: 20 mensagens/minuto para evitar limitações da API
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Limitações das APIs</h4>
                      <p className="text-sm text-yellow-700">
                        As APIs do Instagram e Facebook têm limitações específicas. Certifique-se de seguir as 
                        políticas de uso para evitar bloqueios temporários ou permanentes.
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc pl-5">
                        <li>Responda às mensagens dentro de 24 horas</li>
                        <li>Evite enviar mensagens em massa</li>
                        <li>Respeite os limites de taxa da API</li>
                        <li>Obtenha consentimento antes de enviar mensagens promocionais</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;