# Cómo Descargar Proformas como PDF

## Método Recomendado (Con Imágenes)

1. Haz clic en el botón **"📄 Descargar PDF"**
2. Se abrirá el diálogo de impresión de tu navegador
3. En "Destino" o "Destination", selecciona:
   - **Windows**: "Microsoft Print to PDF" o "Guardar como PDF"
   - **Mac**: "Guardar como PDF"
   - **Chrome**: "Guardar como PDF"
4. Haz clic en "Guardar" o "Save"
5. Elige dónde guardar el archivo

## Ventajas de este Método

✅ Las imágenes aparecen correctamente
✅ Los colores se mantienen
✅ El diseño es idéntico al HTML
✅ Funciona en todos los navegadores
✅ No hay problemas de CORS

## Configuración Recomendada en el Diálogo de Impresión

- **Diseño**: Vertical / Portrait
- **Márgenes**: Predeterminados
- **Escala**: 100%
- **Gráficos de fondo**: ✅ Activado (para ver colores)

## Atajos de Teclado

- **Windows/Linux**: `Ctrl + P`
- **Mac**: `Cmd + P`

## Solución de Problemas

### Las imágenes no aparecen
- Asegúrate de que "Gráficos de fondo" esté activado
- Verifica que tengas conexión a internet

### Los colores no se ven
- Activa "Gráficos de fondo" en las opciones de impresión
- En Chrome: Más configuración > Opciones > Gráficos de fondo

### El PDF está cortado
- Ajusta los márgenes a "Predeterminados" o "Mínimos"
- Verifica que la escala sea 100%

## Nota Técnica

El botón usa `window.print()` que es la forma más confiable de generar PDFs desde el navegador. Las librerías como html2pdf.js tienen problemas con imágenes externas debido a restricciones de CORS (Cross-Origin Resource Sharing).
