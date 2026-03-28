# Recuperación de Contraseña por Código OTP - Implementación Completa

## ✅ IMPLEMENTACIÓN COMPLETADA

### Sistema de Recuperación por Código de 6 Dígitos

En lugar de enviar un enlace por correo, el sistema ahora:
1. Genera un código de 6 dígitos
2. Lo envía por correo electrónico
3. Usuario ingresa el código
4. Usuario crea nueva contraseña

---

## 📋 PASOS DE CONFIGURACIÓN

### Paso 1: Crear Tabla de Códigos en Supabase

1. Ve a tu proyecto: https://qfinablpaknitaytdgoj.supabase.co
2. Abre **SQL Editor**
3. Ejecuta el script: `crear-tabla-codigos-recuperacion.sql`

Este script crea:
- Tabla `codigos_recuperacion`
- Función `generar_codigo_recuperacion(email)` - Genera código de 6 dígitos
- Función `verificar_codigo_recuperacion(email, codigo)` - Verifica si es válido
- Función `limpiar_codigos_expirados()` - Limpia códigos viejos

### Paso 2: Crear Edge Function para Cambiar Contraseña

**Opción A: Usando Supabase CLI (Recomendado)**

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Link con tu proyecto
supabase link --project-ref qfinablpaknitaytdgoj

# 4. Crear función
supabase functions new cambiar-password

# 5. Copiar el código de supabase-edge-function-cambiar-password.ts
#    a supabase/functions/cambiar-password/index.ts

# 6. Desplegar
supabase functions deploy cambiar-password
```

**Opción B: Desde el Dashboard de Supabase**

1. Ve a **Edge Functions** en el dashboard
2. Crea nueva función llamada `cambiar-password`
3. Copia el código de `supabase-edge-function-cambiar-password.ts`
4. Despliega la función

### Paso 3: Configurar Servicio de Email

**IMPORTANTE**: Por defecto, el código se muestra en consola (solo desarrollo).

Para producción, necesitas configurar un servicio de email:

#### Opción 1: Usar Supabase Email (Limitado)

Supabase tiene email integrado pero con límites. Para usarlo, modifica la función `enviarCodigoRecuperacion`:

```javascript
// En supabase.auth.servicio.js
export const enviarCodigoRecuperacion = async (correo) => {
  // ... generar código ...
  
  // Enviar email usando Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: `myapp://verify-code?code=${codigo}`
  });
  
  // ...
};
```

#### Opción 2: SendGrid (Recomendado)

1. Crea cuenta en SendGrid (gratis hasta 100 emails/día)
2. Obtén tu API Key
3. Instala en tu proyecto:
   ```bash
   npm install @sendgrid/mail
   ```

4. Crea servicio de email:

```javascript
// frontend/src/servicios/email.servicio.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey('TU_SENDGRID_API_KEY');

export const enviarEmailCodigo = async (correo, codigo) => {
  const msg = {
    to: correo,
    from: 'noreply@tudominio.com', // Email verificado en SendGrid
    subject: 'Código de Recuperación - BRADATEC',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">BRADATEC</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Código de Recuperación</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Tu código de verificación es:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #2563eb; 
                        color: white; 
                        font-size: 32px;
                        font-weight: bold;
                        padding: 20px;
                        letter-spacing: 10px;
                        border-radius: 8px;
                        display: inline-block;">
              ${codigo}
            </div>
          </div>
          
          <p style="color: #6b7280;">
            Este código es válido por <strong>10 minutos</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Si no solicitaste este código, ignora este correo.
          </p>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 BRADATEC - Sistema de Proformas
          </p>
        </div>
      </div>
    `,
  };

  await sgMail.send(msg);
};
```

5. Actualiza `enviarCodigoRecuperacion`:

```javascript
import { enviarEmailCodigo } from './email.servicio';

export const enviarCodigoRecuperacion = async (correo) => {
  // ... generar código ...
  
  // Enviar por email
  await enviarEmailCodigo(correo, codigo);
  
  return {
    success: true,
    mensaje: 'Se ha enviado un código de 6 dígitos a tu correo.',
    // NO incluir código en producción
  };
};
```

#### Opción 3: Nodemailer con Gmail

```javascript
// frontend/src/servicios/email.servicio.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu-email@gmail.com',
    pass: 'tu-app-password' // App Password de Gmail
  }
});

export const enviarEmailCodigo = async (correo, codigo) => {
  await transporter.sendMail({
    from: '"BRADATEC" <tu-email@gmail.com>',
    to: correo,
    subject: 'Código de Recuperación',
    html: `
      <h2>Tu código de recuperación es:</h2>
      <h1 style="font-size: 48px; letter-spacing: 10px;">${codigo}</h1>
      <p>Válido por 10 minutos.</p>
    `
  });
};
```

---

## 🎯 FLUJO COMPLETO

### Desde la App del Usuario:

**Paso 1: Solicitar Código**
1. Usuario abre app
2. Toca "¿Olvidaste tu contraseña?"
3. Ingresa su correo
4. Toca "Enviar Código"
5. Sistema genera código de 6 dígitos
6. Código se guarda en BD (válido 10 minutos)
7. Código se envía por email

**Paso 2: Verificar Código**
1. Usuario recibe email con código
2. Ingresa código de 6 dígitos en la app
3. Toca "Verificar Código"
4. Sistema verifica en BD
5. Si es válido, marca como usado
6. Avanza a paso 3

**Paso 3: Nueva Contraseña**
1. Usuario ingresa nueva contraseña
2. Confirma contraseña
3. Toca "Cambiar Contraseña"
4. Sistema llama Edge Function
5. Edge Function verifica código nuevamente
6. Actualiza contraseña usando Admin API
7. Usuario puede iniciar sesión

---

## 🔧 ARCHIVOS CREADOS/MODIFICADOS

### Scripts SQL:
- `crear-tabla-codigos-recuperacion.sql` - Tabla y funciones

### Edge Function:
- `supabase-edge-function-cambiar-password.ts` - Función para cambiar password

### Servicios:
- `frontend/src/servicios/supabase.auth.servicio.js`:
  - `enviarCodigoRecuperacion(correo)` - Genera y envía código
  - `verificarCodigoRecuperacion(correo, codigo)` - Verifica código
  - `cambiarPasswordConCodigo(correo, codigo, nuevaPassword)` - Cambia password

### Pantallas:
- `frontend/src/pantallas/Login.pantalla.js`:
  - Modal con 3 pasos
  - Paso 1: Ingresar correo
  - Paso 2: Ingresar código
  - Paso 3: Nueva contraseña

---

## 🧪 PRUEBAS

### Modo Desarrollo (Código en Consola):

1. Abre la app
2. Toca "¿Olvidaste tu contraseña?"
3. Ingresa correo registrado
4. Toca "Enviar Código"
5. **Mira la consola** - verás el código
6. Ingresa el código en la app
7. Crea nueva contraseña
8. Inicia sesión

### Modo Producción (Con Email):

1. Configura servicio de email (SendGrid/Gmail)
2. Prueba el flujo completo
3. Verifica que llegue el email
4. Ingresa código del email
5. Cambia contraseña
6. Inicia sesión

---

## ⚠️ SEGURIDAD

### Características de Seguridad:

✅ **Código de 6 dígitos**: Difícil de adivinar (1 en 1,000,000)
✅ **Expiración**: Válido solo 10 minutos
✅ **Un solo uso**: Se marca como usado al verificar
✅ **Invalidación**: Códigos anteriores se invalidan al generar uno nuevo
✅ **Rate limiting**: Supabase limita intentos automáticamente
✅ **Encriptación**: Comunicación HTTPS
✅ **Admin API**: Solo Edge Function puede cambiar passwords

### Mejoras Adicionales (Opcional):

1. **Límite de intentos**: Bloquear después de 3 intentos fallidos
2. **Captcha**: Agregar reCAPTCHA al solicitar código
3. **Notificación**: Email cuando se cambia la contraseña
4. **Historial**: Registrar cambios de contraseña
5. **2FA**: Autenticación de dos factores

---

## 📊 ESTRUCTURA DE DATOS

### Tabla codigos_recuperacion:

```sql
id          UUID        -- ID único
email       VARCHAR     -- Email del usuario
codigo      VARCHAR(6)  -- Código de 6 dígitos
usado       BOOLEAN     -- Si ya fue usado
expira_en   TIMESTAMP   -- Fecha de expiración
created_at  TIMESTAMP   -- Fecha de creación
```

### Ejemplo de Registro:

```
id: 123e4567-e89b-12d3-a456-426614174000
email: usuario@ejemplo.com
codigo: 847392
usado: false
expira_en: 2026-01-20 15:45:00
created_at: 2026-01-20 15:35:00
```

---

## 🎨 UI/UX

### Paso 1: Solicitar Código
- Input de correo
- Botón "Enviar Código"
- Validación de formato

### Paso 2: Ingresar Código
- Input grande centrado para 6 dígitos
- Teclado numérico
- Muestra correo de destino
- Enlace "¿No recibiste el código? Reenviar"
- Contador de tiempo (opcional)

### Paso 3: Nueva Contraseña
- Input de nueva contraseña con ojito
- Input de confirmar contraseña
- Requisitos de contraseña
- Botón "Cambiar Contraseña"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "No llega el código":

1. **Revisa spam/correo no deseado**
2. **Verifica configuración de email**
3. **Revisa logs de Supabase**
4. **En desarrollo**: Mira la consola

### "Código inválido":

1. **Verifica que no haya expirado** (10 minutos)
2. **Asegúrate de escribir bien** (6 dígitos)
3. **Solicita nuevo código**
4. **Revisa que el email sea correcto**

### "Error al cambiar contraseña":

1. **Verifica que Edge Function esté desplegada**
2. **Revisa logs de Edge Function**
3. **Verifica permisos de Admin API**
4. **Revisa que el código sea válido**

---

## 📱 CAPTURAS DE PANTALLA (Flujo)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Paso 1: Email  │ --> │ Paso 2: Código  │ --> │ Paso 3: Password│
│                 │     │                 │     │                 │
│ [email input]   │     │   ┌───────┐     │     │ [password]      │
│                 │     │   │847392 │     │     │ [confirm]       │
│ [Enviar Código] │     │   └───────┘     │     │                 │
│                 │     │                 │     │ [Cambiar]       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## ✨ VENTAJAS vs Enlace por Email

### Código OTP:
✅ Más rápido (no necesita abrir navegador)
✅ Funciona en cualquier dispositivo
✅ Más seguro (expira en 10 min vs 24 horas)
✅ Mejor UX en móviles
✅ No depende de deep links
✅ Fácil de escribir (6 dígitos)

### Enlace por Email:
❌ Requiere abrir navegador
❌ Problemas con deep links
❌ Expira en 24 horas
❌ Más pasos para el usuario

---

## 🚀 PRÓXIMAS MEJORAS

1. **Contador de tiempo**: Mostrar tiempo restante del código
2. **Reenvío automático**: Botón para reenviar código
3. **Verificación automática**: Auto-verificar al ingresar 6 dígitos
4. **Historial de intentos**: Registrar intentos fallidos
5. **Notificación de cambio**: Email confirmando cambio de password
6. **SMS alternativo**: Enviar código por SMS además de email

---

**Implementación completada** ✅

El sistema de recuperación por código está listo. Solo necesitas:
1. Ejecutar el script SQL
2. Desplegar la Edge Function
3. Configurar servicio de email (opcional para desarrollo)
