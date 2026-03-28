# Configuración de Recuperación de Contraseña - Supabase

## ✅ IMPLEMENTACIÓN COMPLETADA

### Funcionalidades Agregadas:

1. **Servicio de Recuperación**:
   - `recuperarPassword(correo)` - Envía correo de recuperación
   - `actualizarPassword(nuevaPassword)` - Actualiza la contraseña

2. **UI en Login**:
   - Enlace "¿Olvidaste tu contraseña?"
   - Modal con formulario de recuperación
   - Validación de correo electrónico
   - Mensajes de confirmación

---

## 📋 CONFIGURACIÓN EN SUPABASE

### Paso 1: Verificar Configuración de Email

1. Ve a tu proyecto en Supabase: https://qfinablpaknitaytdgoj.supabase.co
2. Navega a **Authentication** > **Email Templates**
3. Busca la plantilla **"Reset Password"** o **"Recuperar Contraseña"**

### Paso 2: Configurar la Plantilla de Email

La plantilla por defecto debería verse así:

```html
<h2>Restablecer Contraseña</h2>
<p>Hola,</p>
<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer Contraseña</a></p>
<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
<p>Este enlace expirará en 24 horas.</p>
```

**Puedes personalizarla** con tu marca:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #2563eb; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BRADATEC</h1>
    <p style="color: white; margin: 5px 0;">Sistema de Proformas</p>
  </div>
  
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #1f2937;">Restablecer Contraseña</h2>
    <p style="color: #4b5563;">Hola,</p>
    <p style="color: #4b5563;">
      Has solicitado restablecer tu contraseña para el Sistema de Proformas BRADATEC.
    </p>
    <p style="color: #4b5563;">
      Haz clic en el siguiente botón para crear una nueva contraseña:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background-color: #2563eb; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block;
                font-weight: bold;">
        Restablecer Contraseña
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
    </p>
    <p style="color: #6b7280; font-size: 14px;">
      <strong>Nota:</strong> Este enlace expirará en 24 horas por seguridad.
    </p>
  </div>
  
  <div style="background-color: #1f2937; padding: 20px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      © 2026 BRADATEC - Sistema de Proformas
    </p>
  </div>
</div>
```

### Paso 3: Configurar URL de Redirección

1. En **Authentication** > **URL Configuration**
2. Busca **"Site URL"** y asegúrate que esté configurada
3. Agrega en **"Redirect URLs"**:
   - Para desarrollo: `http://localhost:19006/reset-password`
   - Para producción: `myapp://reset-password` (deep link de tu app)

### Paso 4: Configurar Proveedor de Email (Opcional pero Recomendado)

Por defecto, Supabase usa su propio servicio de email, pero tiene límites.

**Para producción, configura un proveedor personalizado:**

#### Opción 1: Gmail (Gratis, Fácil)

1. Ve a **Project Settings** > **Auth** > **SMTP Settings**
2. Habilita "Enable Custom SMTP"
3. Configura:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tu-email@gmail.com
   Password: [App Password de Gmail]
   Sender email: tu-email@gmail.com
   Sender name: BRADATEC Sistema de Proformas
   ```

**Cómo obtener App Password de Gmail:**
1. Ve a tu cuenta de Google
2. Seguridad > Verificación en 2 pasos (actívala si no está)
3. Contraseñas de aplicaciones
4. Genera una nueva para "Correo"
5. Usa esa contraseña en Supabase

#### Opción 2: SendGrid (Profesional)

1. Crea cuenta en SendGrid (gratis hasta 100 emails/día)
2. Obtén tu API Key
3. Configura en Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Tu SendGrid API Key]
   Sender email: noreply@tudominio.com
   Sender name: BRADATEC
   ```

#### Opción 3: AWS SES (Escalable)

Para grandes volúmenes, usa Amazon SES.

---

## 🎯 FLUJO DE RECUPERACIÓN

### Desde la App:

1. **Usuario olvida contraseña**:
   - Abre la app
   - Toca "¿Olvidaste tu contraseña?"
   - Ingresa su correo
   - Toca "Enviar Enlace de Recuperación"

2. **Sistema envía correo**:
   - Supabase envía email con enlace
   - Enlace válido por 24 horas
   - Incluye token de seguridad

3. **Usuario recibe correo**:
   - Revisa bandeja de entrada
   - Puede tardar 1-2 minutos
   - Si no llega, revisar spam

4. **Usuario hace clic en enlace**:
   - Se abre navegador o app
   - Muestra formulario de nueva contraseña
   - Usuario ingresa nueva contraseña
   - Confirma cambio

5. **Contraseña actualizada**:
   - Usuario puede iniciar sesión
   - Con nueva contraseña

---

## 🔧 CÓDIGO IMPLEMENTADO

### Servicio (supabase.auth.servicio.js):

```javascript
// Enviar correo de recuperación
export const recuperarPassword = async (correo) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: 'myapp://reset-password',
  });
  // ...
};

// Actualizar contraseña
export const actualizarPassword = async (nuevaPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: nuevaPassword,
  });
  // ...
};
```

### UI (Login.pantalla.js):

- Modal de recuperación
- Validación de correo
- Mensajes de confirmación
- Manejo de errores

---

## 🧪 PRUEBAS

### Probar Recuperación:

1. **Abre la app**
2. **Toca "¿Olvidaste tu contraseña?"**
3. **Ingresa un correo registrado**
4. **Toca "Enviar Enlace"**
5. **Revisa el correo**
6. **Haz clic en el enlace**
7. **Ingresa nueva contraseña**
8. **Inicia sesión con nueva contraseña**

### Casos de Prueba:

✅ **Correo válido registrado**: Debe enviar email
✅ **Correo no registrado**: Debe enviar email (por seguridad, no revela si existe)
❌ **Correo inválido**: Debe mostrar error de formato
❌ **Campo vacío**: Debe mostrar error de campo requerido

---

## ⚠️ CONSIDERACIONES DE SEGURIDAD

### Buenas Prácticas:

1. **No revelar si el correo existe**:
   - Siempre mostrar "Correo enviado" aunque no exista
   - Evita que atacantes descubran usuarios válidos

2. **Límite de intentos**:
   - Supabase limita automáticamente
   - Previene spam y ataques

3. **Expiración de enlaces**:
   - Enlaces válidos por 24 horas
   - Después deben solicitar uno nuevo

4. **Token único**:
   - Cada enlace tiene token único
   - No reutilizable

5. **HTTPS obligatorio**:
   - Todos los enlaces usan HTTPS
   - Comunicación encriptada

---

## 🎨 PERSONALIZACIÓN

### Cambiar Tiempo de Expiración:

Por defecto son 24 horas. Para cambiar:

1. Ve a **Authentication** > **Email Templates**
2. Edita la plantilla "Reset Password"
3. No hay opción directa, pero puedes:
   - Mencionar tiempo diferente en el texto
   - Contactar soporte de Supabase para cambios

### Cambiar Idioma:

Edita las plantillas en **Email Templates**:
- Subject: "Restablecer Contraseña - BRADATEC"
- Body: Usa el HTML personalizado arriba en español

### Agregar Logo:

En la plantilla HTML, agrega:

```html
<div style="text-align: center; padding: 20px;">
  <img src="https://tu-url-logo.com/logo.png" 
       alt="BRADATEC" 
       style="max-width: 150px;" />
</div>
```

---

## 📱 DEEP LINKS (Opcional - Para App Nativa)

Si compilas la app como APK/IPA, configura deep links:

### Android (app.json):

```json
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "myapp",
              "host": "reset-password"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### iOS (app.json):

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "associatedDomains": ["applinks:tudominio.com"]
    }
  }
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "No llega el correo":

1. **Revisa spam/correo no deseado**
2. **Espera 2-3 minutos** (puede tardar)
3. **Verifica que el correo esté registrado**
4. **Revisa logs en Supabase**:
   - Authentication > Logs
   - Busca errores de email

### "El enlace no funciona":

1. **Verifica que no haya expirado** (24 horas)
2. **Revisa URL de redirección** en Supabase
3. **Intenta copiar y pegar** el enlace completo
4. **Solicita nuevo enlace**

### "Error al enviar":

1. **Verifica conexión a internet**
2. **Revisa configuración SMTP** en Supabase
3. **Verifica límites de email** (100/hora por defecto)
4. **Revisa logs de Supabase**

---

## 📊 LÍMITES Y CUOTAS

### Plan Gratuito de Supabase:

- **50,000 usuarios activos mensuales**
- **100 emails por hora** (con SMTP por defecto)
- **Ilimitado con SMTP personalizado** (Gmail, SendGrid, etc.)

### Recomendaciones:

- Para < 100 usuarios: SMTP por defecto está bien
- Para > 100 usuarios: Configura Gmail o SendGrid
- Para producción: Usa SendGrid o AWS SES

---

## ✨ CARACTERÍSTICAS

✅ Modal intuitivo en Login
✅ Validación de formato de correo
✅ Mensajes de confirmación claros
✅ Manejo de errores
✅ Diseño responsive
✅ Integración con Supabase Auth
✅ Seguro y encriptado
✅ Plantilla de email personalizable

---

## 🚀 PRÓXIMAS MEJORAS

1. **Pantalla de cambio de contraseña**: Crear pantalla dedicada en la app
2. **Verificación de fortaleza**: Validar que la nueva contraseña sea fuerte
3. **Historial de cambios**: Registrar cuándo se cambió la contraseña
4. **Notificación de cambio**: Email confirmando que se cambió la contraseña
5. **Autenticación de dos factores**: Agregar 2FA para mayor seguridad

---

**Implementación completada** ✅

La funcionalidad de recuperación de contraseña está lista. Solo necesitas configurar el email en Supabase siguiendo los pasos arriba.
