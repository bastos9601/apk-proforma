import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import { subirImagen, esImagenValida, obtenerVistaPrevia } from '../utils/cloudinaryService';
import './Pages.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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
      setProductosFiltrados(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarProductos = (termino) => {
    setBusqueda(termino);
    
    if (!termino.trim()) {
      setProductosFiltrados(productos);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtrados = productos.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(terminoLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(terminoLower))
    );
    
    setProductosFiltrados(filtrados);
  };

  const manejarSeleccionImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!esImagenValida(file)) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const tamanoMB = file.size / (1024 * 1024);
    if (tamanoMB > 10) {
      alert('La imagen es demasiado grande. Máximo 10MB.');
      return;
    }

    setImagenFile(file);
    
    // Generar vista previa
    try {
      const preview = await obtenerVistaPrevia(file);
      setImagenPreview(preview);
    } catch (error) {
      console.error('Error al generar vista previa:', error);
    }
  };

  const guardarProducto = async () => {
    if (!nombre || !descripcion || !precio) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let imagenUrl = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
      
      // Subir imagen a Cloudinary si se seleccionó una
      if (imagenFile) {
        setSubiendoImagen(true);
        try {
          imagenUrl = await subirImagen(imagenFile);
          console.log('Imagen subida:', imagenUrl);
        } catch (error) {
          console.error('Error al subir imagen:', error);
          alert('Error al subir la imagen. Se guardará sin imagen.');
        } finally {
          setSubiendoImagen(false);
        }
      }
      
      const { error } = await supabase
        .from('catalogo_productos')
        .insert([{
          usuario_id: user.id,
          nombre,
          descripcion,
          precio: parseFloat(precio),
          imagen_url: imagenUrl
        }]);

      if (error) throw error;

      alert('✅ Producto agregado exitosamente');
      cerrarModal();
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar producto');
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setImagenFile(null);
    setImagenPreview(null);
    setSubiendoImagen(false);
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

        {/* Buscador */}
        <div className="search-container" style={{marginBottom: '24px'}}>
          <input
            type="text"
            placeholder="🔍 Buscar productos por nombre o descripción..."
            value={busqueda}
            onChange={(e) => filtrarProductos(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {busqueda && (
            <p style={{marginTop: '8px', color: '#6b7280', fontSize: '14px'}}>
              Mostrando {productosFiltrados.length} de {productos.length} productos
            </p>
          )}
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
        ) : productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron productos con "{busqueda}"</p>
            <button 
              onClick={() => filtrarProductos('')}
              className="btn btn-secondary"
              style={{marginTop: '16px'}}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map((producto) => (
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
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Nuevo Producto</h2>
              
              <div className="input-group">
                <label>Imagen del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSeleccionImagen}
                  disabled={subiendoImagen}
                />
                {imagenPreview && (
                  <div className="logo-preview">
                    <img src={imagenPreview} alt="Vista previa" style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'}} />
                  </div>
                )}
                <small style={{color: '#6b7280', fontSize: '12px'}}>
                  Formatos: JPG, PNG, GIF, WEBP. Máximo 10MB
                </small>
              </div>

              <div className="input-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  disabled={subiendoImagen}
                />
              </div>
              
              <div className="input-group">
                <label>Descripción *</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del producto"
                  rows="3"
                  disabled={subiendoImagen}
                />
              </div>
              
              <div className="input-group">
                <label>Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                  disabled={subiendoImagen}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={guardarProducto} 
                  className="btn btn-primary"
                  disabled={subiendoImagen}
                >
                  {subiendoImagen ? 'Subiendo imagen...' : 'Guardar'}
                </button>
                <button 
                  onClick={cerrarModal} 
                  className="btn btn-secondary"
                  disabled={subiendoImagen}
                >
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
