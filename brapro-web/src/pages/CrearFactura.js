import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../config/supabase';
import { crearFacturaDesdeProforma } from '../utils/facturaService';
import { consultarRUC, validarFormatoRUC, formatearDireccion } from '../utils/rucService';
import './Pages.css';

function CrearFactura() {
  const { proformaId } = useParams();
  const navigate = useNavigate();
  const [proforma, setProforma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  
  const [clienteRuc, setClienteRuc] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [consultandoRUC, setConsultandoRUC] = useState(false);

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
      
      // Fecha de vencimiento por defecto (30 días)
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 30);
      setFechaVencimiento(fecha.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error al cargar proforma:', error);
      alert('Error al cargar la proforma');
      navigate('/proformas');
    } finally {
      setLoading(false);
    }
  };

  const consultarRUCManual = async () => {
    if (!clienteRuc || clienteRuc.length !== 11) {
      alert('Ingrese un RUC válido de 11 dígitos');
      return;
    }

    if (!validarFormatoRUC(clienteRuc)) {
      alert('El formato del RUC no es válido');
      return;
    }

    setConsultandoRUC(true);
    try {
      const datos = await consultarRUC(clienteRuc);
      
      if (datos.encontrado) {
        setClienteNombre(datos.razonSocial);
        setClienteDireccion(formatearDireccion(datos));
        
        if (!datos.valido) {
          alert(`RUC encontrado pero está ${datos.estado} - ${datos.condicion}`);
        } else {
          alert('✅ RUC Válido - Datos cargados automáticamente');
        }
      } else {
        alert('RUC no encontrado. Ingrese los datos manualmente.');
      }
    } catch (error) {
      console.error('Error completo:', error);
      // No mostrar alerta de error, solo permitir ingreso manual
      console.log('Consulta falló, usuario puede ingresar manualmente');
    } finally {
      setConsultandoRUC(false);
    }
  };

  const validarFormulario = () => {
    if (!clienteRuc.trim() || clienteRuc.length !== 11) {
      alert('El RUC debe tener 11 dígitos');
      return false;
    }
    if (!validarFormatoRUC(clienteRuc)) {
      alert('El formato del RUC no es válido');
      return false;
    }
    if (!clienteNombre.trim()) {
      alert('La razón social es obligatoria');
      return false;
    }
    if (!clienteDireccion.trim()) {
      alert('La dirección es obligatoria');
      return false;
    }
    if (!fechaVencimiento) {
      alert('La fecha de vencimiento es obligatoria');
      return false;
    }
    return true;
  };

  const manejarCrear = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    if (!window.confirm('¿Crear la factura? Esto cambiará el estado de la proforma a "Facturada".')) {
      return;
    }

    setCreando(true);
    try {
      const datosAdicionales = {
        cliente_nombre: clienteNombre.trim(),
        cliente_ruc: clienteRuc.trim(),
        cliente_direccion: clienteDireccion.trim(),
        fecha_vencimiento: fechaVencimiento,
        observaciones: observaciones.trim() || null,
      };

      const factura = await crearFacturaDesdeProforma(proforma, datosAdicionales);
      
      alert(`Factura ${factura.numero_factura} creada correctamente`);
      navigate(`/ver-factura/${factura.id}`);
    } catch (error) {
      alert('Error al crear la factura: ' + error.message);
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
          <h1>🧾 Crear Factura</h1>
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
          <h3>📝 Datos Fiscales del Cliente</h3>
          
          <div className="form-group">
            <label>RUC *</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="text"
                value={clienteRuc}
                onChange={(e) => setClienteRuc(e.target.value)}
                placeholder="Ingrese RUC (11 dígitos)"
                maxLength="11"
                required
                disabled={consultandoRUC}
                style={{flex: 1}}
              />
              <button
                type="button"
                onClick={consultarRUCManual}
                disabled={consultandoRUC || clienteRuc.length !== 11}
                className="btn btn-info"
                style={{minWidth: '120px'}}
              >
                {consultandoRUC ? 'Consultando...' : '🔍 Consultar'}
              </button>
            </div>
            <small>Ingrese el RUC y presione Consultar para obtener datos automáticamente</small>
          </div>

          <div className="form-group">
            <label>Razón Social / Nombre *</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre o razón social del cliente"
              required
              disabled={consultandoRUC}
            />
          </div>

          <div className="form-group">
            <label>Dirección Fiscal *</label>
            <textarea
              value={clienteDireccion}
              onChange={(e) => setClienteDireccion(e.target.value)}
              placeholder="Ingrese dirección completa"
              rows="2"
              required
              disabled={consultandoRUC}
            />
          </div>

          <div className="form-group">
            <label>Fecha de Vencimiento *</label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              required
            />
            <small>Fecha actual + 30 días por defecto</small>
          </div>

          <div className="form-group">
            <label>Observaciones (opcional)</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Condiciones de pago, notas adicionales..."
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
              {creando ? 'Creando...' : '🧾 Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CrearFactura;
