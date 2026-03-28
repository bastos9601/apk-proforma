-- ============================================
-- Agregar sistema de estados a las proformas
-- ============================================

-- 1. Crear tipo ENUM para los estados
CREATE TYPE estado_proforma AS ENUM (
  'pendiente',
  'enviada',
  'aprobada',
  'rechazada',
  'facturada'
);

-- 2. Agregar columna de estado a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS estado estado_proforma DEFAULT 'pendiente';

-- 3. Agregar columna para fecha de cambio de estado
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS fecha_estado TIMESTAMP DEFAULT NOW();

-- 4. Agregar columna para notas sobre el estado
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS notas_estado TEXT;

-- 5. Comentarios
COMMENT ON COLUMN proformas.estado IS 'Estado actual de la proforma';
COMMENT ON COLUMN proformas.fecha_estado IS 'Fecha del último cambio de estado';
COMMENT ON COLUMN proformas.notas_estado IS 'Notas adicionales sobre el estado';

-- 6. Crear índice para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_proformas_estado ON proformas(estado);

-- 7. Actualizar proformas existentes a estado 'pendiente'
UPDATE proformas 
SET estado = 'pendiente', 
    fecha_estado = created_at
WHERE estado IS NULL;

-- ============================================
-- Verificar que se agregó correctamente
-- ============================================
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'proformas' 
AND column_name IN ('estado', 'fecha_estado', 'notas_estado');

-- Ver distribución de estados
SELECT estado, COUNT(*) as cantidad
FROM proformas
GROUP BY estado
ORDER BY cantidad DESC;

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Verifica que aparezcan las nuevas columnas
-- ============================================
