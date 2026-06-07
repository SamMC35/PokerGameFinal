import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/createUser': 'http://localhost:8080',
      '/getUser':    'http://localhost:8080',
      '/room': {
        target: 'http://localhost:8080',
        // Don't proxy browser navigation requests (Accept: text/html) — those are React routes
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return req.url
        },
      },
      '/addPlayerToRoom': 'http://localhost:8080',
      '/startRoom':       'http://localhost:8080',
      '/state':           'http://localhost:8080',
      '/ws':         { target: 'http://localhost:8080', ws: true },
    },
  },
})
