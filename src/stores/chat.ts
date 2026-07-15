import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Conversacion, Mensaje, MensajeRol, MessageMetadata, N8nChatResponse } from '@/types'
import { getSupabase, useMock } from '@/services/supabase'
import { sendToN8n } from '@/services/n8n'
import { mockHealthResponse } from '@/services/mockHealthAgent'
import { clearSessionId, getSessionId, setSessionId } from '@/services/chatSession'
import { useAuthStore } from '@/stores/auth'
import { useHealthCasesStore } from '@/stores/healthCases'
import { softDeleteConversation } from '@/services/chatHistory'

const mockConversations: Conversacion[] = []
const mockMessages: Record<string, Mensaje[]> = {}
const now = () => new Date().toISOString()

function titleFromMessage(value: string) {
  const text = value.trim().replace(/\s+/g, ' ')
  return text.length > 46 ? `${text.slice(0, 46)}…` : text || 'Orientación de salud'
}

export const useChatStore = defineStore('chat', () => {
  const conversaciones = ref<Conversacion[]>([])
  const mensajes = ref<Mensaje[]>([])
  const conversacionActiva = ref<Conversacion | null>(null)
  const escribiendo = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const ultimaRespuesta = ref<N8nChatResponse | null>(null)

  async function cargarConversaciones() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    try {
      if (useMock) {
        conversaciones.value = mockConversations.filter((item) => item.user_id === auth.user?.id && item.estado !== 'eliminada')
      } else {
        const { data, error: loadError } = await getSupabase().from('conversaciones').select('*').eq('user_id', auth.user.id).neq('estado', 'eliminada').order('updated_at', { ascending: false })
        if (loadError) throw loadError
        conversaciones.value = (data ?? []) as Conversacion[]
      }
    } catch (cause) { error.value = cause instanceof Error ? cause.message : 'No se pudo cargar el historial.' }
    finally { loading.value = false }
  }

  async function crearConversacion() {
    const auth = useAuthStore()
    if (!auth.user) return null
    clearSessionId()
    const id = crypto.randomUUID()
    setSessionId(id)
    const conversation: Conversacion = { id, user_id: auth.user.id, titulo: 'Nueva orientación', tipo: 'orientacion', estado: 'activa', created_at: now(), updated_at: now() }
    if (useMock) mockConversations.unshift(conversation)
    else {
      const { data, error: createError } = await getSupabase().from('conversaciones').insert({ user_id: auth.user.id, titulo: conversation.titulo, tipo: conversation.tipo }).select().single()
      if (createError) throw createError
      Object.assign(conversation, data)
      setSessionId(conversation.id)
    }
    conversaciones.value.unshift(conversation)
    conversacionActiva.value = conversation
    mensajes.value = []
    ultimaRespuesta.value = null
    return conversation
  }

  async function obtenerOCrearConversacion() {
    await cargarConversaciones()
    if (conversaciones.value[0]) await seleccionarConversacion(conversaciones.value[0])
    else await crearConversacion()
  }

  async function cargarMensajes(conversationId: string) {
    if (useMock) mensajes.value = [...(mockMessages[conversationId] ?? [])]
    else {
      const { data, error: loadError } = await getSupabase().from('mensajes').select('*').eq('conversacion_id', conversationId).order('created_at')
      if (loadError) throw loadError
      mensajes.value = (data ?? []) as Mensaje[]
    }
  }

  async function seleccionarConversacion(conversation: Conversacion) {
    conversacionActiva.value = conversation
    setSessionId(conversation.id)
    ultimaRespuesta.value = null
    await cargarMensajes(conversation.id)
    const cases = useHealthCasesStore()
    await cases.loadCases()
    cases.selectByConversation(conversation.id)
  }

  function pushLocal(conversationId: string, role: MensajeRol, content: string, metadata: MessageMetadata = {}) {
    const message: Mensaje = { id: crypto.randomUUID(), conversacion_id: conversationId, rol: role, contenido: content, metadata, created_at: now() }
    mensajes.value.push(message)
    if (useMock) (mockMessages[conversationId] ||= []).push(message)
    return message
  }

  async function persist(message: Mensaje) {
    if (useMock) return
    const { error: insertError } = await getSupabase().from('mensajes').insert({ conversacion_id: message.conversacion_id, rol: message.rol, contenido: message.contenido, metadata: message.metadata })
    if (insertError) throw insertError
  }

  async function renombrarConversacion(id: string, title: string) {
    const item = conversaciones.value.find((conversation) => conversation.id === id)
    if (!item) return
    item.titulo = title
    item.updated_at = now()
    if (!useMock) await getSupabase().from('conversaciones').update({ titulo: title }).eq('id', id)
  }

  async function eliminarConversacion(id: string) {
    const auth = useAuthStore()
    if (!auth.user) return false
    if (useMock) {
      const item = mockConversations.find((conversation) => conversation.id === id)
      if (item) item.estado = 'eliminada'
    } else await softDeleteConversation(auth.user.id, id)
    conversaciones.value = conversaciones.value.filter((conversation) => conversation.id !== id)
    if (conversacionActiva.value?.id === id) await crearConversacion()
    return true
  }

  async function enviarMensaje(content: string) {
    const auth = useAuthStore()
    const cases = useHealthCasesStore()
    const conversation = conversacionActiva.value
    const value = content.trim()
    if (!auth.user || !conversation || !value) return
    error.value = null
    const localUser = pushLocal(conversation.id, 'usuario', value)
    if (mensajes.value.filter((item) => item.rol === 'usuario').length === 1) void renombrarConversacion(conversation.id, titleFromMessage(value))
    try { await persist(localUser) } catch { error.value = 'El mensaje se mostró, pero no pudo guardarse en el historial.' }

    escribiendo.value = true
    try {
      const response = useMock
        ? await mockHealthResponse(value)
        : await sendToN8n({ message: value, sessionId: getSessionId(), conversationId: conversation.id, userId: auth.user.id })
      ultimaRespuesta.value = response
      const metadata: MessageMetadata = {
        priority: response.case?.priority_level,
        sources: response.sources,
        services: response.services,
        show_emergency_banner: response.ui?.show_emergency_banner,
        requires_human_review: response.case?.requires_human_review,
      }
      const localAssistant = pushLocal(conversation.id, 'asistente', response.reply, metadata)
      try { await persist(localAssistant) } catch { /* visible locally */ }
      await cases.upsertFromAgent(conversation.id, response)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo contactar al agente.'
      error.value = message
      const lower = value.toLowerCase()
      if (/no puede respirar|dificultad para respirar|dolor.*pecho|no responde|convulsion|sangrado abundante/.test(lower)) {
        pushLocal(conversation.id, 'asistente', 'No fue posible consultar al agente, pero el mensaje contiene una posible señal de alarma. Busca atención inmediata o llama al ECU 911. No esperes una nueva respuesta del sistema.')
      }
    } finally { escribiendo.value = false }
  }

  return { conversaciones, mensajes, conversacionActiva, escribiendo, loading, error, ultimaRespuesta, cargarConversaciones, crearConversacion, obtenerOCrearConversacion, seleccionarConversacion, cargarMensajes, enviarMensaje, renombrarConversacion, eliminarConversacion }
})
