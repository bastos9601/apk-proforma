-- ============================================
-- VERIFICAR Y SOLUCIONAR PROBLEMA DE USUARIO
-- ============================================

-- 1. Ver todos los usuarios que existen
SELECT id, correo, fecha_creacion 
FROM usuarios 
ORDER BY fecha_creacion DESC;

-- 2. Buscar el usuario específico del error
SELECT id, correo 
FROM usuarios 
WHERE id = 'c804befc-00ee-419a-b40a-6ad10fd1dea5';

-- 3. Ver cuántos usuarios hay
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Si no hay usuarios o el usuario no existe, necesitas:
-- OPCIÓN A: Registrarte de nuevo en la app
-- OPCIÓN B: Crear el usuario manualmente (ver abajo)

-- ============================================
-- OPCIÓN B: Crear usuario manualmente (SOLO SI ES NECESARIO)
-- ============================================
-- IMPORTANTE: Cambia el correo y la contraseña
-- La contraseña debe estar encriptada con bcrypt

-- Ejemplo (NO EJECUTAR TODAVÍA):
-- INSERT INTO usuarios (id, correo, password, fecha_creacion)
-- VALUES (
--   'c804befc-00ee-419a-b40a-6ad10fd1dea5',
--   'tu_correo@ejemplo.com',
--   '$2b$10$hash_de_bcrypt_aqui',
--   NOW()
-- );
