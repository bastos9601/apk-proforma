import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './SegoIframe.css';

function SegoIframe({ visible, onClose, onAgregarProducto }) {
  const [tipoCambio, setTipoCambio] = useState(3.80);
  const [productosDetectados, setProductosDetectados] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [ventanaSego, setVentanaSego] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarTipoCambio();
      abrirVentanaSego();
    }
    
    return () => {
      if (ventanaSego && !ventanaSego.closed) {
        ventanaSego.close();
      }
    };
  }, [visible]);

  const cargarTipoCambio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('configuracion')
        .select('tipo_cambio')
        .eq('usuario_id', user.id)
        .single();

      if (data && data.tipo_cambio) {
        setTipoCambio(parseFloat(data.tipo_cambio));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const abrirVentanaSego = () => {
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const ventana = window.open(
      'https://www.sego.com.pe/web/login',
      'SegoWindow',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    setVentanaSego(ventana);
  };

  const buscarProductosEnSego = async (termino) => {
    if (!termino.trim()) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }
    
    setBuscando(true);
    try {
      // En desarrollo usa localhost, en producción usa la URL de Netlify
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? '/.netlify/functions' 
        : 'http://localhost:8888/.netlify/functions';
      
      console.log('Buscando en:', `${baseUrl}/buscar-sego?termino=${encodeURIComponent(termino)}`);
      
      const response = await fetch(`${baseUrl}/buscar-sego?termino=${encodeURIComponent(termino)}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de Sego:', data);
      
      if (data.success && data.productos && data.productos.length > 0) {
        const productosConPrecios = data.productos.map(p => ({
          ...p,
          precioSoles: p.precioUSD * tipoCambio,
          precioVenta: p.precioUSD * tipoCambio * 1.5
        }));
        
        setProductosDetectados(productosConPrecios);
        setMostrarLista(true);
        alert(`✅ Se encontraron ${productosConPrecios.length} productos`);
      } else {
        setProductosDetectados([]);
        setMostrarLista(false);
        alert(`⚠️ No se encontraron productos para "${termino}". Intenta con otro término.`);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      alert(`❌ Error al buscar productos: ${error.message}\n\nPuedes usar "Agregar Manual (Sego)" como alternativa.`);
      setProductosDetectados([]);
      setMostrarLista(false);
    } finally {
      setBuscando(false);
    }
  };

  const agregarProducto = (producto) => {
    if (onAgregarProducto) {
      onAgregarProducto({
        nombre: producto.nombre,
        descripcion: `${producto.nombre}${producto.sku ? ` - SKU: ${producto.sku}` : ''}`,
        precio: producto.precioVenta,
        precioBase: producto.precioSoles,
        precioUSD: producto.precioUSD,
        imagenUrl: 'https://via.placeholder.com/150'
      });
    }
    alert('✅ Producto agregado a la proforma');
  };

  const cerrarTodo = () => {
    if (ventanaSego && !ventanaSego.closed) {
      ventanaSego.close();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="sego-overlay">
      <div className="sego-control-panel">
        <div className="sego-panel-header">
          <h3>🌐 Navegador Sego Activo</h3>
          <button onClick={cerrarTodo} className="btn-close-panel">✕ Cerrar Todo</button>
        </div>

        <div className="sego-panel-info">
          <p>✅ Ventana de Sego abierta</p>
          <p>💱 Tipo de cambio: <strong>S/ {tipoCambio.toFixed(2)}</strong></p>
          <p>📦 Productos detectados: <strong>{productosDetectados.length}</strong></p>
          
          <div className="busqueda-rapida">
            <input
              type="text"
              placeholder="Buscar productos en Sego..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarProductosEnSego(terminoBusqueda)}
              disabled={buscando}
            />
            <button
              onClick={() => buscarProductosEnSego(terminoBusqueda)}
              disabled={buscando || !terminoBusqueda}
              className="btn btn-primary btn-sm"
            >
              {buscando ? '🔄 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </div>

        {mostrarLista && productosDetectados.length > 0 ? (
          <div className="productos-panel">
            <h4>📋 Productos Detectados</h4>
            <div className="productos-panel-lista">
              {productosDetectados.map((producto) => (
                <div key={producto.id} className="producto-panel-item">
                  <div className="producto-panel-info">
                    <h5>{producto.nombre}</h5>
                    {producto.sku && <p className="sku">SKU: {producto.sku}</p>}
                    <div className="precios">
                      <span>💵 ${producto.precioUSD.toFixed(2)}</span>
                      <span>💰 S/ {producto.precioSoles.toFixed(2)}</span>
                      <span className="precio-venta">🏷️ S/ {producto.precioVenta.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => agregarProducto(producto)}
                    className="btn-agregar-panel"
                  >
                    ➕ Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="esperando-productos">
            <div className="spinner-sego"></div>
            <p>Esperando que busques productos en Sego...</p>
            <p className="hint">Busca productos en la ventana de Sego y aparecerán aquí automáticamente</p>
          </div>
        )}

        <div className="sego-panel-actions">
          <button onClick={() => setMostrarLista(!mostrarLista)} className="btn btn-secondary">
            {mostrarLista ? '👁️ Ocultar Lista' : '📋 Ver Lista'}
          </button>
          <button onClick={cerrarTodo} className="btn btn-primary">
            ✅ Finalizar
          </button>
        </div>

        <div className="sego-panel-note">
          <p>💡 <strong>Tip:</strong> Los productos se detectarán automáticamente cuando busques en Sego. 
          Si no aparecen, usa el botón "Agregar Manualmente" en la pantalla principal.</p>
        </div>
      </div>
    </div>
  );
}

export default SegoIframe;
