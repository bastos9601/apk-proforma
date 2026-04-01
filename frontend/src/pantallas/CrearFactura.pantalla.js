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
import { crearFacturaDesdeProforma } from '../servicios/supabase.factura.servicio';
import { obtenerProformaPorId } from '../servicios/supabase.proforma.servicio';
import { formatearFecha } from '../utilidades/formatearFecha';
import { consultarRUC, validarFormatoRUC, formatearDireccion } from '../servicios/ruc.servicio';

export default function CrearFacturaPantalla({ route, navigation }) {
  const { proformaId } = route.params;
  const [proforma, setProforma] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  
  // Datos adicionales de la factura
  const [clienteRuc, setClienteRuc] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [consultandoRUC, setConsultandoRUC] = useState(false);

  useEffect(() => {
    cargarProforma();
  }, []);

  const cargarProforma = async () => {
    try {
      const data = await obtenerProformaPorId(proformaId);
      setProforma(data);
      
      // Pre-llenar nombre del cliente desde la proforma
      setClienteNombre(data.nombre_cliente || '');
      
      // Calcular fecha de vencimiento por defecto (30 días)
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 30);
      const fechaFormato = fecha.toISOString().split('T')[0];
      setFechaVencimiento(fechaFormato);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la proforma');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioRUC = (texto) => {
    setClienteRuc(texto);
  };

  const consultarRUCManual = async () => {
    if (!clienteRuc || clienteRuc.length !== 11) {
      Alert.alert('Error', 'Ingrese un RUC válido de 11 dígitos');
      return;
    }

    if (!validarFormatoRUC(clienteRuc)) {
      Alert.alert('Error', 'El formato del RUC no es válido');
      return;
    }

    setConsultandoRUC(true);
    try {
      const datos = await consultarRUC(clienteRuc);
      
      if (datos.encontrado) {
        setClienteNombre(datos.razonSocial);
        setClienteDireccion(formatearDireccion(datos));
        
        if (!datos.valido) {
          Alert.alert(
            'Advertencia',
            `RUC encontrado pero está ${datos.estado} - ${datos.condicion}`,
            [{ text: 'Entendido' }]
          );
        } else {
          Alert.alert(
            '✅ RUC Válido',
            'Datos cargados automáticamente',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'RUC no encontrado',
          'No se encontró información. Ingrese los datos manualmente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error completo:', error);
      // No mostrar alerta de error, solo permitir ingreso manual
      console.log('Consulta falló, usuario puede ingresar manualmente');
    } finally {
      setConsultandoRUC(false);
    }
  };

  const validarFormulario = () => {
    if (!clienteRuc.trim()) {
      Alert.alert('Error', 'El RUC del cliente es obligatorio');
      return false;
    }
    if (clienteRuc.length !== 11) {
      Alert.alert('Error', 'El RUC debe tener 11 dígitos');
      return false;
    }
    if (!validarFormatoRUC(clienteRuc)) {
      Alert.alert('Error', 'El formato del RUC no es válido');
      return false;
    }
    if (!clienteNombre.trim()) {
      Alert.alert('Error', 'La razón social del cliente es obligatoria');
      return false;
    }
    if (!clienteDireccion.trim()) {
      Alert.alert('Error', 'La dirección del cliente es obligatoria');
      return false;
    }
    if (!fechaVencimiento) {
      Alert.alert('Error', 'La fecha de vencimiento es obligatoria');
      return false;
    }
    return true;
  };

  const manejarCrearFactura = async () => {
    if (!validarFormulario()) return;

    Alert.alert(
      'Confirmar',
      '¿Deseas crear la factura? Esta acción cambiará el estado de la proforma a "Facturada".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear Factura',
          onPress: async () => {
            setCreando(true);
            try {
              const datosAdicionales = {
                cliente_nombre: clienteNombre.trim(),
                cliente_ruc: clienteRuc.trim(),
                cliente_direccion: clienteDireccion.trim(),
                fecha_vencimiento: fechaVencimiento,
                observaciones: observaciones.trim() || null,
              };

              const factura = await crearFacturaDesdeProforma(proforma, datosAdicionales);
              
              Alert.alert(
                'Éxito',
                `Factura ${factura.numero_factura} creada correctamente`,
                [
                  {
                    text: 'Ver Factura',
                    onPress: () => {
                      navigation.replace('DetalleFactura', { facturaId: factura.id });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo crear la factura: ' + error.message);
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
          <Text style={estilos.titulo}>Crear Factura</Text>
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
          <Text style={estilos.cardTitulo}>💰 Desglose del Total (ya incluye IGV)</Text>
          <View style={estilos.desgloseFila}>
            <Text style={estilos.desgloseLabel}>Total de Proforma:</Text>
            <Text style={estilos.desgloseValor}>
              S/ {parseFloat(proforma.total).toFixed(2)}
            </Text>
          </View>
          <View style={[estilos.desgloseFila, { backgroundColor: '#fef3c7', marginTop: 8, padding: 8, borderRadius: 6 }]}>
            <Text style={[estilos.desgloseLabel, { fontSize: 12 }]}>Desglose en factura:</Text>
          </View>
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

        {/* Formulario de datos fiscales */}
        <View style={estilos.card}>
          <Text style={estilos.cardTitulo}>📝 Datos Fiscales del Cliente</Text>
          
          <Text style={estilos.inputLabel}>RUC *</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <TextInput
              style={[estilos.input, { flex: 1, marginRight: 10 }]}
              placeholder="Ingrese RUC (11 dígitos)"
              value={clienteRuc}
              onChangeText={manejarCambioRUC}
              keyboardType="numeric"
              maxLength={11}
              editable={!consultandoRUC}
            />
            <TouchableOpacity
              style={estilos.botonConsultar}
              onPress={consultarRUCManual}
              disabled={consultandoRUC || clienteRuc.length !== 11}
            >
              {consultandoRUC ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={estilos.textoBotonConsultar}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={estilos.ayuda}>
            Ingrese el RUC y presione 🔍 para consultar automáticamente
          </Text>

          <Text style={estilos.inputLabel}>Razón Social / Nombre *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Nombre o razón social del cliente"
            value={clienteNombre}
            onChangeText={setClienteNombre}
            editable={!consultandoRUC}
          />

          <Text style={estilos.inputLabel}>Dirección Fiscal *</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilinea]}
            placeholder="Ingrese dirección completa"
            value={clienteDireccion}
            onChangeText={setClienteDireccion}
            multiline
            numberOfLines={2}
            editable={!consultandoRUC}
          />

          <Text style={estilos.inputLabel}>Fecha de Vencimiento *</Text>
          <TextInput
            style={estilos.input}
            placeholder="YYYY-MM-DD"
            value={fechaVencimiento}
            onChangeText={setFechaVencimiento}
          />
          <Text style={estilos.ayuda}>
            Fecha actual + 30 días por defecto
          </Text>

          <Text style={estilos.inputLabel}>Observaciones (opcional)</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilinea]}
            placeholder="Condiciones de pago, notas adicionales..."
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
          onPress={manejarCrearFactura}
          disabled={creando}
        >
          {creando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>🧾 Crear Factura</Text>
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
    backgroundColor: '#c00000',
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
    color: '#c00000',
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
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    marginTop: 5,
    borderBottomWidth: 0,
  },
  desgloseLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c00000',
  },
  desgloseValorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c00000',
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
  ayuda: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
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
    backgroundColor: '#c00000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#fca5a5',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
