import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { obtenerProformaPorId, cambiarEstadoProforma } from '../servicios/supabase.proforma.servicio';
import { generarPDF, compartirPDF, generarHTMLProforma } from '../servicios/pdf.servicio';
import { obtenerConfiguracion } from '../servicios/supabase.configuracion.servicio';
import EstadoBadge, { ESTADOS_CONFIG } from '../componentes/EstadoBadge';
import AlertaValidez from '../componentes/AlertaValidez';
import { formatearFecha } from '../utilidades/formatearFecha';

export default function VerProformaPantalla({ route, navigation }) {
  const { proformaId } = route.params;
  const [proforma, setProforma] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [notasEstado, setNotasEstado] = useState('');

  useEffect(() => {
    cargarProforma();
  }, []);

  const cargarProforma = async () => {
    try {
      const proformaData = await obtenerProformaPorId(proformaId);
      setProforma(proformaData);
      setDetalles(proformaData.detalle_proforma || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la proforma');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const manejarGenerarPDF = async () => {
    setGenerandoPdf(true);
    try {
      // Obtener configuración
      let configuracion = null;
      try {
        configuracion = await obtenerConfiguracion();
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      const pdfUri = await generarPDF(
        proforma,
        detalles,
        proforma.nombre_cliente || 'CLIENTE',
        configuracion
      );
      await compartirPDF(pdfUri, proforma.nombre_cliente || 'CLIENTE');
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const manejarEditar = () => {
    navigation.navigate('EditarProforma', { proformaId, proforma, detalles });
  };

  const manejarCrearFactura = () => {
    navigation.navigate('CrearFactura', { proformaId });
  };

  const abrirModalEstado = (estado) => {
    setEstadoSeleccionado(estado);
    setNotasEstado('');
    setMostrarModalEstado(true);
  };

  const confirmarCambioEstado = async () => {
    if (!estadoSeleccionado) return;

    try {
      setCargando(true);
      await cambiarEstadoProforma(proformaId, estadoSeleccionado, notasEstado || null);
      Alert.alert('Éxito', `Estado cambiado a ${ESTADOS_CONFIG[estadoSeleccionado].label}`);
      setMostrarModalEstado(false);
      await cargarProforma();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Modal para cambiar estado */}
      <Modal
        visible={mostrarModalEstado}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarModalEstado(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Cambiar Estado</Text>
            
            {estadoSeleccionado && (
              <View style={estilos.estadoSeleccionadoContainer}>
                <EstadoBadge estado={estadoSeleccionado} />
              </View>
            )}

            <Text style={estilos.modalLabel}>Notas (opcional):</Text>
            <TextInput
              style={estilos.modalInput}
              placeholder="Agregar notas sobre el cambio de estado..."
              value={notasEstado}
              onChangeText={setNotasEstado}
              multiline
              numberOfLines={3}
            />

            <View style={estilos.modalBotones}>
              <TouchableOpacity
                style={[estilos.modalBoton, estilos.modalBotonCancelar]}
                onPress={() => setMostrarModalEstado(false)}
              >
                <Text style={estilos.modalBotonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.modalBoton, estilos.modalBotonConfirmar]}
                onPress={confirmarCambioEstado}
              >
                <Text style={[estilos.modalBotonTexto, { color: '#fff' }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={estilos.scroll}>
        <View style={estilos.header}>
          <Text style={estilos.titulo}>BRADATEC</Text>
          <Text style={estilos.subtitulo}>Proforma de Servicios</Text>
        </View>

        <View style={estilos.infoCard}>
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Fecha:</Text>
            <Text style={estilos.infoValor}>
              {formatearFecha(proforma.fecha)}
            </Text>
          </View>
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Proforma N°:</Text>
            <Text style={estilos.infoValor}>
              {proforma.id.substring(0, 8).toUpperCase()}
            </Text>
          </View>
          {proforma.fecha_validez && (
            <View style={estilos.infoFila}>
              <Text style={estilos.infoLabel}>Válida hasta:</Text>
              <View style={estilos.infoValorConAlerta}>
                <Text style={estilos.infoValor}>
                  {formatearFecha(proforma.fecha_validez)}
                </Text>
                <AlertaValidez fechaValidez={proforma.fecha_validez} mostrarSiempre={true} />
              </View>
            </View>
          )}
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Estado:</Text>
            <EstadoBadge estado={proforma.estado || 'pendiente'} />
          </View>
          {proforma.notas_estado && (
            <View style={estilos.notasEstadoContainer}>
              <Text style={estilos.notasEstadoLabel}>Notas:</Text>
              <Text style={estilos.notasEstadoTexto}>{proforma.notas_estado}</Text>
            </View>
          )}
        </View>

        {/* Botones de cambio de estado */}
        <View style={estilos.estadosBotonesContainer}>
          <Text style={estilos.estadosBotonesLabel}>Cambiar estado:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(ESTADOS_CONFIG).map((estado) => (
              <TouchableOpacity
                key={estado}
                style={[
                  estilos.estadoBoton,
                  { backgroundColor: ESTADOS_CONFIG[estado].bgColor },
                  proforma.estado === estado && estilos.estadoBotonActivo
                ]}
                onPress={() => abrirModalEstado(estado)}
                disabled={proforma.estado === estado}
              >
                <Text style={estilos.estadoBotonIcono}>
                  {ESTADOS_CONFIG[estado].icon}
                </Text>
                <Text style={[
                  estilos.estadoBotonTexto,
                  { color: ESTADOS_CONFIG[estado].color }
                ]}>
                  {ESTADOS_CONFIG[estado].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Detalles</Text>
          
          {detalles.map((detalle, index) => (
            <View key={index} style={estilos.detalleCard}>
              {detalle.imagen_url && (
                <Image
                  source={{ uri: detalle.imagen_url }}
                  style={estilos.imagen}
                />
              )}
              <View style={estilos.detalleInfo}>
                <Text style={estilos.descripcion}>{detalle.descripcion}</Text>
                <View style={estilos.detalleNumeros}>
                  <Text style={estilos.cantidad}>Cant: {detalle.cantidad}</Text>
                  <Text style={estilos.precio}>
                    Precio: ${parseFloat(detalle.precio).toFixed(2)}
                  </Text>
                </View>
                <Text style={estilos.totalDetalle}>
                  Total: ${parseFloat(detalle.total).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={estilos.totalCard}>
          <View style={estilos.totalFila}>
            <Text style={estilos.totalLabel}>TOTAL:</Text>
            <Text style={estilos.totalValor}>
              ${parseFloat(proforma.total).toFixed(2)}
            </Text>
          </View>
          <View style={estilos.totalLetrasCard}>
            <Text style={estilos.totalLetrasLabel}>Total en letras:</Text>
            <Text style={estilos.totalLetrasTexto}>{proforma.total_letras}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={estilos.footer}>
        {proforma.estado === 'aprobada' && (
          <>
            <TouchableOpacity
              style={estilos.botonFactura}
              onPress={manejarCrearFactura}
            >
              <Text style={estilos.textoBoton}>🧾 Factura</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={estilos.botonBoleta}
              onPress={() => navigation.navigate('CrearBoleta', { proformaId: proforma.id })}
            >
              <Text style={estilos.textoBoton}>📄 Boleta</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity
          style={estilos.botonEditar}
          onPress={manejarEditar}
        >
          <Text style={estilos.textoBoton}>✏️ Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[estilos.botonPdf, generandoPdf && estilos.botonDeshabilitado]}
          onPress={manejarGenerarPDF}
          disabled={generandoPdf}
        >
          {generandoPdf ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>📄 PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  infoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  infoValor: {
    fontSize: 14,
    color: '#1f2937',
  },
  infoValorConAlerta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
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
  detalleCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  detalleInfo: {
    flex: 1,
  },
  descripcion: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detalleNumeros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cantidad: {
    fontSize: 12,
    color: '#6b7280',
  },
  precio: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalDetalle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  totalCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  totalLetrasCard: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  totalLetrasLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalLetrasTexto: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 10,
  },
  botonFactura: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonBoleta: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonEditar: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonPdf: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#93c5fd',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notasEstadoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  notasEstadoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  notasEstadoTexto: {
    fontSize: 14,
    color: '#1f2937',
  },
  estadosBotonesContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  estadosBotonesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  estadoBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  estadoBotonActivo: {
    borderColor: '#2563eb',
    opacity: 0.5,
  },
  estadoBotonIcono: {
    fontSize: 16,
    marginRight: 6,
  },
  estadoBotonTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  estadoSeleccionadoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBoton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotonCancelar: {
    backgroundColor: '#f3f4f6',
  },
  modalBotonConfirmar: {
    backgroundColor: '#2563eb',
  },
  modalBotonTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
