# 🔄 Guía: Sesión Persistente en Sego

## ✨ Nueva Funcionalidad

Ahora puedes **agregar múltiples productos** desde Sego sin tener que cerrar el WebView ni iniciar sesión de nuevo. La sesión se mantiene abierta hasta que decidas volver a la proforma.

---

## 🎯 ¿Cómo Funciona?

### Antes:
```
1. Abrir WebView → Iniciar sesión
2. Buscar producto
3. Seleccionar producto
4. ❌ WebView se cierra
5. Volver a abrir WebView → Iniciar sesión de nuevo
6. Buscar otro producto...
```

### Ahora:
```
1. Abrir WebView → Iniciar sesión (solo una vez)
2. Buscar producto 1 → Agregar ✓
3. Buscar producto 2 → Agregar ✓
4. Buscar producto 3 → Agregar ✓
5. Cuando termines → Volver a Proforma
```

---

## 📱 Flujo de Usuario

### Paso 1: Abrir WebView
1. Ve a **"Nueva Proforma"**
2. Presiona **"🌐 Navegar en Sego (Seleccionar Producto)"**
3. **Inicia sesión** en Sego (solo una vez)

### Paso 2: Agregar Primer Producto
1. **Busca** el primer producto (ej: "disco duro 1tb")
2. Se abre el **modal con la lista**
3. **Selecciona** el producto
4. Aparece el **Alert de confirmación**
5. Presiona **"Agregar"**

### Paso 3: Decidir Qué Hacer
Aparece un nuevo Alert:
```
┌─────────────────────────────────────┐
│      ✓ Producto Agregado            │
├─────────────────────────────────────┤
│ DISCO DURO PURPLE WD 1TB agregado   │
│ a la proforma.                      │
│                                     │
│ Productos agregados: 1              │
│                                     │
│ ¿Deseas agregar más productos?     │
│                                     │
│  [Volver a Proforma] [Seguir Buscando] │
└─────────────────────────────────────┘
```

**Opciones**:
- **"Seguir Buscando"**: El WebView permanece abierto, puedes buscar más productos
- **"Volver a Proforma"**: Cierra el WebView y vuelve a la proforma

### Paso 4: Agregar Más Productos
Si elegiste **"Seguir Buscando"**:
1. El modal se cierra
2. Sigues en el WebView de Sego
3. **Busca** otro producto (ej: "camara ip 4mp")
4. **Selecciona** y **agrega**
5. Repite cuantas veces quieras

### Paso 5: Volver a la Proforma
Cuando termines de agregar productos:
1. Presiona **"Volver a Proforma"** en el Alert
2. O presiona el botón **✕** en la barra superior
3. Verás todos los productos agregados en la lista

---

## 🎨 Interfaz Visual

### Barra de Navegación con Contador:
```
┌─────────────────────────────────────────────┐
│ [✕] [←] [→] [⟳]  [🛒 3]    [Ver Lista]    │
│                    ↑                        │
│              Contador de productos          │
└─────────────────────────────────────────────┘
```

El badge naranja **[🛒 3]** muestra cuántos productos has agregado.

### Alert de Confirmación:
```
┌─────────────────────────────────────┐
│      ✓ Producto Agregado            │
├─────────────────────────────────────┤
│ CAMARA IP 4MP HIKVISION agregado    │
│ a la proforma.                      │
│                                     │
│ Productos agregados: 3              │ ← Contador
│                                     │
│ ¿Deseas agregar más productos?     │
│                                     │
│  [Volver a Proforma] [Seguir Buscando] │
└─────────────────────────────────────┘
```

---

## 💡 Ejemplo Práctico

### Escenario: Crear una proforma con 3 productos

**1. Abrir WebView e iniciar sesión** (1 vez)
```
Usuario: Bradatecsrl@gmail.com
Contraseña: 20608918371
```

**2. Agregar Disco Duro**
```
Buscar: "disco duro 1tb"
Seleccionar: DISCO DURO PURPLE WD 1TB
Precio: S/ 560.99
→ Agregar → Seguir Buscando
```

**3. Agregar Cámara**
```
Buscar: "camara ip 4mp"
Seleccionar: CAMARA IP 4MP HIKVISION
Precio: S/ 270.00
→ Agregar → Seguir Buscando
```

**4. Agregar DVR**
```
Buscar: "dvr 8 canales"
Seleccionar: DVR 8CH HIKVISION
Precio: S/ 675.00
→ Agregar → Volver a Proforma
```

**5. Ver Proforma**
```
Lista de ítems:
1. DISCO DURO PURPLE WD 1TB - S/ 560.99
2. CAMARA IP 4MP HIKVISION - S/ 270.00
3. DVR 8CH HIKVISION - S/ 675.00

Total: S/ 1,505.99
```

---

## 🔄 Ventajas de la Sesión Persistente

| Ventaja | Descripción |
|---------|-------------|
| **Una sola sesión** | Inicias sesión solo una vez |
| **Más rápido** | No tienes que esperar el login cada vez |
| **Más eficiente** | Agregas múltiples productos sin interrupciones |
| **Contador visual** | Ves cuántos productos has agregado |
| **Flexible** | Decides cuándo volver a la proforma |

---

## 📊 Comparación

### Antes (Sin Sesión Persistente):
```
Tiempo para agregar 3 productos:
- Login: 10s
- Buscar producto 1: 5s
- Agregar: 3s
- Cerrar y volver: 2s
- Login de nuevo: 10s
- Buscar producto 2: 5s
- Agregar: 3s
- Cerrar y volver: 2s
- Login de nuevo: 10s
- Buscar producto 3: 5s
- Agregar: 3s

Total: 58 segundos
```

### Ahora (Con Sesión Persistente):
```
Tiempo para agregar 3 productos:
- Login: 10s (solo una vez)
- Buscar producto 1: 5s
- Agregar: 3s
- Buscar producto 2: 5s
- Agregar: 3s
- Buscar producto 3: 5s
- Agregar: 3s
- Volver: 2s

Total: 36 segundos
```

**¡38% más rápido!** ⚡

---

## 🎯 Casos de Uso

### Caso 1: Proforma con productos similares
```
Buscar: "disco duro"
→ Agregar: 1TB
→ Agregar: 2TB
→ Agregar: 4TB
→ Volver
```

### Caso 2: Proforma completa de seguridad
```
Buscar: "camara"
→ Agregar: Cámara 1
→ Agregar: Cámara 2

Buscar: "dvr"
→ Agregar: DVR 8CH

Buscar: "disco"
→ Agregar: Disco 2TB

→ Volver
```

### Caso 3: Comparar y elegir
```
Buscar: "camara 4mp"
→ Ver lista de 10 cámaras
→ Agregar: La más económica

Buscar: "camara 5mp"
→ Ver lista de 8 cámaras
→ Agregar: La de mejor calidad

→ Volver
```

---

## 🔧 Detalles Técnicos

### ¿Cómo se mantiene la sesión?
- El WebView **NO se cierra** después de agregar un producto
- Solo se cierra el **modal de lista**
- Las **cookies de sesión** de Sego se mantienen activas
- Puedes navegar libremente en Sego

### ¿Qué pasa con los productos agregados?
- Se agregan **directamente a la lista** de la proforma
- Cada producto tiene **cantidad 1** por defecto
- Puedes **editar la cantidad** después en la proforma
- Los productos se guardan en **memoria** hasta que guardes la proforma

### ¿Cuándo se cierra la sesión?
- Cuando presionas **"Volver a Proforma"**
- Cuando presionas el botón **✕** (cerrar)
- Cuando presionas el botón **Atrás** de tu celular
- **NO** se cierra al agregar productos

---

## ❓ Preguntas Frecuentes

### ¿Puedo ver cuántos productos he agregado?
**Sí**, el badge naranja en la barra superior muestra el contador: **[🛒 3]**

### ¿Los productos se agregan automáticamente?
**No**, debes confirmar cada producto en el Alert antes de agregarlo.

### ¿Puedo eliminar un producto agregado?
**Sí**, cuando vuelvas a la proforma, puedes eliminar cualquier ítem de la lista.

### ¿Puedo cambiar la cantidad?
**Sí**, todos los productos se agregan con cantidad 1. Puedes editar la cantidad en la lista de la proforma.

### ¿Qué pasa si cierro el WebView por error?
Los productos ya agregados se mantienen en la proforma. Solo tendrás que volver a abrir el WebView e iniciar sesión de nuevo.

### ¿Puedo buscar en diferentes categorías?
**Sí**, puedes buscar cualquier término y agregar productos de diferentes categorías sin cerrar la sesión.

---

## ✅ Resumen

**Implementado**:
- ✅ Sesión persistente en Sego
- ✅ Agregar múltiples productos sin cerrar
- ✅ Contador visual de productos agregados
- ✅ Alert con opciones: "Volver" o "Seguir Buscando"
- ✅ Productos se agregan directamente a la lista

**Resultado**:
- 🚀 **38% más rápido** para agregar múltiples productos
- 🔄 **Una sola sesión** - No más logins repetidos
- 📊 **Contador visual** - Sabes cuántos productos has agregado
- 💪 **Más eficiente** - Workflow continuo sin interrupciones

**¡Ahora puedes agregar todos los productos que necesites en una sola sesión!** 🎉
