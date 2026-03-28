import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          BRAPRO
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            📊 Dashboard
          </Link>
          <Link to="/proformas" className="navbar-link">
            📄 Proformas
          </Link>
          <Link to="/catalogo" className="navbar-link">
            📦 Catálogo
          </Link>
          <Link to="/configuracion" className="navbar-link">
            ⚙️ Configuración
          </Link>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
