-- Agregar campo para identificar si se creó factura o boleta desde la proforma

-- Agregar columna tipo_documento a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20);

-- Comentario
COMMENT ON COLUMN proformas.tipo_documento IS 'Tipo de documento creado: factura o boleta';

-- Actualizar proformas existentes que tienen facturas
UPDATE proformas p
SET tipo_documento = 'factura'
WHERE EXISTS (
  SELECT 1 FROM facturas f 
  WHERE f.proforma_id = p.id
)
AND tipo_documento IS NULL;

-- Actualizar proformas existentes que tienen boletas
UPDATE proformas p
SET tipo_documento = 'boleta'
WHERE EXISTS (
  SELECT 1 FROM boletas b 
  WHERE b.proforma_id = p.id
)
AND tipo_documento IS NULL;
