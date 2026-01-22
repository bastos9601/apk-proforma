# 🎯 Guía: Selección Individual de Productos desde Sego

## ✨ Nueva Funcionalidad

Ahora puedes **seleccionar productos individuales** desde Sego y agregarlos **directamente a tu proforma** (no al catálogo), con el precio con IGV +50% ya calculado.

---

## 📱 Cómo Funciona

### Paso 1: Abrir el Navegador de Sego
1. Ve a **"Nueva Proforma"**
2. Presiona **"🌐 Navegar en Sego (Seleccionar Producto)"** (botón azul)

### Paso 2: Iniciar Sesión
1. Ingresa tus credenciales de distribuidor:
   - **Usuario**: Bradatecsrl@gmail.com
   - **Contraseña**: 20608918371
2. Presiona "Iniciar Sesión"

### Paso 3: Buscar Productos
1. Usa la barra de búsqueda de Sego
2. Busca el producto que necesitas (ej: "disco duro purple 1tb")
3. Espera a que cargue la página

### Paso 4: Ver Lista de Productos
Tienes **2 opciones**:

#### Opción A: Automática
- Cuando la página termine de cargar, se abrirá automáticamente un **modal con la lista de productos**

#### Opción B: Manual
- Presiona el botón verde **"Ver Lista"** en la barra superior

### Paso 5: Seleccionar un Producto
1. En el modal verás todos los productos con:
   - **Imagen** del producto
   - **Nombre** completo
   - **SKU**
   - **Precio Sego** (con IGV)
   - **Precio Venta** (+50% de margen)

2. **Toca el producto** que quieres agregar

3. Aparecerá un **Alert de confirmación** mostrando:
   ```
   DISCO DURO PURPLE WD 1 TERA SATA
   
   Precio Sego (con IGV): S/ 98.42
   Precio de Venta (+50%): S/ 147.63
   
   ¿Agregar este producto a la proforma?
   ```

4. Presiona **"Agregar"**

### Paso 6: Completar el Ítem
1. Volverás automáticamente a **"Nueva Proforma"**
2. Los campos se llenarán automáticamente:
   - ✅ **Descripción**: Nombre del producto
   - ✅ **Precio**: Precio con margen del 50%
   - ✅ **Imagen**: Imagen del producto
   - ✅ **Cantidad**: 1 (por defecto)

3. **Ajusta la cantidad** si es necesario

4. Presiona **"Agregar Ítem"** para agregarlo a la lista de la proforma

---

## 🎨 Interfaz del Modal

```
┌─────────────────────────────────────────────┐
│ Selecciona un Producto (5)            [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [IMG] DISCO DURO PURPLE WD 1TB  [+] │   │
│  │       SKU: SE-HDD1TB                │   │
│  │       Precio Sego: S/ 98.42         │   │
│  │       Precio Venta: S/ 147.63       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [IMG] CAMARA IP 4MP HIKVISION   [+] │   │
│  │       SKU: SE-CAM4MP                │   │
│  │       Precio Sego: S/ 120.00        │   │
│  │       Precio Venta: S/ 180.00       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 💡 Ventajas del Nuevo Sistema

| Ventaja | Descripción |
|---------|-------------|
| **Selección Individual** | Eliges exactamente el producto que necesitas |
| **Directo a Proforma** | No se guarda en el catálogo, va directo a la proforma |
| **Precios Reales** | Ves el precio exacto de Sego con IGV |
| **Margen Automático** | El 50% se calcula automáticamente |
| **Vista Previa** | Ves todos los productos antes de seleccionar |
| **Fácil y Rápido** | Solo 1 clic para agregar el producto |

---

## 🔄 Flujo Completo

```
1. Presionar "🌐 Navegar en Sego"
   ↓
2. Iniciar sesión en Sego
   ↓
3. Buscar producto
   ↓
4. Se abre modal con lista de productos
   ↓
5. Tocar el producto deseado
   ↓
6. Confirmar en el Alert
   ↓
7. Volver a "Nueva Proforma" con campos llenos
   ↓
8. Ajustar cantidad
   ↓
9. Presionar "Agregar Ítem"
   ↓
10. ¡Producto agregado a la proforma!
```

---

## 📊 Ejemplo Práctico

### En Sego:
```
Producto: DISCO DURO PURPLE WD 1 TERA SATA
SKU: SE-HDD1TB
Precio con IGV: $ 98.42
```

### En el Modal:
```
┌─────────────────────────────────────┐
│ [IMG] DISCO DURO PURPLE WD 1TB  [+] │
│       SKU: SE-HDD1TB                │
│       Precio Sego: S/ 98.42         │
│       Precio Venta: S/ 147.63       │ ← 98.42 × 1.5
└─────────────────────────────────────┘
```

### En la Proforma:
```
Descripción: DISCO DURO PURPLE WD 1 TERA SATA
Cantidad: 1
Precio: S/ 147.63
Total: S/ 147.63
```

---

## ❓ Preguntas Frecuentes

### ¿Se guarda en mi catálogo?
**No**, el producto se agrega directamente a la proforma actual. Si quieres guardarlo en el catálogo, usa el botón "⭐ Guardar al Catálogo" después de agregarlo.

### ¿Puedo agregar varios productos?
**Sí**, puedes volver al WebView de Sego y seleccionar otro producto. Cada producto se agregará como un ítem separado en la proforma.

### ¿Puedo cambiar el precio?
**Sí**, después de que se llenen los campos, puedes modificar el precio manualmente antes de presionar "Agregar Ítem".

### ¿Qué pasa si no veo precios en Sego?
Verifica que tu cuenta de distribuidor esté aprobada. Si no ves precios, el modal estará vacío.

### ¿Puedo cerrar el modal sin seleccionar?
**Sí**, presiona el botón [✕] en la esquina superior derecha o el botón "Atrás" de tu celular.

---

## 🎯 Diferencias con el Sistema Anterior

| Característica | Antes | Ahora |
|----------------|-------|-------|
| **Destino** | Catálogo | Proforma directa |
| **Selección** | Todos los productos | Individual |
| **Confirmación** | Alert simple | Modal + Alert |
| **Vista previa** | No | Sí (modal con lista) |
| **Cantidad** | Manual | Pre-llenada (1) |

---

## 🚀 Consejos

1. **Busca específicamente**: Usa términos específicos para encontrar menos productos y elegir más fácil

2. **Verifica el precio**: Antes de confirmar, revisa que el precio con margen sea correcto

3. **Ajusta la cantidad**: Después de agregar, puedes cambiar la cantidad antes de agregar el ítem

4. **Usa el modal**: Es más fácil ver todos los productos en el modal que en el WebView

5. **Cierra el modal**: Si no encuentras lo que buscas, cierra el modal y busca otro término

---

## ✅ Resumen

**Antes**: Extraías todos los productos → Se guardaban en el catálogo → Los buscabas en el catálogo → Los agregabas a la proforma

**Ahora**: Buscas en Sego → Seleccionas el producto → Se agrega directo a la proforma

**¡Mucho más rápido y directo!** 🎉
