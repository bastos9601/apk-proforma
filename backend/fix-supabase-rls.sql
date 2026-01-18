-- ============================================
-- SOLUCIÓN: Desactivar RLS para permitir registro
-- ============================================

-- Opción 1: Desactivar RLS en la tabla usuarios (RECOMENDADO para este proyecto)
-- Esto permite que el backend maneje toda la lógica de seguridad
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- También desactivar en las otras tablas para evitar problemas
ALTER TABLE proformas DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_proforma DISABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTA: 
-- En este proyecto, la seguridad se maneja a nivel de backend con JWT.
-- No necesitamos RLS de Supabase porque:
-- 1. El backend valida el token JWT en cada petición
-- 2. Los usuarios solo pueden acceder a sus propios datos
-- 3. Todas las consultas pasan por el backend, no directamente desde el frontend
-- ============================================
