-- ============================================
-- BRADATEC - Base de Datos con Supabase Auth
-- Base de Datos: PostgreSQL (Supabase)
-- Versión: 3.0 (Con RLS y Supabase Auth)
-- ============================================

-- ============================================
-- LIMPIAR BASE DE DATOS EXISTENTE
-- ============================================

-- Eliminar tablas existentes
DROP TABLE IF EXISTS detalle_proforma CASCADE;
DROP TABLE IF EXISTS proformas CASCADE;
DROP TABLE IF EXISTS catalogo_productos CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- ============================================
-- 1. TABLA DE PROFORMAS
-- ============================================
CREATE TABLE proformas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  total_letras TEXT NOT NULL,
  numero_proforma VARCHAR(50),
  nombre_cliente VARCHAR(255),
  descripcion_servicio TEXT,
  consideraciones TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE proformas IS 'Tabla de proformas creadas por los usuarios';

-- ============================================
-- 2. TABLA DE DETALLES DE PROFORMA
-- ============================================
CREATE TABLE detalle_proforma (
  id SERIAL PRIMARY KEY,
  proforma_id UUID NOT NULL REFERENCES proformas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  imagen_url TEXT
);

COMMENT ON TABLE detalle_proforma IS 'Tabla de ítems/detalles de cada proforma';

-- ============================================
-- 3. TABLA DE CATÁLOGO DE PRODUCTOS
-- ============================================
CREATE TABLE catalogo_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  imagen_url TEXT NOT NULL,
  sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE catalogo_productos IS 'Catálogo de productos propios del usuario';

-- ============================================
-- 4. TABLA DE CONFIGURACIÓN
-- ============================================
CREATE TABLE configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre_empresa VARCHAR(255) DEFAULT 'BRADATEC',
  nombre_sistema VARCHAR(255) DEFAULT 'BRADATEC',
  representante VARCHAR(255) DEFAULT 'ING. DAVID POLO',
  ruc VARCHAR(20) DEFAULT '20608918371',
  direccion TEXT DEFAULT 'JIRON ZAVALA 501',
  telefono VARCHAR(20) DEFAULT '969142875',
  email VARCHAR(255) DEFAULT 'bradatecsrl@gmail.com',
  cuenta_banco VARCHAR(50) DEFAULT '480-77406530-0-76',
  cci VARCHAR(50) DEFAULT '002-480-177406530076-25',
  tipo_cambio DECIMAL(10,2) DEFAULT 3.80,
  logo_url TEXT,
  logo_bcp_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE configuracion IS 'Configuración personalizada por usuario';

-- ============================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_proforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Políticas para PROFORMAS
CREATE POLICY "Los usuarios pueden ver sus propias proformas"
  ON proformas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propias proformas"
  ON proformas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias proformas"
  ON proformas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias proformas"
  ON proformas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para DETALLE_PROFORMA
CREATE POLICY "Los usuarios pueden ver detalles de sus proformas"
  ON detalle_proforma FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proformas
      WHERE proformas.id = detalle_proforma.proforma_id
      AND proformas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden crear detalles en sus proformas"
  ON detalle_proforma FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proformas
      WHERE proformas.id = detalle_proforma.proforma_id
      AND proformas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden actualizar detalles de sus proformas"
  ON detalle_proforma FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proformas
      WHERE proformas.id = detalle_proforma.proforma_id
      AND proformas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden eliminar detalles de sus proformas"
  ON detalle_proforma FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proformas
      WHERE proformas.id = detalle_proforma.proforma_id
      AND proformas.usuario_id = auth.uid()
    )
  );

-- Políticas para CATALOGO_PRODUCTOS
CREATE POLICY "Los usuarios pueden ver sus propios productos"
  ON catalogo_productos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propios productos"
  ON catalogo_productos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios productos"
  ON catalogo_productos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios productos"
  ON catalogo_productos FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para CONFIGURACION
CREATE POLICY "Los usuarios pueden ver su propia configuración"
  ON configuracion FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear su propia configuración"
  ON configuracion FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar su propia configuración"
  ON configuracion FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar su propia configuración"
  ON configuracion FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================================
-- 7. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX idx_proformas_usuario ON proformas(usuario_id);
CREATE INDEX idx_proformas_fecha ON proformas(fecha DESC);
CREATE INDEX idx_detalle_proforma ON detalle_proforma(proforma_id);
CREATE INDEX idx_catalogo_usuario ON catalogo_productos(usuario_id);
CREATE INDEX idx_catalogo_nombre ON catalogo_productos(nombre);
CREATE INDEX idx_configuracion_usuario ON configuracion(usuario_id);

-- ============================================
-- 8. FUNCIONES ÚTILES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER trigger_proformas_updated_at
  BEFORE UPDATE ON proformas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_catalogo_updated_at
  BEFORE UPDATE ON catalogo_productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- ============================================
-- 9. VERIFICACIÓN
-- ============================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('proformas', 'detalle_proforma', 'catalogo_productos', 'configuracion')
ORDER BY table_name;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- INSTRUCCIONES DE USO:
-- 1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
-- 2. Abre el SQL Editor
-- 3. Copia y pega TODO este script
-- 4. Ejecuta el script (Ctrl+Enter o botón Run)
-- 5. Verifica que aparezca "Success" y las 4 tablas estén listadas
-- 6. Ve a Authentication > Providers y asegúrate de que Email esté habilitado
-- 7. Copia tu URL y anon key desde Settings > API
-- 8. Pégalas en frontend/src/config/supabase.config.js
