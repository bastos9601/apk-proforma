import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { formatearFecha } from '../utilidades/formatearFecha';

/**
 * Generar PDF de boleta
 */
export const generarPDFBoleta = async (boleta) => {
  try {
    const html = generarHTMLBoleta(boleta);
    
    // Usar fecha de emisión de la boleta
    const fechaEmision = new Date(boleta.fecha_emision + 'T00:00:00');
    const fechaFormato = `${fechaEmision.getDate().toString().padStart(2, '0')}-${(fechaEmision.getMonth() + 1).toString().padStart(2, '0')}-${fechaEmision.getFullYear()}`;
    
    // Limpiar nombre del cliente para el archivo
    const nombreClienteLimpio = (boleta.cliente_nombre || 'Cliente')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase();
    
    // Formato: Boleta_B001-00001_NombreCliente_01-04-2026.pdf
    const nombreArchivo = `Boleta_${boleta.numero_boleta}_${nombreClienteLimpio}_${fechaFormato}.pdf`;
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
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
    console.error('Error al generar PDF:', error);
    throw error;
  }
};

/**
 * Compartir PDF de boleta
 */
export const compartirPDFBoleta = async (boleta) => {
  try {
    const uri = await generarPDFBoleta(boleta);
    
    const puedeCompartir = await Sharing.isAvailableAsync();
    
    if (puedeCompartir) {
      const nombreArchivo = uri.split('/').pop();
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir Boleta - ${boleta.cliente_nombre || 'Cliente'}`,
        UTI: 'com.adobe.pdf',
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
 * Generar HTML para el PDF de boleta
 */
const generarHTMLBoleta = (boleta) => {
  const detalles = boleta.boleta_detalles || [];
  
  const filasDetalles = detalles
    .sort((a, b) => a.orden - b.orden)
    .map((detalle) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${detalle.descripcion}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${detalle.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">S/ ${parseFloat(detalle.subtotal).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #1f2937;
          padding: 10mm;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 3px solid #c00000;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #c00000;
          margin-bottom: 5px;
        }
        
        .company-details {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.6;
        }
        
        .boleta-box {
          background: linear-gradient(135deg, #c00000 0%, #8b0000 100%);
          color: white;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          min-width: 180px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .boleta-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }
        
        .boleta-number {
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        .info-section {
          margin-bottom: 15px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #c00000;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 2px solid #fee2e2;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
        }
        
        .info-item {
          display: flex;
          gap: 5px;
        }
        
        .info-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 80px;
        }
        
        .info-value {
          color: #1f2937;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          background: white;
        }
        
        thead {
          background: linear-gradient(135deg, #c00000 0%, #8b0000 100%);
          color: white;
        }
        
        th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        
        th:nth-child(2),
        th:nth-child(3),
        th:nth-child(4) {
          text-align: right;
        }
        
        td {
          font-size: 10px;
        }
        
        .totals-table {
          width: 280px;
          margin-left: auto;
          margin-top: 10px;
          background: #f9fafb;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .totals-table td {
          padding: 6px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-table tr:last-child td {
          border-bottom: none;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          font-weight: bold;
          font-size: 13px;
          color: #c00000;
          padding: 10px 12px;
        }
        
        .total-letras {
          background: #fef3c7;
          padding: 10px;
          border-radius: 6px;
          margin-top: 10px;
          font-size: 10px;
          font-style: italic;
          color: #92400e;
          border-left: 4px solid #f59e0b;
        }
        
        .observaciones {
          margin-top: 15px;
          padding: 10px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 10px;
          color: #4b5563;
        }
        
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <div class="company-name">BRADATEC S.R.L.</div>
          <div class="company-details">
            RUC: 20608918371<br>
            Jr. Zavala Nro. 501 Urb. Cercado de Pucallpa<br>
            Callería - Coronel Portillo - Ucayali<br>
            Teléfono: (061) 123-4567
          </div>
        </div>
        <div class="boleta-box">
          <div class="boleta-title">BOLETA DE VENTA</div>
          <div class="boleta-number">${boleta.numero_boleta}</div>
        </div>
      </div>

      <!-- Información del Cliente -->
      <div class="info-section">
        <div class="section-title">📋 Información del Cliente</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Cliente:</span>
            <span class="info-value">${boleta.cliente_nombre || 'Cliente'}</span>
          </div>
          ${boleta.cliente_dni ? `
          <div class="info-item">
            <span class="info-label">DNI:</span>
            <span class="info-value">${boleta.cliente_dni}</span>
          </div>
          ` : ''}
          <div class="info-item">
            <span class="info-label">Fecha Emisión:</span>
            <span class="info-value">${formatearFecha(boleta.fecha_emision)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estado:</span>
            <span class="info-value">${boleta.estado_pago === 'pagada' ? '✅ Pagada' : boleta.estado_pago === 'anulada' ? '❌ Anulada' : '⏳ Pendiente'}</span>
          </div>
        </div>
      </div>

      <!-- Tabla de Productos/Servicios -->
      <table>
        <thead>
          <tr>
            <th>DESCRIPCIÓN</th>
            <th style="text-align: center;">CANT.</th>
            <th style="text-align: right;">P. UNIT.</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${filasDetalles}
        </tbody>
      </table>

      <!-- Totales -->
      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">S/ ${parseFloat(boleta.subtotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td>IGV (18%):</td>
          <td style="text-align: right;">S/ ${parseFloat(boleta.igv).toFixed(2)}</td>
        </tr>
        <tr>
          <td>TOTAL:</td>
          <td style="text-align: right;">S/ ${parseFloat(boleta.total).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Total en letras -->
      <div class="total-letras">
        <strong>SON:</strong> ${boleta.total_letras}
      </div>

      ${boleta.observaciones ? `
      <div class="observaciones">
        <strong>Observaciones:</strong><br>
        ${boleta.observaciones}
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        Documento generado electrónicamente - ${formatearFecha(new Date().toISOString().split('T')[0])}
      </div>
    </body>
    </html>
  `;
};
