// Service Worker para Gybachat Landing Page
// Otimizado para performance em VM

const CACHE_NAME = 'gybachat-landing-v1.0.0';
const STATIC_CACHE = 'gybachat-static-v1.0.0';
const DYNAMIC_CACHE = 'gybachat-dynamic-v1.0.0';

// Recursos para cache imediato (críticos)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS e JS serão adicionados automaticamente pelo build
];

// Recursos para cache sob demanda
const CACHE_STRATEGIES = {
  // Cache first para assets estáticos
  static: [
    /\.(?:js|css|woff|woff2|ttf|eot)$/,
    /\/assets\//
  ],
  
  // Network first para API calls
  api: [
    /\/api\//
  ],
  
  // Stale while revalidate para imagens
  images: [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /unsplash\.com/,
    /images\./
  ]
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Installation failed', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Limpar caches antigos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests de extensões do browser
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Estratégias de cache
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Cache First para assets estáticos
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Network First para API calls
    if (isApiCall(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Stale While Revalidate para imagens
    if (isImage(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Network First para HTML (landing page)
    if (isHTMLRequest(request)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Fallback para network
    return await fetch(request);
    
  } catch (error) {
    console.error('SW: Request failed', error);
    
    // Fallback para offline
    if (isHTMLRequest(request)) {
      const cache = await caches.open(STATIC_CACHE);
      return await cache.match('/index.html');
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch em background para atualizar cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Retorna cache se disponível, senão aguarda network
  return cached || fetchPromise;
}

// Helpers para identificar tipos de request
function isStaticAsset(url) {
  return CACHE_STRATEGIES.static.some(pattern => pattern.test(url.pathname));
}

function isApiCall(url) {
  return CACHE_STRATEGIES.api.some(pattern => pattern.test(url.pathname));
}

function isImage(url) {
  return CACHE_STRATEGIES.images.some(pattern => pattern.test(url.href));
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Background Sync para requests offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sync de dados quando voltar online
  console.log('SW: Background sync triggered');
}

// Push notifications (para futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'gybachat-notification'
      })
    );
  }
});

// Cleanup de cache periódico
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName === DYNAMIC_CACHE) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Manter apenas os 50 itens mais recentes
      if (requests.length > 50) {
        const toDelete = requests.slice(0, requests.length - 50);
        await Promise.all(toDelete.map(request => cache.delete(request)));
      }
    }
  }
  
  console.log('SW: Cache cleanup completed');
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  // Log apenas em desenvolvimento
  if (self.location.hostname === 'localhost') {
    const start = performance.now();
    
    event.respondWith(
      handleRequest(event.request).then((response) => {
        const end = performance.now();
        console.log(`SW: ${event.request.url} - ${end - start}ms`);
        return response;
      })
    );
  }
});

console.log('SW: Service Worker loaded successfully');

