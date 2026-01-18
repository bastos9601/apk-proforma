/**
 * Convertir número a letras (español)
 * Soporta números hasta 999,999,999.99
 */

const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

/**
 * Convertir número menor a 100
 */
const convertirMenorCien = (numero) => {
  if (numero < 10) {
    return unidades[numero];
  } else if (numero >= 10 && numero < 20) {
    return especiales[numero - 10];
  } else {
    const decena = Math.floor(numero / 10);
    const unidad = numero % 10;
    
    if (unidad === 0) {
      return decenas[decena];
    } else if (decena === 2) {
      return 'veinti' + unidades[unidad];
    } else {
      return decenas[decena] + ' y ' + unidades[unidad];
    }
  }
};

/**
 * Convertir número menor a 1000
 */
const convertirMenorMil = (numero) => {
  if (numero < 100) {
    return convertirMenorCien(numero);
  }

  const centena = Math.floor(numero / 100);
  const resto = numero % 100;

  let resultado = '';
  
  if (centena === 1 && resto === 0) {
    resultado = 'cien';
  } else {
    resultado = centenas[centena];
    if (resto > 0) {
      resultado += ' ' + convertirMenorCien(resto);
    }
  }

  return resultado;
};

/**
 * Convertir número completo
 */
export const convertirNumeroALetras = (numero) => {
  if (numero === 0) return 'cero soles';
  
  // Separar parte entera y decimal
  const partes = numero.toFixed(2).split('.');
  const parteEntera = parseInt(partes[0]);
  const parteDecimal = parseInt(partes[1]);

  let resultado = '';

  // Millones
  if (parteEntera >= 1000000) {
    const millones = Math.floor(parteEntera / 1000000);
    if (millones === 1) {
      resultado += 'un millón ';
    } else {
      resultado += convertirMenorMil(millones) + ' millones ';
    }
  }

  // Miles
  const miles = Math.floor((parteEntera % 1000000) / 1000);
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'mil ';
    } else {
      resultado += convertirMenorMil(miles) + ' mil ';
    }
  }

  // Unidades
  const unidadesNum = parteEntera % 1000;
  if (unidadesNum > 0) {
    resultado += convertirMenorMil(unidadesNum) + ' ';
  }

  // Agregar "nuevos soles"
  resultado += 'nuevos soles';

  // Agregar centavos si existen
  if (parteDecimal > 0) {
    resultado += ' con ' + convertirMenorCien(parteDecimal) + ' céntimos';
  }

  // Capitalizar primera letra
  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
};

/**
 * Ejemplo de uso:
 * convertirNumeroALetras(1500.50) => "Mil quinientos nuevos soles con cincuenta céntimos"
 * convertirNumeroALetras(100) => "Cien nuevos soles"
 * convertirNumeroALetras(25.99) => "Veinticinco nuevos soles con noventa y nueve céntimos"
 */
