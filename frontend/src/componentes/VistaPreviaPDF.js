import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function VistaPreviaPDF({ visible, onClose, htmlContent }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={estilos.contenedor}>
        {/* Header */}
        <View style={estilos.header}>
          <Text style={estilos.titulo}>Vista Previa del PDF</Text>
          <TouchableOpacity onPress={onClose} style={estilos.botonCerrar}>
            <Text style={estilos.textoCerrar}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Vista previa del contenido con WebView */}
        {htmlContent ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={estilos.webview}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            // Configuración específica para Android APK
            androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
            mixedContentMode="always"
          />
        ) : (
          <View style={estilos.centrado}>
            <Text style={estilos.textoVacio}>No hay contenido para mostrar</Text>
          </View>
        )}

        {/* Footer */}
        <View style={estilos.footer}>
          <Text style={estilos.textoInfo}>
            Esta es una vista previa. El PDF final tendrá mejor calidad.
          </Text>
          <TouchableOpacity style={estilos.botonCerrarFooter} onPress={onClose}>
            <Text style={estilos.textoBotonCerrar}>Cerrar Vista Previa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 15,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  botonCerrar: {
    padding: 5,
  },
  textoCerrar: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  textoVacio: {
    fontSize: 16,
    color: '#6b7280',
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 4,
  },
  textoInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  botonCerrarFooter: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
