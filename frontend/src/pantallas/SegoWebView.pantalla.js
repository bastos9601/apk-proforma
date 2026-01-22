import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  Image,
  Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { obtenerConfiguracion } from '../servicios/configuracion.servicio';

const SegoWebViewPantalla = ({ navigation, route }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  const [tipoCambio, setTipoCambio] = useState(3.80); // Valor por defecto
  const [productosAgregados, setProductosAgregados] = useState(0); // Contador de productos agregados

  // Callback para agregar producto a la proforma (viene de CrearProforma)
  const { onAgregarProducto } = route.params || {};

  // Cargar tipo de cambio de la configuración
  useEffect(() => {
    cargarTipoCambio();
  }, []);

  const cargarTipoCambio = async () => {
    try {
      const respuesta = await obtenerConfiguracion();
      const config = respuesta.configuracion;
      if (config.tipo_cambio) {
        setTipoCambio(parseFloat(config.tipo_cambio));
        console.log('Tipo de cambio cargado:', config.tipo_cambio);
      }
    } catch (error) {
      console.log('Usando tipo de cambio por defecto: 3.80');
    }
  };

  // Script para inyectar en la página de Sego
  const injectedJavaScript = `
    (function() {
      // Función para extraer productos de la página de búsqueda
      function extraerProductos() {
        const productos = [];
        const items = document.querySelectorAll('.tp-product-item');
        
        items.forEach((item, index) => {
          try {
            const nombre = item.querySelector('.tp-product-title a, h6 a')?.textContent.trim() || '';
            const textoCompleto = item.textContent;
            
            // SKU
            const skuMatch = textoCompleto.match(/SKU:\\s*([A-Z0-9\\-]+)/i);
            const sku = skuMatch ? skuMatch[1] : '';
            
            // Precio - buscar "Precio con IGV: $ XX.XX"
            let precio = null;
            const matchIGV = textoCompleto.match(/Precio con IGV[:\\s]*\\$\\s*([\\d,\\.]+)/i);
            if (matchIGV) {
              precio = parseFloat(matchIGV[1].replace(/,/g, ''));
            } else {
              // Buscar cualquier precio con $
              const matches = textoCompleto.match(/\\$\\s*([\\d,\\.]+)/g);
              if (matches && matches.length > 0) {
                const precioStr = matches[matches.length - 1].replace('$', '').replace(/,/g, '').trim();
                precio = parseFloat(precioStr);
              }
            }
            
            // Descripción
            const descripcion = item.querySelector('.tp-product-description, .product-description')?.textContent.trim() || nombre;
            
            // Imagen
            const imagenEl = item.querySelector('.tp-product-image, img');
            let imagenUrl = '';
            if (imagenEl) {
              imagenUrl = imagenEl.src || imagenEl.dataset.src || '';
              if (imagenUrl && !imagenUrl.startsWith('http')) {
                imagenUrl = 'https://www.sego.com.pe' + imagenUrl;
              }
            }
            
            if (nombre && precio && precio > 0) {
              productos.push({
                id: index,
                nombre,
                descripcion,
                sku,
                precioBase: precio, // Precio en USD de Sego
                imagenUrl
              });
            }
          } catch (error) {
            console.error('Error extrayendo producto:', error);
          }
        });
        
        return productos;
      }
      
      // Detectar cuando estamos en una página de búsqueda
      if (window.location.href.includes('/shop')) {
        // Esperar a que cargue la página
        setTimeout(() => {
          const productos = extraerProductos();
          if (productos.length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              tipo: 'PRODUCTOS_ENCONTRADOS',
              productos: productos,
              cantidad: productos.length
            }));
          }
        }, 3000);
      }
      
      // Enviar URL actual
      window.ReactNativeWebView.postMessage(JSON.stringify({
        tipo: 'URL_CAMBIO',
        url: window.location.href
      }));
      
      true; // Requerido por React Native WebView
    })();
  `;

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.tipo === 'PRODUCTOS_ENCONTRADOS') {
        // Aplicar tipo de cambio y margen a los productos
        const productosConPreciosSoles = data.productos.map(p => ({
          ...p,
          precioBase: p.precioBase * tipoCambio, // Convertir USD a Soles
          precioConMargen: (p.precioBase * tipoCambio) * 1.5 // Convertir y aplicar +50%
        }));
        
        setProductosDisponibles(productosConPreciosSoles);
        // Mostrar automáticamente la lista de productos
        setMostrarListaProductos(true);
      } else if (data.tipo === 'URL_CAMBIO') {
        setCurrentUrl(data.url);
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  };

  const seleccionarProducto = (producto) => {
    const precioUSD = producto.precioBase / tipoCambio; // Calcular precio original en USD
    
    Alert.alert(
      'Agregar a Proforma',
      `${producto.nombre}\n\nPrecio Sego (USD): $ ${precioUSD.toFixed(2)}\nTipo de Cambio: S/ ${tipoCambio.toFixed(2)}\nPrecio en Soles: S/ ${producto.precioBase.toFixed(2)}\nPrecio de Venta (+50%): S/ ${producto.precioConMargen.toFixed(2)}\n\n¿Agregar este producto a la proforma?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: () => {
            if (onAgregarProducto) {
              // Enviar producto a CrearProforma
              onAgregarProducto({
                descripcion: producto.descripcion,
                precio: producto.precioConMargen,
                imagenUri: producto.imagenUrl,
                nombre: producto.nombre,
                sku: producto.sku
              });
              
              // Incrementar contador local
              const nuevoContador = productosAgregados + 1;
              setProductosAgregados(nuevoContador);
              
              console.log('Producto enviado a proforma:', producto.nombre);
              console.log('Contador actualizado:', nuevoContador);
              
              // Solo cerrar el modal, NO cerrar el WebView
              setMostrarListaProductos(false);
              
              // Mostrar confirmación
              Alert.alert(
                '✓ Producto Agregado',
                `${producto.nombre} agregado a la proforma.\n\nProductos agregados: ${nuevoContador}\n\n¿Deseas agregar más productos?`,
                [
                  {
                    text: 'Volver a Proforma',
                    onPress: () => {
                      // En lugar de goBack(), usar navigate para mantener el WebView en el stack
                      navigation.navigate('CrearProforma');
                    }
                  },
                  {
                    text: 'Seguir Buscando',
                    style: 'cancel'
                  }
                ]
              );
            } else {
              Alert.alert('Error', 'No se pudo agregar el producto');
            }
          }
        }
      ]
    );
  };

  const extraerProductosManual = () => {
    if (currentUrl.includes('/shop')) {
      webViewRef.current?.injectJavaScript(`
        (function() {
          const productos = [];
          const items = document.querySelectorAll('.tp-product-item');
          
          items.forEach((item, index) => {
            try {
              const nombre = item.querySelector('.tp-product-title a, h6 a')?.textContent.trim() || '';
              const textoCompleto = item.textContent;
              
              const skuMatch = textoCompleto.match(/SKU:\\s*([A-Z0-9\\-]+)/i);
              const sku = skuMatch ? skuMatch[1] : '';
              
              let precio = null;
              const matchIGV = textoCompleto.match(/Precio con IGV[:\\s]*\\$\\s*([\\d,\\.]+)/i);
              if (matchIGV) {
                precio = parseFloat(matchIGV[1].replace(/,/g, ''));
              } else {
                const matches = textoCompleto.match(/\\$\\s*([\\d,\\.]+)/g);
                if (matches && matches.length > 0) {
                  const precioStr = matches[matches.length - 1].replace('$', '').replace(/,/g, '').trim();
                  precio = parseFloat(precioStr);
                }
              }
              
              const descripcion = item.querySelector('.tp-product-description, .product-description')?.textContent.trim() || nombre;
              
              const imagenEl = item.querySelector('.tp-product-image, img');
              let imagenUrl = '';
              if (imagenEl) {
                imagenUrl = imagenEl.src || imagenEl.dataset.src || '';
                if (imagenUrl && !imagenUrl.startsWith('http')) {
                  imagenUrl = 'https://www.sego.com.pe' + imagenUrl;
                }
              }
              
              if (nombre && precio && precio > 0) {
                productos.push({
                  id: index,
                  nombre,
                  descripcion,
                  sku,
                  precioBase: precio, // Precio en USD de Sego
                  imagenUrl
                });
              }
            } catch (error) {
              console.error('Error:', error);
            }
          });
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            tipo: 'PRODUCTOS_ENCONTRADOS',
            productos: productos,
            cantidad: productos.length
          }));
        })();
      `);
    } else {
      Alert.alert(
        'Página incorrecta',
        'Por favor, navega a una página de búsqueda de productos en Sego (https://www.sego.com.pe/shop)'
      );
    }
  };

  const renderProducto = ({ item }) => {
    const precioUSD = item.precioBase / tipoCambio;
    
    return (
      <TouchableOpacity
        style={styles.productoCard}
        onPress={() => seleccionarProducto(item)}
      >
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.productoImagen} />
        ) : (
          <View style={[styles.productoImagen, styles.productoSinImagen]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.productoSku}>SKU: {item.sku}</Text>
          <Text style={styles.productoPrecioUSD}>
            Sego: $ {precioUSD.toFixed(2)} USD
          </Text>
          <Text style={styles.productoPrecioBase}>
            En Soles: S/ {item.precioBase.toFixed(2)}
          </Text>
          <Text style={styles.productoPrecioVenta}>
            Venta (+50%): S/ {item.precioConMargen.toFixed(2)}
          </Text>
        </View>
        
        <Ionicons name="add-circle" size={32} color="#4caf50" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de navegación */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={() => webViewRef.current?.goBack()}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={canGoBack ? '#fff' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={() => webViewRef.current?.goForward()}
          disabled={!canGoForward}
        >
          <Ionicons name="arrow-forward" size={24} color={canGoForward ? '#fff' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => webViewRef.current?.reload()}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Botón para cerrar sesión */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Deseas cerrar la sesión de Sego? Tendrás que iniciar sesión de nuevo.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar Sesión',
                  style: 'destructive',
                  onPress: () => {
                    // Recargar la página de login
                    webViewRef.current?.injectJavaScript(`
                      window.location.href = 'https://www.sego.com.pe/web/logout';
                      setTimeout(() => {
                        window.location.href = 'https://www.sego.com.pe/web/login';
                      }, 1000);
                    `);
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Contador de productos agregados */}
        {productosAgregados > 0 && (
          <View style={styles.contadorBadge}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.contadorTexto}>{productosAgregados}</Text>
          </View>
        )}
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.sego.com.pe/web/login' }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        incognito={false}
        cacheEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d32f2f" />
            <Text style={styles.loadingText}>Cargando Sego...</Text>
          </View>
        )}
      />

      {/* Indicador de carga */}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#d32f2f" />
        </View>
      )}

      {/* Botón flotante "Ver Lista" */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={extraerProductosManual}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="list" size={20} color="#fff" />
          <Text style={styles.floatingButtonText}>Ver Lista</Text>
        </View>
      </TouchableOpacity>

      {/* Modal con lista de productos */}
      <Modal
        visible={mostrarListaProductos}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMostrarListaProductos(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>
              Selecciona un Producto ({productosDisponibles.length})
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMostrarListaProductos(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {productosDisponibles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No se encontraron productos con precios
              </Text>
              <Text style={styles.emptySubtext}>
                Asegúrate de haber iniciado sesión y estar en una página de búsqueda
              </Text>
            </View>
          ) : (
            <FlatList
              data={productosDisponibles}
              renderItem={renderProducto}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listaProductos}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#d32f2f',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  navButton: {
    padding: 10,
    marginHorizontal: 5
  },
  navButtonDisabled: {
    opacity: 0.3
  },
  contadorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10
  },
  contadorTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4caf50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto'
  },
  extractButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14
  },
  webview: {
    flex: 1
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  loadingBar: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#d32f2f',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1
  },
  modalCloseButton: {
    padding: 5
  },
  listaProductos: {
    padding: 10
  },
  productoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  productoImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  productoSinImagen: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productoInfo: {
    flex: 1
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  productoSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  productoPrecioUSD: {
    fontSize: 11,
    color: '#3b82f6',
    marginBottom: 2,
    fontWeight: '600'
  },
  productoPrecioBase: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  productoPrecioVenta: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20
  }
});

export default SegoWebViewPantalla;
