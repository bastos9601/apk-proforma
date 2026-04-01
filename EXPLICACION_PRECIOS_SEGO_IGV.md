# 📊 Explicación: Precios de SEGO e IGV

## 🔄 Flujo Actual de Precios

### 1. Precio en SEGO (USD)
```
Producto: Mouse Logitech
Precio SEGO: $10.00 USD
```

### 2. Conversión a Soles
```
Tipo de cambio: S/ 3.80
Precio en Soles: $10.00 × 3.80 = S/ 38.00
```

### 3. Aplicar Margen de Ganancia (+50%)
```
Código: precioConMargen = precioEnSoles * 1.5
Resultado: S/ 38.00 × 1.5 = S/ 57.00
```

### 4. Este precio va a la Proforma
```
Proforma:
  Mouse Logitech
  Precio: S/ 57.00  ← Este es el precio que guardas
```

---

## ❓ ¿Los precios de SEGO incluyen IGV?

**Necesitas verificar en la página de SEGO:**

### Opción A: SEGO muestra precios SIN IGV ✅
```
SEGO: $10.00 USD (sin IGV)
  ↓
Tu sistema:
  S/ 38.00 (sin IGV)
  × 1.5 margen
  = S/ 57.00 (sin IGV) → Proforma
  
Al crear factura:
  Subtotal: S/ 57.00
  IGV 18%:  S/ 10.26
  ─────────────────
  TOTAL:    S/ 67.26  ✅ CORRECTO
```

### Opción B: SEGO muestra precios CON IGV ⚠️
```
SEGO: $10.00 USD (ya incluye IGV)
  ↓
Tu sistema:
  S/ 38.00 (con IGV)
  × 1.5 margen
  = S/ 57.00 (con IGV) → Proforma
  
Al crear factura:
  Subtotal: S/ 57.00
  IGV 18%:  S/ 10.26  ← Estás sumando IGV otra vez
  ─────────────────
  TOTAL:    S/ 67.26  ❌ IGV DUPLICADO
```

---

## 🔍 Cómo Verificar en SEGO

Revisa en la página de SEGO si:

1. **Los precios dicen:**
   - "Precio + IGV" → Ya incluye IGV
   - "Incluye IGV" → Ya incluye IGV
   - "Precio sin IGV" → NO incluye IGV
   - No dice nada → Probablemente NO incluye IGV

2. **Compara con factura de SEGO:**
   - Si SEGO te vende un producto a $10 USD
   - Revisa su factura/boleta
   - Si muestra desglose de IGV → Los precios web NO incluyen IGV
   - Si NO muestra desglose → Los precios web SÍ incluyen IGV

---

## 🛠️ Solución si SEGO incluye IGV

Si confirmas que SEGO muestra precios CON IGV, debes modificar:

**Archivo:** `frontend/src/pantallas/SegoWebView.pantalla.js`
**Línea:** 153

**Cambiar de:**
```javascript
precioConMargen: (p.precioBase * tipoCambio) * 1.5
```

**A:**
```javascript
// Quitar IGV de SEGO, convertir a soles, aplicar margen
precioSinIGV: (p.precioBase / 1.18) * tipoCambio,
precioConMargen: ((p.precioBase / 1.18) * tipoCambio) * 1.5
```

---

## 📋 Resumen

**Tu sistema actual:**
1. Toma precio de SEGO en USD
2. Convierte a soles (× tipo cambio)
3. Aplica margen +50%
4. Guarda en proforma como **subtotal**
5. Al crear factura, suma IGV 18%

**Si SEGO ya incluye IGV:**
- Debes dividir entre 1.18 primero
- Luego aplicar conversión y margen
- Así evitas cobrar IGV doble

**Si SEGO NO incluye IGV:**
- El código actual está perfecto ✅
- No necesitas cambiar nada

---

## ✅ Cambios Realizados en Factura

1. ✅ Botón "👁️ Ver PDF" agregado
2. ✅ Vencimiento eliminado del PDF
3. ✅ Diseño mejorado:
   - Gradientes y sombras
   - Mejor espaciado
   - Colores profesionales
   - Tipografía mejorada
   - Sección de contacto destacada

**Verifica en SEGO si incluyen IGV y me dices para ajustar el código si es necesario.**
