import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { obtenerProformas, eliminarProforma, obtenerProformaPorId } from '../servicios/proforma.servicio';
import { cerrarSesion } from '../servicios/auth.servicio';
import { generarHTMLProforma, generarPDF, compartirPDF } from '../servicios/pdf.servicio';
import { obtenerConfiguracion } from '../servicios/configuracion.servicio';
import VistaPreviaPDF from '../componentes/VistaPreviaPDF';

export default function HistorialProformasPantalla({ navigation }) {
  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [htmlVistaPrevia, setHtmlVistaPrevia] = useState('');

  useEffect(() => {
    cargarProformas();
  }, []);

  // Recargar al volver a la pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarProformas();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarProformas = async () => {
    try {
      const respuesta = await obtenerProformas();
      setProformas(respuesta.proformas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las proformas');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const refrescar = () => {
    setRefrescando(true);
    cargarProformas();
  };

  const confirmarEliminar = (id) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar esta proforma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => manejarEliminar(id)
        }
      ]
    );
  };

  const manejarEliminar = async (id) => {
    try {
      await eliminarProforma(id);
      Alert.alert('Éxito', 'Proforma eliminada');
      cargarProformas();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la proforma');
    }
  };

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await cerrarSesion();
            // La app detectará automáticamente que no hay token y mostrará el login
          }
        }
      ]
    );
  };

  const verPDF = async (proformaId) => {
    setCargando(true);
    try {
      // Obtener proforma completa con detalles
      const respuesta = await obtenerProformaPorId(proformaId);
      const proforma = respuesta.proforma;

      // Obtener configuración
      let configuracion = null;
      try {
        const configResp = await obtenerConfiguracion();
        configuracion = configResp.configuracion;
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      // Generar HTML
      const html = generarHTMLProforma(
        proforma,
        proforma.detalles,
        proforma.nombre_cliente || 'CLIENTE',
        configuracion
      );

      setHtmlVistaPrevia(html);
      setMostrarVistaPrevia(true);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cargar el PDF');
    } finally {
      setCargando(false);
    }
  };

  const compartirProforma = async (proformaId) => {
    setCargando(true);
    try {
      // Obtener proforma completa con detalles
      const respuesta = await obtenerProformaPorId(proformaId);
      const proforma = respuesta.proforma;

      // Obtener configuración
      let configuracion = null;
      try {
        const configResp = await obtenerConfiguracion();
        configuracion = configResp.configuracion;
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      // Generar PDF
      const pdfUri = await generarPDF(
        proforma,
        proforma.detalles,
        proforma.nombre_cliente || 'CLIENTE',
        configuracion
      );

      // Compartir PDF
      await compartirPDF(pdfUri, proforma.nombre_cliente || 'CLIENTE');

      Alert.alert('Éxito', 'PDF generado correctamente');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setCargando(false);
    }
  };

  const renderProforma = ({ item }) => (
    <View style={estilos.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VerProforma', { proformaId: item.id })}
      >
        <View style={estilos.cardHeader}>
          <Text style={estilos.fecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
          <Text style={estilos.total}>S/ {parseFloat(item.total).toFixed(2)}</Text>
        </View>
        {item.nombre_cliente && (
          <Text style={estilos.nombreCliente}>
            👤 {item.nombre_cliente}
          </Text>
        )}
        <Text style={estilos.id} numberOfLines={1}>
          ID: {item.id.substring(0, 8).toUpperCase()}
        </Text>
        <Text style={estilos.totalLetras} numberOfLines={2}>
          {item.total_letras}
        </Text>
      </TouchableOpacity>
      
      <View style={estilos.botonesContainer}>
        <TouchableOpacity
          style={estilos.botonVerPDF}
          onPress={() => verPDF(item.id)}
        >
          <Text style={estilos.textoBoton}>📄 Ver PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={estilos.botonCompartir}
          onPress={() => compartirProforma(item.id)}
        >
          <Text style={estilos.textoBoton}>📤 Compartir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={estilos.botonEliminar}
          onPress={() => confirmarEliminar(item.id)}
        >
          <Text style={estilos.textoBoton}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Vista Previa del PDF */}
      <VistaPreviaPDF
        visible={mostrarVistaPrevia}
        onClose={() => setMostrarVistaPrevia(false)}
        htmlContent={htmlVistaPrevia}
      />

      <View style={estilos.header}>
        <TouchableOpacity
          style={estilos.botonConfiguracion}
          onPress={() => navigation.navigate('Configuracion')}
        >
          <Text style={estilos.textoConfiguracion}>⚙️ Configuración</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={estilos.botonCerrarSesion}
          onPress={manejarCerrarSesion}
        >
          <Text style={estilos.textoCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={proformas}
        renderItem={renderProforma}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
        }
        ListEmptyComponent={
          <View style={estilos.vacio}>
            <Text style={estilos.textoVacio}>No hay proformas</Text>
            <Text style={estilos.subtextoVacio}>
              Crea tu primera proforma
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={estilos.botonFlotante}
        onPress={() => navigation.navigate('CrearProforma')}
      >
        <Text style={estilos.textoBotonFlotante}>+</Text>
      </TouchableOpacity>
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
  header: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonConfiguracion: {
    padding: 8,
  },
  textoConfiguracion: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  botonCerrarSesion: {
    padding: 8,
  },
  textoCerrarSesion: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  lista: {
    padding: 10,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fecha: {
    fontSize: 14,
    color: '#6b7280',
  },
  nombreCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  id: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 5,
  },
  totalLetras: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  botonVerPDF: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonCompartir: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vacio: {
    alignItems: 'center',
    marginTop: 100,
  },
  textoVacio: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 10,
  },
  subtextoVacio: {
    fontSize: 14,
    color: '#9ca3af',
  },
  botonFlotante: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  textoBotonFlotante: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
