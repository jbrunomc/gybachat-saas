/**
 * Service Worker para cache offline e melhor performance
 * Implementa estratégia de cache para diferentes tipos de recursos
 */

/**
 * Registra o Service Worker
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
}

/**
 * Verifica se o app está sendo executado em modo offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Limpa o cache do Service Worker
 */
export function clearCache(): Promise<boolean> {
  const CACHE_NAME = 'gybachat-cache-v1';
  if ('caches' in window) {
    return caches.delete(CACHE_NAME)
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}

export default {
  registerServiceWorker,
  isOffline,
  clearCache
};