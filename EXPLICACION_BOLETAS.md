# 🧾 Sistema de Boletas - Explicación

## 📊 FACTURA vs BOLETA en Perú

### FACTURA (Ya implementado ✅)

**Características:**
- Para empresas con RUC
- Requiere: RUC + Razón Social + Dirección
- Desglose obligatorio de IGV
- Numeración: F001-00001, F001-00002...
- Permite deducir impuestos
- Más formal

**Ejemplo:**
```
FACTURA F001-00001
─────────────────────
SEÑOR(ES): Empresa SAC
RUC: 20123456789
DIRECCIÓN: Av. Principal 123

Producto X    S/ 30.00
─────────────────────
Subtotal:     S/ 30.00
IGV (18%):    S/  5.40
─────────────────────
TOTAL:        S/ 35.40
```

---

### BOLETA DE VENTA (Por implementar)

**Características:**
- Para consumidores finales (personas)
- Solo requiere: Nombre (opcional)
- NO requiere RUC ni dirección
- IGV puede estar incluido o desglosado
- Numeración: B001-00001, B001-00002...
- NO permite deducir impuestos
- Más simple y rápida

**Ejemplo:**
```
BOLETA B001-00001
─────────────────────
CLIENTE: Juan Pérez

Producto X    S/ 35.40
─────────────────────
TOTAL:        S/ 35.40
(Incluye IGV)
```

O con desglose:
```
BOLETA B001-00001
─────────────────────
CLIENTE: Juan Pérez

Producto X    S/ 30.00
─────────────────────
Subtotal:     S/ 30.00
IGV (18%):    S/  5.40
─────────────────────
TOTAL:        S/ 35.40
```

---

## 🔄 Flujo con Boletas

```
Usuario crea Proforma → Cliente aprueba
                ↓
        ¿Tiene RUC?
        ↙         ↘
      SÍ          NO
       ↓           ↓
   FACTURA     BOLETA
   (F001)      (B001)
```

---

## 🛠️ Implementación de Boletas

### Archivos a crear:

**SQL:**
```sql
-- Tabla boletas (similar a facturas pero sin RUC/dirección obligatorios)
-- Tabla boleta_detalles
-- Tabla contador_boletas (serie B001)
```

**Servicios:**
```
frontend/src/servicios/
├── supabase.boleta.servicio.js  (CRUD boletas)
└── pdf.boleta.servicio.js       (PDF más simple)
```

**Pantallas:**
```
frontend/src/pantallas/
├── CrearBoleta.pantalla.js      (Solo pide nombre)
├── HistorialBoletas.pantalla.js (Lista de boletas)
└── DetalleBoleta.pantalla.js    (Ver boleta)
```

**Modificaciones:**
```
- VerProforma.pantalla.js → Agregar botón "Crear Boleta"
- HistorialProformas.pantalla.js → Agregar botón "Boletas"
- App.js → Agregar rutas de boletas
```

---

## 💡 Diferencias Técnicas

### Tabla Facturas (actual):
```sql
cliente_ruc TEXT NOT NULL,        ← Obligatorio
cliente_direccion TEXT NOT NULL,  ← Obligatorio
```

### Tabla Boletas (propuesta):
```sql
cliente_nombre TEXT,              ← Opcional
cliente_dni TEXT,                 ← Opcional (8 dígitos)
-- Sin RUC ni dirección
```

---

## 🎯 Ventajas de Implementar Boletas

✅ Atender clientes sin RUC
✅ Proceso más rápido (menos datos)
✅ Cumplimiento legal completo
✅ Separación clara de documentos
✅ Numeración independiente
✅ Reportes separados

---

## ⚠️ Importante - IGV Corregido

**ANTES (incorrecto):**
```
Proforma: S/ 30.00
Factura suma IGV: S/ 30.00 + S/ 5.40 = S/ 35.40 ❌
```

**AHORA (correcto):**
```
Proforma: S/ 35.40 (ya incluye IGV)
Factura desglose:
  Subtotal: S/ 30.00
  IGV 18%:  S/ 5.40
  Total:    S/ 35.40 ✅ (mismo precio)
```

---

¿Quieres que implemente el sistema de boletas ahora?
