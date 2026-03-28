import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './ModalCatalogo.css';

function ModalCatalogo({ visible, onClose, onSeleccionar }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarProductos();
    }
  }, [visible]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('catalogo_productos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-catalogo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 Buscar en Catálogo</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="modal-body">
          {loading ? (
            <p>Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="productos-lista">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="producto-item"
                  onClick={() => {
                    onSeleccionar(producto);
                    onClose();
                  }}
                >
                  <img src={producto.imagen_url} alt={producto.nombre} />
                  <div className="producto-info">
                    <h4>{producto.nombre}</h4>
                    <p>{producto.descripcion}</p>
                    <div className="producto-precio">S/ {producto.precio.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalCatalogo;
