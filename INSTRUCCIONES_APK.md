# Guía para Generar APK de BRAPRO

## Opción 1: EAS Build (Recomendado - Más Fácil)

### Requisitos previos:
- Cuenta en Expo (gratuita): https://expo.dev/signup
- Node.js instalado

### Paso 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

### Paso 2: Iniciar sesión en Expo
```bash
cd frontend
eas login
```

### Paso 3: Configurar el proyecto
```bash
eas build:configure
```

### Paso 4: Generar el APK
```bash
eas build -p android --profile preview
```

Esto generará un APK que podrás descargar desde tu cuenta de Expo.

**Ventajas:**
- No necesitas Android Studio
- Se compila en la nube
- Más rápido y sencillo
- El plan gratuito incluye compilaciones

---

## Opción 2: Expo Build (Clásico)

### Paso 1: Instalar Expo CLI
```bash
npm install -g expo-cli
```

### Paso 2: Compilar APK
```bash
cd frontend
expo build:android -t apk
```

Sigue las instrucciones en pantalla. El APK se generará en la nube y recibirás un link de descarga.

---

## Opción 3: Build Local (Requiere Android Studio)

### Requisitos:
- Android Studio instalado
- Java JDK 11 o superior
- Variables de entorno configuradas (ANDROID_HOME)

### Pasos:
```bash
cd frontend
npx expo prebuild
npx expo run:android --variant release
```

El APK se generará en: `android/app/build/outputs/apk/release/`

---

## Preparar Iconos (Opcional pero Recomendado)

Para tener iconos profesionales, necesitas crear:

1. **icon.png**: 1024x1024 px (icono principal)
2. **adaptive-icon.png**: 1024x1024 px (Android adaptativo)
3. **splash.png**: 1284x2778 px (pantalla de carga)

Puedes usar herramientas online como:
- https://www.appicon.co/
- https://icon.kitchen/

O simplemente usa el logo bradatec.png que ya tienes (Expo lo redimensionará automáticamente).

---

## Configuración Actual

Tu app está configurada como:
- **Nombre**: BRAPRO
- **Package**: com.bradatec.brapro
- **Versión**: 1.0.0

---

## Notas Importantes

1. **Primera vez**: EAS Build puede tardar 10-20 minutos
2. **Plan gratuito**: Expo ofrece compilaciones gratuitas limitadas
3. **APK vs AAB**: 
   - APK: Para instalar directamente en dispositivos
   - AAB: Para publicar en Google Play Store

---

## Comandos Rápidos

### Generar APK (EAS - Recomendado):
```bash
cd frontend
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

### Generar AAB para Play Store:
```bash
eas build -p android --profile production
```

### Ver estado de builds:
```bash
eas build:list
```
