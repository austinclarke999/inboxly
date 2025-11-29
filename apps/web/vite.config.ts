import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        landing: 'landing.html',
        dashboard: 'dashboard.html',
        inbox: 'inbox.html',
        subscriptions: 'subscriptions.html',
        settings: 'settings.html',
      }
    }
  },
  server: {
    open: '/landing.html'
  }
})
