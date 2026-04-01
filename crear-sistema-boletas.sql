-- Sistema de Boletas de Venta
-- Completamente separado del sistema de facturas

-- Tabla principal de boletas
CREATE TABLE IF NOT EXISTS boletas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_boleta VARCHAR(20) UNIQUE NOT NULL,
  proforma_id UUID REFERENCES proformas(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Datos del cliente (más simples que factura)
  cliente_nombre VARCHAR(255),
  cliente_dni VARCHAR(8),
  
  -- Montos (igual que factura)
  subtotal DECIMAL(10, 2) NOT NULL,
  igv DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  total_letras TEXT,
  
  -- Fechas
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Estado de pago
  estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagada', 'anulada')),
  metodo_pago VARCHAR(50),
  fecha_pago DATE,
  
  -- Observaciones
  observaciones TEXT,
  notas_pago TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de boletas
CREATE TABLE IF NOT EXISTS boleta_detalles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boleta_id UUID REFERENCES boletas(id) ON DELETE CASCADE NOT NULL,
  
  -- Información del producto/servicio
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  imagen_url TEXT,
  
  -- Orden de visualización
  orden INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla contador de boletas
CREATE TABLE IF NOT EXISTS contador_boletas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ultimo_numero INTEGER DEFAULT 0 NOT NULL,
  serie VARCHAR(10) DEFAULT 'B001' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para obtener siguiente número de boleta
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_boleta()
RETURNS TEXT AS $$
DECLARE
  v_usuario_id UUID;
  v_ultimo_numero INTEGER;
  v_serie VARCHAR(10);
  v_numero_boleta TEXT;
BEGIN
  -- Obtener usuario actual
  v_usuario_id := auth.uid();
  
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener o crear contador para el usuario
  INSERT INTO contador_boletas (usuario_id, ultimo_numero, serie)
  VALUES (v_usuario_id, 0, 'B001')
  ON CONFLICT (usuario_id) DO NOTHING;
  
  -- Incrementar contador
  UPDATE contador_boletas
  SET ultimo_numero = ultimo_numero + 1,
      updated_at = NOW()
  WHERE usuario_id = v_usuario_id
  RETURNING ultimo_numero, serie INTO v_ultimo_numero, v_serie;
  
  -- Formatear número de boleta: B001-00001
  v_numero_boleta := v_serie || '-' || LPAD(v_ultimo_numero::TEXT, 5, '0');
  
  RETURN v_numero_boleta;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de boletas
CREATE OR REPLACE FUNCTION obtener_estadisticas_boletas(p_usuario_id UUID)
RETURNS TABLE (
  total_boletas BIGINT,
  boletas_pendientes BIGINT,
  boletas_pagadas BIGINT,
  total_por_cobrar DECIMAL,
  total_cobrado DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_boletas,
    COUNT(*) FILTER (WHERE estado_pago = 'pendiente')::BIGINT as boletas_pendientes,
    COUNT(*) FILTER (WHERE estado_pago = 'pagada')::BIGINT as boletas_pagadas,
    COALESCE(SUM(total) FILTER (WHERE estado_pago = 'pendiente'), 0) as total_por_cobrar,
    COALESCE(SUM(total) FILTER (WHERE estado_pago = 'pagada'), 0) as total_cobrado
  FROM boletas
  WHERE usuario_id = p_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_boletas_usuario ON boletas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_boletas_estado ON boletas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_boletas_fecha ON boletas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_boleta_detalles_boleta ON boleta_detalles(boleta_id);

-- RLS (Row Level Security)
ALTER TABLE boletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE boleta_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contador_boletas ENABLE ROW LEVEL SECURITY;

-- Políticas para boletas
CREATE POLICY "Usuarios pueden ver sus propias boletas"
  ON boletas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear sus propias boletas"
  ON boletas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias boletas"
  ON boletas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias boletas"
  ON boletas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para detalles de boletas
CREATE POLICY "Usuarios pueden ver detalles de sus boletas"
  ON boleta_detalles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boletas
    WHERE boletas.id = boleta_detalles.boleta_id
    AND boletas.usuario_id = auth.uid()
  ));

CREATE POLICY "Usuarios pueden crear detalles de sus boletas"
  ON boleta_detalles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boletas
    WHERE boletas.id = boleta_detalles.boleta_id
    AND boletas.usuario_id = auth.uid()
  ));

CREATE POLICY "Usuarios pueden actualizar detalles de sus boletas"
  ON boleta_detalles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boletas
    WHERE boletas.id = boleta_detalles.boleta_id
    AND boletas.usuario_id = auth.uid()
  ));

CREATE POLICY "Usuarios pueden eliminar detalles de sus boletas"
  ON boleta_detalles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boletas
    WHERE boletas.id = boleta_detalles.boleta_id
    AND boletas.usuario_id = auth.uid()
  ));

-- Políticas para contador de boletas
CREATE POLICY "Usuarios pueden ver su propio contador de boletas"
  ON contador_boletas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear su propio contador de boletas"
  ON contador_boletas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio contador de boletas"
  ON contador_boletas FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Comentarios
COMMENT ON TABLE boletas IS 'Boletas de venta para consumidores finales';
COMMENT ON TABLE boleta_detalles IS 'Detalles de productos/servicios en boletas';
COMMENT ON TABLE contador_boletas IS 'Contador de boletas por usuario (serie B001)';
