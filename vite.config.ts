import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const n8nChat = env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/health/chat'
  const n8nBase = env.VITE_N8N_BASE_URL || 'http://localhost:5678'

  let chatTarget = 'http://localhost:5678'
  let chatPath = '/webhook/health/chat'
  try {
    const url = new URL(n8nChat)
    chatTarget = url.origin
    chatPath = url.pathname
  } catch {
    // Conserva los valores locales.
  }

  let followupTarget = n8nBase
  try {
    followupTarget = new URL(n8nBase).origin
  } catch {
    // Conserva el valor configurado.
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        '/api/n8n-chat': {
          target: chatTarget,
          changeOrigin: true,
          secure: false,
          rewrite: () => chatPath,
        },
        '/api/followup/pending': {
          target: followupTarget,
          changeOrigin: true,
          secure: false,
          rewrite: () => '/webhook/health/followup/pending',
        },
        '/api/followup/review': {
          target: followupTarget,
          changeOrigin: true,
          secure: false,
          rewrite: () => '/webhook/health/followup/review',
        },
      },
    },
  }
})
