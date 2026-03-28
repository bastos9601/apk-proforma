import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import ModalCatalogo from '../components/ModalCatalogo';
import ModalSego from '../components/ModalSego';
import SegoIframe from '../components/SegoIframe';
import './Pages.css';

function CrearProforma() {
  const navigate = useNavigate();
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcionServicio, setDescripcionServicio] = useState('Por la presente ponemos a su consideración la cotización de instalación y reubicación');
  const [incluirConsideraciones, setIncluirConsideraciones] = useState(true);
  const [consideraciones, setConsideraciones] = useState('1. La garantía de componentes es de 1 año luego de la entrega de datos.\n2. La vigencia de la cotización es de 5 días a partir de la presente fecha por la varianza en el precio del dólar.\n3. El usuario deberá abonar el 50% de presupuesto.\n4. En caso de que el cliente no realice el pago total dentro de los 30 días posteriores a la finalización del trabajo, se aplicará un recargo del 30% sobre el monto total pendiente.');
  const [items, setItems] = useState([]);
  const [nombreProducto, setNombreProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [mostrarSego, setMostrarSego] = useState(false);
  const [mostrarSegoIframe, setMostrarSegoIframe] = useState(false);

  const agregarItem = () => {
    if (!descripcion || !cantidad || !precio) {
      alert('Completa todos los campos');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseFloat(precio);
    const total = cantidadNum * precioNum;

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
    setImagenUrl('');
    setNombreProducto('');
  };

  const subirImagen = async (archivo) => {
    try {
      const timestamp = Date.now();
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `producto_${timestamp}.${extension}`;

      const { error } = await supabase.storage
        .from('proformas')
        .upload(nombreArchivo, archivo, {
          contentType: archivo.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('proformas')
        .getPublicUrl(nombreArchivo);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error al subir imagen:', err);
      throw err;
    }
  };

  const handleImagenChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB');
      return;
    }

    setSubiendoImagen(true);
    try {
      const url = await subirImagen(archivo);
      setImagenUrl(url);
      alert('✅ Imagen subida');
    } catch (error) {
      alert('Error al subir imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const guardarAlCatalogo = async () => {
    if (!nombreProducto || !descripcion || !precio || !imagenUrl) {
      alert('Completa nombre, descripción, precio e imagen para guardar al catálogo');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('catalogo_productos')
        .insert([{
          usuario_id: user.id,
          nombre: nombreProducto,
          descripcion,
          precio: parseFloat(precio),
          imagen_url: imagenUrl
        }]);

      if (error) throw error;

      alert('⭐ Producto guardado en tu catálogo');
      setNombreProducto('');
      setDescripcion('');
      setPrecio('');
      setCantidad('');
      setImagenUrl('');
    } catch (error) {
      alert('Error al guardar en catálogo');
    }
  };

  const seleccionarProductoCatalogo = (producto) => {
    setNombreProducto(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setImagenUrl(producto.imagen_url);
  };

  const agregarProductoDesdeSego = (producto) => {
    setNombreProducto(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setImagenUrl(producto.imagenUrl);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const guardarProforma = async () => {
    if (items.length === 0) {
      alert('Agrega al menos un ítem');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const total = calcularTotal();

      const { data: proforma, error: errorProforma } = await supabase
        .from('proformas')
        .insert([{
          usuario_id: user.id,
          fecha: new Date().toISOString().split('T')[0],
          total,
          total_letras: `SON: ${total.toFixed(2)} SOLES`,
          nombre_cliente: nombreCliente,
          descripcion_servicio: descripcionServicio,
          consideraciones: incluirConsideraciones ? consideraciones : null
        }])
        .select()
        .single();

      if (errorProforma) throw errorProforma;

      const detalles = items.map(item => ({
        proforma_id: proforma.id,
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

      alert('✅ Proforma creada exitosamente');
      navigate('/proformas');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear proforma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>➕ Nueva Proforma</h1>

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
          <h3>Agregar Ítem</h3>
          
          <div className="button-group">
            <button className="btn btn-primary" onClick={() => setMostrarSegoIframe(true)}>
              🌐 Navegar en Sego
            </button>
            <button className="btn btn-secondary" onClick={() => setMostrarCatalogo(true)}>
              🔍 Buscar en Catálogo
            </button>
            <button className="btn" style={{background: '#6b7280', color: 'white'}} onClick={() => setMostrarSego(true)}>
              ✏️ Agregar Manual (Sego)
            </button>
          </div>

          <div className="input-group">
            <label>Seleccionar Imagen</label>
            {imagenUrl && (
              <div className="logo-preview">
                <img src={imagenUrl} alt="Producto" />
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
            <label>Nombre del Producto (para guardar en catálogo)</label>
            <input
              type="text"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>

          <div className="input-group">
            <label>Descripción del Servicio/Producto</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del producto"
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

          <div className="button-group">
            <button onClick={agregarItem} className="btn btn-secondary">
              ➕ Agregar Ítem
            </button>
            <button onClick={guardarAlCatalogo} className="btn" style={{background: '#f59e0b', color: 'white'}}>
              ⭐ Guardar al Catálogo
            </button>
          </div>
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
                    <td>{item.cantidad}</td>
                    <td>S/ {item.precio.toFixed(2)}</td>
                    <td>S/ {item.total.toFixed(2)}</td>
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
            onClick={guardarProforma}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : '💾 Guardar Proforma'}
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

        <ModalSego
          visible={mostrarSego}
          onClose={() => setMostrarSego(false)}
          onAgregarProducto={agregarProductoDesdeSego}
        />

        <SegoIframe
          visible={mostrarSegoIframe}
          onClose={() => setMostrarSegoIframe(false)}
          onAgregarProducto={agregarProductoDesdeSego}
        />
      </div>
    </>
  );
}

export default CrearProforma;
