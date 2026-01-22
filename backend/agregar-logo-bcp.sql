-- Script para agregar columna 'logo_bcp_url' a la tabla configuracion_sistema
-- Ejecutar en Supabase SQL Editor

-- Agregar columna logo_bcp_url (URL del logo del banco)
ALTER TABLE configuracion_sistema 
ADD COLUMN IF NOT EXISTS logo_bcp_url TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN configuracion_sistema.logo_bcp_url IS 'URL del logo del banco (BCP) para mostrar en el footer del PDF';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'configuracion_sistema' AND column_name = 'logo_bcp_url';
