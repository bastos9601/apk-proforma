/**
 * Servicio para consultar RUC en SUNAT
 * Usa Supabase Edge Function que consulta la API de decolecta.com
 */

const SUPABASE_URL = 'https://qfinablpaknitaytdgoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE';

/**
 * Consultar RUC en SUNAT usando Supabase Edge Function
 * @param {string} ruc - RUC de 11 dígitos
 * @returns {object} Datos de la empresa o null si no se encuentra
 */
export const consultarRUC = async (ruc) => {
  if (!ruc || ruc.length !== 11) {
    throw new Error('RUC debe tener 11 dígitos');
  }

  try {
    console.log('Consultando RUC:', ruc);
    
    // Usar Supabase Edge Function (evita problemas de CORS)
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/consultar-ruc?ruc=${ruc}`;
    
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
      throw new Error(errorData.error || 'No se pudo consultar el RUC');
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    
    return data;
  } catch (error) {
    console.error('Error al consultar RUC:', error);
    console.error('Error detallado:', error.message);
    throw error;
  }
};

/**
 * Validar formato de RUC
 * @param {string} ruc - RUC a validar
 * @returns {boolean} true si el formato es válido
 */
export const validarFormatoRUC = (ruc) => {
  if (!ruc) return false;
  if (ruc.length !== 11) return false;
  if (!/^\d+$/.test(ruc)) return false;
  
  // RUC debe empezar con 10, 15, 16, 17 o 20
  const prefijo = ruc.substring(0, 2);
  return ['10', '15', '16', '17', '20'].includes(prefijo);
};

/**
 * Obtener tipo de contribuyente según prefijo del RUC
 * @param {string} ruc - RUC a analizar
 * @returns {string} Tipo de contribuyente
 */
export const obtenerTipoContribuyente = (ruc) => {
  if (!ruc || ruc.length !== 11) return 'Desconocido';
  
  const prefijo = ruc.substring(0, 2);
  
  const tipos = {
    '10': 'Persona Natural',
    '15': 'Persona Natural (No domiciliado)',
    '16': 'Persona Natural (Extranjero)',
    '17': 'Persona Natural (Extranjero)',
    '20': 'Persona Jurídica (Empresa)',
  };
  
  return tipos[prefijo] || 'Desconocido';
};

/**
 * Formatear dirección completa
 * @param {object} datos - Datos de la consulta RUC
 * @returns {string} Dirección formateada
 */
export const formatearDireccion = (datos) => {
  if (!datos.direccion) return '';
  
  let direccion = datos.direccion;
  
  // Agregar distrito, provincia, departamento si están disponibles
  const ubicacion = [datos.distrito, datos.provincia, datos.departamento]
    .filter(Boolean)
    .join(' - ');
  
  if (ubicacion && !direccion.includes(ubicacion)) {
    direccion += ` - ${ubicacion}`;
  }
  
  return direccion;
};
