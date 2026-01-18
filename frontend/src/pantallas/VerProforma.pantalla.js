import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { obtenerProformaPorId } from '../servicios/proforma.servicio';
import { generarPDF, compartirPDF } from '../servicios/pdf.servicio';

export default function VerProformaPantalla({ route, navigation }) {
  const { proformaId } = route.params;
  const [proforma, setProforma] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    cargarProforma();
  }, []);

  const cargarProforma = async () => {
    try {
      const respuesta = await obtenerProformaPorId(proformaId);
      setProforma(respuesta.proforma);
      setDetalles(respuesta.proforma.detalles);
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
      const pdfUri = await generarPDF(proforma, detalles);
      await compartirPDF(pdfUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPdf(false);
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
      <ScrollView style={estilos.scroll}>
        <View style={estilos.header}>
          <Text style={estilos.titulo}>BRADATEC</Text>
          <Text style={estilos.subtitulo}>Proforma de Servicios</Text>
        </View>

        <View style={estilos.infoCard}>
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Fecha:</Text>
            <Text style={estilos.infoValor}>
              {new Date(proforma.fecha).toLocaleDateString()}
            </Text>
          </View>
          <View style={estilos.infoFila}>
            <Text style={estilos.infoLabel}>Proforma N°:</Text>
            <Text style={estilos.infoValor}>
              {proforma.id.substring(0, 8).toUpperCase()}
            </Text>
          </View>
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
        <TouchableOpacity
          style={[estilos.botonPdf, generandoPdf && estilos.botonDeshabilitado]}
          onPress={manejarGenerarPDF}
          disabled={generandoPdf}
        >
          {generandoPdf ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>Generar y Compartir PDF</Text>
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
  },
  botonPdf: {
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
});
