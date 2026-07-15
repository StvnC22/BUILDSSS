# Arquitectura de Manta Cuida IA

## Flujo principal

```text
Ciudadano
  → Vue 3
  → API de Vercel
  → Webhook n8n
  → Reglas determinísticas
  → Orquestador GPT-5.6
  → Clasificador GPT-5.6
  → Consulta de servicios y contenido aprobado
  → Agentes de servicios y prevención GPT-5.6
  → Asistente General GPT-5.6
  → Validador de seguridad
  → Supabase
  → Respuesta y seguimiento
```

## Responsabilidades

### Frontend

- Autenticación.
- Historial.
- Visualización de prioridad, servicios y fuentes.
- Lectura en voz alta.
- Panel de casos y revisión humana.

### Supabase

- Perfiles y roles.
- Conversaciones y mensajes.
- Casos, acciones y seguimientos.
- Directorio de servicios.
- Contenido de salud aprobado.
- RLS para separar ciudadano, operador y administrador.

### n8n

- Normalización.
- Reglas críticas independientes del modelo.
- Coordinación multiagente.
- Persistencia del caso.
- Seguimientos pendientes y revisión humana.

## Contrato de respuesta

```json
{
  "reply": "Texto para el ciudadano",
  "case": {
    "priority_level": "PRIORITY",
    "priority_score": 70,
    "status": "ORIENTED",
    "requires_human_review": false
  },
  "services": [],
  "sources": [],
  "follow_up": {
    "required": true,
    "suggested_time": "24 horas",
    "action": "confirm_attention"
  },
  "ui": {
    "show_emergency_banner": false,
    "show_services": false,
    "show_human_review": false
  }
}
```
