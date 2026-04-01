const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertirGrupo(numero) {
  if (numero === 0) return '';
  if (numero === 100) return 'CIEN';
  
  let resultado = '';
  const c = Math.floor(numero / 100);
  const d = Math.floor((numero % 100) / 10);
  const u = numero % 10;
  
  if (c > 0) resultado += centenas[c] + ' ';
  
  if (d === 1 && u > 0) {
    resultado += especiales[u];
  } else {
    if (d > 0) resultado += decenas[d];
    if (d > 2 && u > 0) resultado += ' Y ';
    if (u > 0 && d !== 1) resultado += unidades[u];
  }
  
  return resultado.trim();
}

export function convertirNumeroALetras(numero) {
  if (numero === 0) return 'CERO SOLES CON CERO CÉNTIMOS';
  
  const partes = numero.toFixed(2).split('.');
  const entero = parseInt(partes[0]);
  const decimal = parseInt(partes[1]);
  
  let resultado = '';
  
  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000);
    resultado += convertirGrupo(millones) + (millones === 1 ? ' MILLÓN ' : ' MILLONES ');
    const resto = entero % 1000000;
    if (resto > 0) resultado += convertirNumeroALetras(resto).split(' SOLES')[0];
  } else if (entero >= 1000) {
    const miles = Math.floor(entero / 1000);
    if (miles === 1) {
      resultado += 'MIL ';
    } else {
      resultado += convertirGrupo(miles) + ' MIL ';
    }
    const resto = entero % 1000;
    if (resto > 0) resultado += convertirGrupo(resto);
  } else {
    resultado = convertirGrupo(entero);
  }
  
  resultado = resultado.trim();
  resultado += entero === 1 ? ' SOL' : ' SOLES';
  resultado += ' CON ' + (decimal < 10 ? 'CERO ' : '') + decimal + '/100';
  
  return resultado;
}
