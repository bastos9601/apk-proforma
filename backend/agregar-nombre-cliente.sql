-- ============================================
-- AGREGAR NOMBRE DEL CLIENTE A PROFORMAS
-- ============================================

-- Agregar columna nombre_cliente a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN nombre_cliente VARCHAR(255);

-- Comentario
COMMENT ON COLUMN proformas.nombre_cliente IS 'Nombre del cliente de la proforma';

-- Actualizar proformas existentes con un valor por defecto
UPDATE proformas 
SET nombre_cliente = 'CLIENTE' 
WHERE nombre_cliente IS NULL;

-- Verificar
SELECT id, nombre_cliente, fecha, total 
FROM proformas 
ORDER BY created_at DESC 
LIMIT 5;

-- Mensaje de éxito
SELECT 'Columna nombre_cliente agregada exitosamente' AS resultado;
