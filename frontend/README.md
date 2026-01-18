# BRADATEC App - Sistema de Proformas

Aplicación móvil para crear proformas de servicios con generación de PDF.

## 🚀 Tecnologías

- React Native
- Expo SDK 54
- JavaScript (NO TypeScript)
- expo-print (generación de PDF)
- expo-sharing (compartir archivos)
- expo-image-picker (selección de imágenes)
- React Navigation

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── pantallas/          # Pantallas de la app
│   │   ├── Login.pantalla.js
│   │   ├── Registro.pantalla.js
│   │   ├── CrearProforma.pantalla.js
│   │   ├── HistorialProformas.pantalla.js
│   │   └── VerProforma.pantalla.js
│   ├── servicios/          # Servicios para API
│   │   ├── auth.servicio.js
│   │   ├── proforma.servicio.js
│   │   ├── cloudinary.servicio.js
│   │   └── pdf.servicio.js
│   └── utilidades/         # Funciones auxiliares
│       └── convertirNumeroALetras.js
├── App.js                  # Punto de entrada
└── package.json
```

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar URL del backend:
Editar los archivos en `src/servicios/` y cambiar:
```javascript
const API_URL = 'http://TU_IP:3000/api/...';
```

**IMPORTANTE:** Para probar en dispositivo físico, usa la IP de tu computadora, NO localhost.

## ▶️ Ejecutar

Iniciar Expo:
```bash
npm start
```

Opciones:
- Presiona `a` para Android
- Presiona `i` para iOS
- Escanea el QR con Expo Go

## 📱 Funcionalidades

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Persistencia de sesión

### Proformas
- Crear proformas con múltiples ítems
- Agregar imágenes a cada ítem
- Calcular totales automáticamente
- Convertir total a letras
- Ver historial de proformas
- Eliminar proformas

### PDF
- Generación de PDF con diseño profesional
- Incluye logo, tabla con imágenes, totales
- Compartir PDF por WhatsApp, email, etc.

## 🎨 Pantallas

### 1. Login
- Inicio de sesión con correo y contraseña
- Navegación a registro

### 2. Registro
- Crear nueva cuenta
- Validación de contraseñas

### 3. Historial de Proformas
- Lista de todas las proformas
- Pull to refresh
- Botón flotante para crear nueva
- Eliminar proformas

### 4. Crear Proforma
- Agregar ítems con:
  - Imagen (opcional)
  - Descripción
  - Cantidad
  - Precio
- Cálculo automático de totales
- Generación y compartir PDF

### 5. Ver Proforma
- Detalle completo de la proforma
- Regenerar y compartir PDF

## 🔐 Configuración de API

Cambiar la URL base en cada servicio:

**auth.servicio.js:**
```javascript
const API_URL = 'http://192.168.1.100:3000/api/auth';
```

**proforma.servicio.js:**
```javascript
const API_URL = 'http://192.168.1.100:3000/api/proformas';
```

**cloudinary.servicio.js:**
```javascript
const API_URL = 'http://192.168.1.100:3000/api/imagenes';
```

## 📝 Flujo de Uso

1. Usuario se registra o inicia sesión
2. Ve el historial de proformas (vacío al inicio)
3. Presiona el botón "+" para crear nueva proforma
4. Agrega ítems:
   - Selecciona imagen (opcional)
   - Escribe descripción
   - Ingresa cantidad y precio
   - Presiona "Agregar Ítem"
5. Repite para todos los ítems necesarios
6. Presiona "Guardar y Generar PDF"
7. La app:
   - Sube las imágenes a Cloudinary
   - Guarda la proforma en la base de datos
   - Genera el PDF
   - Abre el diálogo para compartir
8. Usuario puede compartir por WhatsApp, email, etc.

## 🎯 Características Clave

- **Offline First:** Token guardado localmente
- **Optimización de Imágenes:** Redimensionadas antes de subir
- **Validaciones:** En todos los formularios
- **UX Fluida:** Indicadores de carga, mensajes claros
- **Diseño Profesional:** PDF con formato empresarial

## 🐛 Solución de Problemas

### Error de conexión
- Verifica que el backend esté corriendo
- Usa la IP correcta (no localhost en dispositivo físico)
- Verifica que estén en la misma red

### Imágenes no se suben
- Verifica permisos de cámara/galería
- Revisa configuración de Cloudinary en el backend

### PDF no se genera
- Verifica que expo-print esté instalado
- Revisa que las URLs de imágenes sean accesibles

## 📦 Dependencias Principales

- expo: ~54.0.0
- react-native: 0.76.5
- expo-print: Generación de PDF
- expo-sharing: Compartir archivos
- expo-image-picker: Selección de imágenes
- @react-navigation/native: Navegación
- axios: Peticiones HTTP
- @react-native-async-storage/async-storage: Almacenamiento local

## 🚀 Próximos Pasos

1. Instalar dependencias: `npm install`
2. Configurar URL del backend
3. Ejecutar: `npm start`
4. Probar en Expo Go
