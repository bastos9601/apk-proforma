// ============================================
// Supabase Edge Function: cambiar-password
// ============================================
// Esta función permite cambiar la contraseña de un usuario
// después de verificar el código OTP

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener datos del request
    const { email, codigo, nuevaPassword } = await req.json()

    // Validar parámetros
    if (!email || !codigo || !nuevaPassword) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear cliente de Supabase con service role (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar código
    const { data: codigoValido, error: errorVerificacion } = await supabaseAdmin
      .rpc('verificar_codigo_recuperacion', {
        p_email: email,
        p_codigo: codigo
      })

    if (errorVerificacion || !codigoValido) {
      return new Response(
        JSON.stringify({ error: 'Código inválido o expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener usuario por email
    const { data: { users }, error: errorUsuario } = await supabaseAdmin.auth.admin.listUsers()
    
    const usuario = users?.find(u => u.email === email)
    
    if (!usuario) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Actualizar contraseña usando Admin API
    const { error: errorActualizar } = await supabaseAdmin.auth.admin.updateUserById(
      usuario.id,
      { password: nuevaPassword }
    )

    if (errorActualizar) {
      return new Response(
        JSON.stringify({ error: 'Error al actualizar contraseña' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true, 
        mensaje: 'Contraseña actualizada exitosamente' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// INSTRUCCIONES PARA DESPLEGAR:
// ============================================
// 
// 1. Instalar Supabase CLI:
//    npm install -g supabase
//
// 2. Inicializar proyecto:
//    supabase init
//
// 3. Crear función:
//    supabase functions new cambiar-password
//
// 4. Copiar este código en:
//    supabase/functions/cambiar-password/index.ts
//
// 5. Desplegar:
//    supabase functions deploy cambiar-password --project-ref qfinablpaknitaytdgoj
//
// 6. La URL será:
//    https://qfinablpaknitaytdgoj.supabase.co/functions/v1/cambiar-password
//
// ============================================
