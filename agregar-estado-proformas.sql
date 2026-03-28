-- Agregar columna de estado a la tabla proformas
ALTER TABLE proformas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'Pendiente';

-- Actualizar proformas existentes sin estado
UPDATE proformas 
SET estado = 'Pendiente' 
WHERE estado IS NULL;

-- Comentario: Estados posibles
-- 'Pendiente' - Recién creada, esperando revisión
-- 'Aprobada' - Cliente aprobó la proforma
-- 'Rechazada' - Cliente rechazó la proforma
-- 'Enviada' - Proforma enviada al cliente
-- 'Completada' - Trabajo completado y pagado
