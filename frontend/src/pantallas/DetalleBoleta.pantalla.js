import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { obtenerBoletaPorId, marcarBoletaPagada, anularBoleta } from '../servicios/supabase.boleta.servicio';
import { compartirPDFBoleta } from '../servicios/pdf.boleta.servicio';
import { formatearFecha } from '../utilidades/formatearFecha';
import EstadoPagoBadge from '../componentes/EstadoPagoBadge';

export default function DetalleBoletaPantalla({ route, navigation }) {
  const { boletaId } = route.params;
  const [boleta, setBoleta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    cargarBoleta();
  }, []);

  const cargarBoleta = async () => {
    try {
      const data = await obtenerBoletaPorId(boletaId);
      setBoleta(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la boleta');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const manejarCompartirPDF = async () => {
    setGenerandoPDF(true);
    try {
      await compartirPDFBoleta(boleta);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  const manejarMarcarPagada = () => {
    Alert.alert(
      'Marcar como Pagada',
      '¿Confirmas que esta boleta ha sido pagada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await marcarBoletaPagada(boleta.id, 'Efectivo');
              Alert.alert('Éxito', 'Boleta marcada como pagada');
              cargarBoleta();
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar la boleta');
            }
          },
        },
      ]
    );
  };

  const manejarAnular = () => {
    Alert.alert(
      'Anular Boleta',
      '¿Estás seguro de anular esta boleta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Anular',
          style: 'destructive',
          onPress: async () => {
            try {
              await anularBoleta(boleta.id, 'Anulada por el usuario');
              Alert.alert('Éxito', 'Boleta anulada correctamente');
              cargarBoleta();
            } catch (error) {
              Alert.alert('Error', 'No se pudo anular la boleta');
            }
          },
        },
      ]
    );
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
      <ScrollView style={estilos.scroll}>
        <View style={estilos.header}>
          <Text style={estilos.titulo}>Boleta de Venta</Text>
          <Text style={estilos.numeroBoleta}>{boleta.numero_boleta}</Text>
          <EstadoPagoBadge estado={boleta.estado_pago} />
        </View>

        {/* Información del Cliente */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>👤 Información del Cliente</Text>
          <View style={estilos.infoFila}>
            <Text style={estilos.label}>Nombre:</Text>
            <Text style={estilos.valor}>{boleta.cliente_nombre || 'Cliente'}</Text>
          </View>
          {boleta.cliente_dni && (
            <View style={estilos.infoFila}>
              <Text style={estilos.label}>DNI:</Text>
              <Text style={estilos.valor}>{boleta.cliente_dni}</Text>
            </View>
          )}
        </View>

        {/* Fechas */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>📅 Fechas</Text>
          <View style={estilos.infoFila}>
            <Text style={estilos.label}>Fecha de Emisión:</Text>
            <Text style={estilos.valor}>{formatearFecha(boleta.fecha_emision)}</Text>
          </View>
          {boleta.fecha_pago && (
            <View style={estilos.infoFila}>
              <Text style={estilos.label}>Fecha de Pago:</Text>
              <Text style={estilos.valor}>{formatearFecha(boleta.fecha_pago)}</Text>
            </View>
          )}
        </View>

        {/* Detalles de Productos/Servicios */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>📦 Detalle</Text>
          {boleta.boleta_detalles?.map((detalle, index) => (
            <View key={index} style={estilos.detalleItem}>
              <View style={estilos.detalleHeader}>
                <Text style={estilos.detalleDescripcion}>{detalle.descripcion}</Text>
                <Text style={estilos.detalleTotal}>
                  S/ {parseFloat(detalle.subtotal).toFixed(2)}
                </Text>
              </View>
              <Text style={estilos.detalleCantidad}>
                {detalle.cantidad} x S/ {parseFloat(detalle.precio_unitario).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>💰 Totales</Text>
          <View style={estilos.totalFila}>
            <Text style={estilos.totalLabel}>Subtotal:</Text>
            <Text style={estilos.totalValor}>S/ {parseFloat(boleta.subtotal).toFixed(2)}</Text>
          </View>
          <View style={estilos.totalFila}>
            <Text style={estilos.totalLabel}>IGV (18%):</Text>
            <Text style={estilos.totalValor}>S/ {parseFloat(boleta.igv).toFixed(2)}</Text>
          </View>
          <View style={[estilos.totalFila, estilos.totalFinal]}>
            <Text style={estilos.totalLabelFinal}>TOTAL:</Text>
            <Text style={estilos.totalValorFinal}>S/ {parseFloat(boleta.total).toFixed(2)}</Text>
          </View>
          <View style={estilos.totalLetras}>
            <Text style={estilos.totalLetrasTexto}>SON: {boleta.total_letras}</Text>
          </View>
        </View>

        {boleta.observaciones && (
          <View style={estilos.card}>
            <Text style={estilos.cardTitulo}>📝 Observaciones</Text>
            <Text style={estilos.observaciones}>{boleta.observaciones}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botones de acción */}
      <View style={estilos.footer}>
        <TouchableOpacity
          style={estilos.botonPDF}
          onPress={manejarCompartirPDF}
          disabled={generandoPDF}
        >
          {generandoPDF ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>👁️ Ver PDF</Text>
          )}
        </TouchableOpacity>

        {boleta.estado_pago === 'pendiente' && (
          <>
            <TouchableOpacity
              style={estilos.botonPagar}
              onPress={manejarMarcarPagada}
            >
              <Text style={estilos.textoBoton}>✅ Marcar Pagada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botonAnular}
              onPress={manejarAnular}
            >
              <Text style={estilos.textoBoton}>❌ Anular</Text>
            </TouchableOpacity>
          </>
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
    backgroundColor: '#2563eb',
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  numeroBoleta: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detalleItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detalleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detalleDescripcion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detalleTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  detalleCantidad: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  totalValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalFinal: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  totalValorFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  totalLetras: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  totalLetrasTexto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#92400e',
  },
  observaciones: {
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
  botonPDF: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonPagar: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonAnular: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
