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
  TextInput,
} from 'react-native';
import {
  obtenerFacturaPorId,
  marcarFacturaPagada,
  anularFactura,
  estaVencida,
  calcularDiasVencimiento,
} from '../servicios/supabase.factura.servicio';
import { generarPDFFactura, compartirPDFFactura } from '../servicios/pdf.factura.servicio';
import { obtenerConfiguracion } from '../servicios/supabase.configuracion.servicio';
import EstadoPagoBadge from '../componentes/EstadoPagoBadge';
import { formatearFecha } from '../utilidades/formatearFecha';

export default function DetalleFacturaPantalla({ route, navigation }) {
  const { facturaId } = route.params;
  const [factura, setFactura] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  
  // Modal de pago
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');
  const [notasPago, setNotasPago] = useState('');

  useEffect(() => {
    cargarFactura();
  }, []);

  const cargarFactura = async () => {
    try {
      const facturaData = await obtenerFacturaPorId(facturaId);
      setFactura(facturaData);
      setDetalles(facturaData.factura_detalles || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la factura');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const manejarGenerarPDF = async () => {
    setGenerandoPdf(true);
    try {
      let configuracion = null;
      try {
        configuracion = await obtenerConfiguracion();
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      const pdfUri = await generarPDFFactura(factura, detalles, configuracion);
      await compartirPDFFactura(pdfUri, factura.cliente_nombre);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const abrirModalPago = () => {
    setMetodoPago('');
    setNotasPago('');
    setMostrarModalPago(true);
  };

  const confirmarPago = async () => {
    if (!metodoPago.trim()) {
      Alert.alert('Error', 'Selecciona un método de pago');
      return;
    }

    try {
      setCargando(true);
      await marcarFacturaPagada(facturaId, metodoPago, notasPago || null);
      Alert.alert('Éxito', 'Factura marcada como pagada');
      setMostrarModalPago(false);
      await cargarFactura();
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar como pagada');
    } finally {
      setCargando(false);
    }
  };

  const manejarAnular = () => {
    Alert.alert(
      'Anular Factura',
      '¿Estás seguro de anular esta factura? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Anular',
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await anularFactura(facturaId, 'Anulada por el usuario');
              Alert.alert('Éxito', 'Factura anulada');
              await cargarFactura();
            } catch (error) {
              Alert.alert('Error', 'No se pudo anular la factura');
            } finally {
              setCargando(false);
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#c00000" />
      </View>
    );
  }

  const vencida = estaVencida(factura.fecha_vencimiento);
  const diasVencimiento = calcularDiasVencimiento(factura.fecha_vencimiento);

  return (
    <View style={estilos.contenedor}>
      {/* Modal de pago */}
      <Modal
        visible={mostrarModalPago}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarModalPago(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Registrar Pago</Text>
            
            <Text style={estilos.modalLabel}>Método de Pago *</Text>
            <View style={estilos.metodosPagoContainer}>
              {['Efectivo', 'Transferencia', 'Tarjeta', 'Yape/Plin'].map((metodo) => (
                <TouchableOpacity
                  key={metodo}
                  style={[
                    estilos.metodoBoton,
                    metodoPago === metodo && estilos.metodoBotonSeleccionado
                  ]}
                  onPress={() => setMetodoPago(metodo)}
                >
                  <Text style={[
                    estilos.metodoTexto,
                    metodoPago === metodo && estilos.metodoTextoSeleccionado
                  ]}>
                    {metodo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={estilos.modalLabel}>Notas (opcional)</Text>
            <TextInput
              style={estilos.modalInput}
              placeholder="Número de operación, observaciones..."
              value={notasPago}
              onChangeText={setNotasPago}
              multiline
              numberOfLines={2}
            />

            <View style={estilos.modalBotones}>
              <TouchableOpacity
                style={[estilos.modalBoton, estilos.modalBotonCancelar]}
                onPress={() => setMostrarModalPago(false)}
              >
                <Text style={estilos.modalBotonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.modalBoton, estilos.modalBotonConfirmar]}
                onPress={confirmarPago}
              >
                <Text style={[estilos.modalBotonTexto, { color: '#fff' }]}>
                  Confirmar Pago
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={estilos.scroll}>
        <View style={estilos.header}>
          <Text style={estilos.titulo}>FACTURA</Text>
          <Text style={estilos.numeroFactura}>{factura.numero_factura}</Text>
        </View>

        {/* Información principal */}
        <View style={estilos.infoCard}>
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Estado:</Text>
            <EstadoPagoBadge estado={factura.estado_pago} />
          </View>
          
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Cliente:</Text>
            <Text style={estilos.infoValor}>{factura.cliente_nombre}</Text>
          </View>
          
          {factura.cliente_ruc && (
            <View style={estilos.infoFila}>
              <Text style={estilos.infoLabel}>RUC:</Text>
              <Text style={estilos.infoValor}>{factura.cliente_ruc}</Text>
            </View>
          )}
          
          {factura.cliente_direccion && (
            <View style={estilos.infoFila}>
              <Text style={estilos.infoLabel}>Dirección:</Text>
              <Text style={[estilos.infoValor, { flex: 1, textAlign: 'right' }]}>
                {factura.cliente_direccion}
              </Text>
            </View>
          )}

          <View style={estilos.separador} />

          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Emisión:</Text>
            <Text style={estilos.infoValor}>{formatearFecha(factura.fecha_emision)}</Text>
          </View>
          
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Vencimiento:</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[
                estilos.infoValor,
                vencida && { color: '#ef4444', fontWeight: 'bold' }
              ]}>
                {formatearFecha(factura.fecha_vencimiento)}
              </Text>
              {diasVencimiento !== null && (
                <Text style={[
                  estilos.diasVencimiento,
                  vencida ? { color: '#ef4444' } : { color: '#f59e0b' }
                ]}>
                  {vencida ? `Vencida hace ${Math.abs(diasVencimiento)} días` : `Vence en ${diasVencimiento} días`}
                </Text>
              )}
            </View>
          </View>

          {factura.estado_pago === 'pagada' && factura.fecha_pago && (
            <>
              <View style={estilos.separador} />
              <View style={estilos.infoPagoCard}>
                <Text style={estilos.infoPagoTitulo}>✅ Información de Pago</Text>
                <View style={estilos.infoFila}>
                  <Text style={estilos.infoLabel}>Fecha de pago:</Text>
                  <Text style={estilos.infoValor}>{formatearFecha(factura.fecha_pago)}</Text>
                </View>
                {factura.metodo_pago && (
                  <View style={estilos.infoFila}>
                    <Text style={estilos.infoLabel}>Método:</Text>
                    <Text style={estilos.infoValor}>{factura.metodo_pago}</Text>
                  </View>
                )}
                {factura.notas_pago && (
                  <View style={estilos.notasContainer}>
                    <Text style={estilos.notasLabel}>Notas:</Text>
                    <Text style={estilos.notasTexto}>{factura.notas_pago}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Detalles */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Detalles</Text>
          
          {detalles.map((detalle, index) => (
            <View key={detalle.id} style={estilos.detalleCard}>
              <Text style={estilos.detalleNumero}>#{index + 1}</Text>
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
                    P.U.: S/ {parseFloat(detalle.precio_unitario).toFixed(2)}
                  </Text>
                </View>
                <Text style={estilos.totalDetalle}>
                  Subtotal: S/ {parseFloat(detalle.subtotal).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={estilos.totalesCard}>
          <View style={estilos.totalFila}>
            <Text style={estilos.totalLabel}>Subtotal:</Text>
            <Text style={estilos.totalValor}>S/ {parseFloat(factura.subtotal).toFixed(2)}</Text>
          </View>
          <View style={estilos.totalFila}>
            <Text style={estilos.totalLabel}>IGV (18%):</Text>
            <Text style={estilos.totalValor}>S/ {parseFloat(factura.igv).toFixed(2)}</Text>
          </View>
          <View style={[estilos.totalFila, estilos.totalFinal]}>
            <Text style={estilos.totalLabelFinal}>TOTAL:</Text>
            <Text style={estilos.totalValorFinal}>S/ {parseFloat(factura.total).toFixed(2)}</Text>
          </View>
          <View style={estilos.totalLetrasCard}>
            <Text style={estilos.totalLetrasLabel}>Son:</Text>
            <Text style={estilos.totalLetrasTexto}>{factura.total_letras}</Text>
          </View>
        </View>

        {/* Observaciones */}
        {factura.observaciones && (
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Observaciones</Text>
            <Text style={estilos.observacionesTexto}>{factura.observaciones}</Text>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Botones de acción */}
      <View style={estilos.footer}>
        {factura.estado_pago === 'pendiente' && (
          <TouchableOpacity
            style={estilos.botonPagar}
            onPress={abrirModalPago}
          >
            <Text style={estilos.textoBoton}>✅ Marcar Pagada</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={estilos.botonVerPdf}
          onPress={manejarGenerarPDF}
          disabled={generandoPdf}
        >
          {generandoPdf ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>👁️ Ver PDF</Text>
          )}
        </TouchableOpacity>

        {factura.estado_pago !== 'anulada' && (
          <TouchableOpacity
            style={estilos.botonAnular}
            onPress={manejarAnular}
          >
            <Text style={estilos.textoBotonAnular}>❌</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#c00000',
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  numeroFactura: {
    fontSize: 20,
    color: '#fff',
    marginTop: 5,
    fontWeight: '600',
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
    alignItems: 'center',
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
  separador: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  diasVencimiento: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  infoPagoCard: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoPagoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
  },
  notasContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
  },
  notasLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  notasTexto: {
    fontSize: 13,
    color: '#1f2937',
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
    position: 'relative',
  },
  detalleNumero: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
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
    color: '#c00000',
  },
  totalesCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalFinal: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    marginTop: 5,
    borderBottomWidth: 0,
    borderRadius: 8,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c00000',
  },
  totalValorFinal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c00000',
  },
  totalLetrasCard: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
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
  observacionesTexto: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
  botonPagar: {
    flex: 2,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonVerPdf: {
    flex: 2,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonAnular: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  botonDeshabilitado: {
    backgroundColor: '#93c5fd',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoBotonAnular: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  metodosPagoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metodoBoton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  metodoBotonSeleccionado: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  metodoTexto: {
    fontSize: 14,
    color: '#6b7280',
  },
  metodoTextoSeleccionado: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
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
    backgroundColor: '#10b981',
  },
  modalBotonTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
