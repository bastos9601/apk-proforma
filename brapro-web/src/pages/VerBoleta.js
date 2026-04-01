import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerBoletaPorId, marcarBoletaPagada } from '../utils/boletaService';
import { supabase } from '../config/supabase';
import html2pdf from 'html2pdf.js';
import './VerProforma.css';

function VerBoleta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boleta, setBoleta] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDatos = async () => {
    try {
      // Cargar boleta
      const dataBoleta = await obtenerBoletaPorId(id);
      console.log('Boleta cargada:', dataBoleta);
      console.log('Detalles:', dataBoleta.boleta_detalles);
      setBoleta(dataBoleta);

      // Cargar configuración
      const { data: dataConfig } = await supabase
        .from('configuracion')
        .select('*')
        .eq('usuario_id', dataBoleta.usuario_id)
        .single();
      
      if (dataConfig) {
        setConfig(dataConfig);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la boleta');
      navigate('/boletas');
    } finally {
      setLoading(false);
    }
  };

  const marcarPagada = async () => {
    const metodo = prompt('Método de pago (efectivo, transferencia, etc.):');
    if (!metodo) return;

    try {
      await marcarBoletaPagada(id, metodo);
      alert('Boleta marcada como pagada');
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const descargarPDF = async () => {
    const elemento = document.getElementById('boleta-documento');
    const nombreArchivo = `Boleta_${boleta.numero_boleta}_${boleta.cliente_nombre || 'Cliente'}.pdf`;
    
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

  const detalles = boleta.boleta_detalles || [];
  const formatearFecha = (fecha) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE');

  return (
    <>
      <Navbar />
      <div className="proforma-container">
        <div className="proforma-actions no-print">
          <button onClick={() => navigate('/boletas')} className="btn btn-secondary">
            ← Volver
          </button>
          <button onClick={descargarPDF} className="btn btn-primary">
            📄 Descargar PDF
          </button>
          {boleta.estado_pago === 'pendiente' && (
            <button onClick={marcarPagada} className="btn btn-success">
              ✅ Marcar como Pagada
            </button>
          )}
        </div>

        <div className="proforma-documento" id="boleta-documento">
          {/* Header con 2 columnas - sin barra superior */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '25px',
            paddingBottom: '0'
          }}>
            {/* Info empresa izquierda */}
            <div style={{flex: 1}}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#c00000',
                margin: '0 0 10px 0',
                letterSpacing: '1px'
              }}>{config?.nombre_empresa || 'BRADATEC S.R.L.'}</h1>
              <div style={{fontSize: '11px', color: '#9ca3af', lineHeight: '1.7'}}>
                <p style={{margin: 0}}>RUC: {config?.ruc || '20608918371'}</p>
                <p style={{margin: 0}}>{config?.direccion || 'Jr. Zavala Nro. 501 Urb. Cercado de Pucallpa'}</p>
                <p style={{margin: 0}}>Callería - Coronel Portillo - Ucayali</p>
                <p style={{margin: 0}}>Teléfono: {config?.telefono || '(061) 123-4567'}</p>
              </div>
            </div>

            {/* Cuadro BOLETA derecha */}
            <div style={{
              background: '#c00000',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
                letterSpacing: '1.5px'
              }}>BOLETA DE VENTA</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '3px'
              }}>{boleta.numero_boleta}</div>
            </div>
          </div>

          {/* Línea separadora roja */}
          <div style={{
            height: '3px',
            background: '#c00000',
            marginBottom: '20px'
          }}></div>

          {/* Información del Cliente */}
          <div style={{marginBottom: '20px'}}>
            <div style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#c00000',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{fontSize: '16px'}}>📋</span>
              <span>Información del Cliente</span>
            </div>
            
            {/* Grid de información */}
            <div style={{
              background: '#ffffff',
              padding: '12px 15px',
              borderRadius: '0',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '11px'
              }}>
                <div style={{display: 'flex', gap: '8px'}}>
                  <span style={{fontWeight: '600', color: '#4b5563', minWidth: '110px'}}>Cliente:</span>
                  <span style={{color: '#1f2937', fontWeight: '500'}}>{boleta.cliente_nombre || 'Cliente'}</span>
                </div>
                {boleta.cliente_dni && (
                  <div style={{display: 'flex', gap: '8px'}}>
                    <span style={{fontWeight: '600', color: '#4b5563', minWidth: '50px'}}>DNI:</span>
                    <span style={{color: '#1f2937', fontWeight: '500'}}>{boleta.cliente_dni}</span>
                  </div>
                )}
                <div style={{display: 'flex', gap: '8px'}}>
                  <span style={{fontWeight: '600', color: '#4b5563', minWidth: '110px'}}>Fecha Emisión:</span>
                  <span style={{color: '#1f2937', fontWeight: '500'}}>{formatearFecha(boleta.fecha_emision)}</span>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <span style={{fontWeight: '600', color: '#4b5563', minWidth: '50px'}}>Estado:</span>
                  <span style={{color: '#1f2937', fontWeight: '500'}}>
                    {boleta.estado_pago === 'pagada' ? '✅ Pagada' : '⏳ Pendiente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla con encabezado rojo */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '0',
            border: '1px solid #e5e7eb'
          }}>
            <thead>
              <tr style={{background: '#c00000', color: 'white'}}>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  border: 'none'
                }}>DESCRIPCIÓN</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  width: '100px',
                  border: 'none'
                }}>CANT.</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  width: '120px',
                  border: 'none'
                }}>P. UNIT.</th>
                <th style={{
                  padding: '12px 15px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  width: '120px',
                  border: 'none'
                }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {detalles && detalles.length > 0 ? (
                detalles.map((detalle, index) => (
                  <tr key={detalle.id || index} style={{background: '#ffffff'}}>
                    <td style={{
                      padding: '10px 15px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '11px',
                      color: '#1f2937'
                    }}>{detalle.descripcion}</td>
                    <td style={{
                      padding: '10px 15px',
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#1f2937'
                    }}>{detalle.cantidad}</td>
                    <td style={{
                      padding: '10px 15px',
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'right',
                      fontSize: '11px',
                      color: '#1f2937'
                    }}>S/ {parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                    <td style={{
                      padding: '10px 15px',
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'right',
                      fontSize: '11px',
                      color: '#1f2937'
                    }}>S/ {parseFloat(detalle.subtotal).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{
                    textAlign: 'center',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    color: '#6b7280'
                  }}>
                    No hay detalles disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totales - alineados a la derecha */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '15px',
            marginBottom: '15px'
          }}>
            <div style={{width: '300px'}}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 15px',
                fontSize: '11px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{color: '#4b5563'}}>Subtotal:</span>
                <span style={{color: '#1f2937', fontWeight: '500'}}>S/ {parseFloat(boleta.subtotal).toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 15px',
                fontSize: '11px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{color: '#4b5563'}}>IGV (18%):</span>
                <span style={{color: '#1f2937', fontWeight: '500'}}>S/ {parseFloat(boleta.igv).toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 15px',
                fontSize: '14px',
                background: '#fecaca',
                fontWeight: 'bold',
                color: '#c00000'
              }}>
                <span>TOTAL:</span>
                <span>S/ {parseFloat(boleta.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Total en letras */}
          <div style={{
            background: '#fef3c7',
            padding: '12px 15px',
            fontSize: '11px',
            color: '#92400e',
            borderLeft: '4px solid #f59e0b',
            marginBottom: '20px'
          }}>
            <strong>SON:</strong> {boleta.total_letras}
          </div>

          {/* Observaciones */}
          {boleta.observaciones && (
            <div style={{
              marginTop: '15px',
              marginBottom: '20px',
              padding: '12px 15px',
              background: '#f3f4f6',
              fontSize: '11px',
              color: '#4b5563',
              borderRadius: '4px'
            }}>
              <strong>Observaciones:</strong><br />
              {boleta.observaciones}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '30px',
            paddingTop: '15px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            fontSize: '10px',
            color: '#d1d5db'
          }}>
            Documento generado electrónicamente - {formatearFecha(boleta.fecha_emision)}
          </div>
        </div>
      </div>
    </>
  );
}

export default VerBoleta;
