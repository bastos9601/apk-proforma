import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';

export default function BusquedaAvanzada({ visible, onClose, onBuscar, filtrosIniciales = {} }) {
  const [texto, setTexto] = useState(filtrosIniciales.texto || '');
  const [estado, setEstado] = useState(filtrosIniciales.estado || '');
  const [fechaDesde, setFechaDesde] = useState(filtrosIniciales.fechaDesde || '');
  const [fechaHasta, setFechaHasta] = useState(filtrosIniciales.fechaHasta || '');
  const [montoMin, setMontoMin] = useState(filtrosIniciales.montoMin || '');
  const [montoMax, setMontoMax] = useState(filtrosIniciales.montoMax || '');
  const [ordenCampo, setOrdenCampo] = useState(filtrosIniciales.ordenCampo || 'created_at');
  const [ordenDireccion, setOrdenDireccion] = useState(filtrosIniciales.ordenDireccion || 'desc');

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'enviada', label: 'Enviada' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
    { value: 'facturada', label: 'Facturada' },
  ];

  const ordenamientos = [
    { campo: 'created_at', label: 'Fecha de creación' },
    { campo: 'fecha', label: 'Fecha de proforma' },
    { campo: 'total', label: 'Monto' },
    { campo: 'nombre_cliente', label: 'Cliente' },
    { campo: 'fecha_validez', label: 'Fecha de validez' },
  ];

  const aplicarFiltros = () => {
    const filtros = {
      texto: texto.trim(),
      estado: estado || null,
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      montoMin: montoMin ? parseFloat(montoMin) : null,
      montoMax: montoMax ? parseFloat(montoMax) : null,
      ordenCampo,
      ordenDireccion,
    };
    onBuscar(filtros);
    onClose();
  };

  const limpiarFiltros = () => {
    setTexto('');
    setEstado('');
    setFechaDesde('');
    setFechaHasta('');
    setMontoMin('');
    setMontoMax('');
    setOrdenCampo('created_at');
    setOrdenDireccion('desc');
  };

  const establecerRangoFecha = (tipo) => {
    const hoy = new Date();
    let desde = new Date();
    
    switch (tipo) {
      case 'hoy':
        desde = hoy;
        break;
      case 'semana':
        desde.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        desde.setMonth(hoy.getMonth() - 1);
        break;
      case 'trimestre':
        desde.setMonth(hoy.getMonth() - 3);
        break;
    }
    
    setFechaDesde(desde.toISOString().split('T')[0]);
    setFechaHasta(hoy.toISOString().split('T')[0]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={estilos.overlay}>
        <View style={estilos.contenedor}>
          <View style={estilos.header}>
            <Text style={estilos.titulo}>Búsqueda Avanzada</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={estilos.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={estilos.scroll}>
            {/* Búsqueda por texto */}
            <View style={estilos.seccion}>
              <Text style={estilos.label}>Buscar por texto</Text>
              <TextInput
                style={estilos.input}
                placeholder="Cliente, número, descripción..."
                value={texto}
                onChangeText={setTexto}
              />
            </View>

            {/* Filtro por estado */}
            <View style={estilos.seccion}>
              <Text style={estilos.label}>Estado</Text>
              <View style={estilos.chipsContainer}>
                {estados.map((est) => (
                  <TouchableOpacity
                    key={est.value}
                    style={[
                      estilos.chip,
                      estado === est.value && estilos.chipActivo
                    ]}
                    onPress={() => setEstado(est.value)}
                  >
                    <Text style={[
                      estilos.chipTexto,
                      estado === est.value && estilos.chipTextoActivo
                    ]}>
                      {est.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rango de fechas */}
            <View style={estilos.seccion}>
              <Text style={estilos.label}>Rango de fechas</Text>
              <View style={estilos.chipsContainer}>
                <TouchableOpacity
                  style={estilos.chipPequeno}
                  onPress={() => establecerRangoFecha('hoy')}
                >
                  <Text style={estilos.chipTexto}>Hoy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.chipPequeno}
                  onPress={() => establecerRangoFecha('semana')}
                >
                  <Text style={estilos.chipTexto}>7 días</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.chipPequeno}
                  onPress={() => establecerRangoFecha('mes')}
                >
                  <Text style={estilos.chipTexto}>30 días</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.chipPequeno}
                  onPress={() => establecerRangoFecha('trimestre')}
                >
                  <Text style={estilos.chipTexto}>3 meses</Text>
                </TouchableOpacity>
              </View>
              <View style={estilos.rangoFechas}>
                <View style={estilos.rangoItem}>
                  <Text style={estilos.labelPequeno}>Desde</Text>
                  <TextInput
                    style={estilos.inputPequeno}
                    placeholder="YYYY-MM-DD"
                    value={fechaDesde}
                    onChangeText={setFechaDesde}
                  />
                </View>
                <View style={estilos.rangoItem}>
                  <Text style={estilos.labelPequeno}>Hasta</Text>
                  <TextInput
                    style={estilos.inputPequeno}
                    placeholder="YYYY-MM-DD"
                    value={fechaHasta}
                    onChangeText={setFechaHasta}
                  />
                </View>
              </View>
            </View>

            {/* Rango de montos */}
            <View style={estilos.seccion}>
              <Text style={estilos.label}>Rango de montos (S/)</Text>
              <View style={estilos.rangoFechas}>
                <View style={estilos.rangoItem}>
                  <Text style={estilos.labelPequeno}>Mínimo</Text>
                  <TextInput
                    style={estilos.inputPequeno}
                    placeholder="0.00"
                    value={montoMin}
                    onChangeText={setMontoMin}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={estilos.rangoItem}>
                  <Text style={estilos.labelPequeno}>Máximo</Text>
                  <TextInput
                    style={estilos.inputPequeno}
                    placeholder="9999.99"
                    value={montoMax}
                    onChangeText={setMontoMax}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Ordenamiento */}
            <View style={estilos.seccion}>
              <Text style={estilos.label}>Ordenar por</Text>
              <View style={estilos.chipsContainer}>
                {ordenamientos.map((ord) => (
                  <TouchableOpacity
                    key={ord.campo}
                    style={[
                      estilos.chip,
                      ordenCampo === ord.campo && estilos.chipActivo
                    ]}
                    onPress={() => setOrdenCampo(ord.campo)}
                  >
                    <Text style={[
                      estilos.chipTexto,
                      ordenCampo === ord.campo && estilos.chipTextoActivo
                    ]}>
                      {ord.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={estilos.direccionContainer}>
                <TouchableOpacity
                  style={[
                    estilos.direccionBoton,
                    ordenDireccion === 'desc' && estilos.direccionBotonActivo
                  ]}
                  onPress={() => setOrdenDireccion('desc')}
                >
                  <Text style={estilos.direccionTexto}>↓ Descendente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    estilos.direccionBoton,
                    ordenDireccion === 'asc' && estilos.direccionBotonActivo
                  ]}
                  onPress={() => setOrdenDireccion('asc')}
                >
                  <Text style={estilos.direccionTexto}>↑ Ascendente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={estilos.footer}>
            <TouchableOpacity
              style={estilos.botonLimpiar}
              onPress={limpiarFiltros}
            >
              <Text style={estilos.textoBotonLimpiar}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.botonAplicar}
              onPress={aplicarFiltros}
            >
              <Text style={estilos.textoBotonAplicar}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  contenedor: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cerrar: {
    fontSize: 24,
    color: '#6b7280',
  },
  scroll: {
    padding: 20,
  },
  seccion: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  labelPequeno: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  inputPequeno: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipActivo: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  chipTexto: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: '#2563eb',
  },
  chipPequeno: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
  },
  rangoFechas: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  rangoItem: {
    flex: 1,
  },
  direccionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  direccionBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  direccionBotonActivo: {
    backgroundColor: '#dbeafe',
  },
  direccionTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  botonLimpiar: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  textoBotonLimpiar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  botonAplicar: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  textoBotonAplicar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
