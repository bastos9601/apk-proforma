import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { formatearFecha } from '../utilidades/formatearFecha';

/**
 * Generar HTML para el PDF de la factura (Diseño Profesional)
 */
export const generarHTMLFactura = (factura, detalles, config = null) => {
  const nombreEmpresa = config?.nombre_empresa || 'BRADATEC';
  const nombreSistema = config?.nombre_sistema || 'BRADATEC';
  const representante = config?.representante || 'ING. DAVID POLO';
  const ruc = config?.ruc || '20608918371';
  const direccion = config?.direccion || 'JIRON ZAVALA 501';
  const telefono = config?.telefono || '969142875';
  const email = config?.email || 'bradatecsrl@gmail.com';
  const logoUrl = config?.logo_url || null;

  let itemNumero = 1;
  const filasDetalles = detalles.map(detalle => {
    const fila = `
    <tr>
      <td style="text-align: center; border: 1px solid #d1d5db; padding: 8px; font-weight: bold; background-color: #f9fafb; font-size: 11px;">${itemNumero}</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 10px; line-height: 1.4;">${detalle.descripcion}</td>
      <td style="text-align: center; border: 1px solid #d1d5db; padding: 8px; font-size: 10px;">${detalle.cantidad}</td>
      <td style="text-align: right; border: 1px solid #d1d5db; padding: 8px; font-size: 10px;">S/ ${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
      <td style="text-align: right; border: 1px solid #d1d5db; padding: 8px; font-weight: bold; font-size: 11px; background-color: #f9fafb;">S/ ${parseFloat(detalle.subtotal).toFixed(2)}</td>
    </tr>
  `;
    itemNumero++;
    return fila;
  }).join('');

  const fechaEmisionFormateada = formatearFecha(factura.fecha_emision);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page { margin: 10mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          font-size: 10px; 
          line-height: 1.3; 
          color: #1f2937;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 3px solid #c00000;
        }
        .logo-section { width: 28%; }
        .logo-image { max-width: 150px; max-height: 90px; object-fit: contain; }
        .logo-text { font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 2px; }
        .logo-subtext { font-size: 11px; color: #1e3a8a; font-weight: 600; letter-spacing: 1px; }
        
        .company-info { width: 42%; text-align: center; padding-top: 5px; }
        .company-name { font-size: 22px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px; letter-spacing: 1px; }
        .representative { font-size: 11px; color: #4b5563; margin-bottom: 4px; font-weight: 600; }
        .company-details { font-size: 9px; color: #6b7280; line-height: 1.4; }
        
        .ruc-section { width: 28%; text-align: right; }
        .ruc-box { 
          border: 3px solid #c00000; 
          padding: 10px; 
          margin-bottom: 8px; 
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border-radius: 6px;
        }
        .ruc-text { font-size: 10px; margin-bottom: 3px; color: #4b5563; font-weight: 600; }
        .factura-label { font-size: 13px; font-weight: bold; color: #c00000; margin-bottom: 4px; letter-spacing: 1px; }
        .factura-number { font-weight: bold; font-size: 16px; color: #c00000; letter-spacing: 0.5px; }
        .date-box { 
          border: 2px solid #4b5563; 
          padding: 8px; 
          background: #f9fafb;
          border-radius: 4px;
        }
        .date-label { font-size: 9px; margin-bottom: 3px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
        .date-value { font-weight: bold; font-size: 11px; color: #1f2937; }
        
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #c00000;
          margin: 12px 0;
          padding: 10px;
          background: linear-gradient(90deg, transparent, #fee2e2 15%, #fee2e2 85%, transparent);
          letter-spacing: 2px;
          text-transform: uppercase;
          border-top: 2px solid #c00000;
          border-bottom: 2px solid #c00000;
        }
        
        .client-info {
          border: 2px solid #4b5563;
          padding: 8px 12px;
          margin-bottom: 10px;
          background: #f9fafb;
          border-radius: 4px;
        }
        .client-row {
          margin-bottom: 4px;
          font-size: 10px;
          display: flex;
          padding: 2px 0;
        }
        .client-row:last-child { margin-bottom: 0; }
        .client-label { 
          font-weight: bold; 
          width: 85px; 
          color: #4b5563;
          text-transform: uppercase;
          font-size: 9px;
        }
        .client-value {
          color: #1f2937;
          font-weight: 600;
          flex: 1;
          font-size: 10px;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 12px;
          border-radius: 6px;
          overflow: hidden;
        }
        th {
          background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          padding: 10px 6px;
          text-align: center;
          font-weight: bold;
          border: none;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td { 
          padding: 8px 6px; 
          font-size: 10px;
          border: 1px solid #e5e7eb;
        }
        tbody tr:nth-child(even) { background-color: #f9fafb; }
        
        .totals-section {
          width: 100%;
          margin-top: 8px;
          margin-bottom: 10px;
        }
        .totals-table {
          width: 38%;
          margin-left: auto;
          border-collapse: collapse;
          border-radius: 4px;
          overflow: hidden;
        }
        .totals-table td {
          border: none;
          padding: 6px 15px;
          font-size: 11px;
        }
        .totals-label {
          text-align: right;
          font-weight: bold;
          background: #f3f4f6;
          width: 50%;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
          text-transform: uppercase;
          font-size: 10px;
        }
        .totals-value {
          text-align: right;
          width: 50%;
          background-color: #ffffff;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding-right: 15px;
          font-size: 11px;
        }
        .total-final-label {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          font-weight: bold;
          font-size: 12px;
          border-bottom: none;
        }
        .total-final-value {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          font-weight: bold;
          font-size: 13px;
          border-bottom: none;
        }
        
        .total-letras {
          border: 2px solid #4b5563;
          padding: 8px;
          margin-bottom: 10px;
          font-size: 10px;
          font-weight: bold;
          background: #f9fafb;
          text-align: center;
          color: #1f2937;
          border-radius: 4px;
        }
        
        .observaciones-section {
          padding: 10px;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        .observaciones-titulo {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 6px;
          color: #92400e;
          text-transform: uppercase;
        }
        .observaciones-texto {
          font-size: 10px;
          line-height: 1.5;
          white-space: pre-line;
          color: #78350f;
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
              <div class="logo-subtext">S.R.L</div>
            </div>`
          }
        </div>
        
        <div class="company-info">
          <div class="company-name">${nombreEmpresa}</div>
          <div class="representative">${representante}</div>
          <div class="company-details">
            ${direccion}<br>
            RUC: ${ruc}<br>
            ${telefono} | ${email}
          </div>
        </div>
        
        <div class="ruc-section">
          <div class="ruc-box">
            <div class="ruc-text">RUC: ${ruc}</div>
            <div class="factura-label">FACTURA</div>
            <div class="factura-number">${factura.numero_factura}</div>
          </div>
          <div class="date-box">
            <div class="date-label">Fecha de Emisión</div>
            <div class="date-value">${fechaEmisionFormateada}</div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div class="title">Factura de Venta</div>

      <!-- Client Info -->
      <div class="client-info">
        <div class="client-row">
          <span class="client-label">Señor(es):</span>
          <span class="client-value">${factura.cliente_nombre}</span>
        </div>
        ${factura.cliente_ruc ? `
        <div class="client-row">
          <span class="client-label">RUC:</span>
          <span class="client-value">${factura.cliente_ruc}</span>
        </div>
        ` : ''}
        ${factura.cliente_direccion ? `
        <div class="client-row">
          <span class="client-label">Dirección:</span>
          <span class="client-value">${factura.cliente_direccion}</span>
        </div>
        ` : ''}
      </div>

      <!-- Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">ITEM</th>
            <th style="width: 52%;">DESCRIPCIÓN</th>
            <th style="width: 13%;">CANT.</th>
            <th style="width: 13%;">P. UNIT.</th>
            <th style="width: 14%;">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${filasDetalles}
        </tbody>
      </table>

      <!-- Totals Section -->
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td class="totals-label">SUBTOTAL</td>
            <td class="totals-value">S/ ${parseFloat(factura.subtotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="totals-label">IGV (18%)</td>
            <td class="totals-value">S/ ${parseFloat(factura.igv).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="total-final-label">TOTAL</td>
            <td class="total-final-value">S/ ${parseFloat(factura.total).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="total-letras">
        SON: ${factura.total_letras?.toUpperCase() || ''}
      </div>

      <!-- Observaciones -->
      ${factura.observaciones ? `
      <div class="observaciones-section">
        <div class="observaciones-titulo">📌 Observaciones</div>
        <div class="observaciones-texto">${factura.observaciones}</div>
      </div>
      ` : ''}
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
 * Generar PDF de la factura
 */
export const generarPDFFactura = async (factura, detalles, config = null) => {
  try {
    // Convertir logo a base64 si existe
    let configConLogoBase64 = config;
    if (config?.logo_url) {
      const logoBase64 = await convertirImagenABase64(config.logo_url);
      configConLogoBase64 = {
        ...config,
        logo_url: logoBase64 || config?.logo_url,
      };
    }

    const html = generarHTMLFactura(factura, detalles, configConLogoBase64);
    
    // Generar nombre de archivo: Factura_F001-00001_CLIENTE_01-04-2026.pdf
    const fechaGeneracion = new Date();
    const fechaFormato = `${fechaGeneracion.getDate().toString().padStart(2, '0')}-${(fechaGeneracion.getMonth() + 1).toString().padStart(2, '0')}-${fechaGeneracion.getFullYear()}`;
    const nombreClienteLimpio = factura.cliente_nombre
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase();
    const nombreArchivo = `Factura_${factura.numero_factura}_${nombreClienteLimpio}_${fechaFormato}.pdf`;
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    // Renombrar archivo
    const nuevoUri = FileSystem.documentDirectory + nombreArchivo;
    await FileSystem.copyAsync({
      from: uri,
      to: nuevoUri
    });
    
    await FileSystem.deleteAsync(uri, { idempotent: true });
    
    return nuevoUri;
  } catch (error) {
    console.error('Error al generar PDF de factura:', error);
    throw error;
  }
};

/**
 * Compartir PDF de factura
 */
export const compartirPDFFactura = async (uri, nombreCliente) => {
  try {
    const puedeCompartir = await Sharing.isAvailableAsync();
    
    if (puedeCompartir) {
      const nombreArchivo = uri.split('/').pop();
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir Factura - ${nombreCliente}`,
        UTI: 'com.adobe.pdf',
        suggestedName: nombreArchivo
      });
    } else {
      throw new Error('La función de compartir no está disponible');
    }
  } catch (error) {
    console.error('Error al compartir PDF de factura:', error);
    throw error;
  }
};
