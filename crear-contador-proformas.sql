-- ============================================
-- Crear sistema de numeración secuencial para proformas
-- ============================================

-- 1. Crear tabla para el contador
CREATE TABLE IF NOT EXISTS contador_proformas (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ultimo_numero INTEGER NOT NULL DEFAULT 4449,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT solo_una_fila CHECK (id = 1)
);

-- 2. Insertar el valor inicial (4449, para que la primera sea 4450)
INSERT INTO contador_proformas (id, ultimo_numero)
VALUES (1, 4449)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear función para obtener el siguiente número
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_proforma()
RETURNS INTEGER AS $$
DECLARE
  nuevo_numero INTEGER;
BEGIN
  UPDATE contador_proformas
  SET ultimo_numero = ultimo_numero + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING ultimo_numero INTO nuevo_numero;
  
  RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;

-- 4. Habilitar RLS en la tabla contador
ALTER TABLE contador_proformas ENABLE ROW LEVEL SECURITY;

-- 5. Permitir que usuarios autenticados lean el contador
CREATE POLICY "Usuarios pueden leer el contador"
ON contador_proformas FOR SELECT
TO authenticated
USING (true);

-- 6. Permitir que usuarios autenticados actualicen el contador
CREATE POLICY "Usuarios pueden actualizar el contador"
ON contador_proformas FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- Verificar que se creó correctamente
-- ============================================
SELECT * FROM contador_proformas;

-- Probar la función
SELECT obtener_siguiente_numero_proforma();
SELECT obtener_siguiente_numero_proforma();
SELECT obtener_siguiente_numero_proforma();

-- Debería mostrar 4450, 4451, 4452

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Verifica que aparezca el contador en 4449
-- ============================================
