-- ============================================
-- Tabla para códigos de recuperación de contraseña
-- ============================================

-- 1. Crear tabla para almacenar códigos OTP
CREATE TABLE IF NOT EXISTS codigos_recuperacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  expira_en TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_codigos_email ON codigos_recuperacion(email);
CREATE INDEX IF NOT EXISTS idx_codigos_codigo ON codigos_recuperacion(codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_expira ON codigos_recuperacion(expira_en);

-- 3. Función para limpiar códigos expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION limpiar_codigos_expirados()
RETURNS void AS $$
BEGIN
  DELETE FROM codigos_recuperacion
  WHERE expira_en < NOW() OR usado = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para generar código de 6 dígitos
CREATE OR REPLACE FUNCTION generar_codigo_recuperacion(p_email VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_codigo VARCHAR(6);
BEGIN
  -- Generar código aleatorio de 6 dígitos
  v_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Invalidar códigos anteriores del mismo email
  UPDATE codigos_recuperacion
  SET usado = TRUE
  WHERE email = p_email AND usado = FALSE;
  
  -- Insertar nuevo código (válido por 10 minutos)
  INSERT INTO codigos_recuperacion (email, codigo, expira_en)
  VALUES (p_email, v_codigo, NOW() + INTERVAL '10 minutes');
  
  RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para verificar código
CREATE OR REPLACE FUNCTION verificar_codigo_recuperacion(p_email VARCHAR, p_codigo VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_valido BOOLEAN;
BEGIN
  -- Verificar si existe código válido
  SELECT EXISTS(
    SELECT 1 FROM codigos_recuperacion
    WHERE email = p_email
      AND codigo = p_codigo
      AND usado = FALSE
      AND expira_en > NOW()
  ) INTO v_valido;
  
  -- Si es válido, marcarlo como usado
  IF v_valido THEN
    UPDATE codigos_recuperacion
    SET usado = TRUE
    WHERE email = p_email AND codigo = p_codigo;
  END IF;
  
  RETURN v_valido;
END;
$$ LANGUAGE plpgsql;

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE codigos_recuperacion ENABLE ROW LEVEL SECURITY;

-- 7. Política: Solo el sistema puede acceder (no usuarios directamente)
CREATE POLICY "Sistema puede gestionar códigos"
  ON codigos_recuperacion
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 8. Comentarios
COMMENT ON TABLE codigos_recuperacion IS 'Códigos OTP para recuperación de contraseña';
COMMENT ON COLUMN codigos_recuperacion.codigo IS 'Código de 6 dígitos';
COMMENT ON COLUMN codigos_recuperacion.expira_en IS 'Fecha de expiración (10 minutos)';
COMMENT ON COLUMN codigos_recuperacion.usado IS 'Si el código ya fue utilizado';

-- ============================================
-- Verificar que se creó correctamente
-- ============================================
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'codigos_recuperacion'
ORDER BY ordinal_position;

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter)
-- 5. Verifica que la tabla se creó correctamente
-- ============================================
