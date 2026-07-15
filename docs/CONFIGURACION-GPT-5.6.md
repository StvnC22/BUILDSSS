# Configuración de GPT-5.6 y n8n

## 1. Base de datos

Ejecuta en Supabase, en este orden:

1. `supabase/schema.sql`
2. `supabase/health-seed.sql`

El primer script elimina las tablas financieras anteriores y crea el modelo de salud.

## 2. Importar el workflow

En n8n:

1. Abre **Workflows**.
2. Selecciona **Import from File**.
3. Importa `workflow/MultiAgente_Salud.json`.
4. Mantén el workflow inactivo mientras configuras las credenciales.

## 3. Credencial OpenAI

Asigna una credencial OpenAI a estos nodos:

- Orquestador
- Agente de Clasificación y Acceso
- Agente de Acceso a Servicios
- Agente de Prevención y Trámites
- Asistente General de Salud

El JSON usa el identificador `gpt-5.6-sol`. Si tu nodo n8n muestra otro identificador exacto para GPT-5.6, selecciónalo manualmente sin cambiar los prompts.

## 4. Credencial PostgreSQL

Asigna la conexión PostgreSQL de Supabase a:

- Leer Contexto
- Consultar Servicios
- Consultar Contenido Aprobado
- Guardar Caso
- Programar Seguimiento
- Listar Seguimientos
- Guardar Revisión

Usa una conexión de servidor guardada en n8n. Nunca coloques la contraseña de PostgreSQL en Vue o en variables `VITE_*`.

## 5. Webhooks

El workflow expone:

- `POST /webhook/health/chat`
- `GET /webhook/health/followup/pending`
- `POST /webhook/health/followup/review`

En `.env.local`:

```env
VITE_USE_MOCK=false
VITE_N8N_BASE_URL=https://TU-N8N
VITE_N8N_WEBHOOK_URL=https://TU-N8N/webhook/health/chat
```

En Vercel:

```env
N8N_BASE_URL=https://TU-N8N
N8N_WEBHOOK_URL=https://TU-N8N/webhook/health/chat
N8N_INTERNAL_TOKEN=un-token-largo
APP_ALLOWED_ORIGIN=https://TU-APP.vercel.app
```

## 6. Activación

1. Ejecuta una prueba manual desde n8n.
2. Comprueba que el nodo **Formatear Respuesta Segura** produzca `reply`, `case`, `services`, `sources`, `follow_up` y `ui`.
3. Activa el workflow.
4. Reinicia el frontend.
