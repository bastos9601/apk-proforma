import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import './Pages.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
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

  const guardarProducto = async () => {
    if (!nombre || !descripcion || !precio) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('catalogo_productos')
        .insert([{
          usuario_id: user.id,
          nombre,
          descripcion,
          precio: parseFloat(precio),
          imagen_url: 'https://via.placeholder.com/150'
        }]);

      if (error) throw error;

      alert('✅ Producto agregado');
      setMostrarModal(false);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      cargarProductos();
    } catch (error) {
      alert('Error al guardar producto');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('catalogo_productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Producto eliminado');
      cargarProductos();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>📦 Mi Catálogo</h1>
          <button onClick={() => setMostrarModal(true)} className="btn btn-primary">
            ➕ Nuevo Producto
          </button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes productos en tu catálogo</p>
            <button onClick={() => setMostrarModal(true)} className="btn btn-primary">
              Agregar Primer Producto
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="product-card">
                <img src={producto.imagen_url} alt={producto.nombre} />
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <div className="product-price">S/ {producto.precio.toFixed(2)}</div>
                <button
                  onClick={() => eliminarProducto(producto.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {mostrarModal && (
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Nuevo Producto</h2>
              <div className="input-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="input-group">
                <label>Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción"
                  rows="3"
                />
              </div>
              <div className="input-group">
                <label>Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="modal-actions">
                <button onClick={guardarProducto} className="btn btn-primary">
                  Guardar
                </button>
                <button onClick={() => setMostrarModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Catalogo;
