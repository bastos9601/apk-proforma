import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Generar HTML para el PDF de la proforma (Estilo BRADATEC)
 * EXPORTADA para vista previa
 */
export const generarHTMLProforma = (proforma, detalles, nombreCliente = 'CLIENTE', config = null) => {
  // Usar configuración personalizada o valores por defecto
  const nombreEmpresa = config?.nombre_empresa || 'BRADATEC';
  const nombreSistema = config?.nombre_sistema || 'BRADATEC';
  const representante = config?.representante || 'ING. DAVID POLO';
  const ruc = config?.ruc || '20608918371';
  const direccion = config?.direccion || 'JIRON ZAVALA 501';
  const telefono = config?.telefono || '969142875';
  const email = config?.email || 'bradatecsrl@gmail.com';
  const cuentaBanco = config?.cuenta_banco || '480-77406530-0-76';
  const cci = config?.cci || '002-480-177406530076-25';
  const logoUrl = config?.logo_url || null;
  const logoBcpUrl = config?.logo_bcp_url || null;

  let itemNumero = 1;
  const filasDetalles = detalles.map(detalle => {
    const fila = `
    <tr>
      <td style="text-align: center; border: 1px solid #000; padding: 8px; font-weight: bold;">${itemNumero}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 8px;">
        ${detalle.imagen_url ? 
          `<img src="${detalle.imagen_url}" style="width: 60px; height: 60px; object-fit: contain;" />` : 
          '<div style="width: 60px; height: 60px; background: #f0f0f0; display: inline-block;"></div>'
        }
      </td>
      <td style="border: 1px solid #000; padding: 8px; text-align: left;">${detalle.descripcion}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 8px;">${detalle.cantidad}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 8px;">S/ ${parseFloat(detalle.precio).toFixed(2)}</td>
      <td style="text-align: center; border: 1px solid #000; padding: 8px; font-weight: bold;">S/ ${parseFloat(detalle.total).toFixed(2)}</td>
    </tr>
  `;
    itemNumero++;
    return fila;
  }).join('');

  const fechaFormateada = new Date(proforma.fecha).toLocaleDateString('es-PE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          margin: 15mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        .logo-section {
          width: 25%;
        }
        .logo-image {
          max-width: 150px;
          max-height: 100px;
          object-fit: contain;
        }
        .logo-text {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 5px;
        }
        .logo-subtext {
          font-size: 10px;
          color: #1e3a8a;
        }
        .company-info {
          width: 45%;
          text-align: center;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 5px;
        }
        .representative {
          font-size: 11px;
          margin-bottom: 8px;
        }
        .services-box {
          border: 2px solid #000;
          padding: 8px;
          margin-top: 5px;
        }
        .services-title {
          font-weight: bold;
          margin-bottom: 3px;
        }
        .services-list {
          font-size: 9px;
          line-height: 1.4;
        }
        .ruc-section {
          width: 25%;
          text-align: right;
        }
        .ruc-box {
          border: 2px solid #1e3a8a;
          padding: 8px;
          margin-bottom: 8px;
        }
        .ruc-text {
          font-size: 10px;
          margin-bottom: 2px;
        }
        .proforma-number {
          font-weight: bold;
          font-size: 12px;
        }
        .date-box {
          border: 2px solid #000;
          padding: 8px;
        }
        .date-label {
          font-size: 10px;
          margin-bottom: 2px;
        }
        .date-value {
          font-weight: bold;
          font-size: 11px;
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          text-decoration: underline;
          margin: 15px 0;
        }
        .client-info {
          margin-bottom: 10px;
          font-size: 11px;
        }
        .client-label {
          font-weight: bold;
        }
        .description-text {
          margin-bottom: 15px;
          font-size: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          background-color: #4472c4;
          color: white;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #000;
          font-size: 11px;
        }
        td {
          padding: 8px;
          font-size: 10px;
        }
        .notes-row {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          font-size: 9px;
        }
        .total-row {
          background-color: #f0f0f0;
        }
        .total-label {
          text-align: right;
          font-weight: bold;
          padding-right: 10px;
        }
        .total-value {
          text-align: center;
          font-weight: bold;
          color: #c00000;
          font-size: 12px;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #000;
        }
        .footer-left {
          width: 50%;
        }
        .company-footer {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-align: center;
          border: 2px solid #000;
          padding: 8px;
          background-color: #fff;
        }
        .bank-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .bank-table td {
          border: 2px solid #000;
          padding: 8px;
          font-size: 11px;
        }
        .bank-logo-cell {
          width: 120px;
          background-color: #003b7a;
          text-align: center;
          vertical-align: middle;
          padding: 10px;
        }
        .bank-logo {
          width: 100%;
          height: auto;
          max-width: 100px;
          object-fit: contain;
        }
        .bank-label-cell {
          width: 100px;
          font-weight: bold;
          background-color: #f0f0f0;
          text-align: center;
        }
        .bank-value-cell {
          background-color: #fff;
          text-align: center;
        }
        .footer-right {
          width: 45%;
          text-align: left;
        }
        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12px;
        }
        .contact-icon {
          width: 28px;
          height: 28px;
          margin-right: 10px;
          font-size: 24px;
        }
        .icon-maps {
          color: #4285F4;
        }
        .icon-whatsapp {
          color: #25D366;
        }
        .icon-gmail {
          color: #EA4335;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          ${logoUrl ? 
            `<img src="${logoUrl}" class="logo-image" alt="Logo" />` :
            `<div>
              <div class="logo-text">${nombreSistema}</div>
              <div class="logo-subtext">SRL</div>
            </div>`
          }
        </div>
        
        <div class="company-info">
          <div class="company-name">${nombreEmpresa}</div>
          <div class="representative">REPRESENTANTE: ${representante}</div>
          <div class="services-box">
            <div class="services-title">Venta de equipos:</div>
            <div class="services-list">
              -Cámaras de seguridad &nbsp;&nbsp;&nbsp;&nbsp; -Alarmas<br>
              -Redes y telecomunicaciones -Computo<br>
              -Cercos eléctricos &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -Ferretería y otros
            </div>
          </div>
        </div>
        
        <div class="ruc-section">
          <div class="ruc-box">
            <div class="ruc-text">RUC: ${ruc}</div>
            <div class="ruc-text">PROFORMA</div>
            <div class="proforma-number">Nº ${proforma.numero_proforma || proforma.id.substring(0, 6).toUpperCase()}</div>
          </div>
          <div class="date-box">
            <div class="date-label">FECHA</div>
            <div class="date-value">${fechaFormateada}</div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div class="title">Cotización del Servicio</div>

      <!-- Client Info -->
      <div class="client-info">
        <span class="client-label">CLIENTE:</span> ${nombreCliente}
      </div>
      <div class="description-text">
        ${proforma.descripcion_servicio || 'Por la presente ponemos a su consideración la cotización de instalación y reubicación'}
      </div>

      <!-- Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">ITEM</th>
            <th style="width: 12%;">IMAGEN</th>
            <th style="width: 45%;">DESCRIPCION</th>
            <th style="width: 12%;">CANTIDAD</th>
            <th style="width: 11%;">PRECIO</th>
            <th style="width: 12%;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${filasDetalles}
          <tr>
            <td colspan="4" class="notes-row">
              son: ${proforma.total_letras.toUpperCase()}
            </td>
            <td class="total-row total-label">TOTAL</td>
            <td class="total-row total-value">S/ ${parseFloat(proforma.total).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Consideraciones -->
      ${proforma.consideraciones ? `
      <div style="margin-top: 15px; margin-bottom: 15px;">
        <div style="font-weight: bold; font-size: 11px; margin-bottom: 8px;">CONSIDERACIONES:</div>
        <div style="font-size: 10px; line-height: 1.6; white-space: pre-line;">${proforma.consideraciones}</div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left">
          <div class="company-footer">${nombreEmpresa} S.R.L</div>
          
          <table class="bank-table">
            <tr>
              ${logoBcpUrl ? `
              <td class="bank-logo-cell" rowspan="2">
                <img src="${logoBcpUrl}" class="bank-logo" alt="BCP" />
              </td>
              ` : ''}
              <td class="bank-label-cell">CTA. AHORROS</td>
              <td class="bank-value-cell">${cuentaBanco}</td>
            </tr>
            <tr>
              <td class="bank-label-cell">CCI</td>
              <td class="bank-value-cell">${cci}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer-right">
          <div class="contact-item">
            <span class="contact-icon icon-maps">📍</span>
            <strong>${direccion}</strong>
          </div>
          <div class="contact-item">
            <span class="contact-icon icon-whatsapp">📱</span>
            <strong>${telefono}</strong>
          </div>
          <div class="contact-item">
            <span class="contact-icon icon-gmail">✉️</span>
            <strong>${email}</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Convertir imagen URL a base64
 */
const convertirImagenABase64 = async (url) => {
  try {
    const respuesta = await fetch(url);
    const blob = await respuesta.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al convertir imagen a base64:', error);
    return null;
  }
};

/**
 * Generar PDF de la proforma
 */
export const generarPDF = async (proforma, detalles, nombreCliente = 'CLIENTE', config = null) => {
  try {
    // Si hay logos, convertirlos a base64
    let configConLogosBase64 = config;
    if (config?.logo_url || config?.logo_bcp_url) {
      const logoBase64 = config?.logo_url ? await convertirImagenABase64(config.logo_url) : null;
      const logoBcpBase64 = config?.logo_bcp_url ? await convertirImagenABase64(config.logo_bcp_url) : null;
      
      configConLogosBase64 = {
        ...config,
        logo_url: logoBase64 || config?.logo_url,
        logo_bcp_url: logoBcpBase64 || config?.logo_bcp_url
      };
    }

    const html = generarHTMLProforma(proforma, detalles, nombreCliente, configConLogosBase64);
    
    // Generar nombre de archivo personalizado
    const fecha = new Date(proforma.fecha);
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
    const nombreClienteLimpio = nombreCliente
      .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .toUpperCase();
    const numeroProforma = proforma.numero_proforma || proforma.id.substring(0, 6).toUpperCase();
    const nombreArchivo = `Proforma_${numeroProforma}_${nombreClienteLimpio}_${fechaFormato}.pdf`;
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    // Renombrar el archivo con el nombre personalizado
    const nuevoUri = FileSystem.documentDirectory + nombreArchivo;
    await FileSystem.copyAsync({
      from: uri,
      to: nuevoUri
    });
    
    // Eliminar el archivo temporal original
    await FileSystem.deleteAsync(uri, { idempotent: true });
    
    return nuevoUri;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
};

/**
 * Compartir PDF
 */
export const compartirPDF = async (uri, nombreCliente = 'CLIENTE', proforma = null) => {
  try {
    const puedeCompartir = await Sharing.isAvailableAsync();
    
    if (puedeCompartir) {
      // Extraer el nombre del archivo de la URI
      const nombreArchivo = uri.split('/').pop();
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir Proforma - ${nombreCliente}`,
        UTI: 'com.adobe.pdf',
        // El nombre sugerido al compartir
        suggestedName: nombreArchivo
      });
    } else {
      throw new Error('La función de compartir no está disponible');
    }
  } catch (error) {
    console.error('Error al compartir PDF:', error);
    throw error;
  }
};

/**
 * Guardar PDF en el dispositivo
 */
export const guardarPDF = async (uri, nombreArchivo) => {
  try {
    const directorioDescargas = FileSystem.documentDirectory + 'proformas/';
    
    // Crear directorio si no existe
    const infoDirectorio = await FileSystem.getInfoAsync(directorioDescargas);
    if (!infoDirectorio.exists) {
      await FileSystem.makeDirectoryAsync(directorioDescargas, { intermediates: true });
    }

    const rutaDestino = directorioDescargas + nombreArchivo;
    await FileSystem.copyAsync({
      from: uri,
      to: rutaDestino
    });

    return rutaDestino;
  } catch (error) {
    console.error('Error al guardar PDF:', error);
    throw error;
  }
};
