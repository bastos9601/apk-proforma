import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { crearBoletaDesdeProforma } from '../servicios/supabase.boleta.servicio';
import { obtenerProformaPorId } from '../servicios/supabase.proforma.servicio';
import { formatearFecha } from '../utilidades/formatearFecha';
import { consultarDNI, validarFormatoDNI } from '../servicios/dni.servicio';

export default function CrearBoletaPantalla({ route, navigation }) {
  const { proformaId } = route.params;
  const [proforma, setProforma] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  
  // Datos de la boleta (más simples que factura)
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteDni, setClienteDni] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [consultandoDNI, setConsultandoDNI] = useState(false);

  useEffect(() => {
    cargarProforma();
  }, []);

  const cargarProforma = async () => {
    try {
      const data = await obtenerProformaPorId(proformaId);
      setProforma(data);
      setClienteNombre(data.nombre_cliente || '');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la proforma');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioDNI = (texto) => {
    setClienteDni(texto);
  };

  const consultarDNIManual = async () => {
    if (!clienteDni || clienteDni.length !== 8) {
      Alert.alert('Error', 'Ingrese un DNI válido de 8 dígitos');
      return;
    }

    if (!validarFormatoDNI(clienteDni)) {
      Alert.alert('Error', 'El formato del DNI no es válido');
      return;
    }

    setConsultandoDNI(true);
    try {
      const datos = await consultarDNI(clienteDni);
      
      if (datos.encontrado) {
        setClienteNombre(datos.nombreCompleto);
        Alert.alert(
          '✅ DNI Válido',
          'Datos cargados automáticamente desde RENIEC',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'DNI no encontrado',
          'No se encontró información en RENIEC. Ingrese el nombre manualmente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error completo:', error);
      // No mostrar alerta de error, solo permitir ingreso manual
      console.log('Consulta falló, usuario puede ingresar manualmente');
    } finally {
      setConsultandoDNI(false);
    }
  };

  const validarFormulario = () => {
    if (clienteDni && clienteDni.length !== 8) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos');
      return false;
    }
    return true;
  };

  const manejarCrearBoleta = async () => {
    if (!validarFormulario()) return;

    Alert.alert(
      'Confirmar',
      '¿Deseas crear la boleta? Esta acción cambiará el estado de la proforma a "Facturada".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear Boleta',
          onPress: async () => {
            setCreando(true);
            try {
              const datosAdicionales = {
                cliente_nombre: clienteNombre.trim() || 'Cliente',
                cliente_dni: clienteDni.trim() || null,
                observaciones: observaciones.trim() || null,
              };

              const boleta = await crearBoletaDesdeProforma(proforma, datosAdicionales);
              
              Alert.alert(
                'Éxito',
                `Boleta ${boleta.numero_boleta} creada correctamente`,
                [
                  {
                    text: 'Ver Boleta',
                    onPress: () => {
                      navigation.replace('DetalleBoleta', { boletaId: boleta.id });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo crear la boleta: ' + error.message);
            } finally {
              setCreando(false);
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
          <Text style={estilos.titulo}>Crear Boleta</Text>
          <Text style={estilos.subtitulo}>Desde Proforma {proforma.numero_proforma}</Text>
        </View>

        {/* Información de la proforma */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>📋 Datos de la Proforma</Text>
          <View style={estilos.infoFila}>
            <Text style={estilos.label}>Cliente:</Text>
            <Text style={estilos.valor}>{proforma.nombre_cliente}</Text>
          </View>
          <View style={estilos.infoFila}>
            <Text style={estilos.label}>Fecha:</Text>
            <Text style={estilos.valor}>{formatearFecha(proforma.fecha)}</Text>
          </View>
          <View style={estilos.infoFila}>
            <Text style={estilos.label}>Total (con IGV):</Text>
            <Text style={[estilos.valor, estilos.totalDestacado]}>
              S/ {parseFloat(proforma.total).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Desglose de IGV */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>💰 Desglose del Total</Text>
          <View style={estilos.desgloseFila}>
            <Text style={estilos.desgloseLabel}>Subtotal (sin IGV):</Text>
            <Text style={estilos.desgloseValor}>
              S/ {(parseFloat(proforma.total) / 1.18).toFixed(2)}
            </Text>
          </View>
          <View style={estilos.desgloseFila}>
            <Text style={estilos.desgloseLabel}>IGV (18%):</Text>
            <Text style={estilos.desgloseValor}>
              S/ {(parseFloat(proforma.total) - parseFloat(proforma.total) / 1.18).toFixed(2)}
            </Text>
          </View>
          <View style={[estilos.desgloseFila, estilos.desgloseTotal]}>
            <Text style={estilos.desgloseLabelTotal}>TOTAL:</Text>
            <Text style={estilos.desgloseValorTotal}>
              S/ {parseFloat(proforma.total).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Formulario simple para boleta */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>👤 Datos del Cliente (Opcional)</Text>
          <Text style={estilos.infoText}>
            Para boletas no es obligatorio ingresar datos del cliente
          </Text>
          
          <Text style={estilos.inputLabel}>DNI (opcional)</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <TextInput
              style={[estilos.input, { flex: 1, marginRight: 10 }]}
              placeholder="DNI de 8 dígitos (opcional)"
              value={clienteDni}
              onChangeText={manejarCambioDNI}
              keyboardType="numeric"
              maxLength={8}
              editable={!consultandoDNI}
            />
            <TouchableOpacity
              style={estilos.botonConsultar}
              onPress={consultarDNIManual}
              disabled={consultandoDNI || clienteDni.length !== 8}
            >
              {consultandoDNI ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={estilos.textoBotonConsultar}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={estilos.ayuda}>
            Ingrese el DNI y presione 🔍 para consultar automáticamente
          </Text>

          <Text style={estilos.inputLabel}>Nombre del Cliente</Text>
          <TextInput
            style={estilos.input}
            placeholder="Nombre completo (opcional)"
            value={clienteNombre}
            onChangeText={setClienteNombre}
            editable={!consultandoDNI}
          />

          <Text style={estilos.inputLabel}>Observaciones (opcional)</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilinea]}
            placeholder="Notas adicionales..."
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botones de acción */}
      <View style={estilos.footer}>
        <TouchableOpacity
          style={estilos.botonCancelar}
          onPress={() => navigation.goBack()}
          disabled={creando}
        >
          <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[estilos.botonCrear, creando && estilos.botonDeshabilitado]}
          onPress={manejarCrearBoleta}
          disabled={creando}
        >
          {creando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>🧾 Crear Boleta</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
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
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 15,
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 6,
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
  totalDestacado: {
    fontSize: 16,
    color: '#2563eb',
  },
  desgloseFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  desgloseLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  desgloseValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  desgloseTotal: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    marginTop: 5,
    borderBottomWidth: 0,
  },
  desgloseLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  desgloseValorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputMultilinea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  botonCancelar: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCrear: {
    flex: 2,
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
  ayuda: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  botonConsultar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  textoBotonConsultar: {
    fontSize: 20,
  },
});
