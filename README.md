# Manta Cuida IA

Plataforma de orientación y acceso a servicios de salud para Manta, Ecuador. El sistema combina **Vue 3**, **Supabase**, **n8n** y un flujo multiagente configurado para **GPT-5.6 Sol**.

> Manta Cuida IA no diagnostica, no prescribe medicamentos y no reemplaza a profesionales de salud. Ante una emergencia se debe llamar al ECU 911.

## Funciones incluidas

- Registro e inicio de sesión con roles `ciudadano`, `operador` y `admin`.
- Chat de orientación con historial.
- Clasificación en cuatro niveles: emergencia, prioritaria, programable y preventiva.
- Reglas determinísticas que no permiten que la IA reduzca una alerta crítica.
- Directorio de servicios con fuente y fecha de verificación.
- Ficha de caso, seguimiento y revisión humana.
- Panel administrativo para operadores.
- Lectura en voz alta y preferencias de accesibilidad.
- Modo demo que funciona sin credenciales externas.
- Workflow de n8n con cinco agentes GPT-5.6 Sol y tres webhooks.

## Inicio rápido en modo demo

```bash
npm install
copy .env.example .env.local
npm run dev
```

En `.env.local` conserva:

```env
VITE_USE_MOCK=true
```

Cuentas:

| Rol | Correo | Contraseña |
|---|---|---|
| Ciudadano | `ciudadano@demo.com` | `demo1234` |
| Operador | `operador@demo.com` | `demo1234` |
| Administrador | `admin@demo.com` | `demo1234` |

## Activar el modo real

1. Ejecuta `supabase/schema.sql` y luego `supabase/health-seed.sql`.
2. Configura Supabase y n8n en `.env.local`.
3. Importa `workflow/MultiAgente_Salud.json` en n8n.
4. Asigna credenciales OpenAI y PostgreSQL a los nodos correspondientes.
5. Confirma el identificador del modelo GPT-5.6 disponible en tu cuenta de n8n/OpenAI.
6. Activa el workflow y cambia `VITE_USE_MOCK=false`.

Consulta `docs/CONFIGURACION-GPT-5.6.md` para el proceso completo.

## Estructura

```text
api/                  Proxies seguros para Vercel
src/components/health Componentes de prioridad, servicios y casos
src/stores/            Autenticación, chat y casos
supabase/              Esquema y datos de demostración
workflow/              Workflow importable de n8n
docs/                  Arquitectura, seguridad, demo y despliegue
```

## Comandos

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Antes de una demostración pública

Los servicios incluidos en el seed son marcadores de demostración. Sustituye direcciones, teléfonos, horarios y fuentes por datos institucionales verificados. No presentes disponibilidad en tiempo real si no existe una integración que la confirme.
