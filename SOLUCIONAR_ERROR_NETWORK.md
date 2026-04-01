# Solucionar Error "Network request failed"

## 🔴 Problema
Los nuevos usuarios no pueden:
- Guardar configuración
- Guardar productos al catálogo
- Subir imágenes

Error: "Network request failed"

## 🔍 Causa
Las políticas de seguridad (RLS - Row Level Security) en Supabase no están configuradas correctamente para permitir que los usuarios autenticados accedan a sus propios datos.

## ✅ Solución

### Paso 1: Ejecutar Script SQL

1. Ve a **Supabase Dashboard**
2. Abre **SQL Editor**
3. Copia y pega el contenido de `fix-rls-policies.sql`
4. Ejecuta el script (Ctrl+Enter o botón Run)
5. Verifica que no haya errores

### Paso 2: Configurar Políticas de Storage

1. Ve a **Storage** en Supabase Dashboard
2. Selecciona el bucket **proformas**
3. Ve a la pestaña **Policies**
4. Agrega las siguientes políticas:

#### Política 1: Ver archivos
```
Nombre: Usuarios pueden ver archivos
Operation: SELECT
Target roles: authenticated
Policy definition: true
```

#### Política 2: Subir archivos
```
Nombre: Usuarios pueden subir archivos
Operation: INSERT
Target roles: authenticated
Policy definition: true
```

#### Política 3: Actualizar archivos
```
Nombre: Usuarios pueden actualizar archivos
Operation: UPDATE
Target roles: authenticated
Policy definition: true
```

#### Política 4: Eliminar archivos
```
Nombre: Usuarios pueden eliminar archivos
Operation: DELETE
Target roles: authenticated
Policy definition: true
```

### Paso 3: Verificar el Bucket

1. Ve a **Storage** > **proformas**
2. Verifica que el bucket sea **público** o que tenga las políticas correctas
3. Si no existe, créalo:
   - Nombre: `proformas`
   - Public: ✅ (marcado)
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### Paso 4: Probar

1. Cierra sesión en la app
2. Crea un nuevo usuario o inicia sesión con el usuario existente
3. Intenta:
   - Guardar configuración
   - Subir logo de empresa
   - Guardar un producto al catálogo
   - Crear una proforma

## 🔧 Verificación Rápida

Ejecuta este SQL para ver si las políticas están activas:

```sql
-- Ver todas las políticas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operacion,
  roles
FROM pg_policies
WHERE tablename IN ('configuracion', 'catalogo_productos', 'proformas', 'detalle_proforma')
ORDER BY tablename, cmd;
```

Deberías ver 4 políticas por tabla (SELECT, INSERT, UPDATE, DELETE).

## 📱 Para la App Móvil

Si el error persiste en la app móvil:

1. Cierra completamente la app
2. Limpia el caché de la app
3. Vuelve a abrir la app
4. Inicia sesión nuevamente

## 🌐 Para la Web

Si el error persiste en la web:

1. Limpia el caché del navegador
2. Cierra sesión
3. Vuelve a iniciar sesión
4. Intenta de nuevo

## ⚠️ Nota Importante

Las políticas RLS son por seguridad. Aseguran que:
- Cada usuario solo ve sus propios datos
- Nadie puede ver datos de otros usuarios
- Los datos están protegidos

No desactives RLS a menos que sea absolutamente necesario.

## 🆘 Si el Problema Persiste

1. Verifica que el usuario esté autenticado correctamente
2. Revisa los logs en Supabase Dashboard > Logs
3. Verifica que la URL y API Key de Supabase sean correctas
4. Asegúrate de que el bucket 'proformas' exista y sea público
