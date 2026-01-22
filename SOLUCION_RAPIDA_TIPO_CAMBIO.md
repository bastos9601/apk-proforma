# ⚡ Solución Rápida: Error de tipo_cambio

## 🔴 Error:
```
Could not find the 'tipo_cambio' column
```

## ✅ Solución en 3 Pasos:

### 1️⃣ Abre Supabase
- Ve a: https://supabase.com
- Inicia sesión
- Selecciona tu proyecto

### 2️⃣ Ejecuta este SQL
1. Haz clic en **"SQL Editor"** (menú izquierdo)
2. Haz clic en **"New query"**
3. Copia y pega esto:

```sql
ALTER TABLE configuracion_sistema 
ADD COLUMN tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;

UPDATE configuracion_sistema 
SET tipo_cambio = 3.80 
WHERE tipo_cambio IS NULL;
```

4. Haz clic en **"Run"** (botón verde)

### 3️⃣ Prueba tu APK
1. Cierra y vuelve a abrir tu APK
2. Ve a **"Configuración"**
3. Cambia el tipo de cambio
4. Guarda
5. ¡Debería funcionar! ✅

---

## 📍 Ubicación del Script

El script completo está en:
```
backend/agregar-tipo-cambio.sql
```

O usa la versión simple:
```
backend/agregar-tipo-cambio-simple.sql
```

---

## 🎯 Resultado Esperado

Después de ejecutar el SQL, deberías ver:
```
✓ Success. No rows returned
```

Y tu tabla `configuracion_sistema` tendrá la nueva columna `tipo_cambio` con valor `3.80`.

---

**¡Eso es todo! Una vez ejecutado, tu APK funcionará correctamente.** 🚀
