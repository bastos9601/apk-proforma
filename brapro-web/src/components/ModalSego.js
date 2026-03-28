import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './ModalSego.css';

function ModalSego({ visible, onClose, onAgregarProducto }) {
  const [tipoCambio, setTipoCambio] = useState(3.80);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [producto, setProducto] = useState({
    nombre: '',
    sku: '',
    precioUSD: '',
    imagenUrl: ''
  });

  useEffect(() => {
    if (visible) {
      cargarTipoCambio();
    }
  }, [visible]);

  const cargarTipoCambio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('configuracion')
        .select('tipo_cambio')
        .eq('usuario_id', user.id)
        .single();

      if (data && data.tipo_cambio) {
        setTipoCambio(parseFloat(data.tipo_cambio));
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const abrirSego = () => {
    window.open('https://www.sego.com.pe/web/login', '_blank', 'width=1200,height=800');
    setMostrarFormulario(true);
  };

  const calcularPrecios = () => {
    const precioUSD = parseFloat(producto.precioUSD) || 0;
    const precioSoles = precioUSD * tipoCambio;
    const precioVenta = precioSoles * 1.5;
    return { precioSoles, precioVenta };
  };

  const agregarProducto = () => {
    if (!producto.nombre || !producto.precioUSD) {
      alert('Completa al menos el nombre y precio del producto');
      return;
    }

    const { precioSoles, precioVenta } = calcularPrecios();

    if (onAgregarProducto) {
      onAgregarProducto({
        nombre: producto.nombre,
        descripcion: `${producto.nombre}${producto.sku ? ` - SKU: ${producto.sku}` : ''}`,
        precio: precioVenta,
        precioBase: precioSoles,
        precioUSD: parseFloat(producto.precioUSD),
        imagenUrl: producto.imagenUrl || 'https://via.placeholder.com/150'
      });
    }

    // Limpiar formulario
    setProducto({
      nombre: '',
      sku: '',
      precioUSD: '',
      imagenUrl: ''
    });

    alert('✅ Producto agregado a la proforma');
  };

  const { precioSoles, precioVenta } = calcularPrecios();

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sego" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌐 Navegar en Sego</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="sego-info">
            <p className="tipo-cambio-info">
              Tipo de cambio actual: <strong>S/ {tipoCambio.toFixed(2)}</strong>
            </p>
          </div>

          {!mostrarFormulario ? (
            <>
              <div className="sego-instructions">
                <h4>Instrucciones:</h4>
                <ol>
                  <li>Haz clic en "Abrir Sego" para iniciar sesión</li>
                  <li>Busca los productos que necesitas</li>
                  <li>Copia la información del producto</li>
                  <li>Vuelve aquí y usa el formulario para agregarlo</li>
                </ol>
              </div>

              <div className="modal-actions">
                <button onClick={abrirSego} className="btn btn-primary">
                  🌐 Abrir Sego
                </button>
                <button onClick={onClose} className="btn btn-secondary">
                  Cerrar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="sego-form">
                <h4>Agregar Producto de Sego</h4>
                
                <div className="input-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={producto.nombre}
                    onChange={(e) => setProducto({...producto, nombre: e.target.value})}
                    placeholder="Ej: CAMARA PARA AUTOMOVIL"
                  />
                </div>

                <div className="input-group">
                  <label>SKU (opcional)</label>
                  <input
                    type="text"
                    value={producto.sku}
                    onChange={(e) => setProducto({...producto, sku: e.target.value})}
                    placeholder="Ej: HK-AE-DC5313-C6"
                  />
                </div>

                <div className="input-group">
                  <label>Precio en USD (Sego) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={producto.precioUSD}
                    onChange={(e) => setProducto({...producto, precioUSD: e.target.value})}
                    placeholder="Ej: 89.77"
                  />
                </div>

                <div className="input-group">
                  <label>URL de Imagen (opcional)</label>
                  <input
                    type="text"
                    value={producto.imagenUrl}
                    onChange={(e) => setProducto({...producto, imagenUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                {producto.precioUSD && (
                  <div className="precio-calculado">
                    <h4>Cálculo Automático:</h4>
                    <p>💵 Precio Sego (USD): <strong>$ {parseFloat(producto.precioUSD).toFixed(2)}</strong></p>
                    <p>💱 Tipo de Cambio: <strong>S/ {tipoCambio.toFixed(2)}</strong></p>
                    <p>💰 Precio en Soles: <strong>S/ {precioSoles.toFixed(2)}</strong></p>
                    <p className="precio-venta">🏷️ Precio de Venta (+50%): <strong>S/ {precioVenta.toFixed(2)}</strong></p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={agregarProducto} className="btn btn-primary">
                  ➕ Agregar a Proforma
                </button>
                <button onClick={() => setMostrarFormulario(false)} className="btn btn-secondary">
                  ← Volver
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalSego;
