-- ============================================
-- CREAR TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ============================================

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_empresa VARCHAR(255) DEFAULT 'BRADATEC',
  nombre_sistema VARCHAR(255) DEFAULT 'BRADATEC',
  representante VARCHAR(255) DEFAULT 'ING. DAVID POLO',
  ruc VARCHAR(20) DEFAULT '20608918371',
  logo_url TEXT,
  direccion VARCHAR(500) DEFAULT 'JIRON ZAVALA 501',
  telefono VARCHAR(50) DEFAULT '969142875',
  email VARCHAR(255) DEFAULT 'bradatecsrl@gmail.com',
  cuenta_banco VARCHAR(100) DEFAULT '480-77406530-0-76',
  cci VARCHAR(100) DEFAULT '002-480-177406530076-25',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- Comentarios
COMMENT ON TABLE configuracion_sistema IS 'Configuración personalizada del sistema por usuario';
COMMENT ON COLUMN configuracion_sistema.usuario_id IS 'ID del usuario propietario de la configuración';
COMMENT ON COLUMN configuracion_sistema.nombre_empresa IS 'Nombre de la empresa para el PDF';
COMMENT ON COLUMN configuracion_sistema.nombre_sistema IS 'Nombre del sistema';
COMMENT ON COLUMN configuracion_sistema.representante IS 'Nombre del representante';
COMMENT ON COLUMN configuracion_sistema.ruc IS 'RUC de la empresa';
COMMENT ON COLUMN configuracion_sistema.logo_url IS 'URL del logo en Cloudinary';

-- Desactivar RLS
ALTER TABLE configuracion_sistema DISABLE ROW LEVEL SECURITY;

-- Crear índice
CREATE INDEX idx_config_usuario ON configuracion_sistema(usuario_id);

-- Insertar configuración por defecto para usuarios existentes
INSERT INTO configuracion_sistema (usuario_id)
SELECT id FROM usuarios
ON CONFLICT (usuario_id) DO NOTHING;

-- Verificar
SELECT * FROM configuracion_sistema;

-- Mensaje de éxito
SELECT 'Tabla configuracion_sistema creada exitosamente' AS resultado;
