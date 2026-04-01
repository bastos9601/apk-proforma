import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/contextos/Auth.contexto';

// Pantallas
import BienvenidaPantalla from './src/pantallas/Bienvenida.pantalla';
import LoginPantalla from './src/pantallas/Login.pantalla';
import RegistroPantalla from './src/pantallas/Registro.pantalla';
import CrearProformaPantalla from './src/pantallas/CrearProforma.pantalla';
import EditarProformaPantalla from './src/pantallas/EditarProforma.pantalla';
import HistorialProformasPantalla from './src/pantallas/HistorialProformas.pantalla';
import VerProformaPantalla from './src/pantallas/VerProforma.pantalla';
import ConfiguracionPantalla from './src/pantallas/Configuracion.pantalla';
import SegoWebViewPantalla from './src/pantallas/SegoWebView.pantalla';
// Pantallas de Facturas
import CrearFacturaPantalla from './src/pantallas/CrearFactura.pantalla';
import HistorialFacturasPantalla from './src/pantallas/HistorialFacturas.pantalla';
import DetalleFacturaPantalla from './src/pantallas/DetalleFactura.pantalla';
// Pantallas de Boletas
import CrearBoletaPantalla from './src/pantallas/CrearBoleta.pantalla';
import HistorialBoletasPantalla from './src/pantallas/HistorialBoletas.pantalla';
import DetalleBoletaPantalla from './src/pantallas/DetalleBoleta.pantalla';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { estaAutenticado, cargando } = useAuth();
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);

  // Mostrar pantalla de bienvenida
  if (mostrarBienvenida) {
    return (
      <BienvenidaPantalla onFinish={() => setMostrarBienvenida(false)} />
    );
  }

  // Mostrar indicador de carga mientras se verifica autenticación
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!estaAutenticado ? (
          // Pantallas de autenticación
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginPantalla}
              options={{ title: 'Iniciar Sesión', headerShown: false }}
            />
            <Stack.Screen 
              name="Registro" 
              component={RegistroPantalla}
              options={{ title: 'Registrarse' }}
            />
          </>
        ) : (
          // Pantallas principales
          <>
            <Stack.Screen 
              name="HistorialProformas" 
              component={HistorialProformasPantalla}
              options={{ title: 'Mis Proformas' }}
            />
            <Stack.Screen 
              name="CrearProforma" 
              component={CrearProformaPantalla}
              options={{ title: 'Nueva Proforma' }}
            />
            <Stack.Screen 
              name="EditarProforma" 
              component={EditarProformaPantalla}
              options={{ title: 'Editar Proforma' }}
            />
            <Stack.Screen 
              name="VerProforma" 
              component={VerProformaPantalla}
              options={{ title: 'Ver Proforma' }}
            />
            <Stack.Screen 
              name="Configuracion" 
              component={ConfiguracionPantalla}
              options={{ title: 'Configuración' }}
            />
            <Stack.Screen 
              name="SegoWebView" 
              component={SegoWebViewPantalla}
              options={{ title: 'Navegador Sego', headerShown: false }}
            />
            {/* Pantallas de Facturas */}
            <Stack.Screen 
              name="HistorialFacturas" 
              component={HistorialFacturasPantalla}
              options={{ title: 'Mis Facturas' }}
            />
            <Stack.Screen 
              name="CrearFactura" 
              component={CrearFacturaPantalla}
              options={{ title: 'Crear Factura' }}
            />
            <Stack.Screen 
              name="DetalleFactura" 
              component={DetalleFacturaPantalla}
              options={{ title: 'Detalle de Factura' }}
            />
            {/* Pantallas de Boletas */}
            <Stack.Screen 
              name="HistorialBoletas" 
              component={HistorialBoletasPantalla}
              options={{ title: 'Mis Boletas' }}
            />
            <Stack.Screen 
              name="CrearBoleta" 
              component={CrearBoletaPantalla}
              options={{ title: 'Crear Boleta' }}
            />
            <Stack.Screen 
              name="DetalleBoleta" 
              component={DetalleBoletaPantalla}
              options={{ title: 'Detalle de Boleta' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
