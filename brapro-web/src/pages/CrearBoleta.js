import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase';
import { crearBoletaDesdeProforma } from '../utils/boletaService';
import { consultarDNI, validarFormatoDNI } from '../utils/dniService';
import './Pages.css';

function CrearBoleta() {
  const { proformaId } = useParams();
  const navigate = useNavigate();
  const [proforma, setProforma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteDni, setClienteDni] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [consultandoDNI, setConsultandoDNI] = useState(false);

  useEffect(() => {
    cargarProforma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proformaId]);

  const cargarProforma = async () => {
    try {
      const { data, error } = await supabase
        .from('proformas')
        .select(`
          *,
          detalle_proforma (*)
        `)
        .eq('id', proformaId)
        .single();

      if (error) throw error;
      
      console.log('Proforma con detalles:', data);
      setProforma(data);
      setClienteNombre(data.nombre_cliente || '');
    } catch (error) {
      console.error('Error al cargar proforma:', error);
      alert('Error al cargar la proforma');
      navigate('/proformas');
    } finally {
      setLoading(false);
    }
  };

  const consultarDNIManual = async () => {
    if (!clienteDni || clienteDni.length !== 8) {
      alert('Ingrese un DNI válido de 8 dígitos');
      return;
    }

    if (!validarFormatoDNI(clienteDni)) {
      alert('El formato del DNI no es válido');
      return;
    }

    setConsultandoDNI(true);
    try {
      const datos = await consultarDNI(clienteDni);
      
      if (datos.encontrado) {
        setClienteNombre(datos.nombreCompleto);
        alert('✅ DNI Válido - Datos cargados automáticamente desde RENIEC');
      } else {
        alert('DNI no encontrado en RENIEC. Ingrese el nombre manualmente.');
      }
    } catch (error) {
      console.error('Error completo:', error);
      // No mostrar alerta de error, solo permitir ingreso manual
      console.log('Consulta falló, usuario puede ingresar manualmente');
    } finally {
      setConsultandoDNI(false);
    }
  };

  const manejarCrear = async (e) => {
    e.preventDefault();

    if (clienteDni && clienteDni.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    if (!window.confirm('¿Crear la boleta? Esto cambiará el estado de la proforma a "Facturada".')) {
      return;
    }

    setCreando(true);
    try {
      const datosAdicionales = {
        cliente_nombre: clienteNombre.trim() || 'Cliente',
        cliente_dni: clienteDni.trim() || null,
        observaciones: observaciones.trim() || null,
      };

      const boleta = await crearBoletaDesdeProforma(proforma, datosAdicionales);
      
      alert(`Boleta ${boleta.numero_boleta} creada correctamente`);
      navigate(`/ver-boleta/${boleta.id}`);
    } catch (error) {
      alert('Error al crear la boleta: ' + error.message);
    } finally {
      setCreando(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Cargando...</p>
        </div>
      </>
    );
  }

  const subtotal = parseFloat(proforma.total) / 1.18;
  const igv = parseFloat(proforma.total) - subtotal;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>📄 Crear Boleta</h1>
          <p>Desde Proforma {proforma.numero_proforma}</p>
        </div>

        <div className="info-card">
          <h3>📋 Datos de la Proforma</h3>
          <div className="info-grid">
            <div><strong>Cliente:</strong> {proforma.nombre_cliente}</div>
            <div><strong>Fecha:</strong> {new Date(proforma.fecha + 'T00:00:00').toLocaleDateString('es-PE')}</div>
            <div><strong>Total (con IGV):</strong> <span className="text-primary">S/ {parseFloat(proforma.total).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="info-card">
          <h3>💰 Desglose del Total</h3>
          <div className="totals-breakdown">
            <div className="breakdown-row">
              <span>Subtotal (sin IGV):</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>IGV (18%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total">
              <span>TOTAL:</span>
              <span>S/ {parseFloat(proforma.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={manejarCrear} className="form-card">
          <h3>👤 Datos del Cliente (Opcional)</h3>
          <p className="form-note">Para boletas no es obligatorio ingresar datos del cliente</p>
          
          <div className="form-group">
            <label>DNI (opcional)</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="text"
                value={clienteDni}
                onChange={(e) => setClienteDni(e.target.value)}
                placeholder="DNI de 8 dígitos (opcional)"
                maxLength="8"
                disabled={consultandoDNI}
                style={{flex: 1}}
              />
              <button
                type="button"
                onClick={consultarDNIManual}
                disabled={consultandoDNI || clienteDni.length !== 8}
                className="btn btn-info"
                style={{minWidth: '120px'}}
              >
                {consultandoDNI ? 'Consultando...' : '🔍 Consultar'}
              </button>
            </div>
            <small>Ingrese el DNI y presione Consultar para obtener datos automáticamente</small>
          </div>

          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre completo (opcional)"
              disabled={consultandoDNI}
            />
          </div>

          <div className="form-group">
            <label>Observaciones (opcional)</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/proformas')}
              className="btn btn-secondary"
              disabled={creando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creando}
            >
              {creando ? 'Creando...' : '📄 Crear Boleta'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CrearBoleta;
