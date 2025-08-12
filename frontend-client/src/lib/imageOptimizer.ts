/**
 * Utilitário para otimização de imagens
 * Implementa lazy loading, dimensionamento responsivo e formatos modernos
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'cover' | 'contain' | 'fill';
}

/**
 * Otimiza URLs de imagens para CDN
 * Funciona com imagens do Pexels, Unsplash e outros CDNs populares
 */
export function optimizeImage(url: string, options: ImageOptions = {}): string {
  if (!url) return '';
  
  // Imagens já otimizadas ou SVGs
  if (url.includes('data:image') || url.endsWith('.svg')) {
    return url;
  }

  // Otimização para Unsplash
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const width = options.width || 800;
    const height = options.height;
    const quality = options.quality || 80;
    const format = options.format || 'webp';
    const fit = options.fit || 'cover';
    
    let optimizedUrl = `${baseUrl}?fm=${format}&q=${quality}&fit=${fit}&w=${width}`;
    if (height) optimizedUrl += `&h=${height}`;
    
    return optimizedUrl;
  }
  
  // Otimização para Pexels
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    const width = options.width || 800;
    const quality = options.quality || 80;
    
    // Pexels usa um formato diferente de parâmetros
    return `${baseUrl}?auto=compress&cs=tinysrgb&w=${width}&q=${quality}`;
  }
  
  // Para outras imagens, retornar URL original
  return url;
}

/**
 * Gera srcset para imagens responsivas
 */
export function generateSrcSet(url: string, options: ImageOptions = {}): string {
  if (!url || url.includes('data:image') || url.endsWith('.svg')) {
    return '';
  }
  
  const widths = [320, 640, 960, 1280, 1920];
  const format = options.format || 'webp';
  const quality = options.quality || 80;
  
  return widths
    .map(width => {
      const optimizedUrl = optimizeImage(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Componente de imagem otimizada para React
 */
export const getImageProps = (url: string, options: ImageOptions = {}) => {
  const optimizedSrc = optimizeImage(url, options);
  const srcSet = generateSrcSet(url, options);
  
  return {
    src: optimizedSrc,
    srcSet: srcSet || undefined,
    loading: 'lazy',
    decoding: 'async',
    width: options.width,
    height: options.height,
    style: {
      objectFit: options.fit || 'cover',
    },
  };
};

/**
 * Pré-carrega imagens críticas
 */
export function preloadCriticalImages(urls: string[]): void {
  if (typeof document === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeImage(url, { width: 800, format: 'webp' });
    document.head.appendChild(link);
  });
}

export default {
  optimizeImage,
  generateSrcSet,
  getImageProps,
  preloadCriticalImages
};