import type { HealthCase, HealthService, HealthSource, N8nChatResponse } from '@/types'
import { getSessionId } from '@/services/chatSession'

const webhookUrl = '/api/n8n-chat'

function text(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value == null) return ''
  return String(value).trim()
}

function unwrap(value: unknown, depth = 0): unknown {
  if (depth > 5 || typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value
  try { return unwrap(JSON.parse(trimmed), depth + 1) } catch { return value }
}

function asObject(value: unknown): Record<string, unknown> {
  const unwrapped = unwrap(value)
  return unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) ? unwrapped as Record<string, unknown> : {}
}

function extractReply(value: unknown): string {
  const obj = asObject(value)
  for (const key of ['reply', 'output', 'text', 'response', 'answer']) {
    const candidate = obj[key]
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    if (candidate && typeof candidate === 'object') {
      const nested = extractReply(candidate)
      if (nested) return nested
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) { const found = extractReply(item); if (found) return found }
  }
  return typeof value === 'string' ? value.trim() : ''
}

function parseResponse(value: unknown): N8nChatResponse {
  const obj = asObject(value)
  const reply = extractReply(value)
  if (!reply) throw new Error('n8n respondió sin un campo reply/output legible.')
  return {
    reply,
    case: (obj.case ?? obj.health_case) as Partial<HealthCase> | undefined,
    services: Array.isArray(obj.services) ? obj.services as HealthService[] : [],
    sources: Array.isArray(obj.sources) ? obj.sources as HealthSource[] : [],
    follow_up: obj.follow_up as N8nChatResponse['follow_up'],
    ui: obj.ui as N8nChatResponse['ui'],
    agent: text(obj.agent) || undefined,
    error_code: text(obj.error_code) || undefined,
  }
}

export async function sendToN8n(payload: { message: string; sessionId?: string; conversationId?: string; userId?: string }): Promise<N8nChatResponse> {
  const message = payload.message.trim()
  if (!message) throw new Error('El mensaje está vacío.')

  let response: Response
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: { id: payload.sessionId || getSessionId() },
        conversation_id: payload.conversationId,
        user_id: payload.userId,
        message: { content: message },
        channel: 'web',
        locale: 'es-EC',
      }),
    })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'error de red'
    throw new Error(`No se pudo conectar con n8n: ${detail}`)
  }

  const raw = await response.text()
  if (!response.ok) {
    if (response.status >= 500) throw new Error('El agente de salud no está disponible. Revisa la ejecución en n8n.')
    throw new Error(`Error HTTP ${response.status}: ${raw.slice(0, 140)}`)
  }
  if (!raw.trim()) throw new Error('n8n devolvió una respuesta vacía.')
  try { return parseResponse(JSON.parse(raw)) } catch { return parseResponse(raw) }
}
