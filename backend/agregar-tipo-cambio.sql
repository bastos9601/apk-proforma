-- ============================================
-- AGREGAR COLUMNA TIPO_CAMBIO A CONFIGURACIÓN
-- ============================================

-- Agregar columna tipo_cambio
ALTER TABLE configuracion_sistema 
ADD COLUMN IF NOT EXISTS tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;

-- Comentario
COMMENT ON COLUMN configuracion_sistema.tipo_cambio IS 'Tipo de cambio USD a Soles para conversión de precios de Sego';

-- Actualizar registros existentes con valor por defecto
UPDATE configuracion_sistema 
SET tipo_cambio = 3.80 
WHERE tipo_cambio IS NULL;

-- Verificar
SELECT usuario_id, nombre_empresa, tipo_cambio 
FROM configuracion_sistema;

-- Mensaje de éxito
SELECT 'Columna tipo_cambio agregada exitosamente. Valor por defecto: 3.80' AS resultado;
