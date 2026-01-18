# 📖 GUÍA DE INSTALACIÓN COMPLETA - BRADATEC

Esta guía te llevará paso a paso desde cero hasta tener la aplicación funcionando.

## 📋 Requisitos Previos

### Software Necesario
- ✅ Node.js (versión 18 o superior)
- ✅ npm o yarn
- ✅ Git (opcional)
- ✅ Expo Go app en tu celular (Android/iOS)

### Cuentas Necesarias
- ✅ Cuenta en Supabase (gratis)
- ✅ Cuenta en Cloudinary (gratis)

---

## 🚀 PASO 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - **Name:** bradatec-proformas
   - **Database Password:** (guarda esta contraseña)
   - **Region:** Elige la más cercana
5. Click en "Create new project"
6. Espera 2-3 minutos mientras se crea

### 1.2 Obtener Credenciales
1. En tu proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ejemplo: https://xxxxx.supabase.co)
   - **anon public** key (la key larga)

### 1.3 Crear Tablas
1. Ve a **SQL Editor** en el menú lateral
2. Click en "New query"
3. Copia y pega el contenido del archivo `backend/database.sql`
4. Click en "Run" o presiona Ctrl+Enter
5. Verifica que aparezca "Success"
6. Ve a **Table Editor** y verifica que existan las tablas:
   - usuarios
   - proformas
   - detalle_proforma

---

## 🖼️ PASO 2: Configurar Cloudinary

### 2.1 Crear Cuenta
1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Click en "Sign Up Free"
3. Completa el registro
4. Verifica tu email

### 2.2 Obtener Credenciales
1. En el Dashboard, verás:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
2. Copia estos tres valores

---

## 💻 PASO 3: Configurar Backend

### 3.1 Instalar Dependencias
```bash
cd backend
npm install
```

### 3.2 Crear Archivo .env
1. Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

2. Abre `.env` y completa con tus datos:
```env
PORT=3000

# Supabase (del Paso 1.2)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=tu_anon_key_aqui

# JWT (genera un string aleatorio largo)
JWT_SECRET=mi_secreto_super_seguro_12345

# Cloudinary (del Paso 2.2)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3.3 Iniciar Backend
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 3000
📍 http://localhost:3000
```

### 3.4 Probar Backend
Abre tu navegador y ve a: `http://localhost:3000`

Deberías ver:
```json
{
  "mensaje": "API BRADATEC - Sistema de Proformas",
  "version": "1.0.0",
  "estado": "activo"
}
```

✅ **Backend funcionando correctamente**

---

## 📱 PASO 4: Configurar Frontend

### 4.1 Instalar Dependencias
Abre una **nueva terminal** (deja el backend corriendo):

```bash
cd frontend
npm install
```

### 4.2 Obtener IP de tu Computadora

**Windows:**
```bash
ipconfig
```
Busca "IPv4 Address" (ejemplo: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Busca "inet" (ejemplo: 192.168.1.100)

### 4.3 Configurar URL del Backend

Edita estos 3 archivos y cambia la URL:

**1. src/servicios/auth.servicio.js**
```javascript
// Línea 4 - Cambiar localhost por tu IP
const API_URL = 'http://192.168.1.100:3000/api/auth';
```

**2. src/servicios/proforma.servicio.js**
```javascript
// Línea 4 - Cambiar localhost por tu IP
const API_URL = 'http://192.168.1.100:3000/api/proformas';
```

**3. src/servicios/cloudinary.servicio.js**
```javascript
// Línea 4 - Cambiar localhost por tu IP
const API_URL = 'http://192.168.1.100:3000/api/imagenes';
```

### 4.4 Iniciar Expo
```bash
npm start
```

Deberías ver un QR code en la terminal.

---

## 📲 PASO 5: Probar en tu Celular

### 5.1 Instalar Expo Go
- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 5.2 Conectar
1. Asegúrate de que tu celular y computadora estén en la **misma red WiFi**
2. Abre Expo Go en tu celular
3. Escanea el QR code que aparece en la terminal
4. Espera a que cargue la app (puede tardar 1-2 minutos la primera vez)

### 5.3 Probar la App
1. Deberías ver la pantalla de Login
2. Click en "¿No tienes cuenta? Regístrate aquí"
3. Crea una cuenta de prueba:
   - Correo: prueba@test.com
   - Contraseña: 123456
4. Click en "Registrarse"
5. Deberías ver la pantalla de "Mis Proformas" (vacía)

✅ **App funcionando correctamente**

---

## 🎯 PASO 6: Crear Primera Proforma

### 6.1 Crear Proforma
1. Click en el botón flotante "+" (abajo a la derecha)
2. En la pantalla "Nueva Proforma":
   - Click en "Seleccionar Imagen" (opcional)
   - Escribe descripción: "Cámara de seguridad HD"
   - Cantidad: 4
   - Precio: 250
   - Click en "Agregar Ítem"
3. Agrega otro ítem:
   - Descripción: "Instalación"
   - Cantidad: 1
   - Precio: 500
   - Click en "Agregar Ítem"
4. Verás el total: $1500.00
5. Click en "Guardar y Generar PDF"
6. Espera unos segundos...
7. Se abrirá el diálogo para compartir el PDF

✅ **Primera proforma creada exitosamente**

---

## 🐛 Solución de Problemas

### Problema: Backend no inicia

**Error:** "Cannot find module..."
```bash
cd backend
npm install
```

**Error:** "SUPABASE_URL is not defined"
- Verifica que el archivo `.env` exista
- Verifica que las variables estén correctamente escritas

### Problema: App no se conecta al backend

**Error:** "Network request failed"
1. Verifica que el backend esté corriendo
2. Verifica que usaste tu IP, no localhost
3. Verifica que estén en la misma red WiFi
4. Desactiva el firewall temporalmente

**Probar conexión:**
En tu celular, abre el navegador y ve a:
```
http://TU_IP:3000
```
Deberías ver el mensaje JSON del backend.

### Problema: Imágenes no se suben

**Error:** "Error al subir imagen"
1. Verifica credenciales de Cloudinary en `.env`
2. Verifica que el cloud_name sea correcto
3. Revisa los logs del backend

### Problema: PDF no se genera

**Error:** "No se pudo generar el PDF"
1. Verifica que las URLs de imágenes sean accesibles
2. Intenta sin imágenes primero
3. Revisa los logs en la terminal de Expo

### Problema: Expo no inicia

**Error:** "Metro bundler error"
```bash
cd frontend
rm -rf node_modules
npm install
npm start -- --clear
```

---

## ✅ Checklist Final

Antes de considerar la instalación completa, verifica:

- [ ] Backend corriendo en puerto 3000
- [ ] Puedes acceder a http://localhost:3000 en el navegador
- [ ] Tablas creadas en Supabase
- [ ] Frontend corriendo con Expo
- [ ] App carga en Expo Go
- [ ] Puedes registrarte
- [ ] Puedes crear una proforma
- [ ] Se genera el PDF
- [ ] Puedes compartir el PDF

---

## 📚 Próximos Pasos

Una vez que todo funcione:

1. **Personalizar:**
   - Cambia "BRADATEC" por el nombre de tu empresa
   - Personaliza colores en los estilos
   - Agrega tu logo

2. **Mejorar:**
   - Agrega más campos a las proformas
   - Implementa búsqueda
   - Agrega filtros por fecha

3. **Desplegar:**
   - Backend: Heroku, Railway, Render
   - Base de datos: Ya está en Supabase
   - App: Compilar con EAS Build

---

## 🆘 Ayuda Adicional

Si tienes problemas:

1. Revisa los logs en la terminal del backend
2. Revisa los logs en la terminal de Expo
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de estar usando Node.js 18+

---

**¡Felicidades! 🎉**

Tu sistema de proformas está listo para usar.
