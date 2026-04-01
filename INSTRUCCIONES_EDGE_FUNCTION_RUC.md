# Instrucciones para Desplegar Edge Function de Consulta RUC

## Paso 1: Instalar Supabase CLI

### Windows:
```powershell
# Usando Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

O descarga desde: https://github.com/supabase/cli/releases

### Verificar instalación:
```bash
supabase --version
```

## Paso 2: Inicializar Supabase en tu proyecto

```bash
# Navegar a la raíz de tu proyecto
cd ruta/a/tu/proyecto

# Inicializar Supabase (esto crea la carpeta supabase/)
supabase init
```

## Paso 3: Crear la Edge Function

```bash
# Crear la función
supabase functions new consultar-ruc
```

Esto creará: `supabase/functions/consultar-ruc/index.ts`

## Paso 4: Copiar el código

Copia el contenido del archivo `supabase-edge-function-consultar-ruc.ts` y pégalo en:
```
supabase/functions/consultar-ruc/index.ts
```

## Paso 5: Login en Supabase

```bash
# Hacer login
supabase login

# Vincular tu proyecto
supabase link --project-ref qfinablpaknitaytdgoj
```

Tu project-ref es: `qfinablpaknitaytdgoj` (extraído de tu URL de Supabase)

## Paso 6: Desplegar la función

```bash
# Desplegar la función
supabase functions deploy consultar-ruc
```

## Paso 7: Verificar el despliegue

La función estará disponible en:
```
https://qfinablpaknitaytdgoj.supabase.co/functions/v1/consultar-ruc?ruc=20100070970
```

## Paso 8: Probar la función

### Desde el navegador:
```
https://qfinablpaknitaytdgoj.supabase.co/functions/v1/consultar-ruc?ruc=10769795869
```

### Desde Postman o curl:
```bash
curl "https://qfinablpaknitaytdgoj.supabase.co/functions/v1/consultar-ruc?ruc=10769795869" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE"
```

## Respuesta esperada:

```json
{
  "encontrado": true,
  "razonSocial": "NOMBRE DE LA EMPRESA O PERSONA",
  "direccion": "DIRECCION COMPLETA",
  "estado": "ACTIVO",
  "condicion": "HABIDO",
  "departamento": "LIMA",
  "provincia": "LIMA",
  "distrito": "MIRAFLORES",
  "valido": true
}
```

## Troubleshooting

### Error: "supabase: command not found"
- Reinicia tu terminal después de instalar
- Verifica que esté en el PATH

### Error: "Project not linked"
```bash
supabase link --project-ref qfinablpaknitaytdgoj
```

### Error al desplegar
- Verifica que estés logueado: `supabase login`
- Verifica que el proyecto esté vinculado: `supabase projects list`

### Ver logs de la función
```bash
supabase functions logs consultar-ruc
```

## Límites de Supabase Edge Functions

- **Plan Gratuito**: 500,000 invocaciones/mes
- **Timeout**: 150 segundos por invocación
- **Memoria**: 150 MB

Más que suficiente para consultas de RUC.

## Siguiente paso

Una vez desplegada la función, ejecuta el siguiente comando para actualizar tu código de React Native:

```bash
# Te daré el código actualizado para usar la Edge Function
```

## Notas importantes

- ✅ La función consulta directo a SUNAT (fuente oficial)
- ✅ No depende de APIs de terceros
- ✅ Gratis dentro de los límites de Supabase
- ✅ Serverless, no necesitas mantener un servidor
- ✅ Se ejecuta en el edge (rápido)
