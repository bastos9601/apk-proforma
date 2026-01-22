# 💱 Guía: Tipo de Cambio USD → Soles

## ✨ Nueva Funcionalidad

Tu APK ahora tiene una **configuración de tipo de cambio** que convierte automáticamente los precios de Sego de dólares a soles, y luego aplica el margen del 50%.

---

## 🎯 ¿Cómo Funciona?

### Fórmula Completa:
```
1. Precio Sego (USD): $ 98.42
2. Tipo de Cambio: S/ 3.80
3. Conversión a Soles: $ 98.42 × 3.80 = S/ 373.996
4. Margen del 50%: S/ 373.996 × 1.5 = S/ 560.99
5. Precio Final: S/ 560.99
```

---

## ⚙️ Configurar el Tipo de Cambio

### Paso 1: Ir a Configuración
1. Abre tu APK
2. Ve al menú principal
3. Presiona **"Configuración"**

### Paso 2: Actualizar Tipo de Cambio
1. Desplázate hasta la sección **"Tipo de Cambio (USD → Soles)"**
2. Verás el campo **"Tipo de Cambio"** con el valor actual (por defecto: 3.80)
3. **Ingresa el nuevo tipo de cambio** (ejemplo: 3.85)
4. Presiona **"Guardar Configuración"**

### Paso 3: Usar en Sego
1. Ve a **"Nueva Proforma"**
2. Presiona **"🌐 Navegar en Sego (Seleccionar Producto)"**
3. Busca productos
4. Los precios se convertirán automáticamente usando tu tipo de cambio

---

## 📊 Ejemplo Práctico

### Configuración:
```
Tipo de Cambio: S/ 3.80
```

### Producto en Sego:
```
DISCO DURO PURPLE WD 1TB
Precio con IGV: $ 98.42 USD
```

### En el Modal del APK:
```
┌─────────────────────────────────────┐
│ DISCO DURO PURPLE WD 1TB            │
│ SKU: SE-HDD1TB                      │
│ Sego: $ 98.42 USD                   │ ← Precio original
│ En Soles: S/ 373.996                │ ← 98.42 × 3.80
│ Venta (+50%): S/ 560.99             │ ← 373.996 × 1.5
└─────────────────────────────────────┘
```

### En el Alert de Confirmación:
```
┌─────────────────────────────────────┐
│      Agregar a Proforma             │
├─────────────────────────────────────┤
│ DISCO DURO PURPLE WD 1 TERA SATA    │
│                                     │
│ Precio Sego (USD): $ 98.42         │
│ Tipo de Cambio: S/ 3.80            │
│ Precio en Soles: S/ 373.996        │
│ Precio de Venta (+50%): S/ 560.99  │
│                                     │
│ ¿Agregar este producto a la         │
│ proforma?                           │
└─────────────────────────────────────┘
```

---

## 🔄 Cambiar el Tipo de Cambio

### Escenario: El dólar subió de S/ 3.80 a S/ 3.85

1. **Ve a Configuración**
2. **Cambia** el tipo de cambio de `3.80` a `3.85`
3. **Guarda** los cambios
4. **Vuelve a buscar** productos en Sego

### Resultado:
```
Antes (TC: 3.80):
$ 98.42 × 3.80 = S/ 373.996 → S/ 560.99 (+50%)

Después (TC: 3.85):
$ 98.42 × 3.85 = S/ 378.917 → S/ 568.38 (+50%)
```

---

## 💡 Casos de Uso

### Caso 1: Tipo de cambio estándar
```
Configuración: TC = 3.80
Producto: $ 100 USD
Resultado: S/ 380 → S/ 570 (+50%)
```

### Caso 2: Dólar alto
```
Configuración: TC = 4.00
Producto: $ 100 USD
Resultado: S/ 400 → S/ 600 (+50%)
```

### Caso 3: Dólar bajo
```
Configuración: TC = 3.60
Producto: $ 100 USD
Resultado: S/ 360 → S/ 540 (+50%)
```

---

## 📱 Interfaz de Configuración

### Pantalla de Configuración:
```
┌─────────────────────────────────────┐
│ Tipo de Cambio (USD → Soles)       │
├─────────────────────────────────────┤
│ Este tipo de cambio se usará para  │
│ convertir los precios de Sego de   │
│ dólares a soles                     │
│                                     │
│ Tipo de Cambio *                    │
│ ┌─────────────────────────────────┐ │
│ │ 3.80                            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Ejemplo: Si el tipo de cambio es   │
│ 3.80, un producto de $100 USD =    │
│ S/ 380                              │
└─────────────────────────────────────┘
```

---

## 🎯 Ventajas

| Ventaja | Descripción |
|---------|-------------|
| **Actualizable** | Cambia el tipo de cambio cuando quieras |
| **Automático** | Se aplica automáticamente a todos los productos |
| **Transparente** | Ves el precio en USD y en Soles |
| **Preciso** | Usa el tipo de cambio exacto que configures |
| **Flexible** | Puedes ajustarlo según el mercado |

---

## 🔢 Fórmulas

### Conversión USD → Soles:
```javascript
precioSoles = precioUSD × tipoCambio
```

### Aplicar Margen del 50%:
```javascript
precioVenta = precioSoles × 1.5
```

### Fórmula Completa:
```javascript
precioVenta = (precioUSD × tipoCambio) × 1.5
```

---

## ❓ Preguntas Frecuentes

### ¿Dónde encuentro el tipo de cambio actual?
Puedes consultar:
- **SBS**: https://www.sbs.gob.pe/app/pp/SISTIP_PORTAL/Paginas/Publicacion/TipoCambioPromedio.aspx
- **SUNAT**: https://www.sunat.gob.pe/cl-at-ittipcam/tcS01Alias
- **Bancos**: BCP, Interbank, BBVA

### ¿Con qué frecuencia debo actualizar el tipo de cambio?
Depende de tu negocio:
- **Diario**: Si los precios varían mucho
- **Semanal**: Para estabilidad
- **Mensual**: Si prefieres precios fijos

### ¿Qué pasa si no configuro el tipo de cambio?
Se usará el valor por defecto: **S/ 3.80**

### ¿Puedo usar decimales?
**Sí**, puedes usar hasta 4 decimales (ejemplo: 3.8542)

### ¿El tipo de cambio afecta productos ya agregados?
**No**, solo afecta productos nuevos que agregues desde Sego

---

## 🔧 Configuración en el Backend

### Tabla de Configuración:
```sql
ALTER TABLE configuracion_sistema 
ADD COLUMN tipo_cambio DECIMAL(10, 4) DEFAULT 3.80;
```

### Script SQL:
Ejecuta el archivo: `backend/agregar-tipo-cambio.sql`

---

## 📊 Comparación de Precios

### Con diferentes tipos de cambio:

| Precio USD | TC: 3.60 | TC: 3.80 | TC: 4.00 |
|------------|----------|----------|----------|
| $ 50       | S/ 270   | S/ 285   | S/ 300   |
| $ 100      | S/ 540   | S/ 570   | S/ 600   |
| $ 150      | S/ 810   | S/ 855   | S/ 900   |
| $ 200      | S/ 1080  | S/ 1140  | S/ 1200  |

*Precios con margen del 50% incluido*

---

## ✅ Resumen

**Implementado**:
- ✅ Campo de tipo de cambio en Configuración
- ✅ Conversión automática USD → Soles
- ✅ Visualización de precio en USD y Soles
- ✅ Aplicación del margen del 50% después de la conversión
- ✅ Valor por defecto: S/ 3.80

**Resultado**:
- 💱 **Conversión automática** de precios de Sego
- 🎯 **Precios precisos** según el tipo de cambio actual
- 📊 **Transparencia total** - ves USD y Soles
- ⚙️ **Configurable** - actualiza cuando quieras

**¡Tu APK ahora convierte automáticamente los precios de dólares a soles!** 🚀
