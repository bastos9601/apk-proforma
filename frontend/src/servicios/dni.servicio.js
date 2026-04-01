/**
 * Servicio para consultar DNI en RENIEC
 * Usa Supabase Edge Function que consulta la API de decolecta.com
 */

import { SUPABASE_CONFIG } from '../config/supabase.config';

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
    const edgeFunctionUrl = `${SUPABASE_CONFIG.url}/functions/v1/consultar-dni?dni=${dni}`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
