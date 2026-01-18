-- ============================================
-- AGREGAR NÚMERO DE PROFORMA AUTOMÁTICO
-- ============================================

-- 1. Agregar columna numero_proforma a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN numero_proforma INTEGER;

-- 2. Crear secuencia que comience en 44125
CREATE SEQUENCE IF NOT EXISTS seq_numero_proforma START WITH 44125;

-- 3. Actualizar proformas existentes con números consecutivos desde 44125
DO $$
DECLARE
  proforma_record RECORD;
  contador INTEGER := 44125;
BEGIN
  FOR proforma_record IN 
    SELECT id FROM proformas ORDER BY created_at ASC
  LOOP
    UPDATE proformas 
    SET numero_proforma = contador 
    WHERE id = proforma_record.id;
    contador := contador + 1;
  END LOOP;
END $$;

-- 4. Establecer el valor por defecto para nuevas proformas
ALTER TABLE proformas 
ALTER COLUMN numero_proforma SET DEFAULT nextval('seq_numero_proforma');

-- 5. Hacer que el campo sea NOT NULL
ALTER TABLE proformas 
ALTER COLUMN numero_proforma SET NOT NULL;

-- 6. Crear índice único para el número de proforma
CREATE UNIQUE INDEX idx_numero_proforma ON proformas(numero_proforma);

-- 7. Comentario
COMMENT ON COLUMN proformas.numero_proforma IS 'Número correlativo de proforma, comienza en 44125';

-- 8. Verificar
SELECT id, numero_proforma, fecha, total 
FROM proformas 
ORDER BY numero_proforma DESC 
LIMIT 5;

-- Mensaje de éxito
SELECT 'Columna numero_proforma agregada exitosamente. Próximo número: ' || nextval('seq_numero_proforma') AS resultado;
