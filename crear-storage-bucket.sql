-- ============================================
-- Crear Bucket de Storage para Imágenes (SIMPLIFICADO)
-- ============================================

-- 1. Crear el bucket 'proformas' (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('proformas', 'proformas', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Política: Permitir que usuarios autenticados suban archivos
DROP POLICY IF EXISTS "Usuarios pueden subir imágenes" ON storage.objects;
CREATE POLICY "Usuarios pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proformas');

-- 3. Política: Permitir que todos vean las imágenes (público)
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;
CREATE POLICY "Imágenes públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proformas');

-- 4. Política: Permitir que usuarios eliminen archivos
DROP POLICY IF EXISTS "Usuarios pueden eliminar imágenes" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proformas');

-- 5. Política: Permitir que usuarios actualicen archivos
DROP POLICY IF EXISTS "Usuarios pueden actualizar imágenes" ON storage.objects;
CREATE POLICY "Usuarios pueden actualizar imágenes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proformas');

-- ============================================
-- Verificar que se creó correctamente
-- ============================================
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'proformas';

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Deberías ver el bucket 'proformas' creado
-- 
-- O MEJOR AÚN: Usa la interfaz de Supabase:
-- Storage > New bucket > Name: proformas > Public: ON
-- ============================================
