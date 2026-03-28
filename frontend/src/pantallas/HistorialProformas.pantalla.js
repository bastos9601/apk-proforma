import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { 
  obtenerProformas, 
  eliminarProforma, 
  obtenerProformaPorId, 
  obtenerProformasPorEstado, 
  obtenerEstadisticasEstados,
  buscarProformas,
  obtenerProformasPorVencer,
  obtenerProformasVencidas
} from '../servicios/supabase.proforma.servicio';
import { cerrarSesion } from '../servicios/supabase.auth.servicio';
import { generarHTMLProforma, generarPDF, compartirPDF } from '../servicios/pdf.servicio';
import { obtenerConfiguracion } from '../servicios/supabase.configuracion.servicio';
import VistaPreviaPDF from '../componentes/VistaPreviaPDF';
import EstadoBadge, { ESTADOS_CONFIG } from '../componentes/EstadoBadge';
import BusquedaAvanzada from '../componentes/BusquedaAvanzada';
import AlertaValidez from '../componentes/AlertaValidez';

export default function HistorialProformasPantalla({ navigation }) {
  const [proformas, setProformas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [htmlVistaPrevia, setHtmlVistaPrevia] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarBusquedaAvanzada, setMostrarBusquedaAvanzada] = useState(false);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [proformasPorVencer, setProformasPorVencer] = useState([]);
  const [proformasVencidas, setProformasVencidas] = useState([]);

  useEffect(() => {
    cargarProformas();
    cargarEstadisticas();
    cargarAlertas();
  }, [filtroEstado]);

  // Recargar al volver a la pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarProformas();
      cargarEstadisticas();
      cargarAlertas();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarProformas = async () => {
    try {
      const proformas = filtroEstado 
        ? await obtenerProformasPorEstado(filtroEstado)
        : await obtenerProformas();
      setProformas(proformas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las proformas');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const stats = await obtenerEstadisticasEstados();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cambiarFiltro = (estado) => {
    setFiltroEstado(estado === filtroEstado ? null : estado);
  };

  const cargarAlertas = async () => {
    try {
      const porVencer = await obtenerProformasPorVencer();
      const vencidas = await obtenerProformasVencidas();
      setProformasPorVencer(porVencer);
      setProformasVencidas(vencidas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    }
  };

  const aplicarBusquedaAvanzada = async (filtros) => {
    try {
      setCargando(true);
      setFiltrosActivos(filtros);
      const resultados = await buscarProformas(filtros);
      setProformas(resultados);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setCargando(false);
    }
  };

  const limpiarBusqueda = () => {
    setTextoBusqueda('');
    setFiltrosActivos({});
    cargarProformas();
  };

  const busquedaRapida = async (texto) => {
    setTextoBusqueda(texto);
    if (texto.trim() === '') {
      cargarProformas();
      return;
    }
    
    try {
      const resultados = await buscarProformas({ texto: texto.trim() });
      setProformas(resultados);
    } catch (error) {
      console.error('Error en búsqueda rápida:', error);
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
      const proforma = await obtenerProformaPorId(proformaId);

      // Obtener configuración
      let configuracion = null;
      try {
        configuracion = await obtenerConfiguracion();
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      // Generar HTML
      const html = generarHTMLProforma(
        proforma,
        proforma.detalle_proforma,
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
    setGenerandoPDF(true);
    try {
      console.log('Iniciando compartir proforma:', proformaId);
      
      // Obtener proforma completa con detalles
      const proforma = await obtenerProformaPorId(proformaId);
      console.log('Proforma obtenida:', proforma.id);

      // Obtener configuración
      let configuracion = null;
      try {
        configuracion = await obtenerConfiguracion();
        console.log('Configuración obtenida');
      } catch (error) {
        console.log('Usando configuración por defecto');
      }

      console.log('Generando PDF...');
      // Generar PDF
      const pdfUri = await generarPDF(
        proforma,
        proforma.detalle_proforma,
        proforma.nombre_cliente || 'CLIENTE',
        configuracion
      );
      console.log('PDF generado:', pdfUri);

      console.log('Compartiendo PDF...');
      // Compartir PDF
      await compartirPDF(pdfUri, proforma.nombre_cliente || 'CLIENTE');
      console.log('PDF compartido exitosamente');

    } catch (error) {
      console.error('Error completo al compartir:', error);
      console.error('Error stack:', error.stack);
      Alert.alert(
        'Error', 
        `No se pudo compartir el PDF: ${error.message || 'Error desconocido'}`
      );
    } finally {
      setGenerandoPDF(false);
    }
  };

  const renderProforma = ({ item }) => (
    <View style={estilos.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VerProforma', { proformaId: item.id })}
      >
        <View style={estilos.cardHeader}>
          <View style={estilos.cardHeaderLeft}>
            <Text style={estilos.fecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
            <EstadoBadge estado={item.estado || 'pendiente'} />
            {item.fecha_validez && (
              <AlertaValidez fechaValidez={item.fecha_validez} />
            )}
          </View>
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
      {/* Modal de carga para generar PDF */}
      <Modal
        visible={generandoPDF}
        transparent={true}
        animationType="fade"
      >
        <View style={estilos.modalCarga}>
          <View style={estilos.modalCargaContenido}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={estilos.modalCargaTexto}>Generando PDF...</Text>
            <Text style={estilos.modalCargaSubtexto}>Por favor espera</Text>
          </View>
        </View>
      </Modal>

      {/* Vista Previa del PDF */}
      <VistaPreviaPDF
        visible={mostrarVistaPrevia}
        onClose={() => setMostrarVistaPrevia(false)}
        htmlContent={htmlVistaPrevia}
      />

      {/* Búsqueda Avanzada */}
      <BusquedaAvanzada
        visible={mostrarBusquedaAvanzada}
        onClose={() => setMostrarBusquedaAvanzada(false)}
        onBuscar={aplicarBusquedaAvanzada}
        filtrosIniciales={filtrosActivos}
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

      {/* Alertas de validez */}
      {(proformasPorVencer.length > 0 || proformasVencidas.length > 0) && (
        <View style={estilos.alertasContainer}>
          {proformasVencidas.length > 0 && (
            <TouchableOpacity 
              style={estilos.alertaBanner}
              onPress={() => {
                Alert.alert(
                  'Proformas Vencidas',
                  `Tienes ${proformasVencidas.length} proforma${proformasVencidas.length !== 1 ? 's' : ''} vencida${proformasVencidas.length !== 1 ? 's' : ''}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={estilos.alertaBannerIcono}>⚠️</Text>
              <Text style={estilos.alertaBannerTexto}>
                {proformasVencidas.length} proforma{proformasVencidas.length !== 1 ? 's' : ''} vencida{proformasVencidas.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
          {proformasPorVencer.length > 0 && (
            <TouchableOpacity 
              style={[estilos.alertaBanner, { backgroundColor: '#fef3c7' }]}
              onPress={() => {
                Alert.alert(
                  'Proformas por Vencer',
                  `Tienes ${proformasPorVencer.length} proforma${proformasPorVencer.length !== 1 ? 's' : ''} por vencer en los próximos 3 días`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={estilos.alertaBannerIcono}>⏰</Text>
              <Text style={estilos.alertaBannerTexto}>
                {proformasPorVencer.length} proforma{proformasPorVencer.length !== 1 ? 's' : ''} por vencer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Barra de búsqueda */}
      <View style={estilos.busquedaContainer}>
        <View style={estilos.busquedaInputContainer}>
          <Text style={estilos.busquedaIcono}>🔍</Text>
          <TextInput
            style={estilos.busquedaInput}
            placeholder="Buscar por cliente, número..."
            value={textoBusqueda}
            onChangeText={busquedaRapida}
          />
          {textoBusqueda !== '' && (
            <TouchableOpacity onPress={limpiarBusqueda}>
              <Text style={estilos.busquedaLimpiar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={estilos.botonBusquedaAvanzada}
          onPress={() => setMostrarBusquedaAvanzada(true)}
        >
          <Text style={estilos.botonBusquedaAvanzadaTexto}>⚙️</Text>
        </TouchableOpacity>
      </View>

      Estadísticas
      {estadisticas && (
        <View style={estilos.estadisticasContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={estilos.estadisticaCard}>
              <Text style={estilos.estadisticaNumero}>{estadisticas.total}</Text>
              <Text style={estilos.estadisticaLabel}>Total</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#fef3c7' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#f59e0b' }]}>
                {estadisticas.pendiente}
              </Text>
              <Text style={estilos.estadisticaLabel}>Pendientes</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#dbeafe' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#3b82f6' }]}>
                {estadisticas.enviada}
              </Text>
              <Text style={estilos.estadisticaLabel}>Enviadas</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#d1fae5' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#10b981' }]}>
                {estadisticas.aprobada}
              </Text>
              <Text style={estilos.estadisticaLabel}>Aprobadas</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#ede9fe' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#8b5cf6' }]}>
                {estadisticas.facturada}
              </Text>
              <Text style={estilos.estadisticaLabel}>Facturadas</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Filtros de estado */}
      <View style={estilos.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[estilos.filtroChip, !filtroEstado && estilos.filtroChipActivo]}
            onPress={() => setFiltroEstado(null)}
          >
            <Text style={[estilos.filtroTexto, !filtroEstado && estilos.filtroTextoActivo]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          {Object.keys(ESTADOS_CONFIG).map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                estilos.filtroChip,
                filtroEstado === estado && estilos.filtroChipActivo,
                { backgroundColor: ESTADOS_CONFIG[estado].bgColor }
              ]}
              onPress={() => cambiarFiltro(estado)}
            >
              <Text style={estilos.filtroIcono}>{ESTADOS_CONFIG[estado].icon}</Text>
              <Text style={[
                estilos.filtroTexto,
                { color: ESTADOS_CONFIG[estado].color },
                filtroEstado === estado && estilos.filtroTextoActivo
              ]}>
                {ESTADOS_CONFIG[estado].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 8,
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
  modalCarga: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCargaContenido: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalCargaTexto: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCargaSubtexto: {
    marginTop: 5,
    fontSize: 14,
    color: '#6b7280',
  },
  estadisticasContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  estadisticaCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  estadisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  estadisticaLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filtroChipActivo: {
    borderColor: '#2563eb',
  },
  filtroIcono: {
    fontSize: 14,
    marginRight: 5,
  },
  filtroTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filtroTextoActivo: {
    color: '#2563eb',
  },
  alertasContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertaBannerIcono: {
    fontSize: 18,
    marginRight: 10,
  },
  alertaBannerTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  busquedaContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  busquedaInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  busquedaIcono: {
    fontSize: 16,
    marginRight: 8,
  },
  busquedaInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  busquedaLimpiar: {
    fontSize: 18,
    color: '#6b7280',
    paddingHorizontal: 8,
  },
  botonBusquedaAvanzada: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonBusquedaAvanzadaTexto: {
    fontSize: 18,
  },
});

