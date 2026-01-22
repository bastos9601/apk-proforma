import React, { useState, useRef } from 'react';
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
import { crearProforma } from '../servicios/proforma.servicio';
import { subirImagen } from '../servicios/cloudinary.servicio';
import { generarPDF, compartirPDF, generarHTMLProforma } from '../servicios/pdf.servicio';
import { convertirNumeroALetras } from '../utilidades/convertirNumeroALetras';
import { guardarProductoCatalogo } from '../servicios/producto.servicio';
import { obtenerConfiguracion } from '../servicios/configuracion.servicio';
import BuscadorProductos from '../componentes/BuscadorProductos';
import VistaPreviaPDF from '../componentes/VistaPreviaPDF';

export default function CrearProformaPantalla({ navigation }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUri, setImagenUri] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [nombreProducto, setNombreProducto] = useState('');
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [htmlVistaPrevia, setHtmlVistaPrevia] = useState('');
  const [descripcionServicio, setDescripcionServicio] = useState('Por la presente ponemos a su consideración la cotización de instalación y reubicación');
  const [consideraciones, setConsideraciones] = useState(
    '1. La garantía de componentes es de 1 año luego de la entrega de datos.\n' +
    '2. La vigencia de la cotización es de 5 días a partir de la presente fecha por la varianza en el precio del dólar.\n' +
    '3. El usuario deberá abonar el 50% de presupuesto.\n' +
    '4. En caso de que el cliente no realice el pago total dentro de los 30 días posteriores a la finalización del trabajo, se aplicará un recargo del 30% sobre el monto total pendiente.'
  );
  const [incluirConsideraciones, setIncluirConsideraciones] = useState(true);

  // Callback para recibir producto desde SegoWebView
  const agregarProductoDesdeSego = (producto) => {
    // Agregar directamente a la lista de items con cantidad 1
    const nuevoItem = {
      descripcion: producto.descripcion,
      cantidad: 1,
      precio: producto.precio,
      total: producto.precio * 1,
      imagenUri: producto.imagenUri,
      imagenUrl: null // Se llenará al subir
    };

    // Actualizar tanto el estado como la referencia
    const nuevosItems = [...itemsRef.current, nuevoItem];
    itemsRef.current = nuevosItems;
    setItems(nuevosItems);
    
    console.log('Producto agregado desde Sego:', producto.descripcion);
    console.log('Total de items ahora:', nuevosItems.length);
  };

  // Seleccionar producto de SEGO
  const seleccionarProductoSego = (producto) => {
    setDescripcion(producto.descripcion);
    
    // Si el producto tiene precio válido, usarlo
    if (producto.precio && producto.precio > 0) {
      setPrecio(producto.precio.toString());
      Alert.alert('Producto seleccionado', `${producto.nombre} - S/ ${producto.precio.toFixed(2)}`);
    } else {
      // Si no tiene precio, dejar que el usuario lo ingrese
      setPrecio('');
      Alert.alert(
        'Producto seleccionado', 
        `${producto.nombre}\n\nPor favor ingresa el precio manualmente`,
        [{ text: 'OK' }]
      );
    }
    
    // Opcionalmente podrías descargar la imagen
    if (producto.imagenUrl) {
      setImagenUri(producto.imagenUrl);
    }
  };

  // Seleccionar imagen de la galería
  const seleccionarImagen = async () => {
    try {
      console.log('Iniciando selección de imagen...');
      
      // Verificar permisos actuales
      const { status: statusActual } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Status actual de permisos:', statusActual);
      
      let permisoFinal = statusActual;
      
      // Si no tiene permisos, solicitarlos
      if (statusActual !== 'granted') {
        console.log('Solicitando permisos...');
        const { status: nuevoStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        permisoFinal = nuevoStatus;
        console.log('Nuevo status de permisos:', nuevoStatus);
      }
      
      if (permisoFinal !== 'granted') {
        Alert.alert(
          'Permiso necesario', 
          'La app necesita acceso a tus fotos. Por favor ve a Configuración de tu celular → Apps → Expo Go → Permisos y habilita "Archivos y multimedia".',
          [{ text: 'Entendido' }]
        );
        return;
      }

      console.log('Abriendo selector de imágenes...');
      
      // Abrir selector de imágenes con compresión
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reducir calidad para imágenes más pequeñas
        allowsMultipleSelection: false,
      });

      console.log('Resultado del picker:', JSON.stringify(resultado));

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        console.log('Imagen seleccionada:', resultado.assets[0].uri);
        setImagenUri(resultado.assets[0].uri);
        Alert.alert('Éxito', 'Imagen seleccionada');
      } else {
        console.log('Selección cancelada');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + error.message);
    }
  };

  // Tomar foto con la cámara
  const tomarFoto = async () => {
    try {
      console.log('Iniciando cámara...');
      
      // Verificar permisos de cámara
      const { status: statusActual } = await ImagePicker.getCameraPermissionsAsync();
      console.log('Status actual de permisos de cámara:', statusActual);
      
      let permisoFinal = statusActual;
      
      if (statusActual !== 'granted') {
        console.log('Solicitando permisos de cámara...');
        const { status: nuevoStatus } = await ImagePicker.requestCameraPermissionsAsync();
        permisoFinal = nuevoStatus;
        console.log('Nuevo status de permisos de cámara:', nuevoStatus);
      }
      
      if (permisoFinal !== 'granted') {
        Alert.alert(
          'Permiso necesario', 
          'La app necesita acceso a la cámara.',
          [{ text: 'Entendido' }]
        );
        return;
      }

      console.log('Abriendo cámara...');
      
      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reducir calidad para imágenes más pequeñas
      });

      console.log('Resultado de la cámara:', JSON.stringify(resultado));

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        console.log('Foto tomada:', resultado.assets[0].uri);
        setImagenUri(resultado.assets[0].uri);
        Alert.alert('Éxito', 'Foto tomada');
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto: ' + error.message);
    }
  };

  // Mostrar opciones de imagen
  const mostrarOpcionesImagen = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Galería',
          onPress: seleccionarImagen
        },
        {
          text: 'Cámara',
          onPress: tomarFoto
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  // Guardar producto al catálogo
  const guardarAlCatalogo = async () => {
    if (!nombreProducto.trim() || !descripcion.trim() || !precio || !imagenUri) {
      Alert.alert('Error', 'Completa nombre, descripción, precio e imagen para guardar al catálogo');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'Precio inválido');
      return;
    }

    setCargando(true);
    try {
      // Subir imagen a Cloudinary
      const imagenUrl = await subirImagen(imagenUri);

      // Guardar producto
      await guardarProductoCatalogo({
        nombre: nombreProducto.trim(),
        descripcion: descripcion.trim(),
        precio: precioNum,
        imagenUrl
      });

      Alert.alert('Éxito', '⭐ Producto guardado en tu catálogo');
      
      // Limpiar solo el nombre del producto
      setNombreProducto('');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.error || 'No se pudo guardar el producto');
    } finally {
      setCargando(false);
    }
  };

  // Agregar ítem a la lista
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
      imagenUrl: null // Se llenará al subir
    };

    setItems([...items, nuevoItem]);
    
    // Limpiar formulario
    setDescripcion('');
    setCantidad('');
    setPrecio('');
    setImagenUri(null);
    setNombreProducto('');
  };

  // Eliminar ítem
  const eliminarItem = (index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  // Calcular total
  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  // Generar vista previa del PDF
  const generarVistaPrevia = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un ítem para ver la vista previa');
      return;
    }

    if (!nombreCliente.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }

    setCargando(true);
    try {
      // Obtener configuración
      let configuracion = null;
      try {
        const configResp = await obtenerConfiguracion();
        configuracion = configResp.configuracion;
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      // Calcular total
      const total = calcularTotal();
      const totalLetras = convertirNumeroALetras(total);

      // Crear objeto proforma temporal para vista previa
      const proformaTemp = {
        id: 'PREVIEW',
        numero_proforma: '00000',
        fecha: new Date().toISOString().split('T')[0],
        total,
        total_letras: totalLetras,
        descripcion_servicio: descripcionServicio.trim(),
        consideraciones: incluirConsideraciones ? consideraciones.trim() : null
      };

      // Crear detalles temporales
      const detallesTemp = items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio: item.precio,
        total: item.total,
        imagen_url: item.imagenUri
      }));

      // Generar HTML
      const html = generarHTMLProforma(
        proformaTemp,
        detallesTemp,
        nombreCliente.trim(),
        configuracion
      );

      setHtmlVistaPrevia(html);
      setMostrarVistaPrevia(true);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo generar la vista previa');
    } finally {
      setCargando(false);
    }
  };

  // Guardar proforma
  const guardarProforma = async () => {
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
      // Subir imágenes a Cloudinary
      const itemsConUrls = await Promise.all(
        items.map(async (item) => {
          if (item.imagenUri) {
            const url = await subirImagen(item.imagenUri);
            return { ...item, imagenUrl: url };
          }
          return item;
        })
      );

      // Calcular total
      const total = calcularTotal();
      const totalLetras = convertirNumeroALetras(total);

      // Preparar datos
      const proformaData = {
        fecha: new Date().toISOString().split('T')[0],
        total,
        totalLetras,
        nombreCliente: nombreCliente.trim(),
        descripcionServicio: descripcionServicio.trim(),
        consideraciones: incluirConsideraciones ? consideraciones.trim() : null,
        detalles: itemsConUrls.map(item => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio: item.precio,
          total: item.total,
          imagenUrl: item.imagenUrl
        }))
      };

      // Crear proforma en el backend
      const respuesta = await crearProforma(proformaData);

      // Obtener configuración del usuario
      let configuracion = null;
      try {
        const configResp = await obtenerConfiguracion();
        configuracion = configResp.configuracion;
      } catch (error) {
        console.log('No se pudo cargar configuración, usando valores por defecto');
      }

      // Generar PDF con nombre del cliente y configuración
      const pdfUri = await generarPDF(
        respuesta.proforma,
        respuesta.proforma.detalles,
        nombreCliente.trim(),
        configuracion
      );

      // Compartir PDF con nombre del cliente
      await compartirPDF(pdfUri, nombreCliente.trim());

      Alert.alert('Éxito', 'Proforma creada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.error || 'Error al crear proforma');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Vista Previa del PDF */}
      <VistaPreviaPDF
        visible={mostrarVistaPrevia}
        onClose={() => setMostrarVistaPrevia(false)}
        htmlContent={htmlVistaPrevia}
      />

      {/* Buscador de productos SEGO */}
      <BuscadorProductos
        visible={mostrarBuscador}
        onClose={() => setMostrarBuscador(false)}
        onSeleccionar={seleccionarProductoSego}
      />

      {/* Sección de Cliente */}
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

        {/* Checkbox para incluir consideraciones */}
        <TouchableOpacity
          style={estilos.checkboxContainer}
          onPress={() => setIncluirConsideraciones(!incluirConsideraciones)}
          activeOpacity={0.7}
        >
          <View style={[estilos.checkbox, incluirConsideraciones && estilos.checkboxMarcado]}>
            {incluirConsideraciones && (
              <Text style={estilos.checkboxIcono}>✓</Text>
            )}
          </View>
          <Text style={estilos.checkboxLabel}>Incluir Consideraciones en la proforma</Text>
        </TouchableOpacity>

        {/* Campo de consideraciones (solo visible si está activado) */}
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

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Agregar Ítem</Text>

        {/* Botón para buscar en SEGO */}
        <TouchableOpacity
          style={estilos.botonSego}
          onPress={() => setMostrarBuscador(true)}
        >
          <Text style={estilos.textoBotonSego}>🔍 Buscar en Catálogo</Text>
        </TouchableOpacity>

        {/* Botón para abrir WebView de Sego */}
        <TouchableOpacity
          style={estilos.botonSegoWebView}
          onPress={() => navigation.navigate('SegoWebView', { 
            onAgregarProducto: agregarProductoDesdeSego 
          })}
        >
          <Text style={estilos.textoBotonSegoWebView}>🌐 Navegar en Sego </Text>
        </TouchableOpacity>

        <View style={estilos.separador}>
          <View style={estilos.lineaSeparador} />
          <Text style={estilos.textoSeparador}>o ingresa manualmente</Text>
          <View style={estilos.lineaSeparador} />
        </View>

        <TouchableOpacity style={estilos.botonImagen} onPress={mostrarOpcionesImagen}>
          {imagenUri ? (
            <Image source={{ uri: imagenUri }} style={estilos.imagenPreview} />
          ) : (
            <Text style={estilos.textoBotonImagen}>+ Seleccionar Imagen</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={estilos.input}
          placeholder="Nombre del producto (para guardar en catálogo)"
          value={nombreProducto}
          onChangeText={setNombreProducto}
        />

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

        <View style={estilos.fila}>
          <TouchableOpacity 
            style={[estilos.botonAgregar, { flex: 1, marginRight: 5 }]} 
            onPress={agregarItem}
          >
            <Text style={estilos.textoBoton}>Agregar Ítem</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[estilos.botonCatalogo, { flex: 1, marginLeft: 5 }]} 
            onPress={guardarAlCatalogo}
            disabled={cargando}
          >
            <Text style={estilos.textoBoton}>⭐ Guardar al Catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de ítems */}
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

      {items.length > 0 && (
        <>
          <TouchableOpacity
            style={[estilos.botonVistaPrevia, cargando && estilos.botonDeshabilitado]}
            onPress={generarVistaPrevia}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.textoBoton}>👁️ Vista Previa del PDF</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botonGuardar, cargando && estilos.botonDeshabilitado]}
            onPress={guardarProforma}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.textoBoton}>Guardar y Generar PDF</Text>
            )}
          </TouchableOpacity>
        </>
      )}

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
  botonSego: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotonSego: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSegoWebView: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotonSegoWebView: {
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
    paddingVertical: 10,
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
    backgroundColor: '#fff',
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
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
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
  botonCatalogo: {
    backgroundColor: '#f59e0b',
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
  botonVistaPrevia: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 10,
    marginBottom: 5,
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
