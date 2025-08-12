// Utilitários de Performance para Gybachat Landing Page

// Lazy loading de componentes com fallback
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense 
      fallback={fallback || <div className="animate-pulse bg-gray-200 rounded h-32" />}
    >
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Debounce para inputs e pesquisas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle para scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer para lazy loading de imagens
export const createImageObserver = (callback) => {
  if (!window.IntersectionObserver) {
    // Fallback para browsers antigos
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1
    }
  );
};

// Preload de recursos críticos
export const preloadResource = (href, as = 'script', crossorigin = null) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  document.head.appendChild(link);
};

// Preconnect para domínios externos
export const preconnectDomain = (domain) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  document.head.appendChild(link);
};

// Cache de API com TTL
class APICache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutos default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Otimização de imagens
export const optimizeImage = (src, width = null, quality = 80) => {
  // Se for uma URL externa, retorna como está
  if (src.startsWith('http')) {
    return src;
  }

  // Para imagens locais, adiciona parâmetros de otimização
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  params.append('q', quality);
  params.append('f', 'webp');

  return `${src}?${params.toString()}`;
};

// Detecção de conexão lenta
export const isSlowConnection = () => {
  if (!navigator.connection) return false;
  
  const connection = navigator.connection;
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    (connection.effectiveType === '3g' && connection.downlink < 1.5)
  );
};

// Carregamento adaptativo baseado na conexão
export const adaptiveLoading = {
  shouldLoadHighQuality: () => !isSlowConnection(),
  shouldPreloadImages: () => !isSlowConnection(),
  shouldEnableAnimations: () => !isSlowConnection() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// Bundle analyzer helper (apenas em desenvolvimento)
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available at: npm run build -- --analyze');
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Medir tempo de carregamento de componentes
  measureComponentLoad: (componentName) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} loaded in ${endTime - startTime}ms`);
    };
  },

  // Medir Core Web Vitals
  measureWebVitals: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (performance.memory) {
    const memory = performance.memory;
    console.log({
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Cleanup de event listeners
export const createCleanupManager = () => {
  const cleanupFunctions = [];

  return {
    add: (cleanupFn) => cleanupFunctions.push(cleanupFn),
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.length = 0;
    }
  };
};

// Otimização de re-renders
export const createMemoizedSelector = (selector) => {
  let lastArgs = [];
  let lastResult;

  return (...args) => {
    if (args.length !== lastArgs.length || args.some((arg, i) => arg !== lastArgs[i])) {
      lastArgs = args;
      lastResult = selector(...args);
    }
    return lastResult;
  };
};

export default {
  lazyLoad,
  debounce,
  throttle,
  createImageObserver,
  preloadResource,
  preconnectDomain,
  apiCache,
  optimizeImage,
  isSlowConnection,
  adaptiveLoading,
  performanceMonitor,
  registerServiceWorker,
  monitorMemoryUsage,
  createCleanupManager,
  createMemoizedSelector
};

