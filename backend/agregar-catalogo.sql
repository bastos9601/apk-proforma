-- ============================================
-- AGREGAR TABLA DE CATÁLOGO DE PRODUCTOS
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS catalogo_productos CASCADE;

-- Crear tabla de catálogo de productos
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

-- Desactivar RLS
ALTER TABLE catalogo_productos DISABLE ROW LEVEL SECURITY;

-- Crear índices
CREATE INDEX idx_catalogo_usuario ON catalogo_productos(usuario_id);
CREATE INDEX idx_catalogo_nombre ON catalogo_productos(nombre);
CREATE INDEX idx_catalogo_sku ON catalogo_productos(sku);

-- Verificar que se creó correctamente
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'catalogo_productos') as columnas
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name = 'catalogo_productos';

-- Mensaje de éxito
SELECT 'Tabla catalogo_productos creada exitosamente' AS resultado;
