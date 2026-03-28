import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calcularDiasValidez, estaVencida, estaPorVencer } from '../servicios/supabase.proforma.servicio';

export default function AlertaValidez({ fechaValidez, mostrarSiempre = false }) {
  if (!fechaValidez) return null;

  const dias = calcularDiasValidez(fechaValidez);
  const vencida = estaVencida(fechaValidez);
  const porVencer = estaPorVencer(fechaValidez);

  // Si no está vencida ni por vencer, y no se debe mostrar siempre, no mostrar nada
  if (!vencida && !porVencer && !mostrarSiempre) return null;

  let mensaje = '';
  let estilo = estilos.alertaInfo;
  let icono = '📅';

  if (vencida) {
    mensaje = `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    estilo = estilos.alertaError;
    icono = '⚠️';
  } else if (porVencer) {
    if (dias === 0) {
      mensaje = 'Vence hoy';
      estilo = estilos.alertaAdvertencia;
      icono = '⏰';
    } else {
      mensaje = `Vence en ${dias} día${dias !== 1 ? 's' : ''}`;
      estilo = estilos.alertaAdvertencia;
      icono = '⏳';
    }
  } else if (mostrarSiempre) {
    mensaje = `Válida por ${dias} día${dias !== 1 ? 's' : ''} más`;
    estilo = estilos.alertaExito;
    icono = '✅';
  }

  return (
    <View style={[estilos.alerta, estilo]}>
      <Text style={estilos.icono}>{icono}</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertaInfo: {
    backgroundColor: '#dbeafe',
  },
  alertaExito: {
    backgroundColor: '#d1fae5',
  },
  alertaAdvertencia: {
    backgroundColor: '#fef3c7',
  },
  alertaError: {
    backgroundColor: '#fee2e2',
  },
  icono: {
    fontSize: 14,
    marginRight: 6,
  },
  mensaje: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
});
