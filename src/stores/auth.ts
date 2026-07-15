import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'
import { getSupabase, useMock } from '@/services/supabase'
import { formatSupabaseError, isEmailConfirmationRequired } from '@/utils/errors'
import { getEmailRedirectTo } from '@/config/appUrl'

const now = () => new Date().toISOString()
const MOCK_USERS: Record<string, { password: string; profile: Profile }> = {
  'ciudadano@demo.com': {
    password: 'demo1234',
    profile: { id: 'mock-ciudadano-1', full_name: 'María Ciudadana', email: 'ciudadano@demo.com', role: 'ciudadano', city: 'Manta', sector: 'Tarqui', created_at: now(), updated_at: now() },
  },
  'operador@demo.com': {
    password: 'demo1234',
    profile: { id: 'mock-operador-1', full_name: 'Luis Operador', email: 'operador@demo.com', role: 'operador', city: 'Manta', sector: '', created_at: now(), updated_at: now() },
  },
  'admin@demo.com': {
    password: 'demo1234',
    profile: { id: 'mock-admin-1', full_name: 'Ana Administradora', email: 'admin@demo.com', role: 'admin', city: 'Manta', sector: '', created_at: now(), updated_at: now() },
  },
}

let initialized = false

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const infoMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isCiudadano = computed(() => profile.value?.role === 'ciudadano')
  const isOperador = computed(() => profile.value?.role === 'operador')
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const canReviewCases = computed(() => isOperador.value || isAdmin.value)
  const userName = computed(() => profile.value?.full_name || profile.value?.email || 'Usuario')

  function normalizeRole(role: unknown): UserRole {
    if (role === 'admin' || role === 'operador') return role
    return 'ciudadano'
  }

  async function fetchProfile(userId: string) {
    if (useMock) return
    const { data, error: fetchError } = await getSupabase().from('profiles').select('*').eq('id', userId).maybeSingle()
    if (fetchError) throw fetchError
    if (data) profile.value = { ...(data as Profile), role: normalizeRole(data.role) }
  }

  async function ensureProfile(userId: string, fullName: string, email: string, role: UserRole) {
    const { data, error: upsertError } = await getSupabase()
      .from('profiles')
      .upsert({ id: userId, full_name: fullName, email, role }, { onConflict: 'id' })
      .select()
      .single()
    if (upsertError) throw upsertError
    profile.value = data as Profile
  }

  async function applySessionUser(sessionUser: User) {
    user.value = sessionUser
    await fetchProfile(sessionUser.id)
    if (!profile.value) {
      await ensureProfile(
        sessionUser.id,
        sessionUser.user_metadata?.full_name ?? '',
        sessionUser.email ?? '',
        normalizeRole(sessionUser.user_metadata?.role),
      )
    }
  }

  async function init() {
    if (initialized) return
    initialized = true
    loading.value = true
    error.value = null
    try {
      if (useMock) {
        const remembered = localStorage.getItem('manta-cuida-demo-user')
        if (remembered && MOCK_USERS[remembered]) {
          profile.value = MOCK_USERS[remembered].profile
          user.value = { id: profile.value.id, email: profile.value.email } as User
        }
        return
      }
      const supabase = getSupabase()
      const params = new URLSearchParams(window.location.search)
      if (params.get('code') && !window.location.pathname.includes('/auth/callback')) {
        await supabase.auth.exchangeCodeForSession(window.location.href)
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) await applySessionUser(session.user)
      supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        if (nextSession?.user) await applySessionUser(nextSession.user)
        else { user.value = null; profile.value = null }
      })
    } catch (cause) {
      error.value = formatSupabaseError(cause)
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    error.value = null
    if (useMock) {
      const key = email.toLowerCase()
      const mock = MOCK_USERS[key]
      if (!mock || mock.password !== password) { error.value = 'Credenciales incorrectas'; return false }
      user.value = { id: mock.profile.id, email: key } as User
      profile.value = mock.profile
      localStorage.setItem('manta-cuida-demo-user', key)
      return true
    }
    const { data, error: signInError } = await getSupabase().auth.signInWithPassword({ email, password })
    if (signInError) { error.value = formatSupabaseError(signInError); return false }
    await applySessionUser(data.user)
    return true
  }

  async function signUp(fullName: string, email: string, password: string, role: UserRole = 'ciudadano') {
    error.value = null
    infoMessage.value = null
    if (useMock) { error.value = 'En modo demo usa ciudadano@demo.com / demo1234'; return false }
    const safeRole = normalizeRole(role)
    const { data, error: signUpError } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: safeRole }, emailRedirectTo: getEmailRedirectTo() },
    })
    if (signUpError) { error.value = formatSupabaseError(signUpError); return false }
    if (!data.user) { error.value = 'No se pudo crear la cuenta.'; return false }
    if (isEmailConfirmationRequired(data.session, data.user)) {
      infoMessage.value = 'Cuenta creada. Revisa tu correo y confirma el registro.'
      return true
    }
    await applySessionUser(data.user)
    return true
  }

  async function signOut() {
    if (useMock) localStorage.removeItem('manta-cuida-demo-user')
    else await getSupabase().auth.signOut()
    user.value = null
    profile.value = null
  }

  async function updateProfile(updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'city' | 'sector' | 'preferred_contact' | 'accessibility_preferences'>>) {
    if (!user.value) return false
    if (useMock) {
      if (profile.value) profile.value = { ...profile.value, ...updates, updated_at: now() }
      return true
    }
    const { error: updateError } = await getSupabase().from('profiles').update(updates).eq('id', user.value.id)
    if (updateError) { error.value = updateError.message; return false }
    if (profile.value) profile.value = { ...profile.value, ...updates }
    return true
  }

  async function fetchAllProfiles(): Promise<Profile[]> {
    if (useMock) return Object.values(MOCK_USERS).map((item) => item.profile)
    const { data, error: profilesError } = await getSupabase().from('profiles').select('*').order('created_at', { ascending: false })
    if (profilesError) throw profilesError
    return ((data ?? []) as Profile[]).map((item) => ({ ...item, role: normalizeRole(item.role) }))
  }

  return { user, profile, loading, error, infoMessage, isAuthenticated, isCiudadano, isOperador, isAdmin, canReviewCases, userName, init, applySessionUser, signIn, signUp, signOut, updateProfile, fetchAllProfiles }
})
