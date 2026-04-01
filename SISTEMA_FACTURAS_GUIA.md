# 🧾 Sistema de Facturas - Guía de Implementación

## ✅ Archivos Creados

### Base de Datos (Supabase)
- `crear-sistema-facturas.sql` - Script SQL completo para crear tablas, funciones y políticas

### Frontend (React Native/Expo)
- `frontend/src/servicios/supabase.factura.servicio.js` - CRUD de facturas
- `frontend/src/servicios/pdf.factura.servicio.js` - Generación de PDF de facturas
- `frontend/src/componentes/EstadoPagoBadge.js` - Badge de estado de pago
- `frontend/src/pantallas/CrearFactura.pantalla.js` - Crear factura desde proforma
- `frontend/src/pantallas/HistorialFacturas.pantalla.js` - Lista de facturas
- `frontend/src/pantallas/DetalleFactura.pantalla.js` - Ver y gestionar factura

### Modificaciones
- `frontend/App.js` - Agregadas rutas de navegación para facturas
- `frontend/src/pantallas/VerProforma.pantalla.js` - Agregado botón "Crear Factura"
- `frontend/src/pantallas/HistorialProformas.pantalla.js` - Agregado botón "Facturas"

---

## 📋 Pasos para Activar el Sistema

### 1. Ejecutar SQL en Supabase

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `crear-sistema-facturas.sql`
4. Ejecuta el script (botón Run)
5. Verifica que se crearon las tablas:
   - `facturas`
   - `factura_detalles`
   - `contador_facturas`

### 2. Verificar en la App

La app ya está lista para usar facturas. No necesitas instalar nada adicional.

---

## 🎯 Cómo Usar el Sistema

### Flujo Completo

```
1. Crear Proforma con precio S/ 35.40 (ya incluye IGV)
2. Cambiar estado a "Aprobada"
3. Botón "🧾 Crear Factura" aparece
4. Completar datos fiscales (RUC, dirección)
5. Sistema desglose automáticamente:
   - Subtotal: S/ 30.00 (sin IGV)
   - IGV (18%): S/ 5.40
   - Total: S/ 35.40 (mismo precio)
6. Factura se crea con numeración F001-00001
7. Proforma cambia a estado "Facturada"
8. Generar y compartir PDF de factura
9. Marcar como pagada cuando el cliente pague
```

### Cálculo de IGV

**Importante:** El precio en la proforma YA INCLUYE IGV.
La factura solo DESGLOSE el IGV, no lo suma:

```
Proforma: S/ 35.40 (ya incluye IGV)
         ↓
Factura (desglose):
  Subtotal: S/ 30.00  (35.40 / 1.18)
  IGV 18%:  S/  5.40  (35.40 - 30.00)
  ─────────────────
  TOTAL:    S/ 35.40  (mismo precio)
```

**El cliente paga lo mismo**, solo se muestra el desglose fiscal.

### Acceso a Facturas

- Desde **Historial de Proformas** → Botón "🧾 Facturas" (arriba)
- Desde **Ver Proforma** (aprobada) → Botón "🧾 Crear Factura" (abajo)

### Eliminar Facturas

- En **Historial de Facturas** → Presiona el icono 🗑️ en cada factura
- O mantén presionado sobre la factura para eliminar

### Estados de Pago

- **⏳ Pendiente** - Factura emitida, esperando pago
- **✅ Pagada** - Cliente pagó la factura
- **⚠️ Vencida** - Pasó la fecha de vencimiento sin pagar
- **❌ Anulada** - Factura cancelada

---

## 🔑 Características Principales

### Diferencias: Proforma vs Factura

| Característica | Proforma | Factura |
|----------------|----------|---------|
| Propósito | Cotización | Documento fiscal |
| Modificable | ✅ Sí | ❌ No (solo anular) |
| IGV | Incluido | Desglosado (18%) |
| Numeración | PRO-001 | F001-00001 |
| Datos cliente | Nombre | RUC + Dirección |
| Estados | 5 estados | 4 estados de pago |

### Funcionalidades

✅ Crear factura desde proforma aprobada
✅ Numeración automática correlativa (F001-00001, F001-00002...)
✅ Desglose automático de IGV (18%) sobre el subtotal
✅ Gestión de estados de pago
✅ Alertas de vencimiento
✅ Registro de método de pago
✅ Generación de PDF con formato fiscal
✅ Compartir por WhatsApp, email, etc.
✅ Estadísticas: total por cobrar, total cobrado
✅ Anular facturas con motivo
✅ Eliminar facturas (botón 🗑️ o long press)

---

## 📊 Estructura de Datos

### Tabla: facturas
- `numero_factura` - F001-00001 (único, auto-generado)
- `proforma_id` - Referencia a proforma original
- `cliente_ruc` - RUC del cliente (11 dígitos)
- `subtotal` - Monto sin IGV
- `igv` - 18% del subtotal
- `total` - Subtotal + IGV
- `fecha_emision` - Fecha de creación
- `fecha_vencimiento` - Fecha límite de pago
- `estado_pago` - pendiente/pagada/vencida/anulada
- `metodo_pago` - Efectivo/Transferencia/Tarjeta/Yape

### Tabla: factura_detalles
- Copia de los items de la proforma
- Vinculada a la factura

### Tabla: contador_facturas
- Genera números correlativos automáticamente
- Serie configurable (F001, F002, etc.)

---

## 🎨 Interfaz de Usuario

### Pantalla: Historial de Facturas
- Estadísticas: Total, Pendientes, Pagadas
- Montos: Por Cobrar, Cobrado
- Lista de facturas con estado visual
- Pull to refresh

### Pantalla: Crear Factura
- Muestra datos de la proforma
- Desglose automático de IGV
- Formulario de datos fiscales:
  - RUC (obligatorio, 11 dígitos)
  - Dirección fiscal (obligatorio)
  - Fecha vencimiento (30 días por defecto)
  - Observaciones (opcional)

### Pantalla: Detalle de Factura
- Información completa de la factura
- Detalles de items
- Desglose de totales con IGV
- Botones:
  - ✅ Marcar como Pagada
  - 📄 Generar PDF
  - ❌ Anular

---

## 🚀 Próximos Pasos

1. **Ejecutar el SQL** en Supabase
2. **Probar la app**:
   - Crear una proforma
   - Aprobarla
   - Crear factura
   - Generar PDF
   - Marcar como pagada

3. **Opcional - Mejoras futuras**:
   - Reportes de facturación mensual
   - Exportar a Excel
   - Envío automático por email
   - Recordatorios de pago
   - Notas de crédito

---

## ⚠️ Importante

- Las facturas **NO se pueden editar** una vez creadas (solo anular)
- El número de factura es **único y correlativo**
- La proforma cambia a estado "facturada" automáticamente
- El IGV se calcula automáticamente (18%)
- Las facturas vencidas se marcan automáticamente

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que el SQL se ejecutó correctamente en Supabase
2. Revisa que las políticas RLS estén activas
3. Asegúrate de tener proformas en estado "aprobada"
4. Revisa los logs de la consola para errores

---

**Sistema implementado sin modificar el código existente de proformas** ✅
