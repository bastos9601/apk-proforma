-- ============================================
-- Agregar columna tipo_cambio a la tabla configuracion
-- ============================================

-- Agregar la columna tipo_cambio con valor por defecto 3.80
ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS tipo_cambio DECIMAL(10,2) DEFAULT 3.80;

-- Comentario
COMMENT ON COLUMN configuracion.tipo_cambio IS 'Tipo de cambio USD a Soles para conversión de precios';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'configuracion' 
AND column_name = 'tipo_cambio';

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Deberías ver la columna tipo_cambio agregada
-- ============================================
