# Despliegue en Vercel

## 1. Importar el proyecto

1. Entra a [vercel.com/new](https://vercel.com/new).
2. Importa el repositorio `StvnC22/BUILDSSS`.
3. Framework: **Vite** (detectado automáticamente).
4. Build command: `npm run vercel-build`
5. Output: `dist`
6. Install command: `npm ci`

Dominio esperado: **https://buildsss.vercel.app**

## 2. Variables de entorno

### Opción A — Modo demo (sin Supabase ni n8n)

Ideal para la primera prueba pública:

| Variable | Valor |
|---|---|
| `VITE_USE_MOCK` | `true` |
| `APP_ALLOWED_ORIGIN` | `https://buildsss.vercel.app` |

Cuentas demo: `ciudadano@demo.com` / `demo1234` (también operador y admin).

### Opción B — Modo producción

| Variable | Valor |
|---|---|
| `VITE_USE_MOCK` | `false` |
| `VITE_SUPABASE_URL` | `https://tsflfahgkrpgrvwdejbv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | clave anon/publishable de Supabase |
| `N8N_BASE_URL` | URL base de tu instancia n8n |
| `N8N_WEBHOOK_URL` | `https://TU-N8N/webhook/health/chat` |
| `N8N_INTERNAL_TOKEN` | token largo y secreto |
| `APP_ALLOWED_ORIGIN` | `https://buildsss.vercel.app` |

En Vercel → **Settings → Environment Variables**, marca las tres opciones: Production, Preview y Development.

### Opción C — Script automático (CLI)

```powershell
npx vercel login
npx vercel link

# Modo demo
.\scripts\configure-vercel-env.ps1 -Mode demo

# Modo producción (completa los parámetros)
.\scripts\configure-vercel-env.ps1 -Mode production `
  -SupabaseAnonKey "tu_clave" `
  -N8nBaseUrl "https://tu-n8n.example.com" `
  -N8nWebhookUrl "https://tu-n8n.example.com/webhook/health/chat" `
  -N8nInternalToken "token-secreto"

npx vercel --prod
```

## 3. Supabase (solo modo producción)

En **Authentication → URL Configuration → Redirect URLs**, agrega:

```text
https://buildsss.vercel.app/**
https://buildsss.vercel.app/auth/callback
https://buildsss.vercel.app/login
http://localhost:5173/**
http://localhost:5173/auth/callback
```

## 4. Redeploy

Tras cambiar variables:

1. Vercel → **Deployments** → último deploy → **Redeploy**.
2. O desde terminal: `npx vercel --prod`

## 5. Comprobar

- La landing carga con título **Manta Cuida IA**.
- `/login` funciona con cuentas demo (modo mock).
- `/api/n8n-chat` responde 503 si n8n no está configurado (esperado en demo).

Las rutas `/api/*` usan funciones serverless para ocultar la URL y el token interno de n8n.
