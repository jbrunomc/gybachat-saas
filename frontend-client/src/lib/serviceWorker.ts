/**
 * Service Worker para cache offline e melhor performance
 * Implementa estratégia de cache para diferentes tipos de recursos
 */

// Nome do cache
const CACHE_NAME = 'gybachat-cache-v1';

// Recursos a serem cacheados na instalação
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg'
];

// Estratégias de cache por tipo de recurso
const CACHE_STRATEGIES = {
  // Assets estáticos: cache primeiro, depois rede
  assets: {
    match: /\.(js|css|svg|woff2?)$/,
    strategy: 'cache-first'
  },
  // Imagens: stale-while-revalidate
  images: {
    match: /\.(png|jpe?g|gif|webp)$/,
    strategy: 'stale-while-revalidate'
  },
  // API: rede primeiro, fallback para cache
  api: {
    match: /\/api\//,
    strategy: 'network-first'
  },
  // HTML: network-first para sempre ter a versão mais recente
  html: {
    match: /\.(html)$/,
    strategy: 'network-first'
  }
};

// Código do Service Worker
const serviceWorkerCode = `
// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('${CACHE_NAME}').then((cache) => {
      return cache.addAll([
        ${PRECACHE_RESOURCES.map(r => `'${r}'`).join(',\n        ')}
      ]);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== '${CACHE_NAME}') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de socket
  if (event.request.url.includes('/socket.io/')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Estratégia para assets estáticos
  if (${CACHE_STRATEGIES.assets.match}.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
  // Estratégia para imagens
  else if (${CACHE_STRATEGIES.images.match}.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
  // Estratégia para API
  else if (${CACHE_STRATEGIES.api.match}.test(url.pathname)) {
    event.respondWith(networkFirst(event.request));
  }
  // Estratégia para HTML
  else if (${CACHE_STRATEGIES.html.match}.test(url.pathname) || url.pathname === '/') {
    event.respondWith(networkFirst(event.request));
  }
  // Estratégia padrão
  else {
    event.respondWith(networkFirst(event.request));
  }
});

// Estratégia: Cache First, fallback para rede
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return fetch(request).then((response) => {
    if (response.ok) {
      const clonedResponse = response.clone();
      caches.open('${CACHE_NAME}').then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    return response;
  });
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const clonedResponse = response.clone();
      caches.open('${CACHE_NAME}').then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    return response;
  }).catch(() => {
    // Se a rede falhar e não tivermos cache, retornar uma resposta de fallback para imagens
    if (request.url.match(${CACHE_STRATEGIES.images.match})) {
      return caches.match('/assets/image-placeholder.svg');
    }
    throw new Error('Network and cache both failed');
  });
  
  return cachedResponse || fetchPromise;
}

// Estratégia: Network First, fallback para cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      caches.open('${CACHE_NAME}').then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Para HTML, retornar página offline
    if (request.url.match(${CACHE_STRATEGIES.html.match}) || request.url.endsWith('/')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Função para sincronizar mensagens pendentes
async function syncMessages() {
  // Implementação de sincronização de mensagens pendentes
  console.log('Syncing pending messages...');
}
`;

/**
 * Registra o Service Worker
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Criar um blob com o código do Service Worker
      const blob = new Blob([serviceWorkerCode], { type: 'text/javascript' });
      const serviceWorkerUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(serviceWorkerUrl)
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