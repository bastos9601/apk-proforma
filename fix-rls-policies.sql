-- ============================================
-- ARREGLAR POLÍTICAS RLS PARA NUEVOS USUARIOS
-- ============================================

-- 1. POLÍTICAS PARA TABLA CONFIGURACION
-- ============================================

-- Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver su configuración" ON configuracion;
DROP POLICY IF EXISTS "Usuarios pueden insertar su configuración" ON configuracion;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su configuración" ON configuracion;
DROP POLICY IF EXISTS "Usuarios pueden eliminar su configuración" ON configuracion;

-- Habilitar RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ver)
CREATE POLICY "Usuarios pueden ver su configuración"
ON configuracion
FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

-- Política para INSERT (crear)
CREATE POLICY "Usuarios pueden insertar su configuración"
ON configuracion
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- Política para UPDATE (actualizar)
CREATE POLICY "Usuarios pueden actualizar su configuración"
ON configuracion
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política para DELETE (eliminar)
CREATE POLICY "Usuarios pueden eliminar su configuración"
ON configuracion
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- 2. POLÍTICAS PARA TABLA CATALOGO_PRODUCTOS
-- ============================================

-- Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver sus productos" ON catalogo_productos;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus productos" ON catalogo_productos;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus productos" ON catalogo_productos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus productos" ON catalogo_productos;

-- Habilitar RLS
ALTER TABLE catalogo_productos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ver)
CREATE POLICY "Usuarios pueden ver sus productos"
ON catalogo_productos
FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

-- Política para INSERT (crear)
CREATE POLICY "Usuarios pueden insertar sus productos"
ON catalogo_productos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- Política para UPDATE (actualizar)
CREATE POLICY "Usuarios pueden actualizar sus productos"
ON catalogo_productos
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política para DELETE (eliminar)
CREATE POLICY "Usuarios pueden eliminar sus productos"
ON catalogo_productos
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- 3. POLÍTICAS PARA TABLA PROFORMAS
-- ============================================

-- Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver sus proformas" ON proformas;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus proformas" ON proformas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus proformas" ON proformas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus proformas" ON proformas;

-- Habilitar RLS
ALTER TABLE proformas ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ver)
CREATE POLICY "Usuarios pueden ver sus proformas"
ON proformas
FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

-- Política para INSERT (crear)
CREATE POLICY "Usuarios pueden insertar sus proformas"
ON proformas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- Política para UPDATE (actualizar)
CREATE POLICY "Usuarios pueden actualizar sus proformas"
ON proformas
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política para DELETE (eliminar)
CREATE POLICY "Usuarios pueden eliminar sus proformas"
ON proformas
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- 4. POLÍTICAS PARA TABLA DETALLE_PROFORMA
-- ============================================

-- Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver detalles de sus proformas" ON detalle_proforma;
DROP POLICY IF EXISTS "Usuarios pueden insertar detalles de sus proformas" ON detalle_proforma;
DROP POLICY IF EXISTS "Usuarios pueden actualizar detalles de sus proformas" ON detalle_proforma;
DROP POLICY IF EXISTS "Usuarios pueden eliminar detalles de sus proformas" ON detalle_proforma;

-- Habilitar RLS
ALTER TABLE detalle_proforma ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ver)
CREATE POLICY "Usuarios pueden ver detalles de sus proformas"
ON detalle_proforma
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM proformas 
    WHERE proformas.id = detalle_proforma.proforma_id 
    AND proformas.usuario_id = auth.uid()
  )
);

-- Política para INSERT (crear)
CREATE POLICY "Usuarios pueden insertar detalles de sus proformas"
ON detalle_proforma
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM proformas 
    WHERE proformas.id = detalle_proforma.proforma_id 
    AND proformas.usuario_id = auth.uid()
  )
);

-- Política para UPDATE (actualizar)
CREATE POLICY "Usuarios pueden actualizar detalles de sus proformas"
ON detalle_proforma
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM proformas 
    WHERE proformas.id = detalle_proforma.proforma_id 
    AND proformas.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM proformas 
    WHERE proformas.id = detalle_proforma.proforma_id 
    AND proformas.usuario_id = auth.uid()
  )
);

-- Política para DELETE (eliminar)
CREATE POLICY "Usuarios pueden eliminar detalles de sus proformas"
ON detalle_proforma
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM proformas 
    WHERE proformas.id = detalle_proforma.proforma_id 
    AND proformas.usuario_id = auth.uid()
  )
);

-- 5. POLÍTICAS PARA STORAGE (bucket proformas)
-- ============================================

-- Nota: Las políticas de Storage se configuran desde el dashboard de Supabase
-- Ve a Storage > proformas > Policies y agrega:

-- Política para SELECT (ver archivos):
-- Nombre: "Usuarios pueden ver sus archivos"
-- Target roles: authenticated
-- Policy definition: bucket_id = 'proformas'

-- Política para INSERT (subir archivos):
-- Nombre: "Usuarios pueden subir archivos"
-- Target roles: authenticated
-- Policy definition: bucket_id = 'proformas'

-- Política para UPDATE (actualizar archivos):
-- Nombre: "Usuarios pueden actualizar sus archivos"
-- Target roles: authenticated
-- Policy definition: bucket_id = 'proformas'

-- Política para DELETE (eliminar archivos):
-- Nombre: "Usuarios pueden eliminar sus archivos"
-- Target roles: authenticated
-- Policy definition: bucket_id = 'proformas'

-- ============================================
-- VERIFICAR POLÍTICAS
-- ============================================

-- Ver políticas de configuracion
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'configuracion';

-- Ver políticas de catalogo_productos
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'catalogo_productos';

-- Ver políticas de proformas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'proformas';

-- Ver políticas de detalle_proforma
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'detalle_proforma';

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard
-- 2. Abre SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Verifica que no haya errores
-- 6. Prueba crear un nuevo usuario y guardar configuración
-- ============================================
