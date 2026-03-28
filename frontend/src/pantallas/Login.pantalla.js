import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iniciarSesion } from '../servicios/supabase.auth.servicio';
import { supabase } from '../config/supabase.config';
import { useAuth } from '../contextos/Auth.contexto';

export default function LoginPantalla({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const { actualizarAuth } = useAuth();

  useEffect(() => {
    cargarLogo();
  }, []);

  const cargarLogo = async () => {
    try {
      // Intentar obtener cualquier configuración pública (para el logo)
      const { data, error } = await supabase
        .from('configuracion')
        .select('logo_url')
        .limit(1)
        .single();
      
      if (data && data.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      // Si no hay configuración, usar logo por defecto
      console.log('Usando logo por defecto');
    }
  };

  const manejarLogin = async () => {
    if (!correo || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(correo.trim(), password);
      // Actualizar el estado de autenticación
      actualizarAuth();
    } catch (error) {
      Alert.alert('Error', error.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={estilos.contenedor}
    >
      <View style={estilos.formulario}>
        {/* Logo */}
        <View style={estilos.logoContainer}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={estilos.logo}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../assets/bradatec.png')}
              style={estilos.logo}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={estilos.subtitulo}>Sistema de Proformas</Text>

        <TextInput
          style={estilos.input}
          placeholder="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={estilos.passwordContainer}>
          <TextInput
            style={estilos.passwordInput}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!mostrarPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={estilos.eyeButton}
            onPress={() => setMostrarPassword(!mostrarPassword)}
          >
            <Ionicons
              name={mostrarPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
          onPress={manejarLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBoton}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.enlace}
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={estilos.textoEnlace}>
            ¿No tienes cuenta? <Text style={estilos.textoEnlaceDestacado}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  formulario: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 15,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  boton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#93c5fd',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enlace: {
    marginTop: 20,
    alignItems: 'center',
  },
  textoEnlace: {
    color: '#6b7280',
    fontSize: 14,
  },
  textoEnlaceDestacado: {
    color: '#2563eb',
    fontWeight: '600',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  textoSeparador: {
    marginHorizontal: 15,
    color: '#9ca3af',
    fontSize: 14,
  },
  botonRecuperar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 8,
  },
  textoBotonRecuperar: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  enlaceRecuperar: {
    marginTop: 15,
    alignItems: 'center',
  },
  textoEnlaceRecuperar: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
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
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  modalHeaderContenido: {
    alignItems: 'center',
    width: '100%',
  },
  modalIconoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  botonCerrarModal: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  modalSubtitulo: {
    fontSize: 14,
    color: '#6b7280',
  },
  indicadorProgreso: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
  },
  pasoProgreso: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  pasoProgresoActivo: {
    backgroundColor: '#2563eb',
  },
  modalBody: {
    padding: 20,
  },
  modalDescripcion: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalDescripcionSecundaria: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ilustracionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  inputConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  iconoInput: {
    marginRight: 10,
  },
  inputConIconoTexto: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  botonCancelar: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotonCancelar: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  codigoInputContainer: {
    marginBottom: 20,
  },
  inputCodigo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 10,
    paddingVertical: 20,
  },
  correoDestacadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  correoDestacado: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb',
  },
  enlaceReenviar: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoEnlaceReenviar: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  requisitosContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  requisitosLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  requisitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  requisitoTexto: {
    fontSize: 13,
    color: '#4b5563',
  },
  requisitosPassword: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
    lineHeight: 18,
  },
});
