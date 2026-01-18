import React, { useState } from 'react';
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
import { buscarProductos } from '../servicios/producto.servicio';

export default function BuscadorProductos({ visible, onClose, onSeleccionar }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const buscar = async () => {
    if (!busqueda.trim()) {
      Alert.alert('Aviso', 'Ingresa un término de búsqueda');
      return;
    }

    setCargando(true);
    setBuscado(true);
    try {
      const respuesta = await buscarProductos(busqueda);
      setResultados(respuesta.productos || []);
      
      if (respuesta.productos.length === 0) {
        Alert.alert('Sin resultados', 'No se encontraron productos con ese término');
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      Alert.alert('Error', error.error || 'No se pudo buscar productos');
    } finally {
      setCargando(false);
    }
  };

  const seleccionar = (producto) => {
    onSeleccionar(producto);
    limpiar();
    onClose();
  };

  const limpiar = () => {
    setBusqueda('');
    setResultados([]);
    setBuscado(false);
  };

  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={estilos.productoCard}
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
          <Text style={estilos.placeholderTexto}>Sin imagen</Text>
        </View>
      )}
      
      <View style={estilos.productoInfo}>
        <Text style={estilos.productoNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={estilos.productoDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={estilos.productoFooter}>
          <Text style={estilos.productoPrecio}>
            {item.precioTexto || `S/ ${item.precio.toFixed(2)}`}
          </Text>
          <Text style={[
            estilos.productoFuente,
            item.origen === 'propio' && estilos.productoFuentePropio
          ]}>
            {item.origen === 'propio' ? '⭐ MI CATÁLOGO' : 'SEGO'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={estilos.titulo}>Buscar Productos</Text>
          <TouchableOpacity onPress={() => { limpiar(); onClose(); }}>
            <Text style={estilos.cerrar}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={estilos.buscadorContainer}>
          <TextInput
            style={estilos.input}
            placeholder="Buscar en mi catálogo y SEGO"
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={buscar}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[estilos.botonBuscar, cargando && estilos.botonDeshabilitado]}
            onPress={buscar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={estilos.textoBotonBuscar}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {cargando ? (
          <View style={estilos.centrado}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={estilos.textoCargando}>Buscando productos...</Text>
          </View>
        ) : buscado && resultados.length === 0 ? (
          <View style={estilos.centrado}>
            <Text style={estilos.textoVacio}>😕</Text>
            <Text style={estilos.textoVacioTitulo}>No se encontraron productos</Text>
            <Text style={estilos.textoVacioSubtitulo}>
              Intenta con otro término de búsqueda
            </Text>
          </View>
        ) : (
          <FlatList
            data={resultados}
            renderItem={renderProducto}
            keyExtractor={(item, index) => `${item.nombre}-${index}`}
            contentContainerStyle={estilos.lista}
            ListHeaderComponent={
              resultados.length > 0 ? (
                <View style={estilos.resultadosHeader}>
                  <Text style={estilos.resultadosTexto}>
                    {resultados.length} producto{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !buscado ? (
                <View style={estilos.centrado}>
                  <Text style={estilos.textoInicio}>🔍</Text>
                  <Text style={estilos.textoInicioTitulo}>Busca productos</Text>
                  <Text style={estilos.textoInicioSubtitulo}>
                    Busca en tu catálogo propio y en SEGO
                  </Text>
                </View>
              ) : null
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
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cerrar: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  buscadorContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  botonBuscar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#93c5fd',
  },
  textoBotonBuscar: {
    fontSize: 20,
  },
  lista: {
    padding: 10,
  },
  resultadosHeader: {
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultadosTexto: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  productoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  placeholderTexto: {
    fontSize: 10,
    color: '#9ca3af',
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
  productoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  productoFuente: {
    fontSize: 11,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productoFuentePropio: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
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
  textoVacio: {
    fontSize: 60,
    marginBottom: 15,
  },
  textoVacioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  textoVacioSubtitulo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  textoInicio: {
    fontSize: 60,
    marginBottom: 15,
  },
  textoInicioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  textoInicioSubtitulo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
