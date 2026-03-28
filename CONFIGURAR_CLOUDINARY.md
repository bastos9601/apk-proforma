# 🖼️ Configurar Cloudinary para Subida Directa

## Opción 1: Crear Upload Preset (RECOMENDADO)

### Paso 1: Ir a Cloudinary Dashboard
1. Ve a https://cloudinary.com/console
2. Inicia sesión con tu cuenta

### Paso 2: Crear Upload Preset
1. Ve a **Settings** (⚙️ en la esquina superior derecha)
2. Selecciona **Upload** en el menú lateral
3. Baja hasta **Upload presets**
4. Haz clic en **Add upload preset**

### Paso 3: Configurar el Preset
1. **Preset name:** `bradatec_unsigned`
2. **Signing mode:** Selecciona **Unsigned** (importante!)
3. **Folder:** `bradatec/proformas` (opcional)
4. **Access mode:** Public
5. Haz clic en **Save**

### Paso 4: Copiar el Preset Name
- Copia el nombre del preset (debería ser `bradatec_unsigned`)
- Ya está configurado en el código

### Paso 5: Actualizar los Imports
Reemplaza en tus pantallas:
```javascript
// Antes
import { subirImagen } from '../servicios/cloudinary.servicio';

// Después
import { subirImagen } from '../servicios/cloudinary.directo.servicio';
```

---

## Opción 2: Usar Supabase Storage (ALTERNATIVA)

Si prefieres no usar Cloudinary, puedes usar Supabase Storage:

### Ventajas:
- ✅ Todo en un solo lugar (Supabase)
- ✅ No necesitas cuenta de Cloudinary
- ✅ Incluido en el plan gratuito (1GB)

### Desventajas:
- ❌ Menos optimización de imágenes
- ❌ Sin CDN global como Cloudinary

¿Quieres que cree el servicio para Supabase Storage en su lugar?

---

## Opción 3: Usar API Key de Cloudinary (Más Seguro)

Si quieres usar la API key directamente (no recomendado para producción):

1. Ve a Cloudinary Dashboard
2. Copia tu **API Key** y **API Secret**
3. Usa el servicio con autenticación

**NOTA:** No expongas tu API Secret en el código del frontend. Usa upload presets unsigned para apps móviles.

---

## 🚀 Siguiente Paso

**Elige una opción:**

1. **Cloudinary con Upload Preset** (recomendado para producción)
   - Sigue los pasos arriba
   - Actualiza los imports en las pantallas

2. **Supabase Storage** (más simple)
   - Dime y creo el servicio

3. **Sin imágenes por ahora** (para pruebas rápidas)
   - Puedes crear proformas sin imágenes temporalmente
