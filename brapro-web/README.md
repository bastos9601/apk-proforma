# BRAPRO WEB

Aplicación web para gestión de proformas, conectada a la misma base de datos de Supabase que la app móvil.

## Características

- 🔐 Autenticación con Supabase
- 📄 Crear y gestionar proformas
- 📦 Catálogo de productos
- ⚙️ Configuración de empresa
- 📊 Dashboard con estadísticas
- 🎨 Interfaz moderna y responsive

## Instalación

```bash
cd brapro-web
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación se abrirá en http://localhost:3000

## Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`

## Tecnologías

- React 18
- React Router v6
- Supabase (Base de datos y autenticación)
- CSS moderno

## Estructura

```
src/
├── config/          # Configuración de Supabase
├── components/      # Componentes reutilizables
├── pages/          # Páginas de la aplicación
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── Proformas.js
│   ├── CrearProforma.js
│   ├── Catalogo.js
│   └── Configuracion.js
└── App.js          # Componente principal
```

## Credenciales de Supabase

Las credenciales están configuradas en `src/config/supabase.js` y apuntan a la misma base de datos que la app móvil.

## Despliegue

Puedes desplegar en:
- Vercel
- Netlify
- GitHub Pages
- Cualquier hosting de archivos estáticos

Simplemente ejecuta `npm run build` y sube la carpeta `build/`
