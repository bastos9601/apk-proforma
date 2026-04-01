// Supabase Edge Function para consultar RUC en SUNAT
// Archivo: supabase/functions/consultar-ruc/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

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

    console.log('Consultando RUC en SUNAT:', ruc)

    // Hacer petición a SUNAT
    const sunatUrl = `https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias?accion=consPorRuc&nroRuc=${ruc}`
    
    const response = await fetch(sunatUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Error al consultar SUNAT: ${response.status}`)
    }

    const html = await response.text()
    
    // Parsear HTML
    const doc = new DOMParser().parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('No se pudo parsear la respuesta de SUNAT')
    }

    // Extraer datos de las tablas
    const tables = doc.querySelectorAll('table')
    
    if (tables.length === 0) {
      return new Response(
        JSON.stringify({ 
          encontrado: false,
          error: 'RUC no encontrado en SUNAT'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Función auxiliar para extraer texto de una fila
    const extraerTexto = (label: string): string => {
      const rows = doc.querySelectorAll('tr')
      for (const row of rows) {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 2) {
          const labelText = cells[0].textContent.trim()
          if (labelText.includes(label)) {
            return cells[1].textContent.trim()
          }
        }
      }
      return ''
    }

    // Extraer datos
    const razonSocial = extraerTexto('Nombre') || extraerTexto('Razón Social')
    const estado = extraerTexto('Estado')
    const condicion = extraerTexto('Condición')
    const direccion = extraerTexto('Dirección')
    const departamento = extraerTexto('Departamento')
    const provincia = extraerTexto('Provincia')
    const distrito = extraerTexto('Distrito')

    if (!razonSocial) {
      return new Response(
        JSON.stringify({ 
          encontrado: false,
          error: 'No se pudo extraer información del RUC'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construir respuesta
    const datos = {
      encontrado: true,
      razonSocial: razonSocial,
      direccion: direccion,
      estado: estado,
      condicion: condicion,
      departamento: departamento,
      provincia: provincia,
      distrito: distrito,
      valido: estado.toUpperCase() === 'ACTIVO' && condicion.toUpperCase() === 'HABIDO',
    }

    console.log('Datos extraídos:', datos)

    return new Response(
      JSON.stringify(datos),
      { 
        status: 200, 
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
