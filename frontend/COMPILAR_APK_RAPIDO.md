# 🚀 Compilar APK - Guía Rápida

## Pasos Simples (15 minutos)

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
eas login
```

Si no tienes cuenta, créala en: https://expo.dev

### 3. Compilar APK

**Opción A: Usando el script (Recomendado)**

Windows:
```bash
cd frontend
build-apk.bat preview
```

Mac/Linux:
```bash
cd frontend
chmod +x build-apk.sh
./build-apk.sh preview
```

**Opción B: Comando directo**

```bash
cd frontend
eas build --platform android --profile preview
```

### 4. Esperar (10-20 minutos)

EAS compilará tu app en la nube. Verás el progreso en la terminal.

### 5. Descargar APK

Cuando termine, EAS te dará un link. Ejemplo:
```
✔ Build finished
https://expo.dev/accounts/tu-usuario/projects/brapro/builds/abc123
```

Abre ese link y descarga el APK.

### 6. Instalar en tu celular

1. Transfiere el APK a tu Android (por cable, email, WhatsApp, etc.)
2. Abre el APK en tu celular
3. Si te pide, habilita "Instalar apps desconocidas"
4. Toca "Instalar"
5. ¡Listo! 🎉

---

## 🐛 Problemas Comunes

### "eas: command not found"

```bash
npm install -g eas-cli
```

### "Not logged in"

```bash
eas login
```

### "Build failed"

```bash
cd frontend
rm -rf node_modules
npm install
eas build --platform android --profile preview
```

---

## 📝 Notas

- **Primera vez**: Tarda más (15-20 min)
- **Siguientes veces**: Más rápido (10-15 min)
- **Tamaño del APK**: ~50-80 MB
- **Compatible con**: Android 5.0+

---

## 🎯 Perfiles Disponibles

- **preview**: Para pruebas (recomendado)
- **production**: Para publicar en Play Store

---

## 📚 Documentación Completa

Ver: `COMPILAR_APK_ANDROID.md`

---

## ✅ Checklist

- [ ] EAS CLI instalado
- [ ] Login en Expo
- [ ] Compilación iniciada
- [ ] APK descargado
- [ ] APK instalado en celular
- [ ] App funcionando

---

**¿Dudas?** Revisa `COMPILAR_APK_ANDROID.md` para más detalles.
