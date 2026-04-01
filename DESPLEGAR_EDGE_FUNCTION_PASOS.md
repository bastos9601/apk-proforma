# 🚀 Pasos para Desplegar Edge Function de Consulta RUC

## ✅ PASO 1: Instalar Supabase CLI

### Windows (Opción A - Scoop):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Windows (Opción B - Descarga directa):
1. Ve a: https://github.com/supabase/cli/releases
2. Descarga `supabase_windows_amd64.zip`
3. Extrae y agrega al PATH

### Verificar:
```bash
supabase --version
```

---

## ✅ PASO 2: Login en Supabase

```bash
supabase login
```

Se abrirá tu navegador para autorizar.

---

## ✅ PASO 3: Inicializar Supabase en tu proyecto

```bash
# Desde la raíz de tu proyecto
supabase init
```

Esto crea la carpeta `supabase/` con la estructura necesaria.

---

## ✅ PASO 4: Vincular tu proyecto

```bash
supabase link --project-ref qfinablpaknitaytdgoj
```

---

## ✅ PASO 5: Crear la función

```bash
supabase functions new consultar-ruc
```

Esto crea: `supabase/functions/consultar-ruc/index.ts`

---

## ✅ PASO 6: Copiar el código

1. Abre el archivo que acabo de crear: `supabase-edge-function-consultar-ruc.ts`
2. Copia TODO el contenido
3. Pégalo en: `supabase/functions/consultar-ruc/index.ts`

---

## ✅ PASO 7: Desplegar

```bash
supabase functions deploy consultar-ruc
```

Espera a que termine (puede tardar 1-2 minutos).

---

## ✅ PASO 8: Probar la función

### Desde el navegador:
```
https://qfinablpaknitaytdgoj.supabase.co/functions/v1/consultar-ruc?ruc=10769795869
```

### Respuesta esperada:
```json
{
  "encontrado": true,
  "razonSocial": "NOMBRE COMPLETO",
  "direccion": "DIRECCION COMPLETA",
  "estado": "ACTIVO",
  "condicion": "HABIDO",
  "valido": true
}
```

---

## ✅ PASO 9: Listo!

Tu app ya está configurada para usar la Edge Function. Solo necesitas desplegarla siguiendo los pasos anteriores.

---

## 📝 Comandos Resumidos (copia y pega):

```bash
# 1. Login
supabase login

# 2. Inicializar (si no lo has hecho)
supabase init

# 3. Vincular proyecto
supabase link --project-ref qfinablpaknitaytdgoj

# 4. Crear función
supabase functions new consultar-ruc

# 5. (Copiar código manualmente al archivo creado)

# 6. Desplegar
supabase functions deploy consultar-ruc

# 7. Ver logs (opcional)
supabase functions logs consultar-ruc
```

---

## ⚠️ Notas Importantes

1. **Ya actualicé tu código** - El archivo `ruc.servicio.js` ya está configurado para usar la Edge Function
2. **No malogra nada** - Si la función no está desplegada, simplemente dará error y el usuario puede ingresar datos manualmente
3. **Gratis** - 500,000 consultas/mes en plan gratuito
4. **Oficial** - Consulta directo a SUNAT, no APIs de terceros

---

## 🔧 Troubleshooting

### "supabase: command not found"
Reinicia tu terminal o agrega al PATH manualmente.

### "Project not linked"
```bash
supabase link --project-ref qfinablpaknitaytdgoj
```

### Ver logs en tiempo real
```bash
supabase functions logs consultar-ruc --follow
```

### Probar localmente antes de desplegar
```bash
supabase functions serve consultar-ruc
```

---

## 📊 Ventajas de esta solución

✅ Consulta directo a SUNAT (fuente oficial)  
✅ No depende de APIs de terceros  
✅ Gratis (dentro de límites de Supabase)  
✅ Serverless (no necesitas servidor)  
✅ Rápido (se ejecuta en el edge)  
✅ Sin captcha  
✅ Siempre actualizado  

---

## 🎯 Resultado Final

Cuando ingreses un RUC de 11 dígitos en tu app:
1. Se consulta automáticamente en SUNAT
2. Se llenan los datos del cliente
3. Todo funciona sin APIs de terceros
4. Totalmente gratis y confiable
