# Guía para Generar Iconos de BRAPRO

## Opción 1: Herramientas Online (Recomendado - Más Fácil)

### Icon Kitchen (La mejor opción)
1. Ve a: https://icon.kitchen/
2. Haz clic en "Upload Image"
3. Sube tu archivo `bradatec.png`
4. Ajusta el padding si es necesario
5. Selecciona "Android" y "iOS"
6. Haz clic en "Download"
7. Extrae el ZIP y copia los archivos a la carpeta `assets/`

### App Icon Generator
1. Ve a: https://www.appicon.co/
2. Sube `bradatec.png`
3. Descarga el paquete
4. Copia los archivos necesarios a `assets/`

---

## Opción 2: Usar el Script Automático

### Paso 1: Instalar Sharp (librería de procesamiento de imágenes)
```bash
cd frontend
npm install sharp --save-dev
```

### Paso 2: Ejecutar el script
```bash
node generar-iconos.js
```

Esto generará automáticamente:
- ✅ `icon.png` (1024x1024) - Icono principal
- ✅ `adaptive-icon.png` (1024x1024) - Icono adaptativo Android
- ✅ `splash.png` (1284x2778) - Pantalla de carga

---

## Opción 3: Usar Expo (Automático)

Si no quieres generar los iconos manualmente, Expo puede hacerlo por ti:

1. Asegúrate de que `bradatec.png` sea al menos 1024x1024 px
2. Actualiza `app.json` para usar bradatec.png (ya está configurado)
3. Ejecuta:
```bash
npx expo-optimize
```

---

## Tamaños Requeridos

Para una app profesional, necesitas:

### Android:
- **icon.png**: 1024x1024 px (icono principal)
- **adaptive-icon.png**: 1024x1024 px (icono adaptativo)
- **splash.png**: 1284x2778 px (pantalla de carga)

### iOS (opcional):
- **icon.png**: 1024x1024 px

---

## Verificar el Logo Actual

Para ver el tamaño actual de bradatec.png, ejecuta:
```bash
cd frontend/assets
file bradatec.png
```

O en Windows PowerShell:
```powershell
Get-Item bradatec.png | Select-Object Name, Length
```

---

## Recomendaciones

1. **Tamaño mínimo**: El logo debe ser al menos 1024x1024 px
2. **Formato**: PNG con fondo transparente es ideal
3. **Calidad**: Usa imágenes de alta resolución
4. **Padding**: Deja un pequeño margen alrededor del logo

---

## Después de Generar los Iconos

Una vez que tengas los iconos en la carpeta `assets/`, actualiza `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#2563eb"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2563eb"
      }
    }
  }
}
```

Luego vuelve a ejecutar:
```bash
eas build -p android --profile preview
```
