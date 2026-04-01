import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { obtenerBoletas, eliminarBoleta, obtenerEstadisticasBoletas } from '../utils/boletaService';
import './Pages.css';

function Boletas() {
  const [boletas, setBoletas] = useState([]);
  const [boletasFiltradas, setBoletasFiltradas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [boletasData, estadisticasData] = await Promise.all([
        obtenerBoletas(),
        obtenerEstadisticasBoletas(),
      ]);
      setBoletas(boletasData);
      setBoletasFiltradas(boletasData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar boletas');
    } finally {
      setLoading(false);
    }
  };

  const buscarBoletas = (texto) => {
    setBusqueda(texto);
    if (texto.trim() === '') {
      setBoletasFiltradas(boletas);
      return;
    }
    
    const textoLower = texto.toLowerCase();
    const filtradas = boletas.filter(boleta => 
      boleta.numero_boleta.toLowerCase().includes(textoLower) ||
      (boleta.cliente_nombre && boleta.cliente_nombre.toLowerCase().includes(textoLower)) ||
      (boleta.cliente_dni && boleta.cliente_dni.includes(texto))
    );
    setBoletasFiltradas(filtradas);
  };

  const manejarEliminar = async (id, numero) => {
    if (window.confirm(`¿Eliminar la boleta ${numero}?`)) {
      try {
        await eliminarBoleta(id);
        alert('Boleta eliminada');
        cargarDatos();
      } catch (error) {
        alert('Error al eliminar boleta');
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
          <h1>📄 Boletas</h1>
        </div>

        {estadisticas && (
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-number">{estadisticas.total_boletas}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box stat-warning">
              <div className="stat-number">{estadisticas.boletas_pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
            <div className="stat-box stat-success">
              <div className="stat-number">{estadisticas.boletas_pagadas}</div>
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
            placeholder="🔍 Buscar por número, cliente o DNI..."
            value={busqueda}
            onChange={(e) => buscarBoletas(e.target.value)}
            className="search-input"
          />
        </div>

        {boletasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No hay boletas</h3>
            <p>{busqueda ? 'No se encontraron resultados' : 'Crea boletas desde proformas aprobadas'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Fecha Emisión</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {boletasFiltradas.map((boleta) => {
                  const badge = getBadgeEstado(boleta.estado_pago);
                  return (
                    <tr key={boleta.id}>
                      <td><strong>{boleta.numero_boleta}</strong></td>
                      <td>{boleta.cliente_nombre || 'Cliente'}</td>
                      <td>{boleta.cliente_dni || '-'}</td>
                      <td>{formatearFecha(boleta.fecha_emision)}</td>
                      <td><strong>S/ {parseFloat(boleta.total).toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge ${badge.class}`}>{badge.text}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/ver-boleta/${boleta.id}`} className="btn-sm btn-primary">
                            Ver
                          </Link>
                          <button
                            onClick={() => manejarEliminar(boleta.id, boleta.numero_boleta)}
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

export default Boletas;
