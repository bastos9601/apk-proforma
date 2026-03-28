import { supabase } from '../config/supabase.config';

/**
 * Obtener el siguiente número de proforma
 */
export const obtenerSiguienteNumeroProforma = async () => {
  try {
    const { data, error } = await supabase.rpc('obtener_siguiente_numero_proforma');

    if (error) {
      console.error('Error al obtener número de proforma:', error);
      // Si falla, usar timestamp como fallback
      return Date.now().toString().slice(-6);
    }

    return data.toString();
  } catch (error) {
    console.error('Error al obtener número de proforma:', error);
    // Fallback: usar timestamp
    return Date.now().toString().slice(-6);
  }
};
