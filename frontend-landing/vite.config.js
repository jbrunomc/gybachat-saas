import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Otimizações para produção
  build: {
    // Minificação agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados para melhor cache
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          utils: ['clsx']
        },
        // Nomes de arquivo com hash para cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Compressão e otimização
    cssCodeSplit: true,
    sourcemap: false, // Desabilitar sourcemaps em produção
    
    // Tamanho máximo de chunk (500kb)
    chunkSizeWarningLimit: 500,
    
    // Otimizações de assets
    assetsInlineLimit: 4096, // Inline assets menores que 4kb
  },
  
  // Resolução de paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services')
    }
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Configurações de CSS
  css: {
    // PostCSS para otimizações
    postcss: {
      plugins: [
        // Autoprefixer será adicionado automaticamente
      ]
    },
    // Compressão CSS
    devSourcemap: false
  },
  
  // Configurações de assets
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf'],
  
  // Configurações de ambiente
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  },
  
  // Configurações de base para deploy
  base: '/'
})

