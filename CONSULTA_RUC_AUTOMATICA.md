# Consulta Automática de RUC desde SUNAT

## Funcionalidad Implementada

Se ha implementado la consulta automática de datos fiscales desde SUNAT al crear facturas.

## Cómo Funciona

1. **Ingreso de RUC**: Al escribir el RUC del cliente (11 dígitos)
2. **Consulta Automática**: El sistema consulta automáticamente en SUNAT
3. **Auto-completado**: Se llenan automáticamente:
   - Razón Social / Nombre de la empresa
   - Dirección fiscal completa (con distrito, provincia, departamento)
4. **Validación**: Se verifica que el RUC esté ACTIVO y HABIDO

## Características

- ✅ Consulta gratuita usando API de apis.net.pe
- ✅ No requiere token ni autenticación
- ✅ Validación de formato de RUC (debe empezar con 10, 15, 16, 17 o 20)
- ✅ Indicador visual mientras consulta (🔍 Consultando...)
- ✅ Alertas informativas sobre el estado del RUC
- ✅ Permite edición manual si la consulta falla
- ✅ Pre-llena el nombre del cliente desde la proforma

## Flujo de Usuario

### Caso 1: RUC Válido y Activo
1. Usuario ingresa RUC de 11 dígitos
2. Sistema muestra "🔍 Consultando..."
3. Campos se bloquean temporalmente
4. Datos se llenan automáticamente
5. Alerta: "✅ RUC Válido - Datos cargados automáticamente desde SUNAT"

### Caso 2: RUC Encontrado pero Inactivo
1. Usuario ingresa RUC
2. Sistema consulta y encuentra el RUC
3. Datos se llenan automáticamente
4. Alerta: "⚠️ Advertencia - RUC encontrado pero está INACTIVO - NO HABIDO"
5. Usuario puede continuar o corregir

### Caso 3: RUC No Encontrado
1. Usuario ingresa RUC
2. Sistema no encuentra información
3. Alerta: "RUC no encontrado - Ingrese los datos manualmente"
4. Usuario completa manualmente los campos

### Caso 4: Error de Conexión
1. Usuario ingresa RUC
2. Falla la conexión a SUNAT
3. Alerta: "Error - No se pudo consultar el RUC. Verifique su conexión"
4. Usuario puede reintentar o ingresar manualmente

## Validaciones

El formulario valida:
- RUC obligatorio (11 dígitos)
- Formato válido de RUC
- Razón Social obligatoria
- Dirección fiscal obligatoria
- Fecha de vencimiento obligatoria

## Archivos Modificados

1. `frontend/src/servicios/ruc.servicio.js` - Servicio de consulta RUC (NUEVO)
2. `frontend/src/pantallas/CrearFactura.pantalla.js` - Integración de auto-consulta
3. `frontend/src/servicios/supabase.factura.servicio.js` - Soporte para cliente_nombre

## API Utilizada

**Endpoint**: `https://dniruc.apisperu.com/api/v1/ruc/{ruc}?token={token}`

**Características**:
- API gratuita de apisperu.com
- Incluye token público de demostración
- Consulta directa a SUNAT

**Respuesta**:
```json
{
  "razonSocial": "EMPRESA EJEMPLO S.A.C.",
  "direccion": "AV. EJEMPLO 123 - MIRAFLORES - LIMA - LIMA",
  "estado": "ACTIVO",
  "condicion": "HABIDO",
  "departamento": "LIMA",
  "provincia": "LIMA",
  "distrito": "MIRAFLORES"
}
```

## Tipos de RUC Soportados

- **10**: Persona Natural
- **15**: Persona Natural (No domiciliado)
- **16**: Persona Natural (Extranjero)
- **17**: Persona Natural (Extranjero)
- **20**: Persona Jurídica (Empresa) ← Más común para facturas

## Notas Técnicas

- La consulta se dispara automáticamente al completar 11 dígitos
- Los campos se deshabilitan durante la consulta para evitar conflictos
- La dirección se formatea incluyendo distrito, provincia y departamento
- El nombre del cliente de la proforma se usa como valor inicial
- Si el usuario modifica el RUC después de la consulta, se vuelve a consultar
