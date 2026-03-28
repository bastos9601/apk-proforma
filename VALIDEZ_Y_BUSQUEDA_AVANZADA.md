# Validez de Proformas y Búsqueda Avanzada - Implementación Completa

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. VALIDEZ DE PROFORMAS

#### Base de Datos
**Script SQL**: `agregar-validez-proforma.sql`

```sql
-- Columna agregada:
ALTER TABLE proformas ADD COLUMN fecha_validez DATE;

-- Funciones SQL creadas:
- obtener_proformas_por_vencer() -- Proformas que vencen en 3 días o menos
- obtener_proformas_vencidas()   -- Proformas ya vencidas
```

#### Características:

**Validez Automática**:
- Toda proforma nueva tiene validez de 30 días por defecto
- Se calcula automáticamente al crear
- Aparece en el PDF con color naranja distintivo

**Alertas Visuales**:
- 🟢 **Válida**: Más de 3 días restantes (verde)
- 🟡 **Por vencer**: 3 días o menos (amarillo/naranja)
- 🔴 **Vencida**: Fecha pasada (rojo)

**Componente AlertaValidez**:
```javascript
<AlertaValidez 
  fechaValidez="2026-02-15" 
  mostrarSiempre={true} 
/>
```

Muestra:
- "Válida por X días más" (verde)
- "Vence en X días" (amarillo)
- "Vence hoy" (naranja)
- "Vencida hace X días" (rojo)

#### Dónde se muestra:

1. **HistorialProformas**:
   - Banner de alertas en header (proformas vencidas/por vencer)
   - Badge en cada card de proforma
   - Contador de alertas

2. **VerProforma**:
   - Campo "Válida hasta" con fecha
   - AlertaValidez con días restantes
   - Color distintivo según estado

3. **PDF Generado**:
   - Recuadro "VÁLIDA HASTA" en naranja
   - Junto a la fecha de emisión
   - Formato: DD/MM/YYYY

#### Servicios Agregados:

```javascript
// Obtener proformas por vencer (3 días o menos)
obtenerProformasPorVencer()

// Obtener proformas vencidas
obtenerProformasVencidas()

// Calcular días restantes
calcularDiasValidez(fechaValidez)

// Verificar si está vencida
estaVencida(fechaValidez)

// Verificar si está por vencer
estaPorVencer(fechaValidez)
```

---

### 2. BÚSQUEDA AVANZADA

#### Componente BusquedaAvanzada
**Archivo**: `frontend/src/componentes/BusquedaAvanzada.js`

Modal completo con múltiples filtros:

**Filtros Disponibles**:

1. **Búsqueda por Texto**:
   - Busca en: nombre_cliente, numero_proforma, descripcion_servicio
   - Búsqueda insensible a mayúsculas/minúsculas
   - Búsqueda parcial (contiene)

2. **Filtro por Estado**:
   - Todos
   - Pendiente
   - Enviada
   - Aprobada
   - Rechazada
   - Facturada

3. **Rango de Fechas**:
   - Desde / Hasta (manual)
   - Botones rápidos:
     - Hoy
     - Últimos 7 días
     - Últimos 30 días
     - Últimos 3 meses

4. **Rango de Montos**:
   - Monto mínimo
   - Monto máximo
   - En soles (S/)

5. **Ordenamiento**:
   - Por: Fecha creación, Fecha proforma, Monto, Cliente, Validez
   - Dirección: Ascendente / Descendente

#### Búsqueda Rápida

Barra de búsqueda en HistorialProformas:
- Búsqueda en tiempo real
- Busca mientras escribes
- Botón de limpiar (X)
- Botón de búsqueda avanzada (⚙️)

#### Servicio de Búsqueda

```javascript
buscarProformas({
  texto: 'Juan',              // Búsqueda en texto
  estado: 'pendiente',        // Filtro por estado
  fechaDesde: '2026-01-01',   // Desde fecha
  fechaHasta: '2026-01-31',   // Hasta fecha
  montoMin: 100,              // Monto mínimo
  montoMax: 5000,             // Monto máximo
  ordenCampo: 'total',        // Campo de orden
  ordenDireccion: 'desc'      // Dirección
})
```

#### UI/UX:

**Barra de Búsqueda**:
- Input con icono de lupa
- Placeholder: "Buscar por cliente, número..."
- Botón X para limpiar
- Botón ⚙️ para abrir filtros avanzados

**Modal de Búsqueda Avanzada**:
- Slide desde abajo
- Scroll vertical para todos los filtros
- Chips para selección rápida
- Botones: "Limpiar" y "Aplicar Filtros"
- Cierre con X o tocando fuera

**Indicadores Visuales**:
- Chips activos resaltados en azul
- Contador de filtros activos
- Mensaje cuando no hay resultados

---

## 📋 INSTRUCCIONES DE USO

### Ejecutar Scripts SQL:

1. Ve a Supabase: https://qfinablpaknitaytdgoj.supabase.co
2. Abre **SQL Editor**
3. Ejecuta `agregar-validez-proforma.sql`
4. Verifica que la columna `fecha_validez` existe

### Usar Validez de Proformas:

1. **Crear proforma**: Automáticamente tiene 30 días de validez
2. **Ver alertas**: Abre HistorialProformas, verás banners de alertas
3. **Ver validez**: Abre cualquier proforma, verás "Válida hasta"
4. **En PDF**: La fecha de validez aparece en naranja

### Usar Búsqueda Avanzada:

1. **Búsqueda rápida**: Escribe en la barra superior
2. **Filtros avanzados**: Toca el botón ⚙️
3. **Seleccionar filtros**: Usa chips y campos
4. **Aplicar**: Toca "Aplicar Filtros"
5. **Limpiar**: Toca "Limpiar" o la X en la barra

---

## 🎯 CASOS DE USO

### Validez de Proformas:

**Escenario 1: Seguimiento de Proformas**
```
1. Cliente pide proforma
2. Creas proforma (válida 30 días)
3. Envías al cliente
4. App te alerta cuando faltan 3 días
5. Haces seguimiento antes de vencer
```

**Escenario 2: Proformas Vencidas**
```
1. Ves banner "2 proformas vencidas"
2. Tocas el banner
3. Ves cuáles son
4. Decides: renovar o archivar
```

### Búsqueda Avanzada:

**Escenario 1: Buscar Cliente**
```
1. Escribes "Juan" en barra
2. Ves todas las proformas de Juan
3. Seleccionas la que necesitas
```

**Escenario 2: Reporte Mensual**
```
1. Abres búsqueda avanzada
2. Seleccionas "Últimos 30 días"
3. Ordenas por "Monto" descendente
4. Ves las proformas más grandes del mes
```

**Escenario 3: Proformas Grandes Pendientes**
```
1. Abres búsqueda avanzada
2. Estado: "Pendiente"
3. Monto mínimo: 5000
4. Ordenas por fecha
5. Ves proformas grandes sin cerrar
```

---

## 🔧 ARCHIVOS MODIFICADOS

### Scripts SQL:
- `agregar-validez-proforma.sql` (nuevo)

### Servicios:
- `frontend/src/servicios/supabase.proforma.servicio.js`
  - `crearProforma()` - Agrega fecha_validez
  - `actualizarProforma()` - Actualiza fecha_validez
  - `buscarProformas()` - Nueva función
  - `obtenerProformasPorVencer()` - Nueva función
  - `obtenerProformasVencidas()` - Nueva función
  - `calcularDiasValidez()` - Nueva función
  - `estaVencida()` - Nueva función
  - `estaPorVencer()` - Nueva función

### Componentes:
- `frontend/src/componentes/BusquedaAvanzada.js` (nuevo)
- `frontend/src/componentes/AlertaValidez.js` (nuevo)

### Pantallas:
- `frontend/src/pantallas/HistorialProformas.pantalla.js`
  - Barra de búsqueda
  - Banners de alertas
  - Integración con BusquedaAvanzada
  - AlertaValidez en cards
  
- `frontend/src/pantallas/CrearProforma.pantalla.js`
  - Calcula fecha_validez automáticamente
  
- `frontend/src/pantallas/VerProforma.pantalla.js`
  - Muestra fecha_validez
  - Muestra AlertaValidez

### PDF:
- `frontend/src/servicios/pdf.servicio.js`
  - Muestra "VÁLIDA HASTA" en PDF
  - Formato con color naranja

---

## 📊 ESTADÍSTICAS Y MÉTRICAS

### Alertas de Validez:
```javascript
{
  porVencer: 3,    // Proformas que vencen en 3 días o menos
  vencidas: 2,     // Proformas ya vencidas
}
```

### Resultados de Búsqueda:
- Total de resultados encontrados
- Filtros activos aplicados
- Ordenamiento actual

---

## 🎨 DISEÑO Y COLORES

### AlertaValidez:
- 🟢 Verde (`#d1fae5`): Válida (más de 3 días)
- 🟡 Amarillo (`#fef3c7`): Por vencer (1-3 días)
- 🟠 Naranja (`#fef3c7`): Vence hoy
- 🔴 Rojo (`#fee2e2`): Vencida

### Búsqueda:
- Barra: Fondo gris claro (`#f3f4f6`)
- Botón avanzado: Azul (`#2563eb`)
- Chips activos: Azul claro (`#dbeafe`)
- Borde activo: Azul (`#2563eb`)

---

## ✨ CARACTERÍSTICAS DESTACADAS

### Validez:
- ✅ Cálculo automático de 30 días
- ✅ Alertas visuales por estado
- ✅ Banners de notificación
- ✅ Aparece en PDF
- ✅ Funciones SQL optimizadas
- ✅ Componente reutilizable

### Búsqueda:
- ✅ Búsqueda en tiempo real
- ✅ Múltiples filtros combinables
- ✅ Botones de rango rápido
- ✅ Ordenamiento flexible
- ✅ UI intuitiva con chips
- ✅ Limpiar con un toque

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

### Validez:
1. **Notificaciones Push**: Alertar cuando una proforma está por vencer
2. **Renovar Proforma**: Botón para extender validez
3. **Validez Personalizada**: Elegir días de validez al crear
4. **Historial de Renovaciones**: Registrar cambios de validez

### Búsqueda:
1. **Guardar Búsquedas**: Guardar filtros favoritos
2. **Exportar Resultados**: Exportar a Excel/PDF
3. **Búsqueda por Producto**: Buscar proformas con producto específico
4. **Autocompletado**: Sugerencias mientras escribes

---

## 📝 NOTAS TÉCNICAS

- Todas las fechas se manejan en formato ISO (YYYY-MM-DD)
- Las búsquedas son case-insensitive
- Los filtros se combinan con AND (todos deben cumplirse)
- El ordenamiento por defecto es por fecha de creación descendente
- Las alertas se recargan automáticamente al volver a la pantalla
- La búsqueda rápida tiene debounce implícito por React

---

## 🎓 EJEMPLOS DE CÓDIGO

### Usar AlertaValidez:
```javascript
import AlertaValidez from '../componentes/AlertaValidez';

<AlertaValidez 
  fechaValidez={proforma.fecha_validez} 
  mostrarSiempre={true} 
/>
```

### Usar BusquedaAvanzada:
```javascript
import BusquedaAvanzada from '../componentes/BusquedaAvanzada';

<BusquedaAvanzada
  visible={mostrarBusqueda}
  onClose={() => setMostrarBusqueda(false)}
  onBuscar={(filtros) => aplicarFiltros(filtros)}
  filtrosIniciales={filtrosActuales}
/>
```

### Buscar Proformas:
```javascript
import { buscarProformas } from '../servicios/supabase.proforma.servicio';

const resultados = await buscarProformas({
  texto: 'cliente',
  estado: 'pendiente',
  montoMin: 1000,
  ordenCampo: 'total',
  ordenDireccion: 'desc'
});
```

---

**Implementación completada exitosamente** ✅

Ambas funcionalidades están listas para usar. Solo ejecuta el script SQL y todo funcionará.
