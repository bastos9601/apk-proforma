# 🌐 Guía: WebView de Sego en tu APK

## ¿Qué es esto?

Tu APK ahora tiene un **navegador integrado** que te permite:
1. Iniciar sesión en Sego manualmente (con tu cuenta de distribuidor)
2. Buscar productos y ver los precios reales
3. Extraer automáticamente los datos (nombre, precio, descripción, imagen)
4. Guardar los productos en tu catálogo con el margen del 50%

## ¿Por qué esta solución?

El scraping automático no funcionaba porque:
- ❌ Las cookies de sesión no se mantenían entre páginas
- ❌ Los precios no aparecían en la página de búsqueda
- ❌ Tu cuenta de distribuidor requiere login manual

Con el WebView:
- ✅ **TÚ** inicias sesión manualmente (tu cuenta funciona perfectamente)
- ✅ **VES** los precios reales en el navegador
- ✅ **EL APK** extrae automáticamente los datos
- ✅ **SE APLICA** el margen del 50% automáticamente

---

## 📱 Cómo usar el WebView

### Paso 1: Abrir el navegador de Sego

1. Abre tu APK
2. Ve a **"Nueva Proforma"**
3. Presiona el botón azul **"🌐 Navegar en Sego (Extraer Precios)"**

### Paso 2: Iniciar sesión en Sego

1. Se abrirá el navegador con la página de login de Sego
2. Ingresa tus credenciales:
   - **Usuario**: Bradatecsrl@gmail.com
   - **Contraseña**: 20608918371
3. Presiona "Iniciar Sesión"

### Paso 3: Buscar productos

1. Usa la barra de búsqueda de Sego
2. Busca el producto que necesitas (ejemplo: "disco duro purple 1tb")
3. Espera a que cargue la página de resultados

### Paso 4: Extraer productos

Tienes **2 opciones**:

#### Opción A: Extracción Automática
- Cuando la página termine de cargar, el APK detectará automáticamente los productos
- Aparecerá un **Alert** preguntando: "¿Deseas agregar X productos a tu catálogo?"
- Presiona **"Agregar"**

#### Opción B: Extracción Manual
- Presiona el botón verde **"Extraer"** en la barra superior del navegador
- El APK escaneará la página y extraerá los productos
- Aparecerá el mismo Alert para confirmar

### Paso 5: Confirmar y guardar

1. Los productos se guardarán automáticamente en tu catálogo
2. Verás un mensaje: "✓ Productos Guardados - Exitosos: X"
3. Presiona "OK" para volver a la pantalla de crear proforma

---

## 🎯 ¿Qué datos se extraen?

Para cada producto, el APK extrae:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Nombre completo del producto | "DISCO DURO PURPLE WD 1 TERA SATA" |
| **SKU** | Código del producto | "SE-HDD1TB" |
| **Precio Base** | Precio con IGV de Sego | S/ 98.42 |
| **Precio Venta** | Precio base × 1.5 (+50%) | S/ 147.63 |
| **Descripción** | Descripción del producto | Igual al nombre o descripción específica |
| **Imagen** | URL de la imagen del producto | https://www.sego.com.pe/web/image/... |

---

## 🔧 Controles del navegador

La barra superior tiene estos botones:

| Botón | Función |
|-------|---------|
| **✕** | Cerrar el navegador y volver |
| **←** | Ir a la página anterior |
| **→** | Ir a la página siguiente |
| **⟳** | Recargar la página actual |
| **Extraer** | Extraer productos manualmente |

---

## 💡 Consejos y trucos

### Para mejores resultados:

1. **Espera a que cargue completamente** la página antes de extraer
2. **Busca productos específicos** en lugar de categorías generales
3. **Verifica los precios** en el navegador antes de extraer
4. **Navega libremente** - puedes ir a cualquier página de Sego

### Si no se extraen productos:

1. Verifica que estés en una página de búsqueda (`/shop?search=...`)
2. Asegúrate de haber iniciado sesión correctamente
3. Espera unos segundos más para que carguen los precios
4. Presiona el botón "Extraer" manualmente

### Si los precios no aparecen:

1. Verifica que tu cuenta de distribuidor esté aprobada
2. Contacta a Sego para confirmar que tu cuenta tiene acceso a precios
3. Intenta cerrar sesión y volver a iniciar sesión

---

## 🔍 Cómo funciona técnicamente

### 1. Inyección de JavaScript

Cuando cargas una página de Sego, el APK inyecta un script JavaScript que:
- Detecta si estás en una página de productos (`/shop`)
- Busca todos los elementos con clase `.tp-product-item`
- Extrae el nombre, SKU, precio, descripción e imagen de cada producto

### 2. Extracción de precios

El script busca el precio en este orden:
1. **"Precio con IGV: $ XX.XX"** (formato preferido)
2. Cualquier precio con símbolo `$`
3. Atributos `data-price` en el HTML

### 3. Aplicación del margen

```javascript
precioVenta = precioBase × 1.5  // +50% de margen
```

Ejemplo:
- Precio Sego (con IGV): S/ 98.42
- Precio de venta: S/ 147.63

### 4. Guardado en catálogo

Los productos se envían al backend mediante:
```javascript
POST /api/productos
{
  nombre: "DISCO DURO PURPLE WD 1 TERA SATA",
  descripcion: "...",
  precio: 147.63,  // Ya con el 50% de margen
  imagenUrl: "https://...",
  sku: "SE-HDD1TB"
}
```

---

## 📂 Archivos creados

### Frontend:
- `frontend/src/pantallas/SegoWebView.pantalla.js` - Pantalla del navegador
- `frontend/App.js` - Ruta agregada
- `frontend/src/pantallas/CrearProforma.pantalla.js` - Botón agregado

### Dependencias instaladas:
- `react-native-webview` - Para el navegador integrado

---

## ❓ Preguntas frecuentes

### ¿Puedo usar esto en producción?
Sí, el WebView funciona perfectamente en APKs compiladas.

### ¿Se guardan mis credenciales?
No, debes iniciar sesión cada vez que abras el WebView. Esto es más seguro.

### ¿Puedo extraer productos de cualquier página?
Sí, siempre que sea una página de búsqueda de Sego (`/shop?search=...`).

### ¿Qué pasa si Sego cambia su diseño?
El script de extracción usa selectores CSS estándar. Si Sego cambia su HTML, podría necesitar actualizarse.

### ¿Puedo modificar el margen del 50%?
Sí, edita esta línea en `SegoWebView.pantalla.js`:
```javascript
precioVenta: precio * 1.5  // Cambia 1.5 por el margen que quieras
```

---

## 🎉 ¡Listo!

Ahora puedes:
1. ✅ Iniciar sesión en Sego desde tu APK
2. ✅ Ver los precios reales de distribuidor
3. ✅ Extraer productos automáticamente
4. ✅ Guardarlos en tu catálogo con el margen del 50%
5. ✅ Usarlos en tus proformas

**¡Disfruta de tu nuevo sistema de precios de Sego!** 🚀
