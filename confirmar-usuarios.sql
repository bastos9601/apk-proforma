-- ============================================
-- Script para Confirmar Usuarios en Supabase
-- ============================================

-- 1. Ver usuarios no confirmados
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 2. Confirmar TODOS los usuarios (para desarrollo)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Verificar que se confirmaron
SELECT 
  id, 
  email, 
  email_confirmed_at,
  'Usuario confirmado' as status
FROM auth.users;

-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta (Ctrl+Enter o botón Run)
-- 5. Deberías ver los usuarios confirmados
-- 6. Intenta iniciar sesión de nuevo en la app
-- ============================================
