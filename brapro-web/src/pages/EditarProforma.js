import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import ModalCatalogo from '../components/ModalCatalogo';
import { subirImagen } from '../utils/cloudinaryService';
import './Pages.css';

function EditarProforma() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcionServicio, setDescripcionServicio] = useState('');
  const [incluirConsideraciones, setIncluirConsideraciones] = useState(true);
  const [consideraciones, setConsideraciones] = useState('');
  const [items, setItems] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);

  useEffect(() => {
    cargarProforma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setNombreCliente(proformaData.nombre_cliente || '');
      setDescripcionServicio(proformaData.descripcion_servicio || '');
      setConsideraciones(proformaData.consideraciones || '');
      setIncluirConsideraciones(!!proformaData.consideraciones);
      setItems(detallesData || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la proforma');
      navigate('/proformas');
    } finally {
      setLoading(false);
    }
  };

  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 10MB');
      return;
    }

    setImagenFile(file);
    
    // Generar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const agregarItem = async () => {
    if (!descripcion || !cantidad || !precio) {
      alert('Completa todos los campos');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseFloat(precio);
    const total = cantidadNum * precioNum;

    let imagenUrl = null;

    // Subir imagen si se seleccionó una
    if (imagenFile) {
      setSubiendoImagen(true);
      try {
        imagenUrl = await subirImagen(imagenFile);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen. Se agregará sin imagen.');
      } finally {
        setSubiendoImagen(false);
      }
    }

    setItems([...items, {
      descripcion,
      cantidad: cantidadNum,
      precio: precioNum,
      total,
      imagen_url: imagenUrl
    }]);

    setDescripcion('');
    setCantidad('');
    setPrecio('');
    setImagenFile(null);
    setImagenPreview(null);
  };

  const seleccionarProductoCatalogo = (producto) => {
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setImagenPreview(producto.imagen_url);
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const cantidadNum = parseInt(nuevaCantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) return;

    const nuevosItems = [...items];
    nuevosItems[index].cantidad = cantidadNum;
    nuevosItems[index].total = cantidadNum * nuevosItems[index].precio;
    setItems(nuevosItems);
  };

  const actualizarPrecio = (index, nuevoPrecio) => {
    const precioNum = parseFloat(nuevoPrecio);
    if (isNaN(precioNum) || precioNum <= 0) return;

    const nuevosItems = [...items];
    nuevosItems[index].precio = precioNum;
    nuevosItems[index].total = nuevosItems[index].cantidad * precioNum;
    setItems(nuevosItems);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const guardarCambios = async () => {
    if (items.length === 0) {
      alert('Agrega al menos un ítem');
      return;
    }

    if (!nombreCliente.trim()) {
      alert('Ingresa el nombre del cliente');
      return;
    }

    setGuardando(true);
    try {
      const total = calcularTotal();

      // Actualizar proforma
      const { error: errorProforma } = await supabase
        .from('proformas')
        .update({
          total,
          total_letras: `SON: ${total.toFixed(2)} SOLES`,
          nombre_cliente: nombreCliente.trim(),
          descripcion_servicio: descripcionServicio.trim(),
          consideraciones: incluirConsideraciones ? consideraciones.trim() : null,
        })
        .eq('id', id);

      if (errorProforma) throw errorProforma;

      // Eliminar detalles existentes
      await supabase
        .from('detalle_proforma')
        .delete()
        .eq('proforma_id', id);

      // Insertar nuevos detalles
      const detalles = items.map(item => ({
        proforma_id: id,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio: item.precio,
        total: item.total,
        imagen_url: item.imagen_url
      }));

      const { error: errorDetalles } = await supabase
        .from('detalle_proforma')
        .insert(detalles);

      if (errorDetalles) throw errorDetalles;

      alert('✅ Proforma actualizada exitosamente');
      navigate('/proformas');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar proforma');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Cargando proforma...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>✏️ Editar Proforma</h1>

        <div className="card">
          <h3>Información del Cliente</h3>
          <div className="input-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="input-group">
            <label>Descripción del Servicio</label>
            <textarea
              value={descripcionServicio}
              onChange={(e) => setDescripcionServicio(e.target.value)}
              placeholder="Descripción del servicio"
              rows="3"
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={incluirConsideraciones}
                onChange={(e) => setIncluirConsideraciones(e.target.checked)}
              />
              Incluir Consideraciones en la proforma
            </label>
          </div>

          {incluirConsideraciones && (
            <div className="input-group">
              <label>Consideraciones</label>
              <textarea
                value={consideraciones}
                onChange={(e) => setConsideraciones(e.target.value)}
                placeholder="Ej: El usuario deberá abonar el 50% de presupuesto..."
                rows="4"
              />
            </div>
          )}
        </div>

        <div className="card">
          <h3>Agregar Nuevo Ítem</h3>
          
          <button className="btn btn-secondary" onClick={() => setMostrarCatalogo(true)} style={{marginBottom: '15px'}}>
            🔍 Buscar en Catálogo
          </button>

          <div className="input-group">
            <label>Seleccionar Imagen</label>
            {imagenPreview && (
              <div className="logo-preview">
                <img src={imagenPreview} alt="Producto" style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'}} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              disabled={subiendoImagen}
            />
            {subiendoImagen && <p className="upload-status">Subiendo imagen...</p>}
          </div>

          <div className="input-group">
            <label>Descripción del Servicio/Producto</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del producto"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="input-group">
              <label>Precio (S/)</label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <button 
            onClick={agregarItem} 
            className="btn btn-primary"
            disabled={subiendoImagen}
          >
            {subiendoImagen ? 'Subiendo imagen...' : '➕ Agregar Ítem'}
          </button>
        </div>

        {items.length > 0 && (
          <div className="card">
            <h3>Ítems Agregados ({items.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.imagen_url && (
                        <img src={item.imagen_url} alt="Producto" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                      )}
                    </td>
                    <td>{item.descripcion}</td>
                    <td>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(index, e.target.value)}
                        min="1"
                        style={{
                          width: '80px',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={item.precio}
                        onChange={(e) => actualizarPrecio(index, e.target.value)}
                        min="0.01"
                        style={{
                          width: '100px',
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          textAlign: 'right'
                        }}
                      />
                    </td>
                    <td><strong>S/ {item.total.toFixed(2)}</strong></td>
                    <td>
                      <button
                        onClick={() => eliminarItem(index)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-section">
              <h2>Total: S/ {calcularTotal().toFixed(2)}</h2>
            </div>
          </div>
        )}

        <div className="actions">
          <button
            onClick={guardarCambios}
            className="btn btn-primary"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button
            onClick={() => navigate('/proformas')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>

        <ModalCatalogo
          visible={mostrarCatalogo}
          onClose={() => setMostrarCatalogo(false)}
          onSeleccionar={seleccionarProductoCatalogo}
        />
      </div>
    </>
  );
}

export default EditarProforma;
