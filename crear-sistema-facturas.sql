-- =====================================================
-- SISTEMA DE FACTURAS PARA BRAPRO
-- =====================================================
-- Este script crea las tablas necesarias para el módulo de facturas
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla principal de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_factura TEXT UNIQUE NOT NULL,
  proforma_id UUID REFERENCES proformas(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del cliente
  cliente_nombre TEXT NOT NULL,
  cliente_ruc TEXT,
  cliente_direccion TEXT,
  
  -- Montos (sin IGV, con IGV, total)
  subtotal DECIMAL(10,2) NOT NULL,
  igv DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  total_letras TEXT,
  
  -- Fechas
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  
  -- Estado de pago
  estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagada', 'vencida', 'anulada')),
  metodo_pago TEXT,
  fecha_pago DATE,
  
  -- Observaciones
  observaciones TEXT,
  notas_pago TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de detalles de factura
CREATE TABLE IF NOT EXISTS factura_detalles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  imagen_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla contador de facturas
CREATE TABLE IF NOT EXISTS contador_facturas (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ultimo_numero INTEGER DEFAULT 0,
  serie TEXT DEFAULT 'F001',
  CHECK (id = 1)
);

-- Insertar contador inicial si no existe
INSERT INTO contador_facturas (id, ultimo_numero, serie) 
VALUES (1, 0, 'F001')
ON CONFLICT (id) DO NOTHING;

-- 4. Función para obtener y actualizar el siguiente número de factura
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_factura()
RETURNS TEXT AS $$
DECLARE
  v_numero INTEGER;
  v_serie TEXT;
  v_numero_completo TEXT;
BEGIN
  -- Obtener y actualizar el contador
  UPDATE contador_facturas
  SET ultimo_numero = ultimo_numero + 1
  WHERE id = 1
  RETURNING ultimo_numero, serie INTO v_numero, v_serie;
  
  -- Formatear número: F001-00001
  v_numero_completo := v_serie || '-' || LPAD(v_numero::TEXT, 5, '0');
  
  RETURN v_numero_completo;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- 6. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_facturas_usuario ON facturas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_facturas_proforma ON facturas(proforma_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_emision ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_factura_detalles_factura ON factura_detalles(factura_id);

-- 7. Row Level Security (RLS)
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_detalles ENABLE ROW LEVEL SECURITY;

-- Políticas para facturas
CREATE POLICY "Usuarios ven sus propias facturas"
  ON facturas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios crean sus propias facturas"
  ON facturas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios actualizan sus propias facturas"
  ON facturas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios eliminan sus propias facturas"
  ON facturas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para detalles de factura
CREATE POLICY "Usuarios ven detalles de sus facturas"
  ON factura_detalles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM facturas
      WHERE facturas.id = factura_detalles.factura_id
      AND facturas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean detalles de sus facturas"
  ON factura_detalles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM facturas
      WHERE facturas.id = factura_detalles.factura_id
      AND facturas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios actualizan detalles de sus facturas"
  ON factura_detalles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM facturas
      WHERE facturas.id = factura_detalles.factura_id
      AND facturas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios eliminan detalles de sus facturas"
  ON factura_detalles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM facturas
      WHERE facturas.id = factura_detalles.factura_id
      AND facturas.usuario_id = auth.uid()
    )
  );

-- 8. Función para obtener estadísticas de facturas
CREATE OR REPLACE FUNCTION obtener_estadisticas_facturas(p_usuario_id UUID)
RETURNS TABLE (
  total_facturas BIGINT,
  facturas_pendientes BIGINT,
  facturas_pagadas BIGINT,
  facturas_vencidas BIGINT,
  total_por_cobrar DECIMAL,
  total_cobrado DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE estado_pago = 'pendiente')::BIGINT,
    COUNT(*) FILTER (WHERE estado_pago = 'pagada')::BIGINT,
    COUNT(*) FILTER (WHERE estado_pago = 'vencida')::BIGINT,
    COALESCE(SUM(total) FILTER (WHERE estado_pago IN ('pendiente', 'vencida')), 0),
    COALESCE(SUM(total) FILTER (WHERE estado_pago = 'pagada'), 0)
  FROM facturas
  WHERE usuario_id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Ahora puedes usar el sistema de facturas desde la app
