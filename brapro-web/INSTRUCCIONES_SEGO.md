# Instrucciones para usar Sego en BRAPRO WEB

## 🚀 Configuración Inicial

### 1. Variables de Entorno en Netlify

Cuando despliegues la aplicación en Netlify, debes configurar las siguientes variables de entorno:

1. Ve a tu sitio en Netlify Dashboard
2. Ve a **Site settings** > **Environment variables**
3. Agrega las siguientes variables:

```
SEGO_USER=Bradatecsrl@gmail.com
SEGO_PASS=20608918371
```

### 2. Desplegar en Netlify

```bash
# Instalar Netlify CLI (si no lo tienes)
npm install -g netlify-cli

# Iniciar sesión en Netlify
netlify login

# Desplegar
netlify deploy --prod
```

## 🧪 Probar Localmente

Para probar la función de Sego en tu máquina local:

```bash
# Instalar dependencias
cd brapro-web
npm install

# Crear archivo .env en la raíz de brapro-web
# Agregar:
SEGO_USER=Bradatecsrl@gmail.com
SEGO_PASS=20608918371

# Iniciar servidor de desarrollo con Netlify
npm run dev
```

Esto iniciará:
- React en `http://localhost:3000`
- Netlify Functions en `http://localhost:8888/.netlify/functions/`

## 📋 Cómo Funciona

### Flujo de Trabajo

1. **Usuario hace clic en "Navegar en Sego"**
   - Se abre el componente `SegoIframe`
   - Se abre una ventana popup con Sego
   - El usuario puede iniciar sesión manualmente

2. **Usuario busca productos**
   - Escribe el término de búsqueda en el panel de control
   - Hace clic en "Buscar"
   - La función Netlify hace scraping de Sego

3. **Productos detectados**
   - Los productos aparecen en el panel
   - Muestra: nombre, SKU, precio USD, precio en soles, precio de venta (+50%)
   - Usuario hace clic en "Agregar"

4. **Producto agregado**
   - Se llena automáticamente el formulario de la proforma
   - Usuario puede ajustar cantidad y otros detalles

### Cálculos Automáticos

```
Precio USD (de Sego) × Tipo de Cambio = Precio en Soles
Precio en Soles × 1.5 = Precio de Venta (+50% markup)
```

## 🔧 Alternativa: Agregar Manual

Si el scraping no funciona o el usuario prefiere agregar manualmente:

1. Hacer clic en "Agregar Manual (Sego)"
2. Se abre el modal `ModalSego`
3. Hacer clic en "Abrir Sego" (abre ventana popup)
4. Copiar información del producto de Sego
5. Pegar en el formulario
6. El sistema calcula automáticamente los precios

## 🐛 Solución de Problemas

### La función no encuentra productos

**Posibles causas:**
- Sego cambió la estructura HTML de su sitio
- La sesión expiró
- El término de búsqueda no tiene resultados

**Solución:**
- Usar "Agregar Manual (Sego)" como alternativa
- Verificar que las credenciales sean correctas
- Intentar con otro término de búsqueda

### Error de CORS

Si ves errores de CORS en la consola:

**En desarrollo:**
- Asegúrate de usar `npm run dev` (no `npm start`)
- Netlify Dev maneja CORS automáticamente

**En producción:**
- Las funciones de Netlify no tienen problemas de CORS
- Verifica que la URL de la función sea correcta

### Imágenes no se cargan

Las imágenes de Sego pueden tener restricciones CORS. Por eso:
- En el PDF descargable, las imágenes de productos se ocultan
- Usa "Imprimir (con imágenes)" para ver todas las imágenes
- Los logos (empresa y BCP) se convierten a base64 para aparecer en PDF

## 📝 Notas Importantes

1. **Tipo de Cambio**: Se obtiene automáticamente de la configuración del usuario
2. **Markup**: El sistema aplica +50% automáticamente (configurable en el código)
3. **Sesión Sego**: La función mantiene la sesión por 30 minutos
4. **Límite de búsqueda**: No hay límite, pero se recomienda ser específico

## 🎯 Mejoras Futuras

- [ ] Caché de productos buscados
- [ ] Historial de búsquedas
- [ ] Importar múltiples productos a la vez
- [ ] Configurar markup personalizado por usuario
- [ ] Descargar imágenes de Sego y subirlas a Supabase Storage
