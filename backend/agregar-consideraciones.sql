-- Script para agregar columna 'consideraciones' a la tabla proformas
-- Ejecutar en Supabase SQL Editor

-- Agregar columna consideraciones (texto largo, opcional)
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS consideraciones TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN proformas.consideraciones IS 'Consideraciones o términos y condiciones de la proforma';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'proformas' AND column_name = 'consideraciones';
