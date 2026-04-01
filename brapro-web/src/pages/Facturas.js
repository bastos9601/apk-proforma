import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerFacturas, eliminarFactura, obtenerEstadisticasFacturas } from '../utils/facturaService';
import './Pages.css';

function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

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
      console.error('Error:', error);
      alert('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const buscarFacturas = (texto) => {
    setBusqueda(texto);
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

  const manejarEliminar = async (id, numero) => {
    if (window.confirm(`¿Eliminar la factura ${numero}?`)) {
      try {
        await eliminarFactura(id);
        alert('Factura eliminada');
        cargarDatos();
      } catch (error) {
        alert('Error al eliminar factura');
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE');
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      pendiente: { text: 'Pendiente', class: 'badge-warning' },
      pagada: { text: 'Pagada', class: 'badge-success' },
      vencida: { text: 'Vencida', class: 'badge-danger' },
      anulada: { text: 'Anulada', class: 'badge-secondary' },
    };
    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Cargando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>🧾 Facturas</h1>
        </div>

        {estadisticas && (
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-number">{estadisticas.total_facturas}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box stat-warning">
              <div className="stat-number">{estadisticas.facturas_pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
            <div className="stat-box stat-success">
              <div className="stat-number">{estadisticas.facturas_pagadas}</div>
              <div className="stat-label">Pagadas</div>
            </div>
            <div className="stat-box stat-info">
              <div className="stat-number">S/ {parseFloat(estadisticas.total_por_cobrar || 0).toFixed(2)}</div>
              <div className="stat-label">Por Cobrar</div>
            </div>
          </div>
        )}

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por número, cliente o RUC..."
            value={busqueda}
            onChange={(e) => buscarFacturas(e.target.value)}
            className="search-input"
          />
        </div>

        {facturasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <h3>No hay facturas</h3>
            <p>{busqueda ? 'No se encontraron resultados' : 'Crea facturas desde proformas aprobadas'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>RUC</th>
                  <th>Fecha Emisión</th>
                  <th>Vencimiento</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.map((factura) => {
                  const badge = getBadgeEstado(factura.estado_pago);
                  return (
                    <tr key={factura.id}>
                      <td><strong>{factura.numero_factura}</strong></td>
                      <td>{factura.cliente_nombre}</td>
                      <td>{factura.cliente_ruc}</td>
                      <td>{formatearFecha(factura.fecha_emision)}</td>
                      <td>{formatearFecha(factura.fecha_vencimiento)}</td>
                      <td><strong>S/ {parseFloat(factura.total).toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge ${badge.class}`}>{badge.text}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/ver-factura/${factura.id}`} className="btn-sm btn-primary">
                            Ver
                          </Link>
                          <button
                            onClick={() => manejarEliminar(factura.id, factura.numero_factura)}
                            className="btn-sm btn-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Facturas;
