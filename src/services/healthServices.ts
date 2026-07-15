import type { HealthService } from '@/types'
import { getSupabase, useMock } from '@/services/supabase'

export const MOCK_HEALTH_SERVICES: HealthService[] = [
  {
    id: 'demo-hospital-1', name: 'Hospital de referencia de Manta (demostración)', institution_type: 'Público',
    service_type: 'Emergencia y atención hospitalaria', city: 'Manta', sector: 'Centro', address: 'Dirección de demostración; reemplazar con fuente oficial',
    phone: 'ECU 911 para emergencias', schedule: 'Emergencias: 24 horas (confirmar)', emergency_available: true,
    specialties: ['Emergencia', 'Medicina general'], accessibility_features: ['Acceso para movilidad reducida'], requirements: ['Documento de identidad si está disponible'],
    source_name: 'Registro demostrativo, debe verificarse antes de producción', verified_at: '2026-07-15', active: true,
  },
  {
    id: 'demo-centro-2', name: 'Centro de salud comunitario (demostración)', institution_type: 'Público',
    service_type: 'Consulta general y prevención', city: 'Manta', sector: 'Tarqui', address: 'Dirección de demostración', phone: 'Teléfono por verificar',
    schedule: 'Lunes a viernes, horario por verificar', emergency_available: false, specialties: ['Medicina general', 'Vacunación', 'Control preventivo'],
    accessibility_features: ['Atención prioritaria'], requirements: ['Documento de identidad', 'Confirmar requisitos'], source_name: 'Registro demostrativo', verified_at: '2026-07-15', active: true,
  },
  {
    id: 'demo-lab-3', name: 'Laboratorio clínico aliado (demostración)', institution_type: 'Privado', service_type: 'Laboratorio clínico',
    city: 'Manta', sector: 'Los Esteros', address: 'Dirección de demostración', phone: 'Teléfono por verificar', schedule: 'Horario por verificar', emergency_available: false,
    specialties: ['Exámenes de laboratorio'], accessibility_features: ['Ingreso accesible'], requirements: ['Orden médica cuando corresponda', 'Consultar preparación previa'],
    source_name: 'Registro demostrativo', verified_at: '2026-07-15', active: true,
  },
]

export async function fetchHealthServices(search = ''): Promise<HealthService[]> {
  if (useMock) {
    const query = search.trim().toLowerCase()
    if (!query) return MOCK_HEALTH_SERVICES
    return MOCK_HEALTH_SERVICES.filter((service) => [service.name, service.service_type, service.sector, ...service.specialties].join(' ').toLowerCase().includes(query))
  }
  let query = getSupabase().from('health_services').select('*').eq('active', true).order('name')
  if (search.trim()) query = query.or(`name.ilike.%${search}%,service_type.ilike.%${search}%,sector.ilike.%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as HealthService[]
}
