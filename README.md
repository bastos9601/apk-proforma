# 📱 BRADATEC - Sistema de Proformas

Aplicación completa para crear proformas de servicios con generación de PDF. Incluye backend (API REST) y frontend (App móvil React Native).

## 🎯 Características Principales

- ✅ Registro e inicio de sesión de usuarios
- ✅ Crear proformas con múltiples ítems
- ✅ Agregar imágenes a cada ítem
- ✅ Subida de imágenes a Cloudinary
- ✅ Generación de PDF profesional
- ✅ Compartir PDF por WhatsApp, email, etc.
- ✅ Historial de proformas
- ✅ Cálculo automático de totales
- ✅ Conversión de números a letras

## 🏗️ Arquitectura

```
raiz-del-proyecto/
├── backend/          # API REST (Node.js + Express)
│   ├── configuracion/
│   ├── controladores/
│   ├── rutas/
│   ├── modelos/
│   ├── middlewares/
│   └── servicios/
│
└── frontend/         # App móvil (React Native + Expo)
    └── src/
        ├── pantallas/
        ├── servicios/
        └── utilidades/
```

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- JWT para autenticación
- Cloudinary para imágenes
- bcryptjs para encriptación

### Frontend
- React Native
- Expo SDK 54
- JavaScript (NO TypeScript)
- expo-print (PDF)
- expo-sharing (compartir)
- expo-image-picker (imágenes)
- React Navigation

## 🚀 Instalación Rápida

### 1. Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
JWT_SECRET=tu_secreto_jwt_super_seguro
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Ejecutar:
```bash
npm run dev
```

### 2. Base de Datos (Supabase)

Ejecutar este SQL en Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de proformas
CREATE TABLE proformas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  total_letras TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de detalles de proforma
CREATE TABLE detalle_proforma (
  id SERIAL PRIMARY KEY,
  proforma_id UUID REFERENCES proformas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  imagen_url TEXT
);

-- Índices
CREATE INDEX idx_proformas_usuario ON proformas(usuario_id);
CREATE INDEX idx_detalle_proforma ON detalle_proforma(proforma_id);
```

### 3. Frontend

```bash
cd frontend
npm install
```

**IMPORTANTE:** Editar los archivos en `src/servicios/` y cambiar la URL del backend:

```javascript
// Cambiar localhost por la IP de tu computadora
const API_URL = 'http://192.168.1.100:3000/api/...';
```

Ejecutar:
```bash
npm start
```

Escanear el QR con Expo Go en tu celular.

## 📱 Flujo de la Aplicación

1. **Registro/Login**
   - Usuario crea cuenta o inicia sesión
   - Token JWT guardado localmente

2. **Historial**
   - Ver todas las proformas creadas
   - Botón flotante para crear nueva

3. **Crear Proforma**
   - Agregar ítems uno por uno
   - Cada ítem tiene: imagen, descripción, cantidad, precio
   - Cálculo automático de totales

4. **Guardar**
   - Imágenes se suben a Cloudinary
   - Proforma se guarda en Supabase
   - PDF se genera en el dispositivo
   - Se abre diálogo para compartir

5. **Ver Proforma**
   - Ver detalle completo
   - Regenerar y compartir PDF

## 🎨 Diseño del PDF

El PDF incluye:
- Logo de la empresa (BRADATEC)
- Fecha y número de proforma
- Tabla con:
  - Imagen del ítem
  - Descripción
  - Cantidad
  - Precio unitario
  - Total por ítem
- Total general
- Total en letras
- Pie de página

## 🔐 Seguridad

- Passwords encriptados con bcrypt
- Autenticación JWT
- Tokens con expiración
- Validación de datos en backend
- Protección de rutas

## 📊 Base de Datos

### Tabla: usuarios
- id (UUID)
- correo (VARCHAR)
- password (VARCHAR - hash)
- fecha_creacion (TIMESTAMP)

### Tabla: proformas
- id (UUID)
- usuario_id (FK)
- fecha (DATE)
- total (DECIMAL)
- total_letras (TEXT)
- pdf_url (TEXT - opcional)

### Tabla: detalle_proforma
- id (SERIAL)
- proforma_id (FK)
- descripcion (TEXT)
- cantidad (INTEGER)
- precio (DECIMAL)
- total (DECIMAL)
- imagen_url (TEXT)

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verificar` - Verificar token

### Proformas
- `POST /api/proformas` - Crear proforma
- `GET /api/proformas` - Obtener todas
- `GET /api/proformas/:id` - Obtener una
- `PUT /api/proformas/:id/pdf` - Actualizar PDF URL
- `DELETE /api/proformas/:id` - Eliminar

### Imágenes
- `POST /api/imagenes/subir` - Subir imagen a Cloudinary

## 🐛 Solución de Problemas

### Backend no inicia
- Verifica que todas las variables de entorno estén configuradas
- Revisa que Supabase esté accesible
- Verifica credenciales de Cloudinary

### App no se conecta al backend
- Usa la IP de tu computadora, NO localhost
- Verifica que estén en la misma red WiFi
- Revisa que el backend esté corriendo

### Imágenes no se suben
- Verifica configuración de Cloudinary
- Revisa permisos de la app
- Chequea tamaño de las imágenes

## 📝 Notas Importantes

1. **NO usar TypeScript** - Todo en JavaScript
2. **Separación clara** - Backend y Frontend independientes
3. **Imágenes en Cloudinary** - NO en base de datos
4. **PDF en Frontend** - Generado con expo-print
5. **Buenas prácticas** - Código limpio y comentado

## 🎯 Próximos Pasos

1. ✅ Configurar Supabase
2. ✅ Configurar Cloudinary
3. ✅ Instalar dependencias backend
4. ✅ Crear tablas en Supabase
5. ✅ Configurar variables de entorno
6. ✅ Iniciar backend
7. ✅ Instalar dependencias frontend
8. ✅ Configurar URL del backend en la app
9. ✅ Probar en Expo Go

## 📚 Documentación Adicional

- Backend: Ver `backend/README.md`
- Frontend: Ver `frontend/README.md`

## 👨‍💻 Desarrollo

Este proyecto está diseñado para ser:
- Escalable
- Mantenible
- Fácil de entender
- Bien documentado
- Siguiendo mejores prácticas

## 📄 Licencia

Proyecto privado - BRADATEC

---

**¿Necesitas ayuda?** Revisa los README individuales de backend y frontend para más detalles.
