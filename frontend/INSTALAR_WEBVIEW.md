# Instalación de WebView para Sego

Para que funcione el navegador integrado de Sego en tu APK, necesitas instalar la dependencia de WebView.

## Pasos de instalación:

### 1. Instalar react-native-webview

```bash
cd frontend
npx expo install react-native-webview
```

### 2. Verificar que se instaló correctamente

Revisa que en `frontend/package.json` aparezca:

```json
{
  "dependencies": {
    "react-native-webview": "^13.x.x"
  }
}
```

### 3. Reiniciar el servidor de desarrollo

```bash
npm start
```

## ¿Cómo usar el WebView de Sego?

1. **Abre tu APK** y ve a "Nueva Proforma"

2. **Presiona el botón azul** "🌐 Navegar en Sego (Extraer Precios)"

3. **Inicia sesión** en Sego con tus credenciales de distribuidor:
   - Usuario: Bradatecsrl@gmail.com
   - Contraseña: 20608918371

4. **Busca productos** usando la barra de búsqueda de Sego

5. **Extrae los precios** de dos formas:
   - **Automático**: Cuando la página cargue productos, aparecerá un alert preguntando si quieres agregarlos
   - **Manual**: Presiona el botón verde "Extraer" en la barra superior

6. **Confirma** y los productos con sus precios reales se agregarán a tu catálogo

## Ventajas de este método:

✅ **Ves los precios reales** porque tú inicias sesión manualmente
✅ **No hay problemas de scraping** porque usas el navegador real
✅ **Extracción automática** de nombre, descripción, SKU, precio e imagen
✅ **Margen del 50%** se aplica automáticamente
✅ **Se guarda en tu catálogo** para futuras proformas

## Notas importantes:

- Los precios se extraen con el formato "Precio con IGV: $ XX.XX"
- El margen del 50% se aplica automáticamente (precio × 1.5)
- Los productos se guardan en tu catálogo personal
- Puedes navegar libremente en Sego y extraer productos de cualquier página de búsqueda
