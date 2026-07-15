import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CaseAction, HealthCase, HealthCaseStatus, N8nChatResponse } from '@/types'
import { getSupabase, useMock } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'

const now = () => new Date().toISOString()
const mockCases: HealthCase[] = []
const mockActions: CaseAction[] = []

export const useHealthCasesStore = defineStore('healthCases', () => {
  const cases = ref<HealthCase[]>([])
  const actions = ref<CaseAction[]>([])
  const activeCase = ref<HealthCase | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pendingReview = computed(() => cases.value.filter((item) => item.requires_human_review || item.status === 'PENDING_REVIEW'))

  async function loadCases() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    error.value = null
    try {
      if (useMock) {
        cases.value = auth.canReviewCases ? [...mockCases] : mockCases.filter((item) => item.user_id === auth.user?.id)
        return
      }
      let query = getSupabase().from('health_cases').select('*, profiles(full_name,email,role)').order('updated_at', { ascending: false })
      if (!auth.canReviewCases) query = query.eq('user_id', auth.user.id)
      const { data, error: loadError } = await query
      if (loadError) throw loadError
      cases.value = (data ?? []) as HealthCase[]
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'No se pudieron cargar los casos.'
    } finally { loading.value = false }
  }

  async function upsertFromAgent(conversationId: string, response: N8nChatResponse) {
    const auth = useAuthStore()
    if (!auth.user || !response.case) return
    const existing = cases.value.find((item) => item.conversation_id === conversationId)
    const partial = response.case
    const payload: Omit<HealthCase, 'id' | 'created_at' | 'updated_at'> = {
      user_id: auth.user.id,
      conversation_id: conversationId,
      reported_age: partial.reported_age ?? existing?.reported_age ?? null,
      location: partial.location ?? existing?.location ?? auth.profile?.city ?? 'Manta',
      sector: partial.sector ?? existing?.sector ?? auth.profile?.sector ?? '',
      reason: partial.reason ?? existing?.reason ?? '',
      reported_symptoms: partial.reported_symptoms ?? existing?.reported_symptoms ?? [],
      symptom_duration: partial.symptom_duration ?? existing?.symptom_duration ?? '',
      relevant_conditions: partial.relevant_conditions ?? existing?.relevant_conditions ?? [],
      accessibility_needs: partial.accessibility_needs ?? existing?.accessibility_needs ?? [],
      access_barriers: partial.access_barriers ?? existing?.access_barriers ?? [],
      priority_level: partial.priority_level ?? existing?.priority_level ?? 'PREVENTIVE',
      priority_score: partial.priority_score ?? existing?.priority_score ?? 0,
      warning_signs: partial.warning_signs ?? existing?.warning_signs ?? [],
      requested_service: partial.requested_service ?? existing?.requested_service ?? '',
      recommended_service_type: partial.recommended_service_type ?? existing?.recommended_service_type ?? '',
      summary: partial.summary ?? existing?.summary ?? '',
      status: partial.status ?? existing?.status ?? 'NEW',
      requires_human_review: partial.requires_human_review ?? existing?.requires_human_review ?? false,
      consent: partial.consent ?? existing?.consent ?? false,
      next_follow_up_at: partial.next_follow_up_at ?? existing?.next_follow_up_at ?? null,
      closed_at: partial.closed_at ?? existing?.closed_at ?? null,
    }

    if (useMock) {
      if (existing) Object.assign(existing, payload, { updated_at: now() })
      else mockCases.unshift({ id: crypto.randomUUID(), ...payload, created_at: now(), updated_at: now() })
      await loadCases()
      activeCase.value = mockCases.find((item) => item.conversation_id === conversationId) ?? null
      return
    }

    const supabase = getSupabase()
    if (existing) {
      const { data, error: updateError } = await supabase.from('health_cases').update(payload).eq('id', existing.id).select().single()
      if (updateError) throw updateError
      activeCase.value = data as HealthCase
    } else {
      const { data, error: insertError } = await supabase.from('health_cases').insert(payload).select().single()
      if (insertError) throw insertError
      activeCase.value = data as HealthCase
    }
    await loadCases()
  }

  function selectByConversation(conversationId: string) {
    activeCase.value = cases.value.find((item) => item.conversation_id === conversationId) ?? null
  }

  async function updateStatus(caseId: string, status: HealthCaseStatus, note = '') {
    const auth = useAuthStore()
    if (!auth.user) return false
    const current = cases.value.find((item) => item.id === caseId)
    if (!current) return false
    const updates = { status, requires_human_review: status === 'PENDING_REVIEW', closed_at: status === 'CLOSED' ? now() : null }
    if (useMock) {
      Object.assign(current, updates, { updated_at: now() })
      mockActions.unshift({ id: crypto.randomUUID(), case_id: caseId, action_type: 'status_change', description: note || `Estado actualizado a ${status}`, status: 'completed', operator_id: auth.user.id, created_at: now(), updated_at: now() })
      return true
    }
    const { error: updateError } = await getSupabase().from('health_cases').update(updates).eq('id', caseId)
    if (updateError) { error.value = updateError.message; return false }
    await getSupabase().from('case_actions').insert({ case_id: caseId, action_type: 'status_change', description: note || `Estado actualizado a ${status}`, status: 'completed', operator_id: auth.user.id, completed_at: now() })
    await loadCases()
    return true
  }

  async function loadActions() {
    if (useMock) { actions.value = [...mockActions]; return }
    const { data, error: actionsError } = await getSupabase().from('case_actions').select('*').order('created_at', { ascending: false })
    if (actionsError) throw actionsError
    actions.value = (data ?? []) as CaseAction[]
  }

  return { cases, actions, activeCase, pendingReview, loading, error, loadCases, upsertFromAgent, selectByConversation, updateStatus, loadActions }
})
