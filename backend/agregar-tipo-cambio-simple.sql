-- Script simple para agregar tipo_cambio
-- Ejecuta esto en Supabase SQL Editor

ALTER TABLE configuracion_sistema 
ADD COLUMN tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;

UPDATE configuracion_sistema 
SET tipo_cambio = 3.80 
WHERE tipo_cambio IS NULL;
