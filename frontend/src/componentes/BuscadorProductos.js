import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { obtenerCatalogo, eliminarProductoCatalogo, actualizarProductoCatalogo } from '../servicios/producto.servicio';
import { Ionicons } from '@expo/vector-icons';

export default function BuscadorProductos({ visible, onClose, onSeleccionar }) {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nombreEdit, setNombreEdit] = useState('');
  const [precioEdit, setPrecioEdit] = useState('');
  const [descripcionEdit, setDescripcionEdit] = useState('');

  useEffect(() => {
    if (visible) {
      cargarCatalogo();
    }
  }, [visible]);

  useEffect(() => {
    filtrarProductos();
  }, [busqueda, productos]);

  const cargarCatalogo = async () => {
    setCargando(true);
    try {
      const respuesta = await obtenerCatalogo();
      setProductos(respuesta.productos || []);
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      Alert.alert('Error', 'No se pudo cargar el catálogo');
    } finally {
      setCargando(false);
    }
  };

  const filtrarProductos = () => {
    if (!busqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const termino = busqueda.toLowerCase();
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
      setProductosFiltrados(filtrados);
    }
  };

  const seleccionar = (producto) => {
    onSeleccionar(producto);
    limpiar();
    onClose();
  };

  const limpiar = () => {
    setBusqueda('');
    setEditando(null);
    setNombreEdit('');
    setPrecioEdit('');
    setDescripcionEdit('');
  };

  const iniciarEdicion = (producto) => {
    setEditando(producto.id);
    setNombreEdit(producto.nombre);
    setPrecioEdit(producto.precio.toString());
    setDescripcionEdit(producto.descripcion);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNombreEdit('');
    setPrecioEdit('');
    setDescripcionEdit('');
  };

  const guardarEdicion = async () => {
    if (!nombreEdit.trim() || !precioEdit || !descripcionEdit.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const precioNum = parseFloat(precioEdit);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'Precio inválido');
      return;
    }

    setCargando(true);
    try {
      await actualizarProductoCatalogo(editando, {
        nombre: nombreEdit.trim(),
        precio: precioNum,
        descripcion: descripcionEdit.trim()
      });

      Alert.alert('Éxito', 'Producto actualizado');
      cancelarEdicion();
      cargarCatalogo();
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo actualizar el producto');
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = (producto) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar "${producto.nombre}" del catálogo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminar(producto.id)
        }
      ]
    );
  };

  const eliminar = async (id) => {
    setCargando(true);
    try {
      await eliminarProductoCatalogo(id);
      Alert.alert('Éxito', 'Producto eliminado del catálogo');
      cargarCatalogo();
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo eliminar el producto');
    } finally {
      setCargando(false);
    }
  };

  const renderProducto = ({ item }) => {
    const estaEditando = editando === item.id;

    if (estaEditando) {
      return (
        <View style={estilos.productoCardEdit}>
          <Text style={estilos.editTitulo}>Editar Producto</Text>
          
          <Text style={estilos.label}>Nombre</Text>
          <TextInput
            style={estilos.inputEdit}
            value={nombreEdit}
            onChangeText={setNombreEdit}
            placeholder="Nombre del producto"
          />

          <Text style={estilos.label}>Precio (S/)</Text>
          <TextInput
            style={estilos.inputEdit}
            value={precioEdit}
            onChangeText={setPrecioEdit}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          <Text style={estilos.label}>Descripción</Text>
          <TextInput
            style={[estilos.inputEdit, estilos.inputMultilinea]}
            value={descripcionEdit}
            onChangeText={setDescripcionEdit}
            placeholder="Descripción del producto"
            multiline
            numberOfLines={3}
          />

          <View style={estilos.botonesEdit}>
            <TouchableOpacity
              style={estilos.botonCancelar}
              onPress={cancelarEdicion}
            >
              <Text style={estilos.textoBoton}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.botonGuardar}
              onPress={guardarEdicion}
            >
              <Text style={estilos.textoBoton}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={estilos.productoCard}>
        <TouchableOpacity
          style={estilos.productoTouchable}
          onPress={() => seleccionar(item)}
        >
          {item.imagenUrl ? (
            <Image
              source={{ uri: item.imagenUrl }}
              style={estilos.productoImagen}
              resizeMode="cover"
            />
          ) : (
            <View style={estilos.productoImagenPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
            </View>
          )}
          
          <View style={estilos.productoInfo}>
            <Text style={estilos.productoNombre} numberOfLines={2}>
              {item.nombre}
            </Text>
            <Text style={estilos.productoDescripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
            <Text style={estilos.productoPrecio}>
              S/ {parseFloat(item.precio).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={estilos.botonesAccion}>
          <TouchableOpacity
            style={estilos.botonEditar}
            onPress={() => iniciarEdicion(item)}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.botonEliminar}
            onPress={() => confirmarEliminar(item)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={estilos.contenedor}>
        {/* Header */}
        <View style={estilos.header}>
          <Text style={estilos.titulo}>Mi Catálogo</Text>
          <TouchableOpacity onPress={() => { limpiar(); onClose(); }}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={estilos.buscadorContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={estilos.iconoBuscar} />
          <TextInput
            style={estilos.input}
            placeholder="Buscar en mi catálogo..."
            value={busqueda}
            onChangeText={setBusqueda}
            returnKeyType="search"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados */}
        {cargando ? (
          <View style={estilos.centrado}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={estilos.textoCargando}>Cargando catálogo...</Text>
          </View>
        ) : (
          <FlatList
            data={productosFiltrados}
            renderItem={renderProducto}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={estilos.lista}
            ListHeaderComponent={
              productosFiltrados.length > 0 ? (
                <View style={estilos.resultadosHeader}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={estilos.resultadosTexto}>
                    {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} en tu catálogo
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={estilos.centrado}>
                <Ionicons name="folder-open-outline" size={80} color="#d1d5db" />
                <Text style={estilos.textoVacioTitulo}>
                  {busqueda ? 'No se encontraron productos' : 'Catálogo vacío'}
                </Text>
                <Text style={estilos.textoVacioSubtitulo}>
                  {busqueda 
                    ? 'Intenta con otro término de búsqueda'
                    : 'Agrega productos desde "Navegar en Sego"'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 50,
    elevation: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buscadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iconoBuscar: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  lista: {
    padding: 10,
  },
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultadosTexto: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 8,
  },
  productoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productoTouchable: {
    flexDirection: 'row',
    padding: 12,
  },
  productoImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productoImagenPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  botonesAccion: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  botonEditar: {
    flex: 1,
    backgroundColor: '#f59e0b',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productoCardEdit: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
  },
  inputEdit: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputMultilinea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  botonesEdit: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  textoCargando: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
  },
  textoVacioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  textoVacioSubtitulo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
