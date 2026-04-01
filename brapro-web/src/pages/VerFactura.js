import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerFacturaPorId, marcarFacturaPagada } from '../utils/facturaService';
import { supabase } from '../config/supabase';
import html2pdf from 'html2pdf.js';
import './VerProforma.css';

function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDatos = async () => {
    try {
      // Cargar factura
      const dataFactura = await obtenerFacturaPorId(id);
      console.log('Factura cargada:', dataFactura);
      console.log('Detalles:', dataFactura.factura_detalles);
      setFactura(dataFactura);

      // Cargar configuración
      const { data: dataConfig } = await supabase
        .from('configuracion')
        .select('*')
        .eq('usuario_id', dataFactura.usuario_id)
        .single();
      
      if (dataConfig) {
        setConfig(dataConfig);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la factura');
      navigate('/facturas');
    } finally {
      setLoading(false);
    }
  };

  const marcarPagada = async () => {
    const metodo = prompt('Método de pago (efectivo, transferencia, etc.):');
    if (!metodo) return;

    try {
      await marcarFacturaPagada(id, metodo);
      alert('Factura marcada como pagada');
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const descargarPDF = async () => {
    const elemento = document.getElementById('factura-documento');
    const nombreArchivo = `Factura_${factura.numero_factura}_${factura.cliente_nombre}.pdf`;
    
    const opciones = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opciones).from(elemento).save();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container"><p>Cargando...</p></div>
      </>
    );
  }

  const detalles = factura.factura_detalles || [];
  const formatearFecha = (fecha) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE');

  return (
    <>
      <Navbar />
      <div className="proforma-container">
        <div className="proforma-actions no-print">
          <button onClick={() => navigate('/facturas')} className="btn btn-secondary">
            ← Volver
          </button>
          <button onClick={descargarPDF} className="btn btn-primary">
            📄 Descargar PDF
          </button>
          {factura.estado_pago === 'pendiente' && (
            <button onClick={marcarPagada} className="btn btn-success">
              ✅ Marcar como Pagada
            </button>
          )}
        </div>

        <div className="proforma-documento" id="factura-documento">
          {/* Barra roja superior */}
          <div style={{
            height: '8px',
            background: 'linear-gradient(90deg, #c00000 0%, #dc2626 100%)',
            marginBottom: '15px',
            borderRadius: '2px'
          }}></div>

          {/* Header con 3 columnas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 220px',
            gap: '20px',
            marginBottom: '20px',
            alignItems: 'start'
          }}>
            {/* Logo izquierda */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {config?.logo_url ? (
                <img 
                  src={config.logo_url} 
                  alt="Logo" 
                  style={{
                    maxWidth: '150px',
                    maxHeight: '120px',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#1e3a8a',
                    letterSpacing: '2px',
                    lineHeight: '1'
                  }}>BRADATEC</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#1e3a8a',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>S.R.L</div>
                </div>
              )}
            </div>

            {/* Info empresa centro */}
            <div style={{textAlign: 'center', paddingTop: '5px'}}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#1e3a8a',
                margin: '0 0 6px 0',
                letterSpacing: '1px'
              }}>{config?.nombre_empresa || 'BRADATEC S.R.L.'}</h1>
              <p style={{
                fontSize: '11px',
                color: '#4b5563',
                margin: '0 0 4px 0',
                fontWeight: '600'
              }}>{config?.representante || 'ING. DAVID POLO'}</p>
              <div style={{fontSize: '9px', color: '#6b7280', lineHeight: '1.4'}}>
                <p style={{margin: 0}}>{config?.direccion || 'Jr. Zavala Nro. 501 Urb. Cercado de Pucallpa'}</p>
                <p style={{margin: 0}}>RUC: {config?.ruc || '20608918371'}</p>
                <p style={{margin: 0}}>{config?.telefono || '969142875'} | {config?.email || 'bradatecsrl@gmail.com'}</p>
              </div>
            </div>

            {/* Cuadro RUC/FACTURA derecha */}
            <div>
              <div style={{
                border: '3px solid #c00000',
                padding: '10px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <p style={{fontSize: '10px', margin: '0 0 3px 0', color: '#4b5563', fontWeight: '600'}}>RUC: {config?.ruc || '20608918371'}</p>
                <p style={{fontSize: '13px', fontWeight: 'bold', color: '#c00000', margin: '0 0 4px 0', letterSpacing: '1px'}}>FACTURA</p>
                <p style={{fontWeight: 'bold', fontSize: '16px', color: '#c00000', margin: 0, letterSpacing: '0.5px'}}>{factura.numero_factura}</p>
              </div>
              <div style={{
                border: '2px solid #4b5563',
                padding: '8px',
                background: '#f9fafb',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p style={{fontSize: '9px', margin: '0 0 3px 0', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase'}}>Fecha de Emisión</p>
                <p style={{fontWeight: 'bold', fontSize: '11px', color: '#1f2937', margin: 0}}>{formatearFecha(factura.fecha_emision)}</p>
              </div>
            </div>
          </div>

          {/* Título con líneas rojas */}
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#c00000',
            margin: '12px 0',
            padding: '10px',
            background: 'linear-gradient(90deg, transparent, #fee2e2 15%, #fee2e2 85%, transparent)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            borderTop: '2px solid #c00000',
            borderBottom: '2px solid #c00000'
          }}>FACTURA DE VENTA</div>

          {/* Info cliente */}
          <div style={{
            border: '2px solid #4b5563',
            padding: '8px 12px',
            marginBottom: '10px',
            background: '#f9fafb',
            borderRadius: '4px'
          }}>
            <div style={{marginBottom: '4px', fontSize: '10px', display: 'flex', padding: '2px 0'}}>
              <span style={{fontWeight: 'bold', width: '85px', color: '#4b5563', textTransform: 'uppercase', fontSize: '9px'}}>SEÑOR(ES):</span>
              <span style={{color: '#1f2937', fontWeight: '600', flex: 1, fontSize: '10px'}}>{factura.cliente_nombre}</span>
            </div>
            <div style={{marginBottom: '4px', fontSize: '10px', display: 'flex', padding: '2px 0'}}>
              <span style={{fontWeight: 'bold', width: '85px', color: '#4b5563', textTransform: 'uppercase', fontSize: '9px'}}>RUC:</span>
              <span style={{color: '#1f2937', fontWeight: '600', flex: 1, fontSize: '10px'}}>{factura.cliente_ruc}</span>
            </div>
            <div style={{marginBottom: '4px', fontSize: '10px', display: 'flex', padding: '2px 0'}}>
              <span style={{fontWeight: 'bold', width: '85px', color: '#4b5563', textTransform: 'uppercase', fontSize: '9px'}}>DIRECCIÓN:</span>
              <span style={{color: '#1f2937', fontWeight: '600', flex: 1, fontSize: '10px'}}>{factura.cliente_direccion}</span>
            </div>
            <div style={{fontSize: '10px', display: 'flex', padding: '2px 0'}}>
              <span style={{fontWeight: 'bold', width: '85px', color: '#4b5563', textTransform: 'uppercase', fontSize: '9px'}}>ESTADO:</span>
              <span style={{color: '#1f2937', fontWeight: '600', flex: 1, fontSize: '10px'}}>
                {factura.estado_pago === 'pagada' ? '✅ Pagada' : '⏳ Pendiente'}
              </span>
            </div>
          </div>

          {/* Tabla con encabezado rojo */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '12px',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)'}}>
                <th style={{width: '8%', color: 'white', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>ITEM</th>
                <th style={{width: '52%', color: 'white', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>DESCRIPCIÓN</th>
                <th style={{width: '13%', color: 'white', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>CANT.</th>
                <th style={{width: '13%', color: 'white', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>P. UNIT.</th>
                <th style={{width: '14%', color: 'white', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {detalles && detalles.length > 0 ? (
                detalles.map((detalle, index) => (
                  <tr key={detalle.id || index} style={{background: index % 2 === 0 ? '#ffffff' : '#f9fafb'}}>
                    <td style={{textAlign: 'center', border: '1px solid #e5e7eb', padding: '8px', fontWeight: 'bold', fontSize: '11px'}}>{index + 1}</td>
                    <td style={{border: '1px solid #e5e7eb', padding: '8px', textAlign: 'left', fontSize: '10px', lineHeight: '1.4'}}>{detalle.descripcion}</td>
                    <td style={{textAlign: 'center', border: '1px solid #e5e7eb', padding: '8px', fontSize: '10px'}}>{detalle.cantidad}</td>
                    <td style={{textAlign: 'right', border: '1px solid #e5e7eb', padding: '8px', fontSize: '10px'}}>S/ {parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                    <td style={{textAlign: 'right', border: '1px solid #e5e7eb', padding: '8px', fontWeight: 'bold', fontSize: '11px'}}>S/ {parseFloat(detalle.subtotal).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px', border: '1px solid #e5e7eb', color: '#6b7280'}}>
                    No hay detalles disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totales con fondo rojo para el total final */}
          <div style={{width: '100%', marginTop: '8px', marginBottom: '10px'}}>
            <table style={{
              width: '38%',
              marginLeft: 'auto',
              borderCollapse: 'collapse',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <tbody>
                <tr>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    background: '#f3f4f6',
                    width: '50%',
                    color: '#4b5563',
                    borderBottom: '1px solid #e5e7eb',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    padding: '6px 15px',
                    border: 'none'
                  }}>SUBTOTAL</td>
                  <td style={{
                    textAlign: 'right',
                    width: '50%',
                    background: '#ffffff',
                    fontWeight: '600',
                    borderBottom: '1px solid #e5e7eb',
                    paddingRight: '15px',
                    fontSize: '11px',
                    padding: '6px 15px',
                    border: 'none'
                  }}>S/ {parseFloat(factura.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    background: '#f3f4f6',
                    width: '50%',
                    color: '#4b5563',
                    borderBottom: '1px solid #e5e7eb',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    padding: '6px 15px',
                    border: 'none'
                  }}>IGV (18%)</td>
                  <td style={{
                    textAlign: 'right',
                    width: '50%',
                    background: '#ffffff',
                    fontWeight: '600',
                    borderBottom: '1px solid #e5e7eb',
                    paddingRight: '15px',
                    fontSize: '11px',
                    padding: '6px 15px',
                    border: 'none'
                  }}>S/ {parseFloat(factura.igv).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    borderBottom: 'none',
                    textAlign: 'right',
                    padding: '6px 15px',
                    border: 'none'
                  }}>TOTAL</td>
                  <td style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    borderBottom: 'none',
                    textAlign: 'right',
                    padding: '6px 15px',
                    border: 'none'
                  }}>S/ {parseFloat(factura.total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cuadro SON */}
          <div style={{
            border: '2px solid #4b5563',
            padding: '8px',
            marginBottom: '10px',
            fontSize: '10px',
            fontWeight: 'bold',
            background: '#f9fafb',
            textAlign: 'center',
            color: '#1f2937',
            borderRadius: '4px'
          }}>
            SON: {factura.total_letras?.toUpperCase() || ''}
          </div>

          {/* Observaciones */}
          {factura.observaciones && (
            <div style={{
              padding: '10px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '4px'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '11px',
                marginBottom: '6px',
                color: '#92400e',
                textTransform: 'uppercase'
              }}>📌 OBSERVACIONES</div>
              <div style={{
                fontSize: '10px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                color: '#78350f'
              }}>{factura.observaciones}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VerFactura;
