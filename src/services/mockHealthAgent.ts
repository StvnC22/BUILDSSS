import type { HealthPriority, HealthService, N8nChatResponse } from '@/types'
import { MOCK_HEALTH_SERVICES } from '@/services/healthServices'

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const warningPatterns = [
  'dificultad para respirar', 'no puede respirar', 'dolor fuerte en el pecho', 'perdio el conocimiento',
  'no responde', 'convulsion', 'sangrado abundante', 'intento de suicidio', 'se quiere matar',
]

export async function mockHealthResponse(message: string): Promise<N8nChatResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const text = normalize(message)
  const warnings = warningPatterns.filter((pattern) => text.includes(pattern))
  let priority: HealthPriority = 'PREVENTIVE'
  let score = 20
  if (warnings.length) { priority = 'EMERGENCY'; score = 98 }
  else if (/fiebre|dolor|mareo|vomito|diarrea|presion alta|embaraz/.test(text)) { priority = 'PRIORITY'; score = 72 }
  else if (/cita|centro|hospital|consulta|control|laboratorio|farmacia/.test(text)) { priority = 'ROUTINE'; score = 45 }

  const wantsService = /centro|hospital|consulta|control|cita|servicio|donde|laboratorio|emergencia/.test(text)
  const services: HealthService[] = wantsService || priority === 'EMERGENCY' ? MOCK_HEALTH_SERVICES.slice(0, priority === 'EMERGENCY' ? 1 : 3) : []

  let reply = 'Puedo orientarte con prevención, trámites y búsqueda de servicios de salud en Manta. Cuéntame qué necesitas y en qué sector te encuentras.'
  if (priority === 'EMERGENCY') {
    reply = 'Los síntomas descritos pueden requerir atención inmediata. Busca ayuda de emergencia ahora y evita trasladarte sin apoyo. Pide a una persona que te acompañe o llama al ECU 911. ¿Estás acompañado en este momento?'
  } else if (priority === 'PRIORITY') {
    reply = 'Por lo que describes, conviene una valoración profesional prioritaria. No puedo diagnosticarte, pero sí ayudarte a ubicar un servicio y organizar la información que debes comunicar. ¿En qué sector de Manta te encuentras?'
  } else if (wantsService) {
    reply = 'Encontré opciones de demostración para orientar tu búsqueda. Confirma siempre el horario y la disponibilidad directamente con la institución antes de acudir.'
  } else if (/dengue/.test(text)) {
    reply = 'Para prevenir el dengue, elimina recipientes con agua estancada, mantén tapados los depósitos y usa protección contra mosquitos. Si hay fiebre intensa, dolor abdominal, sangrado o decaimiento marcado, busca valoración profesional.'
  } else if (/adulto mayor|no entiendo|paso a paso/.test(text)) {
    reply = 'Te lo explicaré paso a paso y con instrucciones cortas. Primero dime qué trámite o servicio necesitas, por ejemplo: sacar una cita, encontrar un centro o conocer qué documentos llevar.'
  }

  return {
    reply,
    case: {
      reason: message.slice(0, 180),
      priority_level: priority,
      priority_score: score,
      warning_signs: warnings,
      status: priority === 'EMERGENCY' ? 'PENDING_REVIEW' : 'ORIENTED',
      requires_human_review: priority === 'EMERGENCY',
      summary: `Caso clasificado en modo demo como ${priority}.`,
      reported_symptoms: warnings,
    },
    services,
    sources: [{ title: 'Base demostrativa Manta Cuida IA', organization: 'Datos de ejemplo', verified_at: new Date().toISOString().slice(0, 10) }],
    follow_up: { required: priority === 'EMERGENCY' || priority === 'PRIORITY', suggested_time: priority === 'EMERGENCY' ? 'inmediato' : '24 horas', action: 'confirm_attention' },
    ui: { show_emergency_banner: priority === 'EMERGENCY', show_services: services.length > 0, show_human_review: priority === 'EMERGENCY' },
    agent: 'GPT-5.6 Health Orchestrator (modo demo)',
  }
}
