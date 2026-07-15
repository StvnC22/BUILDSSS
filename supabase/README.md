# Supabase — Manta Cuida IA

1. Crea o abre un proyecto de desarrollo en Supabase.
2. Ejecuta `schema.sql` en **SQL Editor**. El script elimina las tablas financieras antiguas.
3. Ejecuta `health-seed.sql`.
4. Copia la URL y la `anon key` a `.env.local`.
5. Crea manualmente una cuenta ciudadana desde la aplicación.
6. Para convertir una cuenta en operador o administrador:

```sql
UPDATE profiles SET role = 'operador' WHERE email = 'correo@ejemplo.com';
UPDATE profiles SET role = 'admin' WHERE email = 'admin@ejemplo.com';
```

Los servicios del seed son de demostración. No presentes direcciones, teléfonos u horarios como oficiales hasta verificarlos y actualizar `source_name`, `source_reference` y `verified_at`.
