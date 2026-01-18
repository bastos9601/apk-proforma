-- ============================================
-- AGREGAR DESCRIPCIÓN DEL SERVICIO A PROFORMAS
-- ============================================

-- Agregar columna descripcion_servicio a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN descripcion_servicio TEXT DEFAULT 'Por la presente ponemos a su consideración la cotización de instalación y reubicación';

-- Comentario
COMMENT ON COLUMN proformas.descripcion_servicio IS 'Descripción personalizada del servicio en la proforma';

-- Verificar
SELECT id, nombre_cliente, descripcion_servicio, fecha, total 
FROM proformas 
ORDER BY created_at DESC 
LIMIT 5;

-- Mensaje de éxito
SELECT 'Columna descripcion_servicio agregada exitosamente' AS resultado;
