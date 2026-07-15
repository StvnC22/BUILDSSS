import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || ''
const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  ?? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
)?.trim() || ''

export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (useMock) throw new Error('Supabase no está activo porque VITE_USE_MOCK=true')
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}

export const isSupabaseConfigured = Boolean(!useMock && supabaseUrl && supabaseAnonKey)
