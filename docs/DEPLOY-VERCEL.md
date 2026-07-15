# Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Framework: Vite.
4. Build: `npm run build`.
5. Output: `dist`.
6. Agrega las variables de `.env.example`.
7. En producción usa `VITE_USE_MOCK=false`.
8. Configura `APP_ALLOWED_ORIGIN` con el dominio final.

Las rutas `/api/*` utilizan funciones serverless para ocultar la URL y el token interno de n8n.
