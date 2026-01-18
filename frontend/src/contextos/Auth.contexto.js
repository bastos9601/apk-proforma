import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const verificarAutenticacion = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setEstaAutenticado(!!token);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setEstaAutenticado(false);
    } finally {
      setCargando(false);
    }
  };

  // Verificar al iniciar
  useEffect(() => {
    verificarAutenticacion();
  }, []);

  // Verificar cuando la app vuelve al primer plano
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        verificarAutenticacion();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const actualizarAuth = () => {
    verificarAutenticacion();
  };

  return (
    <AuthContext.Provider value={{ estaAutenticado, cargando, actualizarAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
