import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import './Pages.css';

function Proformas() {
  const [proformas, setProformas] = useState([]);
  const [proformasFiltradas, setProformasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarProformas();
  }, []);

  const cargarProformas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('proformas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProformas(data || []);
      setProformasFiltradas(data || []);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cargar proformas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarProformas = (termino) => {
    setBusqueda(termino);
    
    if (!termino.trim()) {
      setProformasFiltradas(proformas);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtradas = proformas.filter(p => 
      (p.nombre_cliente && p.nombre_cliente.toLowerCase().includes(terminoLower)) ||
      (p.numero_proforma && p.numero_proforma.toLowerCase().includes(terminoLower)) ||
      (p.estado && p.estado.toLowerCase().includes(terminoLower))
    );
    
    setProformasFiltradas(filtradas);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('proformas')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;
      alert(`✅ Estado cambiado a: ${nuevoEstado}`);
      cargarProformas();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cambiar estado');
    }
  };

  const eliminarProforma = async (id) => {
    if (!window.confirm('¿Eliminar esta proforma?')) return;

    try {
      const { error } = await supabase
        .from('proformas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Proforma eliminada');
      cargarProformas();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>📄 Mis Proformas</h1>
        </div>

        {/* Buscador */}
        <div className="search-container" style={{marginBottom: '24px'}}>
          <input
            type="text"
            placeholder="🔍 Buscar por cliente, número de proforma o estado..."
            value={busqueda}
            onChange={(e) => filtrarProformas(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {busqueda && (
            <p style={{marginTop: '8px', color: '#6b7280', fontSize: '14px'}}>
              Mostrando {proformasFiltradas.length} de {proformas.length} proformas
            </p>
          )}
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : proformas.length === 0 ? (
          <div className="empty-state">
            <p>No tienes proformas aún</p>
          </div>
        ) : proformasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron proformas con "{busqueda}"</p>
            <button 
              onClick={() => filtrarProformas('')}
              className="btn btn-secondary"
              style={{marginTop: '16px'}}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Proforma</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proformasFiltradas.map((proforma) => (
                  <tr key={proforma.id}>
                    <td>{proforma.numero_proforma || 'N/A'}</td>
                    <td>{proforma.nombre_cliente || 'Sin cliente'}</td>
                    <td>{new Date(proforma.fecha).toLocaleDateString()}</td>
                    <td>S/ {proforma.total.toFixed(2)}</td>
                    <td>
                      <select
                        value={proforma.estado || 'Pendiente'}
                        onChange={(e) => cambiarEstado(proforma.id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '2px solid #e5e7eb',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="Enviada">📤 Enviada</option>
                        <option value="Aprobada">✅ Aprobada</option>
                        <option value="Rechazada">❌ Rechazada</option>
                        <option value="Completada">🎉 Completada</option>
                      </select>
                    </td>
                    <td>
                      <a
                        href={`/ver-proforma/${proforma.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{marginRight: '8px'}}
                      >
                        👁️ Ver
                      </a>
                      <button
                        onClick={() => eliminarProforma(proforma.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Proformas;
