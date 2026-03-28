import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { actualizarProforma } from '../servicios/supabase.proforma.servicio';
import { subirImagen } from '../servicios/supabase.storage.servicio';
import { convertirNumeroALetras } from '../utilidades/convertirNumeroALetras';
import BuscadorProductos from '../componentes/BuscadorProductos';

export default function EditarProformaPantalla({ route, navigation }) {
  const { proformaId, proforma, detalles } = route.params;
  
  const [items, setItems] = useState([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcionServicio, setDescripcionServicio] = useState('');
  const [consideraciones, setConsideraciones] = useState('');
  const [incluirConsideraciones, setIncluirConsideraciones] = useState(true);
  
  // Campos para agregar nuevo ítem
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUri, setImagenUri] = useState(null);
  
  const [cargando, setCargando] = useState(false);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);

  useEffect(() => {
    // Cargar datos de la proforma
    setNombreCliente(proforma.nombre_cliente || '');
    setDescripcionServicio(proforma.descripcion_servicio || '');
    setConsideraciones(proforma.consideraciones || '');
    setIncluirConsideraciones(!!proforma.consideraciones);
    
    // Convertir detalles al formato del estado
    const itemsFormateados = detalles.map(d => ({
      id: d.id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio: d.precio,
      total: d.total,
      imagenUri: d.imagen_url,
      imagenUrl: d.imagen_url
    }));
    setItems(itemsFormateados);
  }, []);

  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setImagenUri(resultado.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Seleccionar producto del catálogo
  const seleccionarProductoCatalogo = (producto) => {
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio ? producto.precio.toString() : '');
    
    if (producto.imagen_url) {
      setImagenUri(producto.imagen_url);
    }
    
    Alert.alert('Producto seleccionado', `${producto.nombre} - S/ ${producto.precio.toFixed(2)}`);
  };

  // Callback para recibir producto desde SegoWebView
  const agregarProductoDesdeSego = (producto) => {
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setCantidad('1');
    
    if (producto.imagenUri) {
      setImagenUri(producto.imagenUri);
    }
    
    Alert.alert('Producto agregado desde Sego', producto.descripcion);
  };

  const agregarItem = () => {
    if (!descripcion || !cantidad || !precio) {
      Alert.alert('Error', 'Completa descripción, cantidad y precio');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseFloat(precio);

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'Precio inválido');
      return;
    }

    const nuevoItem = {
      descripcion,
      cantidad: cantidadNum,
      precio: precioNum,
      total: cantidadNum * precioNum,
      imagenUri,
      imagenUrl: null
    };

    setItems([...items, nuevoItem]);
    
    // Limpiar formulario
    setDescripcion('');
    setCantidad('');
    setPrecio('');
    setImagenUri(null);
  };

  const eliminarItem = (index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const guardarCambios = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un ítem');
      return;
    }

    if (!nombreCliente.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }

    setCargando(true);
    try {
      // Subir nuevas imágenes (intentar, pero continuar si falla)
      const itemsConUrls = await Promise.all(
        items.map(async (item) => {
          // Si ya tiene una URL válida (http/https), no intentar subir
          if (item.imagenUrl && (item.imagenUrl.startsWith('http://') || item.imagenUrl.startsWith('https://'))) {
            return item;
          }
          
          // Si tiene una URI local nueva, intentar subir
          if (item.imagenUri && !item.imagenUrl) {
            try {
              const url = await subirImagen(item.imagenUri);
              return { ...item, imagenUrl: url };
            } catch (error) {
              // Usar URI local si falla la subida
              return { ...item, imagenUrl: item.imagenUri };
            }
          }
          
          return item;
        })
      );

      // Calcular total
      const total = calcularTotal();
      const totalLetras = convertirNumeroALetras(total);

      // Preparar datos
      const proformaData = {
        fecha: proforma.fecha,
        total,
        total_letras: totalLetras,
        numero_proforma: proforma.numero_proforma,
        nombre_cliente: nombreCliente.trim(),
        descripcion_servicio: descripcionServicio.trim(),
        consideraciones: incluirConsideraciones ? consideraciones.trim() : null,
        detalles: itemsConUrls.map(item => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio: item.precio,
          total: item.total,
          imagen_url: item.imagenUrl || null
        }))
      };

      // Actualizar proforma
      await actualizarProforma(proformaId, proformaData);

      Alert.alert('Éxito', 'Proforma actualizada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.error || 'No se pudo actualizar la proforma');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Buscador de productos */}
      <BuscadorProductos
        visible={mostrarBuscador}
        onClose={() => setMostrarBuscador(false)}
        onSeleccionar={seleccionarProductoCatalogo}
      />

      {/* Datos del Cliente */}
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Datos del Cliente</Text>
        <TextInput
          style={estilos.input}
          placeholder="Nombre del cliente"
          value={nombreCliente}
          onChangeText={setNombreCliente}
        />
        
        <Text style={estilos.label}>Descripción del Servicio</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          placeholder="Por la presente ponemos a su consideración..."
          value={descripcionServicio}
          onChangeText={setDescripcionServicio}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={estilos.checkboxContainer}
          onPress={() => setIncluirConsideraciones(!incluirConsideraciones)}
        >
          <View style={[estilos.checkbox, incluirConsideraciones && estilos.checkboxMarcado]}>
            {incluirConsideraciones && <Text style={estilos.checkboxIcono}>✓</Text>}
          </View>
          <Text style={estilos.checkboxLabel}>Incluir Consideraciones</Text>
        </TouchableOpacity>

        {incluirConsideraciones && (
          <>
            <Text style={estilos.label}>Consideraciones</Text>
            <TextInput
              style={[estilos.input, estilos.inputConsideraciones]}
              placeholder="1. La garantía de componentes..."
              value={consideraciones}
              onChangeText={setConsideraciones}
              multiline
              numberOfLines={6}
            />
          </>
        )}
      </View>

      {/* Agregar Nuevo Ítem */}
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Agregar Nuevo Ítem</Text>

        {/* Botón para buscar en catálogo */}
        <TouchableOpacity
          style={estilos.botonCatalogo}
          onPress={() => setMostrarBuscador(true)}
        >
          <Text style={estilos.textoBotonCatalogo}>🔍 Buscar en Catálogo</Text>
        </TouchableOpacity>

        {/* Botón para abrir WebView de Sego */}
        <TouchableOpacity
          style={estilos.botonSego}
          onPress={() => navigation.navigate('SegoWebView', { 
            onAgregarProducto: agregarProductoDesdeSego 
          })}
        >
          <Text style={estilos.textoBotonSego}>🌐 Navegar en Sego</Text>
        </TouchableOpacity>

        <View style={estilos.separador}>
          <View style={estilos.lineaSeparador} />
          <Text style={estilos.textoSeparador}>o ingresa manualmente</Text>
          <View style={estilos.lineaSeparador} />
        </View>

        <TouchableOpacity style={estilos.botonImagen} onPress={seleccionarImagen}>
          {imagenUri ? (
            <Image source={{ uri: imagenUri }} style={estilos.imagenPreview} />
          ) : (
            <Text style={estilos.textoBotonImagen}>+ Seleccionar Imagen</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={estilos.input}
          placeholder="Descripción del servicio/producto"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <View style={estilos.fila}>
          <TextInput
            style={[estilos.input, estilos.inputPequeno]}
            placeholder="Cantidad"
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
          />
          <TextInput
            style={[estilos.input, estilos.inputPequeno]}
            placeholder="Precio (S/)"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={estilos.botonAgregar} onPress={agregarItem}>
          <Text style={estilos.textoBoton}>Agregar Ítem</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Ítems */}
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Ítems ({items.length})</Text>
        
        {items.map((item, index) => (
          <View key={index} style={estilos.itemCard}>
            {item.imagenUri && (
              <Image source={{ uri: item.imagenUri }} style={estilos.itemImagen} />
            )}
            <View style={estilos.itemInfo}>
              <Text style={estilos.itemDescripcion}>{item.descripcion}</Text>
              <Text style={estilos.itemDetalle}>
                Cantidad: {item.cantidad} | Precio: S/ {item.precio.toFixed(2)}
              </Text>
              <Text style={estilos.itemTotal}>Total: S/ {item.total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={estilos.botonEliminar}
              onPress={() => eliminarItem(index)}
            >
              <Text style={estilos.textoEliminar}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {items.length > 0 && (
          <View style={estilos.totalContainer}>
            <Text style={estilos.totalTexto}>TOTAL:</Text>
            <Text style={estilos.totalValor}>S/ {calcularTotal().toFixed(2)}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[estilos.botonGuardar, cargando && estilos.botonDeshabilitado]}
        onPress={guardarCambios}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={estilos.textoBoton}>💾 Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  seccion: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  inputMultilinea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputConsideraciones: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: '#2563eb',
  },
  checkboxIcono: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  botonCatalogo: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonCatalogo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSego: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBotonSego: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  textoSeparador: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#9ca3af',
  },
  botonImagen: {
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBotonImagen: {
    color: '#6b7280',
    fontSize: 16,
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputPequeno: {
    flex: 1,
    marginHorizontal: 5,
  },
  botonAgregar: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemDescripcion: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDetalle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  botonEliminar: {
    backgroundColor: '#ef4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoEliminar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
  },
  totalTexto: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  botonGuardar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#93c5fd',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
