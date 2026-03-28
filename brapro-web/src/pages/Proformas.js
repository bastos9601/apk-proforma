import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import './Pages.css';

function Proformas() {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar proformas');
    } finally {
      setLoading(false);
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
    } catch (error) {
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

        {loading ? (
          <p>Cargando...</p>
        ) : proformas.length === 0 ? (
          <div className="empty-state">
            <p>No tienes proformas aún</p>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proformas.map((proforma) => (
                  <tr key={proforma.id}>
                    <td>{proforma.numero_proforma || 'N/A'}</td>
                    <td>{proforma.nombre_cliente || 'Sin cliente'}</td>
                    <td>{new Date(proforma.fecha).toLocaleDateString()}</td>
                    <td>S/ {proforma.total.toFixed(2)}</td>
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
