# Guía Completa: Compilar APK para Android

## 📱 Tu Proyecto: BRAPRO (Sistema de Proformas BRADATEC)

---

## 🎯 OPCIÓN 1: EAS BUILD (RECOMENDADO - MÁS MODERNO)

EAS Build es el servicio moderno de Expo para compilar apps. Es más rápido, confiable y fácil.

### Paso 1: Instalar EAS CLI

```bash
cd frontend
npm install -g eas-cli
```

### Paso 2: Login en Expo

```bash
eas login
```

Si no tienes cuenta:
```bash
eas register
```

### Paso 3: Configurar EAS Build

```bash
eas build:configure
```

Esto creará un archivo `eas.json`. Selecciona:
- Platform: **Android**
- Build type: **APK** (para instalar directamente) o **AAB** (para Google Play Store)

### Paso 4: Crear archivo eas.json (si no se creó automáticamente)

Crea `frontend/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Paso 5: Compilar APK

**Para pruebas (Preview Build)**:
```bash
eas build --platform android --profile preview
```

**Para producción**:
```bash
eas build --platform android --profile production
```

### Paso 6: Descargar APK

Una vez terminado (tarda 10-20 minutos):
1. EAS te dará un link
2. Descarga el APK
3. Transfiere a tu celular
4. Instala (habilita "Instalar apps desconocidas")

---

## 🎯 OPCIÓN 2: EXPO BUILD CLÁSICO (DEPRECADO PERO FUNCIONA)

### Paso 1: Instalar Expo CLI

```bash
npm install -g expo-cli
```

### Paso 2: Login

```bash
expo login
```

### Paso 3: Compilar APK

```bash
cd frontend
expo build:android -t apk
```

Selecciona:
- **Generate new keystore** (primera vez)
- Espera 10-20 minutos

### Paso 4: Descargar

Expo te dará un link para descargar el APK.

---

## 🚀 OPCIÓN 3: BUILD LOCAL (SIN SERVICIOS EN LA NUBE)

Si quieres compilar en tu computadora (más complejo):

### Requisitos:
- Android Studio instalado
- Java JDK 11 o superior
- Android SDK configurado

### Pasos:

1. **Instalar Android Studio**:
   - Descarga de: https://developer.android.com/studio
   - Instala Android SDK
   - Configura variables de entorno

2. **Eject de Expo** (convierte a React Native puro):
   ```bash
   cd frontend
   expo eject
   ```
   ⚠️ **ADVERTENCIA**: Esto es irreversible y complica el proyecto

3. **Compilar**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **APK estará en**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 📋 PREPARACIÓN ANTES DE COMPILAR

### 1. Actualizar app.json

Asegúrate que `frontend/app.json` tenga:

```json
{
  "expo": {
    "name": "BRAPRO",
    "slug": "brapro",
    "version": "1.0.0",
    "android": {
      "package": "com.bradatec.brapro",
      "versionCode": 1,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/bradatec.png",
        "backgroundColor": "#2563eb"
      }
    }
  }
}
```

### 2. Verificar Iconos

Asegúrate que `frontend/assets/bradatec.png` existe y es:
- **1024x1024 px** (recomendado)
- Formato PNG con transparencia

### 3. Limpiar Caché

```bash
cd frontend
rm -rf node_modules
npm install
expo start --clear
```

---

## 🎨 PERSONALIZACIÓN DEL APK

### Cambiar Nombre de la App

En `app.json`:
```json
{
  "expo": {
    "name": "BRADATEC Proformas",
    "slug": "bradatec-proformas"
  }
}
```

### Cambiar Icono

Reemplaza `frontend/assets/bradatec.png` con tu logo:
- Tamaño: 1024x1024 px
- Formato: PNG
- Fondo transparente o sólido

### Cambiar Splash Screen

En `app.json`:
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563eb"
    }
  }
}
```

Crea `frontend/assets/splash.png`:
- Tamaño: 1242x2436 px (iPhone X)
- Formato: PNG

### Cambiar Colores

En `app.json`:
```json
{
  "expo": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#ffffff"
  }
}
```

---

## 🔐 FIRMA DEL APK (PARA PRODUCCIÓN)

### Generar Keystore (Primera vez)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore bradatec.keystore -alias bradatec -keyalg RSA -keysize 2048 -validity 10000
```

Guarda:
- **Contraseña del keystore**
- **Contraseña de la key**
- **Archivo bradatec.keystore**

⚠️ **MUY IMPORTANTE**: Guarda estos datos en lugar seguro. Si los pierdes, no podrás actualizar la app en Google Play.

### Usar Keystore en EAS Build

Crea `frontend/credentials.json`:
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./bradatec.keystore",
      "keystorePassword": "TU_PASSWORD",
      "keyAlias": "bradatec",
      "keyPassword": "TU_KEY_PASSWORD"
    }
  }
}
```

Compila con:
```bash
eas build --platform android --profile production
```

---

## 📦 SUBIR A GOOGLE PLAY STORE

### Paso 1: Crear Cuenta de Desarrollador

- Ve a: https://play.google.com/console
- Paga $25 USD (una sola vez)
- Completa perfil

### Paso 2: Crear App

1. Click en "Crear app"
2. Nombre: **BRADATEC Proformas**
3. Idioma: Español
4. Tipo: App
5. Categoría: Negocios

### Paso 3: Compilar AAB (Android App Bundle)

```bash
eas build --platform android --profile production
```

En `eas.json`, cambia:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Paso 4: Subir AAB

1. En Google Play Console
2. Producción > Crear nueva versión
3. Sube el archivo `.aab`
4. Completa información requerida
5. Envía a revisión

---

## 🧪 PROBAR EL APK

### En Emulador Android Studio

1. Abre Android Studio
2. AVD Manager > Create Virtual Device
3. Selecciona dispositivo (ej: Pixel 5)
4. Descarga imagen del sistema
5. Arrastra el APK al emulador

### En Dispositivo Real

1. Habilita "Opciones de desarrollador":
   - Configuración > Acerca del teléfono
   - Toca "Número de compilación" 7 veces

2. Habilita "Instalar apps desconocidas":
   - Configuración > Seguridad
   - Permitir instalación desde fuentes desconocidas

3. Transfiere APK:
   - Por cable USB
   - Por email
   - Por Google Drive
   - Por WhatsApp

4. Abre el APK y toca "Instalar"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "Build failed"

**Causa**: Error en dependencias o configuración

**Solución**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Keystore not found"

**Causa**: No se encuentra el archivo de firma

**Solución**:
- Genera nuevo keystore (ver sección Firma del APK)
- O usa EAS Build que lo genera automáticamente

### "App crashes on startup"

**Causa**: Error en código o configuración

**Solución**:
1. Revisa logs:
   ```bash
   adb logcat
   ```
2. Verifica que todas las variables de entorno estén configuradas
3. Prueba en Expo Go primero

### "Cannot connect to Supabase"

**Causa**: URL o API Key incorrectas

**Solución**:
- Verifica `frontend/src/config/supabase.config.js`
- Asegúrate que las URLs sean correctas
- Verifica que el dispositivo tenga internet

### "Images not loading"

**Causa**: Permisos de almacenamiento

**Solución**:
- Verifica permisos en `app.json`
- Solicita permisos en tiempo de ejecución

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | EAS Build | Expo Build | Build Local |
|----------------|-----------|------------|-------------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Velocidad | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Costo | Gratis* | Gratis* | Gratis |
| Configuración | Mínima | Mínima | Compleja |
| Control | Medio | Bajo | Total |

*Gratis con límites, planes pagos disponibles

---

## 🎯 RECOMENDACIÓN PARA TU PROYECTO

**Para desarrollo y pruebas**:
```bash
eas build --platform android --profile preview
```

**Para producción**:
```bash
eas build --platform android --profile production
```

**Ventajas**:
- ✅ Más fácil y rápido
- ✅ No necesitas Android Studio
- ✅ Maneja firma automáticamente
- ✅ Builds en la nube
- ✅ Historial de builds

---

## 📝 CHECKLIST ANTES DE COMPILAR

- [ ] `app.json` configurado correctamente
- [ ] Iconos y splash screen listos
- [ ] Todas las dependencias instaladas
- [ ] Código probado en Expo Go
- [ ] Variables de entorno configuradas
- [ ] Permisos de Android declarados
- [ ] Versión actualizada en `app.json`

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Compilar APK de prueba
eas build --platform android --profile preview

# Compilar APK de producción
eas build --platform android --profile production

# Ver builds anteriores
eas build:list

# Descargar último build
eas build:download
```

---

## 📱 RESULTADO FINAL

Después de compilar tendrás:
- **Archivo**: `brapro-v1.0.0.apk` (o similar)
- **Tamaño**: ~50-80 MB (aproximado)
- **Compatible con**: Android 5.0+ (API 21+)
- **Instalable en**: Cualquier dispositivo Android

---

## 💡 TIPS PROFESIONALES

1. **Incrementa la versión** en cada build:
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. **Usa perfiles diferentes** para desarrollo y producción

3. **Guarda los keystores** en lugar seguro (1Password, LastPass, etc.)

4. **Prueba en múltiples dispositivos** antes de publicar

5. **Usa Sentry o similar** para monitorear errores en producción

---

**¿Listo para compilar?** Empieza con EAS Build, es la opción más fácil y moderna.

```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

¡En 15-20 minutos tendrás tu APK listo! 🎉
