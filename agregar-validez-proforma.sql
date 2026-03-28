-- ============================================
-- Agregar campo de validez a las proformas
-- ============================================

-- 1. Agregar columna fecha_validez (válida hasta)
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS fecha_validez DATE;

-- 2. Comentario
COMMENT ON COLUMN proformas.fecha_validez IS 'Fecha hasta la cual la proforma es válida';

-- 3. Crear índice para búsquedas por validez
CREATE INDEX IF NOT EXISTS idx_proformas_fecha_validez ON proformas(fecha_validez);

-- 4. Función para obtener proformas próximas a vencer (últimos 3 días de validez)
CREATE OR REPLACE FUNCTION obtener_proformas_por_vencer()
RETURNS TABLE (
  id UUID,
  numero_proforma VARCHAR,
  nombre_cliente VARCHAR,
  fecha_validez DATE,
  dias_restantes INTEGER,
  estado estado_proforma
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.numero_proforma,
    p.nombre_cliente,
    p.fecha_validez,
    (p.fecha_validez - CURRENT_DATE)::INTEGER as dias_restantes,
    p.estado
  FROM proformas p
  WHERE p.fecha_validez IS NOT NULL
    AND p.fecha_validez >= CURRENT_DATE
    AND p.fecha_validez <= CURRENT_DATE + INTERVAL '3 days'
    AND p.estado IN ('pendiente', 'enviada')
  ORDER BY p.fecha_validez ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para obtener proformas vencidas
CREATE OR REPLACE FUNCTION obtener_proformas_vencidas()
RETURNS TABLE (
  id UUID,
  numero_proforma VARCHAR,
  nombre_cliente VARCHAR,
  fecha_validez DATE,
  dias_vencidos INTEGER,
  estado estado_proforma
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.numero_proforma,
    p.nombre_cliente,
    p.fecha_validez,
    (CURRENT_DATE - p.fecha_validez)::INTEGER as dias_vencidos,
    p.estado
  FROM proformas p
  WHERE p.fecha_validez IS NOT NULL
    AND p.fecha_validez < CURRENT_DATE
    AND p.estado IN ('pendiente', 'enviada')
  ORDER BY p.fecha_validez DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Actualizar proformas existentes con validez de 5 días desde su creación
UPDATE proformas 
SET fecha_validez = (created_at + INTERVAL '5 days')::DATE
WHERE fecha_validez IS NULL;

-- ============================================
-- Verificar que se agregó correctamente
-- ============================================
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'proformas' 
AND column_name = 'fecha_validez';

-- Probar funciones
SELECT * FROM obtener_proformas_por_vencer();
SELECT * FROM obtener_proformas_vencidas();

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Verifica que aparezca la columna fecha_validez
-- ============================================
