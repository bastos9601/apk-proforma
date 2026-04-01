/**
 * Formatear fecha a formato DD/MM/YYYY
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  // Si es string, agregar 'T00:00:00' para evitar problemas de zona horaria
  let date;
  if (typeof fecha === 'string' && !fecha.includes('T')) {
    date = new Date(fecha + 'T00:00:00');
  } else {
    date = new Date(fecha);
  }
  
  // Verificar que la fecha sea válida
  if (isNaN(date.getTime())) return '';
  
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
};

/**
 * Obtener fecha actual en formato YYYY-MM-DD (para guardar en BD)
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const obtenerFechaActual = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
