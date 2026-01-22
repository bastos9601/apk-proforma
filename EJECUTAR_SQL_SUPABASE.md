# 🔧 Cómo Ejecutar SQL en Supabase

## Error Actual:
```
Could not find the 'tipo_cambio' column of 'configuracion_sistema' 
in the schema cache
```

**Causa**: La columna `tipo_cambio` no existe en la base de datos.

**Solución**: Ejecutar el script SQL para agregar la columna.

---

## 📋 Pasos para Ejecutar el SQL

### Paso 1: Abrir Supabase
1. Ve a: https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

### Paso 2: Abrir el Editor SQL
1. En el menú lateral izquierdo, busca **"SQL Editor"** o **"Editor SQL"**
2. Haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** o **"Nueva consulta"**

### Paso 3: Copiar el Script
Copia TODO el contenido del archivo `backend/agregar-tipo-cambio.sql`:

```sql
-- ============================================
-- AGREGAR COLUMNA TIPO_CAMBIO A CONFIGURACIÓN
-- ============================================

-- Agregar columna tipo_cambio
ALTER TABLE configuracion_sistema 
ADD COLUMN IF NOT EXISTS tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;

-- Comentario
COMMENT ON COLUMN configuracion_sistema.tipo_cambio IS 'Tipo de cambio USD a Soles para conversión de precios de Sego';

-- Actualizar registros existentes con valor por defecto
UPDATE configuracion_sistema 
SET tipo_cambio = 3.80 
WHERE tipo_cambio IS NULL;

-- Verificar
SELECT usuario_id, nombre_empresa, tipo_cambio 
FROM configuracion_sistema;

-- Mensaje de éxito
SELECT 'Columna tipo_cambio agregada exitosamente. Valor por defecto: 3.80' AS resultado;
```

### Paso 4: Pegar y Ejecutar
1. **Pega** el script en el editor SQL de Supabase
2. Haz clic en **"Run"** o **"Ejecutar"** (botón verde)
3. Espera a que termine la ejecución

### Paso 5: Verificar el Resultado
Deberías ver:
```
✓ Success. No rows returned
```

Y en la última consulta:
```
resultado: "Columna tipo_cambio agregada exitosamente. Valor por defecto: 3.80"
```

---

## 🎯 Alternativa: Ejecutar Solo lo Esencial

Si prefieres ejecutar solo lo mínimo necesario, copia y ejecuta esto:

```sql
ALTER TABLE configuracion_sistema 
ADD COLUMN IF NOT EXISTS tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;

UPDATE configuracion_sistema 
SET tipo_cambio = 3.80 
WHERE tipo_cambio IS NULL;
```

---

## ✅ Verificar que Funcionó

Después de ejecutar el script, verifica que la columna existe:

```sql
SELECT * FROM configuracion_sistema LIMIT 1;
```

Deberías ver la columna `tipo_cambio` con el valor `3.80`.

---

## 🔄 Probar en tu APK

1. **Cierra** tu APK completamente
2. **Vuelve a abrir** el APK
3. Ve a **"Configuración"**
4. Verás el campo **"Tipo de Cambio"** con el valor `3.80`
5. Intenta **cambiar** el valor a `3.85`
6. Presiona **"Guardar Configuración"**
7. Debería guardar sin errores

---

## 🐛 Si Sigue Dando Error

### Error: "Could not find the 'tipo_cambio' column"

**Solución 1**: Refrescar el caché de Supabase
1. En Supabase, ve a **"Settings"** → **"API"**
2. Busca **"Schema Cache"** o **"Caché de Esquema"**
3. Haz clic en **"Refresh"** o **"Refrescar"**

**Solución 2**: Verificar que la columna existe
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'configuracion_sistema';
```

Deberías ver `tipo_cambio` en la lista.

**Solución 3**: Reiniciar el proyecto de Supabase
1. Ve a **"Settings"** → **"General"**
2. Busca **"Pause project"** o **"Pausar proyecto"**
3. Pausa el proyecto
4. Espera 10 segundos
5. Haz clic en **"Resume"** o **"Reanudar"**

---

## 📸 Capturas de Pantalla (Referencia)

### 1. SQL Editor en Supabase:
```
┌─────────────────────────────────────┐
│ Supabase Dashboard                  │
├─────────────────────────────────────┤
│ ☰ Menu                              │
│   📊 Table Editor                   │
│   📝 SQL Editor      ← AQUÍ         │
│   🔐 Authentication                 │
│   📁 Storage                        │
└─────────────────────────────────────┘
```

### 2. Botón Run:
```
┌─────────────────────────────────────┐
│ [▶ Run]  [Save]  [Format]          │
├─────────────────────────────────────┤
│ ALTER TABLE configuracion_sistema   │
│ ADD COLUMN IF NOT EXISTS...         │
└─────────────────────────────────────┘
```

---

## 💡 Consejos

1. **Copia TODO el script** - No copies solo una parte
2. **Ejecuta una sola vez** - No ejecutes múltiples veces
3. **Espera el resultado** - Puede tardar unos segundos
4. **Verifica con SELECT** - Asegúrate de que la columna existe

---

## ✅ Checklist

- [ ] Abrir Supabase
- [ ] Ir a SQL Editor
- [ ] Copiar el script completo
- [ ] Pegar en el editor
- [ ] Ejecutar (Run)
- [ ] Verificar resultado exitoso
- [ ] Probar en el APK
- [ ] Guardar configuración sin errores

---

## 🆘 ¿Necesitas Ayuda?

Si después de ejecutar el script sigues teniendo problemas:

1. **Verifica** que estás en el proyecto correcto de Supabase
2. **Revisa** que la URL de Supabase en tu `.env` es correcta
3. **Comprueba** que tienes permisos de administrador en Supabase
4. **Intenta** refrescar el caché de Supabase

---

**¡Una vez ejecutado el script, tu APK podrá guardar el tipo de cambio sin problemas!** 🚀
