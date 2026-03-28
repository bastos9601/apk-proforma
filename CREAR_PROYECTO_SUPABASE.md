# 🚀 Crear Nuevo Proyecto en Supabase

## Paso 1: Crear el Proyecto

1. Ve a https://supabase.com/dashboard
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name:** `bradatec-app` (o el nombre que prefieras)
   - **Database Password:** Crea una contraseña segura (guárdala)
   - **Region:** Elige la más cercana (ejemplo: South America - São Paulo)
   - **Pricing Plan:** Free (es suficiente para empezar)
4. Haz clic en **"Create new project"**
5. Espera 2-3 minutos mientras se crea el proyecto

## Paso 2: Obtener las Credenciales

1. Una vez creado el proyecto, ve a **Settings > API**
2. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (la clave larga que empieza con `eyJ...`)

## Paso 3: Actualizar la Configuración

Abre el archivo `frontend/src/config/supabase.config.js` y reemplaza:

```javascript
const SUPABASE_URL = 'TU_NUEVA_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_NUEVA_KEY_AQUI';
```

## Paso 4: Ejecutar el Script SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Haz clic en **"New query"**
3. Abre el archivo `SUPABASE_DATABASE_NUEVA.sql` de este proyecto
4. Copia TODO el contenido
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Deberías ver "Success. No rows returned"

## Paso 5: Habilitar Email Authentication

1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado (toggle en verde)
3. **IMPORTANTE para desarrollo:** 
   - Desactiva "Confirm email" para no tener que verificar emails
   - Esto está en Authentication > Settings > Email Auth
4. Guarda los cambios

## Paso 6: Verificar las Tablas

1. Ve a **Table Editor**
2. Deberías ver estas 4 tablas:
   - ✅ proformas
   - ✅ detalle_proforma
   - ✅ catalogo_productos
   - ✅ configuracion

## Paso 7: Probar la Conexión

Ejecuta el script de prueba:

```bash
cd frontend
node test-supabase-connection.js
```

Deberías ver:
```
✅ Conexión exitosa!
✅ Sistema de autenticación funcionando
```

## Paso 8: Probar la App

```bash
npm start
```

Luego:
1. Abre la app en Expo Go
2. Registra un nuevo usuario
3. Verifica en Supabase > Authentication > Users que aparezca
4. Crea una proforma de prueba
5. Verifica en Table Editor > proformas que aparezca

## 🆘 Si Tienes Problemas

### Error: "relation does not exist"
- No ejecutaste el script SQL
- Vuelve al Paso 4

### Error: "Invalid API key"
- Copiaste mal la URL o la key
- Vuelve al Paso 2 y 3

### Error: "Email not confirmed"
- No desactivaste "Confirm email"
- Ve a Authentication > Settings > Email Auth
- Desactiva "Confirm email"

## 📝 Notas Importantes

- El plan gratuito de Supabase incluye:
  - 500 MB de base de datos
  - 1 GB de almacenamiento de archivos
  - 2 GB de ancho de banda
  - Suficiente para desarrollo y pruebas

- Guarda tu contraseña de base de datos en un lugar seguro
- No compartas tu service_role key (solo usa la anon key)
