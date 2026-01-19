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
import HistorialProformasPantalla from './src/pantallas/HistorialProformas.pantalla';
import VerProformaPantalla from './src/pantallas/VerProforma.pantalla';
import ConfiguracionPantalla from './src/pantallas/Configuracion.pantalla';

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
              name="VerProforma" 
              component={VerProformaPantalla}
              options={{ title: 'Ver Proforma' }}
            />
            <Stack.Screen 
              name="Configuracion" 
              component={ConfiguracionPantalla}
              options={{ title: 'Configuración' }}
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
