import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  const base = process.env.N8N_BASE_URL?.replace(/\/$/, '')
  if (!base) return res.status(503).json({ error: 'N8N_BASE_URL no está configurada' })
  const { followup_id: id, status, reviewed_by: reviewedBy } = req.body ?? {}
  if (!id || !reviewedBy || !['approved', 'edited', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Solicitud de revisión inválida' })
  }
  try {
    const response = await fetch(`${base}/webhook/health/followup/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_INTERNAL_TOKEN ? { 'X-Internal-Token': process.env.N8N_INTERNAL_TOKEN } : {}),
      },
      body: JSON.stringify(req.body),
    })
    const raw = await response.text()
    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8')
    return res.send(raw)
  } catch {
    return res.status(502).json({ error: 'No se pudo conectar con n8n' })
  }
}
