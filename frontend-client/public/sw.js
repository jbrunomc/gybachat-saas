// Service Worker para Gybachat PWA
// Cache offline, push notifications e background sync

const CACHE_NAME = 'gybachat-cache-v1';
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cacheando recursos essenciais');
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
  
  // Força o novo service worker a assumir controle imediatamente
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle de todas as abas abertas
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de socket e chrome-extension
  if (event.request.url.includes('/socket.io/') || 
      event.request.url.includes('chrome-extension://') ||
      event.request.url.includes('moz-extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Estratégia para assets estáticos (JS, CSS, fontes)
  if (/\.(js|css|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
  // Estratégia para imagens
  else if (/\.(png|jpe?g|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
  // Estratégia para API
  else if (/\/api\//.test(url.pathname)) {
    event.respondWith(networkFirst(event.request));
  }
  // Estratégia para HTML
  else if (/\.(html)$/.test(url.pathname) || url.pathname === '/') {
    event.respondWith(networkFirst(event.request));
  }
  // Estratégia padrão
  else {
    event.respondWith(networkFirst(event.request));
  }
});

// Estratégia: Cache First, fallback para rede
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    return response;
  } catch (error) {
    console.error('Cache first failed:', error);
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const clonedResponse = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    return response;
  }).catch(() => {
    // Se a rede falhar e não tivermos cache, retornar resposta de fallback
    if (request.url.match(/\.(png|jpe?g|gif|webp)$/)) {
      return new Response('', { status: 200, statusText: 'OK' });
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
      caches.open(CACHE_NAME).then((cache) => {
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
    if (request.url.match(/\.(html)$/) || request.url.endsWith('/')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Push notifications handler - PRONTO PARA BACKEND
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification recebida:', event);
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nova mensagem recebida',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'gybachat-notification',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    requireInteraction: data.urgent || false,
    silent: false,
    vibrate: data.urgent ? [200, 100, 200] : [100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Gybachat', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/client/conversations')
    );
  }
});

// Sincronização em background - PRONTO PARA BACKEND
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  if (event.tag === 'sync-conversations') {
    event.waitUntil(syncConversations());
  }
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Função para sincronizar mensagens pendentes - AGUARDANDO BACKEND
async function syncMessages() {
  console.log('🔄 Syncing pending messages (aguardando backend)...');
  // TODO: Implementar com backend
  // Buscar mensagens pendentes do IndexedDB
  // Enviar para o backend quando online
}

// Função para sincronizar conversas - AGUARDANDO BACKEND
async function syncConversations() {
  console.log('🔄 Syncing conversations (aguardando backend)...');
  // TODO: Implementar com backend
  // Sincronizar estado das conversas
}

// Função para sincronizar notificações - AGUARDANDO BACKEND
async function syncNotifications() {
  console.log('🔄 Syncing notifications (aguardando backend)...');
  // TODO: Implementar com backend
  // Marcar notificações como lidas
}

// Message handler para comunicação com a aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Gybachat Service Worker carregado e pronto!');