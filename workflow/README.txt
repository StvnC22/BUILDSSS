MANTA CUIDA IA - WORKFLOW N8N

1. Importa MultiAgente_Salud.json en n8n.
2. Asigna una credencial OpenAI a los cinco nodos GPT-5.6 Sol.
3. Asigna una credencial PostgreSQL de Supabase a los nodos de base de datos.
4. Ejecuta primero supabase/schema.sql y supabase/health-seed.sql.
5. Activa el workflow.
6. Configura N8N_WEBHOOK_URL con /webhook/health/chat.

El workflow contiene tres webhooks: chat, seguimientos pendientes y revisión de seguimiento.
Los registros de servicios del seed son demostrativos y deben verificarse antes de producción.
