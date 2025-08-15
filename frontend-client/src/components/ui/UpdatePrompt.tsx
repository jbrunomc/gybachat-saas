import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, Sparkles } from 'lucide-react';

interface UpdatePromptProps {
  onClose?: () => void;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onClose }) => {
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    version?: string;
    features?: string[];
  }>({});

  useEffect(() => {
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUpdateInfo(customEvent.detail);
      setShow(true);
    };

    window.addEventListener('pwa:update-available', handleUpdateAvailable);
    
    return () => {
      window.removeEventListener('pwa:update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // TODO: Implementar com updateManager quando backend estiver pronto
      console.log('🔄 Update será implementado com backend');
      // A página será recarregada automaticamente
    } catch (error) {
      console.error('Erro ao aplicar atualização:', error);
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-in-right">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Nova Versão Disponível
              </h3>
              {updateInfo.version && (
                <p className="text-xs text-gray-500">{updateInfo.version}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {updateInfo.features && updateInfo.features.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Novidades:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {updateInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Atualizar</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleClose}
            className="px-3 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;