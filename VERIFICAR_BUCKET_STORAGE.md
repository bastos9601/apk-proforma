# Verificar y Crear Bucket de Storage

## Tu Situación Actual

Según la captura, estás en el proyecto correcto: `qfinablpaknitaytdgoj`

El bucket `proformas` YA EXISTE y tiene las políticas correctas.

## Posibles Causas del Error

### 1. Problema de Caché o Sesión

Intenta lo siguiente:

1. **Cierra completamente tu app** (no solo minimizar)
2. **Cierra sesión** en la app
3. **Vuelve a iniciar sesión**
4. Intenta subir una imagen nuevamente

### 2. Verificar que el Usuario Esté Autenticado

El error "Network request failed" puede ocurrir si:
- El token de autenticación expiró
- No hay conexión a internet
- El usuario no está autenticado correctamente

### 3. Verificar Permisos del Bucket

En la captura veo que el bucket existe, pero verifica:

1. Ve a **Storage** > **Files** (no Policies)
2. Haz clic en el bucket `proformas`
3. Verifica que diga **PUBLIC** junto al nombre

### 4. Probar Manualmente

Intenta subir un archivo manualmente desde la interfaz de Supabase:

1. Ve a **Storage** > **Files**
2. Haz clic en `proformas`
3. Haz clic en **Upload file**
4. Sube cualquier imagen
5. Si funciona, el bucket está bien configurado

## Solución Alternativa: Recrear el Bucket

Si nada funciona, elimina y recrea el bucket:

### Paso 1: Eliminar Bucket Actual

```sql
-- Eliminar políticas
DROP POLICY IF EXISTS "Usuarios pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Las imágenes son públicas" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir sus propias imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;

-- Eliminar bucket
DELETE FROM storage.buckets WHERE id = 'proformas';
```

### Paso 2: Crear Bucket Nuevo

```sql
-- Crear bucket público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('proformas', 'proformas', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

-- Política: INSERT para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proformas');

-- Política: SELECT público
CREATE POLICY "Lectura pública"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proformas');

-- Política: DELETE para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proformas');

-- Política: UPDATE para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proformas');
```

## Verificar Configuración de CORS

A veces el error "Network request failed" es por CORS. Verifica:

1. Ve a **Settings** > **API**
2. Busca la sección **CORS**
3. Asegúrate de que tu dominio esté permitido (o usa `*` para desarrollo)

## Debug Adicional

Agrega más logs en el código para ver exactamente dónde falla:

```javascript
// En supabase.storage.servicio.js
export const subirImagen = async (imagenUri) => {
  try {
    console.log('=== INICIO SUBIDA ===');
    console.log('URI:', imagenUri);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Usuario:', user?.id);
    console.log('Error auth:', authError);
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    // ... resto del código
    
    console.log('Intentando subir a bucket: proformas');
    const { data, error } = await supabase.storage
      .from('proformas')
      .upload(nombreArchivo, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    console.log('Respuesta data:', data);
    console.log('Respuesta error:', error);
    
    // ... resto del código
  } catch (error) {
    console.error('=== ERROR COMPLETO ===', error);
    throw error;
  }
};
```

## Checklist Final

- [ ] El bucket `proformas` existe
- [ ] El bucket es público (PUBLIC badge visible)
- [ ] Las 4 políticas están creadas
- [ ] El usuario está autenticado en la app
- [ ] Hay conexión a internet
- [ ] Se cerró y abrió la app después de crear el bucket
- [ ] Se probó cerrar sesión y volver a iniciar

Si después de todo esto sigue fallando, comparte los logs de la consola para ver el error exacto.
