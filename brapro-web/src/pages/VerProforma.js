import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import html2pdf from 'html2pdf.js';
import './VerProforma.css';

function VerProforma() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proforma, setProforma] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProforma();
  }, [id]);

  const cargarProforma = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Cargar proforma
      const { data: proformaData, error: errorProforma } = await supabase
        .from('proformas')
        .select('*')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .single();

      if (errorProforma) throw errorProforma;

      // Cargar detalles
      const { data: detallesData, error: errorDetalles } = await supabase
        .from('detalle_proforma')
        .select('*')
        .eq('proforma_id', id);

      if (errorDetalles) throw errorDetalles;

      // Cargar configuración
      const { data: configData, error: errorConfig } = await supabase
        .from('configuracion')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (errorConfig && errorConfig.code !== 'PGRST116') throw errorConfig;

      setProforma(proformaData);
      setDetalles(detallesData || []);
      setConfiguracion(configData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la proforma');
      navigate('/proformas');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    const elemento = document.getElementById('proforma-documento');
    const nombreArchivo = `Proforma_${proforma.numero_proforma || 'SN'}_${proforma.nombre_cliente || 'Cliente'}.pdf`;
    
    // Convertir logos a base64 para que aparezcan en el PDF
    const logos = elemento.querySelectorAll('.logo-empresa, .logo-bcp');
    
    for (const logo of logos) {
      if (logo.src && logo.src.startsWith('http')) {
        try {
          const response = await fetch(logo.src);
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          logo.src = base64;
        } catch (error) {
          console.log('No se pudo cargar logo:', error);
        }
      }
    }
    
    // Ocultar solo las imágenes de productos para evitar error CORS
    const imagenesProductos = elemento.querySelectorAll('.producto-imagen');
    const imagenesOriginales = [];
    
    imagenesProductos.forEach((img, index) => {
      imagenesOriginales[index] = img.src;
      img.style.display = 'none';
    });
    
    const opciones = {
      margin: 10,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        logging: false,
        useCORS: false,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opciones).from(elemento).save();
    
    // Restaurar las imágenes de productos después de generar el PDF
    imagenesProductos.forEach((img, index) => {
      img.style.display = '';
      img.src = imagenesOriginales[index];
    });
  };

  if (loading) {
    return <div className="loading">Cargando proforma...</div>;
  }

  if (!proforma) {
    return <div className="error">Proforma no encontrada</div>;
  }

  const config = configuracion || {
    nombre_empresa: 'BRADATEC',
    representante: 'ING. DAVID POLO',
    ruc: '20608918371',
    direccion: 'JIRON ZAVALA 501',
    telefono: '969142875',
    email: 'bradatecsrl@gmail.com',
    cuenta_banco: '480-77406530-0-76',
    cci: '002-480-177406530076-25'
  };

  return (
    <div className="proforma-container">
      <div className="proforma-actions no-print">
        <button onClick={() => navigate('/proformas')} className="btn btn-secondary">
          ← Volver
        </button>
        <button onClick={descargarPDF} className="btn btn-primary">
          📄 Descargar PDF
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary">
          🖨️ Imprimir (con imágenes)
        </button>
      </div>

      <div className="proforma-documento" id="proforma-documento">
        {/* Encabezado */}
        <div className="proforma-header">
          <div className="header-logo">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="logo-empresa" />
            ) : (
              <div className="logo-placeholder">LOGO</div>
            )}
          </div>
          
          <div className="header-center">
            <h1 className="empresa-nombre">{config.nombre_empresa}</h1>
            <p className="representante">REPRESENTANTE: {config.representante}</p>
            
            <div className="venta-equipos">
              <p className="venta-titulo">Venta de equipos:</p>
              <p className="venta-items">
                -Cámaras de seguridad -Alarmas<br/>
                -Redes y telecomunicaciones -Computo<br/>
                -Cercos eléctricos -Porteros y otros
              </p>
            </div>
          </div>

          <div className="header-right">
            <div className="info-box">
              <p>RUC: {config.ruc}</p>
              <p>PROFORMA</p>
              <p>N° {proforma.numero_proforma || '4453'}</p>
            </div>
            <div className="info-box fecha-box">
              <p>FECHA</p>
              <p>{new Date(proforma.fecha).toLocaleDateString('es-PE')}</p>
            </div>
            <div className="info-box validez-box">
              <p>VALIDEZ HASTA</p>
              <p>{new Date(new Date(proforma.fecha).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')}</p>
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="titulo-cotizacion">Cotización del Servicio</h2>

        {/* Cliente */}
        <div className="cliente-info">
          <p><strong>CLIENTE:</strong> {proforma.nombre_cliente || 'No especificado'}</p>
        </div>

        {/* Descripción */}
        {proforma.descripcion_servicio && (
          <p className="descripcion-servicio">{proforma.descripcion_servicio}</p>
        )}

        {/* Tabla de Productos */}
        <table className="productos-tabla">
          <thead>
            <tr>
              <th style={{width: '60px'}}>ITEM</th>
              <th style={{width: '120px'}}>IMAGEN</th>
              <th>DESCRIPCIÓN</th>
              <th style={{width: '100px'}}>CANTIDAD</th>
              <th style={{width: '120px'}}>PRECIO</th>
              <th style={{width: '120px'}}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle, index) => (
              <tr key={detalle.id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">
                  {detalle.imagen_url ? (
                    <img src={detalle.imagen_url} alt="Producto" className="producto-imagen" />
                  ) : (
                    <div className="imagen-placeholder">📦</div>
                  )}
                </td>
                <td>{detalle.descripcion}</td>
                <td className="text-center">{detalle.cantidad}</td>
                <td className="text-right">S/ {detalle.precio.toFixed(2)}</td>
                <td className="text-right">S/ {detalle.total.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="4" className="total-text">
                SON: {proforma.total_letras}
              </td>
              <td className="text-right"><strong>TOTAL</strong></td>
              <td className="text-right total-amount"><strong>S/ {proforma.total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Consideraciones */}
        {proforma.consideraciones && (
          <div className="consideraciones-section">
            <p className="consideraciones-titulo"><strong>CONSIDERACIONES:</strong></p>
            <div className="consideraciones-texto">
              {proforma.consideraciones.split('\n').map((linea, index) => (
                <p key={index}>{linea}</p>
              ))}
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="separador"></div>

        {/* Footer con datos bancarios y contacto */}
        <div className="footer-info">
          <div className="footer-left">
            <div className="empresa-box">
              <p className="empresa-nombre-footer">{config.nombre_empresa}</p>
            </div>
            
            <div className="banco-info-footer">
              {config.logo_bcp_url && (
                <img src={config.logo_bcp_url} alt="BCP" className="logo-bcp" />
              )}
              <div className="banco-datos">
                <div className="banco-item">
                  <span className="banco-label">CTA. AHORROS</span>
                  <span className="banco-valor">{config.cuenta_banco}</span>
                </div>
                <div className="banco-item">
                  <span className="banco-label">CCI</span>
                  <span className="banco-valor">{config.cci}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="contacto-item">
              <span className="icono">📍</span>
              <span>{config.direccion}</span>
            </div>
            <div className="contacto-item">
              <span className="icono">📱</span>
              <span>{config.telefono}</span>
            </div>
            <div className="contacto-item">
              <span className="icono">✉️</span>
              <span>{config.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerProforma;
