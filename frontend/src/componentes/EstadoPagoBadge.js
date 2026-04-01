import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Componente para mostrar el estado de pago de una factura
 */
const EstadoPagoBadge = ({ estado }) => {
  const configuracionEstados = {
    pendiente: {
      label: 'Pendiente',
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    pagada: {
      label: 'Pagada',
      icon: '✅',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    vencida: {
      label: 'Vencida',
      icon: '⚠️',
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    anulada: {
      label: 'Anulada',
      icon: '❌',
      color: '#6b7280',
      bgColor: '#f3f4f6',
    },
  };

  const config = configuracionEstados[estado] || configuracionEstados.pendiente;

  return (
    <View style={[estilos.badge, { backgroundColor: config.bgColor }]}>
      <Text style={estilos.icon}>{config.icon}</Text>
      <Text style={[estilos.texto, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default EstadoPagoBadge;
