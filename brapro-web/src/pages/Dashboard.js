import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProformas: 0,
    totalProductos: 0,
    pendientes: 0,
    aprobadas: 0,
    usuario: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Contar proformas
      const { count: proformasCount } = await supabase
        .from('proformas')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id);

      // Contar productos del catálogo
      const { count: productosCount } = await supabase
        .from('catalogo_productos')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id);

      // Contar proformas pendientes
      const { count: pendientesCount } = await supabase
        .from('proformas')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('estado', 'pendiente');

      // Contar proformas aprobadas
      const { count: aprobadasCount } = await supabase
        .from('proformas')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('estado', 'aprobada');

      setStats({
        totalProformas: proformasCount || 0,
        totalProductos: productosCount || 0,
        pendientes: pendientesCount || 0,
        aprobadas: aprobadasCount || 0,
        usuario: user.email
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="container dashboard-container">
        <div className="dashboard-header">
          <h1>Bienvenido a BRAPRO</h1>
          <p className="user-email">{stats.usuario}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>{stats.totalProformas}</h3>
              <p>Proformas Creadas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendientes}</h3>
              <p>Pendientes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.aprobadas}</h3>
              <p>Aprobadas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalProductos}</h3>
              <p>Productos en Catálogo</p>
            </div>
          </div>
        </div>

        <div className="actions-grid">
          <Link to="/crear-proforma" className="action-card action-card-primary">
            <div className="action-icon">➕</div>
            <h3>Nueva Proforma</h3>
            <p>Crear una nueva proforma</p>
          </Link>

          <Link to="/proformas" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Ver Proformas</h3>
            <p>Gestionar proformas existentes</p>
          </Link>

          <Link to="/catalogo" className="action-card">
            <div className="action-icon">🛍️</div>
            <h3>Catálogo</h3>
            <p>Administrar productos</p>
          </Link>

          <Link to="/configuracion" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Configuración</h3>
            <p>Ajustes de la empresa</p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
