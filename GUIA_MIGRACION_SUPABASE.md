# 🚀 Guía de Migración a Supabase Directo

Esta guía te ayudará a migrar tu app de usar backend a conectarse directamente con Supabase.

## 📋 Pasos de Migración

### 1. Crear Nueva Base de Datos en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `SUPABASE_DATABASE_NUEVA.sql`
5. Ejecuta el script (Ctrl+Enter)
6. Verifica que las 4 tablas se crearon correctamente

### 2. Configurar Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave pública)
3. Abre `frontend/src/config/supabase.config.js`
4. Reemplaza:
   ```javascript
   const SUPABASE_URL = 'TU_URL_AQUI';
   const SUPABASE_ANON_KEY = 'TU_CLAVE_AQUI';
   ```

### 3. Habilitar Email Authentication

1. En Supabase, ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura las opciones:
   - ✅ Enable Email provider
   - ✅ Confirm email (opcional, desactívalo para desarrollo)

### 4. Actualizar Imports en tu App

Ahora necesitas cambiar los imports en tus pantallas para usar los nuevos servicios:

#### Antes (con backend):
```javascript
import * as AuthServicio from '../servicios/auth.servicio';
import * as ProformaServicio from '../servicios/proforma.servicio';
```

#### Después (con Supabase):
```javascript
import * as AuthServicio from '../servicios/supabase.auth.servicio';
import * as ProformaServicio from '../servicios/supabase.proforma.servicio';
import * as CatalogoServicio from '../servicios/supabase.catalogo.servicio';
import * as ConfiguracionServicio from '../servicios/supabase.configuracion.servicio';
```

### 5. Archivos que Necesitas Actualizar

Busca y reemplaza los imports en estos archivos:

- `frontend/src/pantallas/Login.pantalla.js`
- `frontend/src/pantallas/Registro.pantalla.js`
- `frontend/src/pantallas/Proformas.pantalla.js`
- `frontend/src/pantallas/CrearProforma.pantalla.js`
- `frontend/src/pantallas/Configuracion.pantalla.js`
- Cualquier otra pantalla que use los servicios

### 6. Cambios en la Lógica de Autenticación

#### Antes:
```javascript
const respuesta = await AuthServicio.iniciarSesion(correo, password);
if (respuesta.token) {
  // Usuario autenticado
}
```

#### Después:
```javascript
const respuesta = await AuthServicio.iniciarSesion(correo, password);
if (respuesta.success) {
  // Usuario autenticado
}
```

### 7. Probar la Migración

1. **Registrar un nuevo usuario:**
   ```bash
   cd frontend
   npm start
   ```
   - Abre la app en Expo Go
   - Registra un nuevo usuario
   - Verifica en Supabase > Authentication que el usuario se creó

2. **Crear una proforma:**
   - Inicia sesión
   - Crea una proforma de prueba
   - Verifica en Supabase > Table Editor > proformas

3. **Verificar RLS:**
   - Los usuarios solo deben ver sus propias proformas
   - Intenta acceder con otro usuario

## 🎯 Ventajas de Supabase Directo

✅ **Sin backend:** No necesitas mantener un servidor Node.js
✅ **Más rápido:** Conexión directa a la base de datos
✅ **Seguro:** Row Level Security (RLS) protege los datos
✅ **Escalable:** Supabase maneja la infraestructura
✅ **Auth integrado:** Sistema de autenticación robusto
✅ **Tiempo real:** Puedes agregar subscripciones en el futuro

## 📦 Nuevos Servicios Creados

1. **supabase.auth.servicio.js** - Autenticación con Supabase Auth
2. **supabase.proforma.servicio.js** - CRUD de proformas
3. **supabase.catalogo.servicio.js** - Gestión de catálogo
4. **supabase.configuracion.servicio.js** - Configuración de usuario

## 🔒 Seguridad (RLS)

Las políticas de Row Level Security garantizan que:
- Cada usuario solo ve sus propios datos
- No se puede acceder a datos de otros usuarios
- Las operaciones están protegidas a nivel de base de datos

## 🚨 Importante

- **Guarda tus credenciales de Supabase de forma segura**
- **No subas `supabase.config.js` con credenciales a Git público**
- **Usa variables de entorno para producción**

## 🆘 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la anon key
- Asegúrate de usar la clave pública, no la service_role key

### Error: "User not authenticated"
- Verifica que el usuario esté logueado
- Revisa que la sesión se esté guardando en AsyncStorage

### Error: "Row Level Security policy violation"
- Verifica que las políticas RLS estén creadas
- Asegúrate de que el usuario_id coincida con auth.uid()

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola de Supabase para ver logs
2. Los logs de tu app en Expo
3. La documentación de Supabase: https://supabase.com/docs
