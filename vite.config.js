import path from 'path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    watch: {
      usePolling: true,
      interval: 200,
      followSymlinks: true,
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/*.log',
        '!**/node_modules/react-animated-select/**'
      ]
    },
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    exclude: ['react-animated-select']
  }
})
