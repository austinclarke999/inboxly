import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'public/landing.html',
        dashboard: 'public/dashboard.html',
        inbox: 'public/inbox.html',
        subscriptions: 'public/subscriptions.html',
        settings: 'public/settings.html',
      }
    }
  },
  server: {
    open: '/landing.html'
  }
})
