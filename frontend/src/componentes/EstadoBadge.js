import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ESTADOS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: '⏳',
  },
  enviada: {
    label: 'Enviada',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: '📤',
  },
  aprobada: {
    label: 'Aprobada',
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: '✅',
  },
  rechazada: {
    label: 'Rechazada',
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '❌',
  },
  facturada: {
    label: 'Facturada',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    icon: '💰',
  },
};

export default function EstadoBadge({ estado, mostrarIcono = true, tipoDocumento = null }) {
  const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.pendiente;
  
  // Si el estado es "facturada" y hay tipo de documento, personalizar el label
  let label = config.label;
  if (estado === 'facturada' && tipoDocumento) {
    label = tipoDocumento === 'factura' ? 'Factura' : 'Boleta';
  }

  return (
    <View style={[estilos.badge, { backgroundColor: config.bgColor }]}>
      {mostrarIcono && <Text style={estilos.icon}>{config.icon}</Text>}
      <Text style={[estilos.texto, { color: config.color }]}>
        {label}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { ESTADOS_CONFIG };
