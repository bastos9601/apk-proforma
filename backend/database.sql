-- ============================================
-- BRADATEC - Base de Datos para Sistema de Proformas
-- Base de Datos: PostgreSQL (Supabase)
-- Versión: 2.0 (Sin RLS - Seguridad manejada por Backend)
-- ============================================

-- ============================================
-- IMPORTANTE: Limpiar base de datos existente
-- ============================================
-- Si ya tienes tablas creadas, ejecuta esto primero:

-- Eliminar triggers y funciones existentes
DROP TRIGGER IF EXISTS trigger_actualizar_proforma_timestamp ON proformas;
DROP FUNCTION IF EXISTS actualizar_timestamp();

-- Eliminar políticas RLS existentes
DROP POLICY IF EXISTS politica_ver_proformas ON proformas;
DROP POLICY IF EXISTS politica_crear_proformas ON proformas;
DROP POLICY IF EXISTS politica_actualizar_proformas ON proformas;
DROP POLICY IF EXISTS politica_eliminar_proformas ON proformas;

-- Eliminar vistas existentes
DROP VIEW IF EXISTS vista_resumen_proformas;
DROP VIEW IF EXISTS vista_estadisticas_usuario;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS contar_proformas_usuario(UUID);
DROP FUNCTION IF EXISTS total_facturado_usuario(UUID);

-- Eliminar tablas existentes (en orden correcto por dependencias)
DROP TABLE IF EXISTS detalle_proforma CASCADE;
DROP TABLE IF EXISTS proformas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================
-- 1. TABLA DE USUARIOS
-- ============================================
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN usuarios.id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.correo IS 'Correo electrónico único del usuario';
COMMENT ON COLUMN usuarios.password IS 'Contraseña encriptada con bcrypt';
COMMENT ON COLUMN usuarios.fecha_creacion IS 'Fecha de registro del usuario';

-- ============================================
-- 2. TABLA DE PROFORMAS
-- ============================================
CREATE TABLE proformas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  total_letras TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE proformas IS 'Tabla de proformas creadas por los usuarios';
COMMENT ON COLUMN proformas.id IS 'Identificador único de la proforma';
COMMENT ON COLUMN proformas.usuario_id IS 'ID del usuario que creó la proforma';
COMMENT ON COLUMN proformas.fecha IS 'Fecha de la proforma';
COMMENT ON COLUMN proformas.total IS 'Total de la proforma en números';
COMMENT ON COLUMN proformas.total_letras IS 'Total de la proforma en letras';
COMMENT ON COLUMN proformas.pdf_url IS 'URL del PDF generado (opcional)';
COMMENT ON COLUMN proformas.created_at IS 'Fecha de creación del registro';

-- ============================================
-- 3. TABLA DE DETALLES DE PROFORMA
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

-- Comentarios
COMMENT ON TABLE detalle_proforma IS 'Tabla de ítems/detalles de cada proforma';
COMMENT ON COLUMN detalle_proforma.id IS 'Identificador único del detalle';
COMMENT ON COLUMN detalle_proforma.proforma_id IS 'ID de la proforma a la que pertenece';
COMMENT ON COLUMN detalle_proforma.descripcion IS 'Descripción del servicio/producto';
COMMENT ON COLUMN detalle_proforma.cantidad IS 'Cantidad de unidades';
COMMENT ON COLUMN detalle_proforma.precio IS 'Precio unitario';
COMMENT ON COLUMN detalle_proforma.total IS 'Total del ítem (cantidad * precio)';
COMMENT ON COLUMN detalle_proforma.imagen_url IS 'URL de la imagen en Cloudinary';

-- ============================================
-- 4. TABLA DE CATÁLOGO DE PRODUCTOS PROPIOS
-- ============================================
CREATE TABLE catalogo_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  imagen_url TEXT NOT NULL,
  sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE catalogo_productos IS 'Catálogo de productos propios del usuario';
COMMENT ON COLUMN catalogo_productos.id IS 'Identificador único del producto';
COMMENT ON COLUMN catalogo_productos.usuario_id IS 'ID del usuario propietario';
COMMENT ON COLUMN catalogo_productos.nombre IS 'Nombre del producto';
COMMENT ON COLUMN catalogo_productos.descripcion IS 'Descripción del producto';
COMMENT ON COLUMN catalogo_productos.precio IS 'Precio del producto';
COMMENT ON COLUMN catalogo_productos.imagen_url IS 'URL de la imagen en Cloudinary';
COMMENT ON COLUMN catalogo_productos.sku IS 'Código SKU del producto (opcional)';

-- ============================================
-- 5. DESACTIVAR ROW LEVEL SECURITY
-- ============================================
-- La seguridad se maneja en el backend con JWT
-- No necesitamos RLS de Supabase

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE proformas DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_proforma DISABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_productos DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para buscar proformas por usuario
CREATE INDEX idx_proformas_usuario ON proformas(usuario_id);

-- Índice para buscar detalles por proforma
CREATE INDEX idx_detalle_proforma ON detalle_proforma(proforma_id);

-- Índice para buscar proformas por fecha
CREATE INDEX idx_proformas_fecha ON proformas(fecha DESC);

-- Índice para buscar usuarios por correo
CREATE INDEX idx_usuarios_correo ON usuarios(correo);

-- Índice para buscar productos por usuario
CREATE INDEX idx_catalogo_usuario ON catalogo_productos(usuario_id);

-- Índice para buscar productos por nombre
CREATE INDEX idx_catalogo_nombre ON catalogo_productos(nombre);

-- Índice para buscar productos por SKU
CREATE INDEX idx_catalogo_sku ON catalogo_productos(sku);

-- ============================================
-- 7. FUNCIONES ÚTILES
-- ============================================

-- Función para obtener el total de proformas de un usuario
CREATE OR REPLACE FUNCTION contar_proformas_usuario(p_usuario_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM proformas WHERE usuario_id = p_usuario_id);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el total facturado por un usuario
CREATE OR REPLACE FUNCTION total_facturado_usuario(p_usuario_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(total), 0) FROM proformas WHERE usuario_id = p_usuario_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VISTAS ÚTILES
-- ============================================

-- Vista: Resumen de proformas con cantidad de ítems
CREATE OR REPLACE VIEW vista_resumen_proformas AS
SELECT 
  p.id,
  p.usuario_id,
  u.correo AS usuario_correo,
  p.fecha,
  p.total,
  p.total_letras,
  COUNT(d.id) AS cantidad_items,
  p.created_at
FROM proformas p
LEFT JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN detalle_proforma d ON p.id = d.proforma_id
GROUP BY p.id, u.correo;

-- Vista: Estadísticas por usuario
CREATE OR REPLACE VIEW vista_estadisticas_usuario AS
SELECT 
  u.id AS usuario_id,
  u.correo,
  COUNT(p.id) AS total_proformas,
  COALESCE(SUM(p.total), 0) AS total_facturado,
  COALESCE(AVG(p.total), 0) AS promedio_proforma,
  MAX(p.fecha) AS ultima_proforma
FROM usuarios u
LEFT JOIN proformas p ON u.id = p.usuario_id
GROUP BY u.id, u.correo;

-- ============================================
-- 9. VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('usuarios', 'proformas', 'detalle_proforma', 'catalogo_productos')
ORDER BY table_name;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega TODO este script
-- 4. Ejecuta el script (Ctrl+Enter o botón Run)
-- 5. Verifica que aparezca "Success" y que las 3 tablas estén listadas
-- 6. Ve a Table Editor y verifica que veas: usuarios, proformas, detalle_proforma
