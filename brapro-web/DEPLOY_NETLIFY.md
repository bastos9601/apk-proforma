# Desplegar BRAPRO WEB en Netlify

## Pasos para desplegar

### 1. Preparar el proyecto

```bash
cd brapro-web
npm install
npm run build
```

### 2. Crear cuenta en Netlify

1. Ve a https://www.netlify.com/
2. Crea una cuenta o inicia sesión
3. Haz clic en "Add new site" > "Import an existing project"

### 3. Conectar con Git (Recomendado)

1. Conecta tu repositorio de GitHub/GitLab/Bitbucket
2. Selecciona el repositorio
3. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Functions directory**: `netlify/functions`

### 4. Configurar Variables de Entorno

En Netlify Dashboard > Site settings > Environment variables, agrega:

```
SEGO_USER=Bradatecsrl@gmail.com
SEGO_PASS=20608918371
```

### 5. Desplegar

Haz clic en "Deploy site"

## Despliegue Manual (Alternativa)

Si prefieres desplegar manualmente:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Desplegar
netlify deploy --prod
```

## Desarrollo Local con Netlify Functions

Para probar las funciones localmente:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Ejecutar en modo desarrollo
netlify dev
```

Esto iniciará:
- React app en http://localhost:8888
- Netlify Functions en http://localhost:8888/.netlify/functions

## Estructura del Proyecto

```
brapro-web/
├── netlify/
│   └── functions/
│       └── buscar-sego.js    # Función serverless para scraping
├── public/
├── src/
│   ├── components/
│   ├── config/
│   ├── pages/
│   └── App.js
├── netlify.toml              # Configuración de Netlify
└── package.json
```

## URLs después del despliegue

- **Sitio web**: https://tu-sitio.netlify.app
- **Función de búsqueda**: https://tu-sitio.netlify.app/.netlify/functions/buscar-sego?termino=camara

## Solución de Problemas

### Error: Function not found

Verifica que:
1. La carpeta `netlify/functions` existe
2. El archivo `buscar-sego.js` está en esa carpeta
3. Las dependencias `axios` y `cheerio` están en `package.json`

### Error: SEGO_USER not defined

Configura las variables de entorno en Netlify Dashboard

### Error de CORS

Las funciones de Netlify ya tienen CORS configurado en el código

## Actualizar el sitio

Si usas Git:
- Haz push a tu repositorio
- Netlify desplegará automáticamente

Si es manual:
```bash
netlify deploy --prod
```

## Monitoreo

- Ve a Netlify Dashboard > Functions
- Revisa los logs de las funciones
- Monitorea el uso y límites

## Límites de Netlify (Plan Gratuito)

- 125,000 invocaciones de funciones/mes
- 100 GB de ancho de banda/mes
- Tiempo de ejecución: 10 segundos por función

## Notas Importantes

- Las credenciales de Sego se configuran como variables de entorno
- Las funciones serverless se ejecutan en cada petición
- La sesión de Sego se mantiene por 30 minutos
- El scraping es legal siempre que respetes los términos de servicio
