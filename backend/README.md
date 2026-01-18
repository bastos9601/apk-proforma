# BRADATEC Backend - API de Proformas

Backend para la aplicación móvil de generación de proformas de servicios.

## 🚀 Tecnologías

- Node.js + Express
- Supabase (PostgreSQL)
- JWT para autenticación
- Cloudinary para imágenes
- bcryptjs para encriptación

## 📁 Estructura del Proyecto

```
backend/
├── configuracion/      # Configuraciones (Supabase, JWT, Cloudinary)
├── controladores/      # Lógica de negocio
├── rutas/             # Definición de endpoints
├── modelos/           # Modelos de datos
├── middlewares/       # Middlewares (autenticación)
├── servicios/         # Servicios auxiliares
└── index.js           # Punto de entrada
```

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`

## 🗄️ Base de Datos (Supabase)

Ejecutar estos comandos SQL en Supabase:

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

-- Índices para mejorar rendimiento
CREATE INDEX idx_proformas_usuario ON proformas(usuario_id);
CREATE INDEX idx_detalle_proforma ON detalle_proforma(proforma_id);
```

## 🌐 Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verificar` - Verificar token (requiere auth)

### Proformas
- `POST /api/proformas` - Crear proforma (requiere auth)
- `GET /api/proformas` - Obtener todas las proformas (requiere auth)
- `GET /api/proformas/:id` - Obtener proforma específica (requiere auth)
- `PUT /api/proformas/:id/pdf` - Actualizar URL del PDF (requiere auth)
- `DELETE /api/proformas/:id` - Eliminar proforma (requiere auth)

### Imágenes
- `POST /api/imagenes/subir` - Subir imagen a Cloudinary (requiere auth)

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

## ▶️ Ejecutar

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## 📝 Ejemplo de Uso

### 1. Registrar usuario
```bash
POST /api/auth/registro
{
  "correo": "usuario@ejemplo.com",
  "password": "123456"
}
```

### 2. Crear proforma
```bash
POST /api/proformas
Headers: Authorization: Bearer <token>
{
  "fecha": "2026-01-18",
  "total": 1500.00,
  "totalLetras": "Mil quinientos dólares",
  "detalles": [
    {
      "descripcion": "Cámara de seguridad HD",
      "cantidad": 4,
      "precio": 250.00,
      "total": 1000.00,
      "imagenUrl": "https://cloudinary.com/..."
    },
    {
      "descripcion": "Instalación",
      "cantidad": 1,
      "precio": 500.00,
      "total": 500.00,
      "imagenUrl": null
    }
  ]
}
```

## 🔒 Seguridad

- Passwords encriptados con bcrypt
- Tokens JWT con expiración
- Validación de datos en todos los endpoints
- CORS configurado
- Variables de entorno para credenciales

## 📦 Dependencias Principales

- express: Framework web
- @supabase/supabase-js: Cliente de Supabase
- jsonwebtoken: Autenticación JWT
- bcryptjs: Encriptación de passwords
- cloudinary: Gestión de imágenes
- cors: Manejo de CORS
- dotenv: Variables de entorno
