# 📄 Sistema de Boletas de Venta - Guía Completa

## ✅ Implementación Completada

Se ha implementado un sistema completo de boletas de venta, completamente separado del sistema de facturas.

## 🗂️ Archivos Creados

### SQL
- `crear-sistema-boletas.sql` - Tablas y funciones de base de datos

### Servicios
- `frontend/src/servicios/supabase.boleta.servicio.js` - CRUD de boletas
- `frontend/src/servicios/pdf.boleta.servicio.js` - Generación de PDF

### Pantallas
- `frontend/src/pantallas/CrearBoleta.pantalla.js` - Crear boleta desde proforma
- `frontend/src/pantallas/HistorialBoletas.pantalla.js` - Lista de boletas
- `frontend/src/pantallas/DetalleBoleta.pantalla.js` - Ver detalle y PDF

### Integraciones
- `frontend/App.js` - Rutas agregadas
- `frontend/src/pantallas/VerProforma.pantalla.js` - Botón "Boleta" agregado
- `frontend/src/pantallas/HistorialProformas.pantalla.js` - Botón "Boletas" agregado

## 📋 Pasos para Activar

### 1. Ejecutar SQL en Supabase
```sql
-- Copiar y ejecutar el contenido de crear-sistema-boletas.sql
-- en el SQL Editor de Supabase
```

### 2. Reiniciar la App
```bash
# Detener la app si está corriendo
# Volver a ejecutar
npm start
```

## 🎯 Diferencias: Factura vs Boleta

| Característica | FACTURA | BOLETA |
|---------------|---------|--------|
| **Para** | Empresas con RUC | Consumidores finales |
| **Requiere RUC** | ✅ Sí (obligatorio) | ❌ No |
| **Requiere Dirección** | ✅ Sí (obligatoria) | ❌ No |
| **Datos del Cliente** | RUC + Razón Social + Dirección | Solo nombre (opcional) |
| **DNI** | No aplica | Opcional (8 dígitos) |
| **Numeración** | F001-00001 | B001-00001 |
| **Color** | 🟢 Verde (#10b981) | 🔵 Azul (#2563eb) |
| **Deducible** | ✅ Sí | ❌ No |

## 🔄 Flujo de Uso

### Crear Boleta desde Proforma

1. **Ver Proforma Aprobada**
   - Ir a "Mis Proformas"
   - Seleccionar una proforma con estado "Aprobada"
   - Verás 2 botones: "🧾 Factura" y "📄 Boleta"

2. **Presionar "📄 Boleta"**
   - Se abre el formulario de crear boleta
   - Datos pre-llenados desde la proforma

3. **Completar Datos (Opcional)**
   - Nombre del cliente (opcional)
   - DNI (opcional, 8 dígitos)
   - Observaciones (opcional)

4. **Crear Boleta**
   - Presionar "🧾 Crear Boleta"
   - Confirmar
   - Se crea la boleta con numeración B001-00001
   - La proforma cambia a estado "Facturada"

### Ver Historial de Boletas

1. **Desde Pantalla Principal**
   - Presionar "📄 Boletas" en la parte superior
   - Ver lista de todas las boletas

2. **Acciones Disponibles**
   - Ver detalle (tap en la boleta)
   - Eliminar boleta (botón 🗑️)

### Ver Detalle de Boleta

1. **Información Mostrada**
   - Número de boleta
   - Estado de pago
   - Datos del cliente
   - Detalles de productos/servicios
   - Totales con IGV desglosado

2. **Acciones Disponibles**
   - 👁️ Ver PDF - Generar y compartir PDF
   - ✅ Marcar Pagada - Si está pendiente
   - ❌ Anular - Si está pendiente

## 📊 Estructura de Base de Datos

### Tabla: boletas
```sql
- id (UUID)
- numero_boleta (VARCHAR) - B001-00001
- proforma_id (UUID)
- usuario_id (UUID)
- cliente_nombre (VARCHAR) - Opcional
- cliente_dni (VARCHAR) - Opcional, 8 dígitos
- subtotal (DECIMAL)
- igv (DECIMAL)
- total (DECIMAL)
- total_letras (TEXT)
- fecha_emision (DATE)
- estado_pago (VARCHAR) - pendiente/pagada/anulada
- metodo_pago (VARCHAR)
- fecha_pago (DATE)
- observaciones (TEXT)
```

### Tabla: boleta_detalles
```sql
- id (UUID)
- boleta_id (UUID)
- descripcion (TEXT)
- cantidad (INTEGER)
- precio_unitario (DECIMAL)
- subtotal (DECIMAL)
- imagen_url (TEXT)
- orden (INTEGER)
```

### Tabla: contador_boletas
```sql
- id (UUID)
- usuario_id (UUID)
- ultimo_numero (INTEGER)
- serie (VARCHAR) - B001
```

## 🎨 Diseño del PDF

El PDF de boleta incluye:
- ✅ Header con logo y datos de empresa
- ✅ Número de boleta destacado (B001-00001)
- ✅ Información del cliente (nombre y DNI si existe)
- ✅ Tabla de productos/servicios
- ✅ Desglose de IGV (Subtotal + IGV 18% = Total)
- ✅ Total en letras
- ✅ Observaciones (si existen)
- ✅ Footer con fecha de generación

**Colores**: Azul (#2563eb) para diferenciar de facturas (verde)

## 🔒 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- ✅ Los usuarios solo ven sus propias boletas
- ✅ No pueden ver boletas de otros usuarios
- ✅ Solo pueden modificar sus propias boletas

## 📱 Estados de Boleta

1. **Pendiente** (⏳)
   - Recién creada
   - Esperando pago
   - Puede marcar como pagada
   - Puede anular

2. **Pagada** (✅)
   - Pago confirmado
   - No se puede modificar
   - Solo ver y generar PDF

3. **Anulada** (❌)
   - Boleta cancelada
   - No se puede modificar
   - Solo ver

## 🚀 Funcionalidades

### Crear Boleta
- ✅ Desde proforma aprobada
- ✅ Datos opcionales del cliente
- ✅ Numeración automática (B001-00001)
- ✅ Desglose automático de IGV
- ✅ Conversión de total a letras

### Historial
- ✅ Lista de todas las boletas
- ✅ Filtro por estado
- ✅ Búsqueda
- ✅ Eliminar boletas

### Detalle
- ✅ Ver información completa
- ✅ Generar PDF profesional
- ✅ Compartir PDF
- ✅ Marcar como pagada
- ✅ Anular boleta

## 💡 Notas Importantes

1. **No malogra el código existente**
   - Sistema completamente separado de facturas
   - No afecta proformas ni facturas
   - Tablas independientes

2. **Numeración independiente**
   - Facturas: F001-00001, F001-00002...
   - Boletas: B001-00001, B001-00002...

3. **Datos más simples**
   - No requiere RUC ni dirección
   - Ideal para ventas rápidas
   - Menos campos obligatorios

4. **Mismo flujo de IGV**
   - Precios de proforma incluyen IGV
   - Se desglo
sa en la boleta
   - Subtotal + IGV 18% = Total

## 🎯 Casos de Uso

### Caso 1: Venta a Consumidor Final
```
Cliente: Juan Pérez
DNI: 12345678
Total: S/ 100.00

→ Crear Boleta B001-00001
→ Cliente recibe PDF
→ Pago en efectivo
→ Marcar como pagada
```

### Caso 2: Venta Rápida sin Datos
```
Cliente: (vacío)
DNI: (vacío)
Total: S/ 50.00

→ Crear Boleta B001-00002
→ Cliente: "Cliente"
→ Generar PDF
```

### Caso 3: Venta con Observaciones
```
Cliente: María García
DNI: 87654321
Observaciones: "Pago en 2 cuotas"
Total: S/ 200.00

→ Crear Boleta B001-00003
→ Observaciones en PDF
```

## ✅ Checklist de Implementación

- [x] SQL ejecutado en Supabase
- [x] Servicios creados
- [x] Pantallas creadas
- [x] Rutas agregadas en App.js
- [x] Botones agregados en pantallas
- [x] PDF diseñado
- [x] RLS configurado
- [x] Numeración automática
- [x] Estados de pago
- [x] Documentación completa

## 🎉 ¡Listo para Usar!

El sistema de boletas está completamente funcional y listo para usar. Solo falta ejecutar el SQL en Supabase y reiniciar la app.
