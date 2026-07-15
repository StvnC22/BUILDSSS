import type { VercelRequest, VercelResponse } from '@vercel/node'

function allowedOrigin(req: VercelRequest): string {
  const configured = process.env.APP_ALLOWED_ORIGIN?.trim()
  if (configured) return configured
  const origin = req.headers.origin
  return typeof origin === 'string' ? origin : '*'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin(req))
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim()
  if (!webhookUrl) return res.status(503).json({ error: 'N8N_WEBHOOK_URL no está configurada' })

  const message = req.body?.message?.content
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message.content es obligatorio' })
  }
  if (message.length > 6000) return res.status(413).json({ error: 'Mensaje demasiado largo' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(process.env.N8N_INTERNAL_TOKEN ? { 'X-Internal-Token': process.env.N8N_INTERNAL_TOKEN } : {}),
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    })
    const raw = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
    return res.send(raw)
  } catch (error) {
    const messageText = error instanceof Error && error.name === 'AbortError'
      ? 'El agente excedió el tiempo de respuesta'
      : 'No se pudo conectar con n8n'
    return res.status(502).json({ error: messageText })
  } finally {
    clearTimeout(timeout)
  }
}
