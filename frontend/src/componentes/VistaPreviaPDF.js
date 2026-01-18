import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
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

        {/* WebView con el HTML */}
        <View style={estilos.webviewContainer}>
          {htmlContent ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={estilos.webview}
              scalesPageToFit={true}
              showsVerticalScrollIndicator={true}
            />
          ) : (
            <View style={estilos.centrado}>
              <Text style={estilos.textoVacio}>No hay contenido para mostrar</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={estilos.footer}>
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
  webviewContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  webview: {
    flex: 1,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  botonCerrarFooter: {
    backgroundColor: '#ef4444',
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
