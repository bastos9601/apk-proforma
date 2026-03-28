-- ============================================
-- Permitir lectura pública del logo en configuración
-- ============================================

-- Crear política para permitir que cualquiera vea el logo
-- (solo el logo, no otros datos sensibles)
CREATE POLICY "El logo es público para la pantalla de login"
ON configuracion FOR SELECT
TO anon
USING (true);

-- Verificar las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'configuracion';

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- ============================================
