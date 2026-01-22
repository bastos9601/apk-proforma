import React, { useState, useEffect } from 'react';
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
import { obtenerConfiguracion, actualizarConfiguracion } from '../servicios/configuracion.servicio';
import { subirImagen } from '../servicios/cloudinary.servicio';

export default function ConfiguracionPantalla({ navigation }) {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombreSistema, setNombreSistema] = useState('');
  const [representante, setRepresentante] = useState('');
  const [ruc, setRuc] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [cuentaBanco, setCuentaBanco] = useState('');
  const [cci, setCci] = useState('');
  const [tipoCambio, setTipoCambio] = useState('3.80'); // Tipo de cambio por defecto

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const respuesta = await obtenerConfiguracion();
      const config = respuesta.configuracion;
      
      setNombreEmpresa(config.nombre_empresa || '');
      setNombreSistema(config.nombre_sistema || '');
      setRepresentante(config.representante || '');
      setRuc(config.ruc || '');
      setLogoUrl(config.logo_url || null);
      setDireccion(config.direccion || '');
      setTelefono(config.telefono || '');
      setEmail(config.email || '');
      setCuentaBanco(config.cuenta_banco || '');
      setCci(config.cci || '');
      setTipoCambio(config.tipo_cambio ? config.tipo_cambio.toString() : '3.80');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la configuración');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setLogoUri(resultado.assets[0].uri);
        Alert.alert('Éxito', 'Logo seleccionado. Guarda los cambios para aplicar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el logo');
    }
  };

  const guardarCambios = async () => {
    if (!nombreEmpresa || !nombreSistema || !representante || !ruc) {
      Alert.alert('Error', 'Completa los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      let urlLogo = logoUrl;

      // Si hay un nuevo logo, subirlo
      if (logoUri) {
        urlLogo = await subirImagen(logoUri);
      }

      const datos = {
        nombre_empresa: nombreEmpresa.trim(),
        nombre_sistema: nombreSistema.trim(),
        representante: representante.trim(),
        ruc: ruc.trim(),
        logo_url: urlLogo,
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        cuenta_banco: cuentaBanco.trim(),
        cci: cci.trim(),
        tipo_cambio: parseFloat(tipoCambio) || 3.80
      };

      await actualizarConfiguracion(datos);
      
      Alert.alert('Éxito', 'Configuración guardada correctamente');
      setLogoUrl(urlLogo);
      setLogoUri(null);
    } catch (error) {
      Alert.alert('Error', error.error || 'No se pudo guardar la configuración');
    } finally {
      setGuardando(false);
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
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Logo de la Empresa</Text>
        
        <TouchableOpacity style={estilos.botonLogo} onPress={seleccionarLogo}>
          {(logoUri || logoUrl) ? (
            <Image 
              source={{ uri: logoUri || logoUrl }} 
              style={estilos.logoPreview} 
              resizeMode="contain"
            />
          ) : (
            <Text style={estilos.textoBotonLogo}>+ Seleccionar Logo</Text>
          )}
        </TouchableOpacity>
        <Text style={estilos.ayuda}>El logo aparecerá en los PDFs de las proformas</Text>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información de la Empresa</Text>
        
        <Text style={estilos.label}>Nombre de la Empresa *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: BRADATEC"
          value={nombreEmpresa}
          onChangeText={setNombreEmpresa}
        />

        <Text style={estilos.label}>Nombre del Sistema *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: BRADATEC"
          value={nombreSistema}
          onChangeText={setNombreSistema}
        />

        <Text style={estilos.label}>Representante *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: ING. DAVID POLO"
          value={representante}
          onChangeText={setRepresentante}
        />

        <Text style={estilos.label}>RUC *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: 20608918371"
          value={ruc}
          onChangeText={setRuc}
          keyboardType="numeric"
        />
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Datos de Contacto</Text>
        
        <Text style={estilos.label}>Dirección</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: JIRON ZAVALA 501"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={estilos.label}>Teléfono</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: 969142875"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <Text style={estilos.label}>Email</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: bradatecsrl@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Datos Bancarios</Text>
        
        <Text style={estilos.label}>Cuenta de Ahorros</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: 480-77406530-0-76"
          value={cuentaBanco}
          onChangeText={setCuentaBanco}
        />

        <Text style={estilos.label}>CCI</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: 002-480-177406530076-25"
          value={cci}
          onChangeText={setCci}
        />
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Tipo de Cambio (USD → Soles)</Text>
        <Text style={estilos.ayuda}>
          Este tipo de cambio se usará para convertir los precios de Sego de dólares a soles
        </Text>
        
        <Text style={estilos.label}>Tipo de Cambio *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej: 3.80"
          value={tipoCambio}
          onChangeText={setTipoCambio}
          keyboardType="decimal-pad"
        />
        <Text style={estilos.ayudaSmall}>
          Ejemplo: Si el tipo de cambio es 3.80, un producto de $100 USD = S/ 380
        </Text>
      </View>

      <TouchableOpacity
        style={[estilos.botonGuardar, guardando && estilos.botonDeshabilitado]}
        onPress={guardarCambios}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={estilos.textoBoton}>Guardar Configuración</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
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
  botonLogo: {
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonLogo: {
    color: '#6b7280',
    fontSize: 16,
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  ayuda: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  ayudaSmall: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  botonGuardar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 10,
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
