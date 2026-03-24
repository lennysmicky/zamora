// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Supprime console.* et debugger en production
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  //  Configuration de build optimisée
  build: {
    minify: 'esbuild', // Utilise esbuild pour minifier (plus rapide)
    sourcemap: false,  // Désactive les sourcemaps en production (optionnel)
    
    rollupOptions: {
      output: {
        // Suppression des commentaires en production
        manualChunks: undefined,
      },
    },
  },
  
  // Variables d'environnement globales (optionnel)
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})