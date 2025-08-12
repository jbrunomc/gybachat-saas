/**
 * Utilitário para preload de rotas e recursos
 * Melhora a performance de navegação prefetchando rotas prováveis
 */

// Mapeamento de rotas para recursos críticos
const routeResources: Record<string, string[]> = {
  '/client/dashboard': [
    '/assets/dashboard-icons.svg',
    '/assets/client-dashboard-bg.webp'
  ],
  '/client/conversations': [
    '/assets/chat-icons.svg'
  ],
  '/master/dashboard': [
    '/assets/master-dashboard-bg.webp'
  ]
};

/**
 * Prefetch de recursos para uma rota específica
 */
export function prefetchRouteResources(route: string): void {
  if (typeof document === 'undefined') return;
  
  const resources = routeResources[route] || [];
  
  resources.forEach(resource => {
    // Prefetch de imagens
    if (resource.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      const img = new Image();
      img.src = resource;
    }
    // Prefetch de outros recursos
    else {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    }
  });
}

/**
 * Prefetch de rotas prováveis baseado na rota atual
 */
export function prefetchLikelyRoutes(currentRoute: string): void {
  if (typeof document === 'undefined') return;
  
  // Mapeamento de rotas prováveis
  const likelyRoutes: Record<string, string[]> = {
    '/client/dashboard': [
      '/client/conversations',
      '/client/whatsapp',
      '/client/tags'
    ],
    '/client/conversations': [
      '/client/dashboard',
      '/client/tags',
      '/client/queue'
    ],
    '/master/dashboard': [
      '/master/companies',
      '/master/themes',
      '/master/settings'
    ]
  };
  
  const routesToPrefetch = likelyRoutes[currentRoute] || [];
  
  routesToPrefetch.forEach(route => {
    // Prefetch de recursos da rota
    prefetchRouteResources(route);
    
    // Prefetch da rota em si (para frameworks que suportam)
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

export default {
  prefetchRouteResources,
  prefetchLikelyRoutes
};