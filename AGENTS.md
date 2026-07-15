# Instrucciones para Codex — Manta Cuida IA

## Objetivo

Mantener una plataforma de orientación y acceso a servicios de salud para Manta, Ecuador, construida con Vue 3, TypeScript, Supabase, n8n y GPT-5.6.

## Reglas obligatorias

- No convertir el sistema en una herramienta de diagnóstico.
- No añadir recetas, dosis o instrucciones para suspender medicamentos.
- No reducir una prioridad `EMERGENCY` marcada por reglas determinísticas.
- No inventar centros, contactos, horarios, fuentes ni disponibilidad.
- Mantener la separación de roles `ciudadano`, `operador`, `admin`.
- Mantener RLS en todas las tablas con datos personales.
- Nunca exponer claves de OpenAI, PostgreSQL o Supabase `service_role` al frontend.
- Los cambios al contrato de n8n deben actualizar `src/types/index.ts`, `src/services/n8n.ts` y el workflow.

## Comprobaciones antes de terminar un 

```bash
npm run typecheck
npm run build
```

## Archivos principales

- `src/stores/chat.ts`: interacción y persistencia del chat.
- `src/stores/healthCases.ts`: casos y revisión humana.
- `workflow/MultiAgente_Salud.json`: automatización de n8n.
- `supabase/schema.sql`: modelo y políticas RLS.
- `supabase/health-seed.sql`: datos demostrativos.

## Modo demo

`VITE_USE_MOCK=true` debe continuar funcionando sin servicios externos.
