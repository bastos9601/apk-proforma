import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerFacturas, obtenerEstadisticasFacturas, eliminarFactura } from '../servicios/supabase.factura.servicio';
import EstadoPagoBadge from '../componentes/EstadoPagoBadge';
import { formatearFecha } from '../utilidades/formatearFecha';

export default function HistorialFacturasPantalla({ navigation }) {
  const [facturas, setFacturas] = useState([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      const [facturasData, estadisticasData] = await Promise.all([
        obtenerFacturas(),
        obtenerEstadisticasFacturas(),
      ]);
      setFacturas(facturasData);
      setFacturasFiltradas(facturasData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las facturas');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const buscarFacturas = (texto) => {
    setTextoBusqueda(texto);
    if (texto.trim() === '') {
      setFacturasFiltradas(facturas);
      return;
    }
    
    const textoLower = texto.toLowerCase();
    const filtradas = facturas.filter(factura => 
      factura.numero_factura.toLowerCase().includes(textoLower) ||
      factura.cliente_nombre.toLowerCase().includes(textoLower) ||
      (factura.cliente_ruc && factura.cliente_ruc.includes(texto))
    );
    setFacturasFiltradas(filtradas);
  };

  const manejarRefrescar = () => {
    setRefrescando(true);
    cargarDatos();
  };

  const manejarEliminarFactura = (factura) => {
    Alert.alert(
      'Eliminar Factura',
      `¿Estás seguro de eliminar la factura ${factura.numero_factura}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarFactura(factura.id);
              Alert.alert('Éxito', 'Factura eliminada');
              cargarDatos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la factura');
            }
          },
        },
      ]
    );
  };

  const renderFactura = ({ item }) => (
    <TouchableOpacity
      style={estilos.facturaCard}
      onPress={() => navigation.navigate('DetalleFactura', { facturaId: item.id })}
    >
      <View style={estilos.facturaHeader}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.numeroFactura}>{item.numero_factura}</Text>
          <Text style={estilos.clienteNombre} numberOfLines={1}>{item.cliente_nombre}</Text>
          <Text style={estilos.fechaTexto}>{formatearFecha(item.fecha_emision)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={estilos.totalValor}>S/ {parseFloat(item.total).toFixed(2)}</Text>
          <EstadoPagoBadge estado={item.estado_pago} />
          <TouchableOpacity
            style={estilos.botonEliminar}
            onPress={(e) => {
              e.stopPropagation();
              manejarEliminarFactura(item);
            }}
          >
            <Text style={estilos.textoEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#c00000" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header con estadísticas */}
      <View style={estilos.header}>
        <Text style={estilos.titulo}>Facturas</Text>
        
        {estadisticas && (
          <View style={estilos.estadisticasContainer}>
            <View style={estilos.estadisticaCard}>
              <Text style={estilos.estadisticaNumero}>{estadisticas.total_facturas}</Text>
              <Text style={estilos.estadisticaLabel}>Total</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#fef3c7' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#f59e0b' }]}>
                {estadisticas.facturas_pendientes}
              </Text>
              <Text style={estilos.estadisticaLabel}>Pendientes</Text>
            </View>
            <View style={[estilos.estadisticaCard, { backgroundColor: '#d1fae5' }]}>
              <Text style={[estilos.estadisticaNumero, { color: '#10b981' }]}>
                {estadisticas.facturas_pagadas}
              </Text>
              <Text style={estilos.estadisticaLabel}>Pagadas</Text>
            </View>
          </View>
        )}

        {estadisticas && (
          <View style={estilos.montosContainer}>
            <View style={estilos.montoCard}>
              <Text style={estilos.montoLabel}>Por Cobrar</Text>
              <Text style={[estilos.montoValor, { color: '#f59e0b' }]}>
                S/ {parseFloat(estadisticas.total_por_cobrar || 0).toFixed(2)}
              </Text>
            </View>
            <View style={estilos.montoCard}>
              <Text style={estilos.montoLabel}>Cobrado</Text>
              <Text style={[estilos.montoValor, { color: '#10b981' }]}>
                S/ {parseFloat(estadisticas.total_cobrado || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Buscador */}
      <View style={estilos.busquedaContainer}>
        <View style={estilos.busquedaInputContainer}>
          <Text style={estilos.busquedaIcono}>🔍</Text>
          <TextInput
            style={estilos.busquedaInput}
            placeholder="Buscar por número, cliente o RUC..."
            value={textoBusqueda}
            onChangeText={buscarFacturas}
          />
          {textoBusqueda !== '' && (
            <TouchableOpacity onPress={() => buscarFacturas('')}>
              <Text style={estilos.busquedaLimpiar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de facturas */}
      <FlatList
        data={facturasFiltradas}
        renderItem={renderFactura}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefrescar}
            colors={['#c00000']}
          />
        }
        ListEmptyComponent={
          <View style={estilos.vacio}>
            <Text style={estilos.vacioIcono}>🧾</Text>
            <Text style={estilos.vacioTexto}>No hay facturas</Text>
            <Text style={estilos.vacioSubtexto}>
              {textoBusqueda ? 'No se encontraron resultados' : 'Crea facturas desde proformas aprobadas'}
            </Text>
          </View>
        }
      />
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
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  estadisticasContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  estadisticaCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  estadisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  estadisticaLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  montosContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  montoCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  montoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  montoValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lista: {
    padding: 10,
  },
  busquedaContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  busquedaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  busquedaIcono: {
    fontSize: 16,
    marginRight: 8,
  },
  busquedaInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  busquedaLimpiar: {
    fontSize: 18,
    color: '#6b7280',
    paddingHorizontal: 8,
  },
  facturaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#c00000',
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  botonEliminar: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  textoEliminar: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  numeroFactura: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c00000',
    marginBottom: 2,
  },
  clienteNombre: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 2,
  },
  fechaTexto: {
    fontSize: 11,
    color: '#9ca3af',
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c00000',
    marginBottom: 4,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  vacioIcono: {
    fontSize: 64,
    marginBottom: 15,
  },
  vacioTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  vacioSubtexto: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
