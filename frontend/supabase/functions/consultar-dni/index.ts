// Supabase Edge Function para consultar DNI en RENIEC
// Archivo: supabase/functions/consultar-dni/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    // Obtener DNI del query parameter
    const url = new URL(req.url)
    const dni = url.searchParams.get('dni')

    if (!dni) {
      return new Response(
        JSON.stringify({ error: 'DNI es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (dni.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'DNI debe tener 8 dígitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Consultando DNI en API:', dni)

    // Usar API de decolecta.com con API key
    const apiUrl = `https://api.decolecta.com/v1/reniec/dni?numero=${dni}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_14389.Dk59mRdHTx4OulcZbgjNiGrYicxVqsE1',
      },
    })

    if (!response.ok) {
      console.error('Error al consultar API:', response.status)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      throw new Error(`Error al consultar DNI: ${response.status}`)
    }

    const data = await response.json()
    console.log('Datos recibidos de API:', data)
    
    // Verificar si se encontró el DNI (estructura de decolecta)
    if (data && data.full_name) {
      return new Response(
        JSON.stringify({
          encontrado: true,
          nombres: data.first_name || '',
          apellidoPaterno: data.first_last_name || '',
          apellidoMaterno: data.second_last_name || '',
          nombreCompleto: data.full_name || '',
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        encontrado: false,
        error: 'DNI no encontrado'
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error en Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error al consultar DNI',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
