import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Star } from 'lucide-react';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };
    
    checkInstalled();
    
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 PWA install prompt disponível');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA instalado com sucesso');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Não mostrar se já estiver instalado
  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      const result = await deferredPrompt.prompt();
      console.log('👍 Resultado da instalação:', result);
      
      if (result.outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA');
      } else {
        console.log('❌ Usuário recusou instalar o PWA');
      }
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Instalar App
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Instale nosso app para uma experiência mais rápida e acesso offline!
      </p>

      <div className="flex items-center space-x-2 mb-4">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Experiência premium
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Agora não
        </button>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isInstalling ? 'Instalando...' : 'Instalar'}</span>
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;