import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })
  const base = process.env.N8N_BASE_URL?.replace(/\/$/, '')
  if (!base) return res.status(503).json({ error: 'N8N_BASE_URL no está configurada' })
  try {
    const response = await fetch(`${base}/webhook/health/followup/pending`, {
      headers: process.env.N8N_INTERNAL_TOKEN ? { 'X-Internal-Token': process.env.N8N_INTERNAL_TOKEN } : {},
    })
    const raw = await response.text()
    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8')
    return res.send(raw)
  } catch {
    return res.status(502).json({ error: 'No se pudo consultar n8n' })
  }
}
