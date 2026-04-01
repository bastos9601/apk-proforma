// Supabase Edge Function para consultar RUC en SUNAT
// Archivo: supabase/functions/consultar-ruc/index.ts

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
    // Obtener RUC del query parameter
    const url = new URL(req.url)
    const ruc = url.searchParams.get('ruc')

    if (!ruc) {
      return new Response(
        JSON.stringify({ error: 'RUC es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (ruc.length !== 11) {
      return new Response(
        JSON.stringify({ error: 'RUC debe tener 11 dígitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Consultando RUC en API:', ruc)

    // Usar API de decolecta.com con API key
    const apiUrl = `https://api.decolecta.com/v1/sunat/ruc?numero=${ruc}`
    
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
      throw new Error(`Error al consultar RUC: ${response.status}`)
    }

    const data = await response.json()
    console.log('Datos recibidos de API:', data)
    
    // Verificar si se encontró el RUC (según documentación de decolecta)
    if (data && data.razon_social) {
      // Construir dirección completa
      const direccionCompleta = data.direccion_completa || data.direccion || 
        [data.direccion, data.distrito, data.provincia, data.departamento]
          .filter(Boolean)
          .join(' - ') || '';
      
      return new Response(
        JSON.stringify({
          encontrado: true,
          razonSocial: data.razon_social || '',
          direccion: direccionCompleta,
          estado: data.estado || '',
          condicion: data.condicion || '',
          departamento: data.departamento || '',
          provincia: data.provincia || '',
          distrito: data.distrito || '',
          valido: data.estado?.toUpperCase() === 'ACTIVO' && data.condicion?.toUpperCase() === 'HABIDO',
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
        error: 'RUC no encontrado'
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
        error: 'Error al consultar RUC',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

