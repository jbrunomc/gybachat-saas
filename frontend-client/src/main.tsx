import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './App.css';
import { registerServiceWorker } from './lib/serviceWorker';
import { preloadCriticalImages } from './lib/imageOptimizer';

// Registrar Service Worker para cache offline e melhor performance
registerServiceWorker();

// Pré-carregar imagens críticas
preloadCriticalImages([
  // Adicione aqui URLs de imagens críticas que devem ser pré-carregadas
  // Exemplo: logos, backgrounds de login, etc.
]);


// Adicionar meta tags para PWA
if (typeof document !== 'undefined') {
  // Theme color
  const metaThemeColor = document.createElement('meta');
  metaThemeColor.name = 'theme-color';
  metaThemeColor.content = '#3B82F6';
  document.head.appendChild(metaThemeColor);
  
  // Apple touch icon
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/icons/apple-touch-icon.png';
  document.head.appendChild(appleTouchIcon);
  
  // Manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/manifest.json';
  document.head.appendChild(manifestLink);
}

// Definir variável global para socket
window.socket = null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);