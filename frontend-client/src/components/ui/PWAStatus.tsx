import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, Smartphone } from 'lucide-react';

const PWAStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    // Verificar se está instalado como PWA
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleUpdateAvailable = () => {
      setHasUpdate(true);
    };

    checkInstalled();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa:update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa:update-available', handleUpdateAvailable);
    };
  }, []);

  // Só mostrar status se estiver instalado ou houver update
  if (!isInstalled && !hasUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="space-y-2">
        {!isOnline && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Offline</span>
          </div>
        )}

        {hasUpdate && (
          <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 mb-2">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Atualização disponível</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAStatus;