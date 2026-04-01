/**
 * Servicio para consultar DNI en RENIEC
 * Usa Supabase Edge Function que consulta la API de decolecta.com
 */

const SUPABASE_URL = 'https://qfinablpaknitaytdgoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE';

/**
 * Consultar DNI en RENIEC usando Supabase Edge Function
 * @param {string} dni - DNI de 8 dígitos
 * @returns {object} Datos de la persona o null si no se encuentra
 */
export const consultarDNI = async (dni) => {
  if (!dni || dni.length !== 8) {
    throw new Error('DNI debe tener 8 dígitos');
  }

  try {
    console.log('Consultando DNI:', dni);
    
    // Usar Supabase Edge Function (evita problemas de CORS)
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/consultar-dni?dni=${dni}`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'No se pudo consultar el DNI');
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    
    return data;
  } catch (error) {
    console.error('Error al consultar DNI:', error);
    console.error('Error detallado:', error.message);
    throw error;
  }
};

/**
 * Validar formato de DNI
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si el formato es válido
 */
export const validarFormatoDNI = (dni) => {
  if (!dni) return false;
  if (dni.length !== 8) return false;
  if (!/^\d+$/.test(dni)) return false;
  return true;
};
