export type UserRole = 'ciudadano' | 'operador' | 'admin'
export type ChatTipo = 'orientacion' | 'servicios' | 'prevencion' | 'tramite'
export type MensajeRol = 'usuario' | 'asistente'
export type HealthPriority = 'EMERGENCY' | 'PRIORITY' | 'ROUTINE' | 'PREVENTIVE'
export type HealthCaseStatus = 'NEW' | 'ORIENTED' | 'REFERRED' | 'PENDING_REVIEW' | 'FOLLOW_UP' | 'RESOLVED' | 'CLOSED'
export type CaseActionStatus = 'pending' | 'approved' | 'edited' | 'rejected' | 'completed'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  phone?: string | null
  city?: string | null
  sector?: string | null
  preferred_contact?: string | null
  accessibility_preferences?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Conversacion {
  id: string
  user_id: string
  titulo: string
  tipo: ChatTipo
  estado: 'activa' | 'eliminada' | string
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Mensaje {
  id: string
  conversacion_id: string
  rol: MensajeRol
  contenido: string
  metadata?: MessageMetadata
  created_at: string
}

export interface MessageMetadata extends Record<string, unknown> {
  priority?: HealthPriority
  sources?: HealthSource[]
  services?: HealthService[]
  show_emergency_banner?: boolean
  requires_human_review?: boolean
}

export interface HealthSource {
  title: string
  organization?: string
  reference?: string
  verified_at?: string
}

export interface HealthService {
  id: string
  name: string
  institution_type: string
  service_type: string
  city: string
  sector: string
  address: string
  phone: string
  schedule: string
  emergency_available: boolean
  specialties: string[]
  accessibility_features: string[]
  requirements: string[]
  source_name: string
  source_reference?: string
  verified_at: string
  active: boolean
}

export interface HealthCase {
  id: string
  user_id: string
  conversation_id: string | null
  reported_age: number | null
  location: string
  sector: string
  reason: string
  reported_symptoms: string[]
  symptom_duration: string
  relevant_conditions: string[]
  accessibility_needs: string[]
  access_barriers: string[]
  priority_level: HealthPriority
  priority_score: number
  warning_signs: string[]
  requested_service: string
  recommended_service_type: string
  summary: string
  status: HealthCaseStatus
  requires_human_review: boolean
  consent: boolean
  next_follow_up_at?: string | null
  created_at: string
  updated_at: string
  closed_at?: string | null
  profiles?: Profile
}

export interface CaseAction {
  id: string
  case_id: string
  action_type: string
  description: string
  status: CaseActionStatus
  operator_id?: string | null
  scheduled_at?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface FollowUpInfo {
  required: boolean
  suggested_time?: string | null
  action?: string | null
}

export interface N8nChatResponse {
  reply: string
  case?: Partial<HealthCase>
  services?: HealthService[]
  sources?: HealthSource[]
  follow_up?: FollowUpInfo
  ui?: {
    show_emergency_banner?: boolean
    show_services?: boolean
    show_human_review?: boolean
  }
  agent?: string
  error_code?: string
}
