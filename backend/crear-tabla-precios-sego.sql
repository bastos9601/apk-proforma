-- Tabla para almacenar precios de productos de Sego
CREATE TABLE IF NOT EXISTS precios_sego (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(500) NOT NULL,
  precio_base DECIMAL(10, 2) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL, -- precio_base * 1.5
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id UUID REFERENCES auth.users(id),
  CONSTRAINT precio_base_positivo CHECK (precio_base > 0)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_precios_sego_sku ON precios_sego(sku);
CREATE INDEX IF NOT EXISTS idx_precios_sego_nombre ON precios_sego(nombre);

-- Trigger para actualizar precio_venta automáticamente
CREATE OR REPLACE FUNCTION actualizar_precio_venta()
RETURNS TRIGGER AS $$
BEGIN
  NEW.precio_venta = NEW.precio_base * 1.5;
  NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_precio_venta
BEFORE INSERT OR UPDATE OF precio_base ON precios_sego
FOR EACH ROW
EXECUTE FUNCTION actualizar_precio_venta();

-- Habilitar RLS
ALTER TABLE precios_sego ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver y editar sus propios precios
CREATE POLICY "Usuarios pueden ver sus precios" ON precios_sego
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus precios" ON precios_sego
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus precios" ON precios_sego
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus precios" ON precios_sego
  FOR DELETE USING (auth.uid() = usuario_id);
