# Guía de Despliegue y Configuración - QodeIA Howard (plataforma-qd)

He realizado mejoras en la estructura del proyecto para asegurar una conexión estable entre el repositorio, Vercel y Supabase. Sigue estos pasos para completar la configuración:

## 1. Configuración de Supabase (¡Seguridad Reforzada!)

He actualizado el esquema SQL para solucionar las advertencias de seguridad (RLS Policy Always True). Ahora, cada dato está vinculado al `user_id` del usuario autenticado.

1. Ve a tu proyecto en [Supabase](https://supabase.com/).
2. Abre el **SQL Editor**.
3. Copia y pega el contenido actualizado de `supabase/schema.sql`.
4. Ejecuta la consulta. Esto:
   - Añadirá la columna `user_id` si no existe.
   - Configurará políticas RLS granulares (SELECT, INSERT, UPDATE, DELETE) que aseguran que **solo tú puedas ver y modificar tus propios datos**.

## 2. Variables de Entorno en Vercel

Asegúrate de tener configuradas las siguientes variables en tu proyecto de Vercel (**Settings > Environment Variables**):

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | La URL de tu proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | La clave Anon pública de Supabase. |
| `VITE_ENCRYPTION_KEY` | Una clave secreta para cifrar tus credenciales localmente (mínimo 32 caracteres recomendados). |
| `VITE_QODEIA_API_KEY` | API Key para integraciones de QodeIA Agent y servicios externos. |

## 3. Despliegue en Vercel

He añadido un archivo `vercel.json` para optimizar el despliegue de la aplicación Vite. Vercel detectará automáticamente la configuración, pero asegúrate de que:
- El **Framework Preset** sea `Vite`.
- El **Build Command** sea `npm run build`.
- El **Output Directory** sea `dist`.

## Cambios Realizados

- **`src/lib/supabase.js`**: Mejorada la lógica de inicialización para evitar errores si las claves no están presentes.
- **`vercel.json`**: Añadido para asegurar que las rutas del frontend funcionen correctamente (SPA rewrites).
- **`supabase/schema.sql`**: Creado el esquema necesario para la base de datos.
- **`DEPLOYMENT_GUIDE.md`**: Esta guía para facilitar el mantenimiento futuro.
