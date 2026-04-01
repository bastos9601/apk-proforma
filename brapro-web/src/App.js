import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './config/supabase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Proformas from './pages/Proformas';
import CrearProforma from './pages/CrearProforma';
import EditarProforma from './pages/EditarProforma';
import VerProforma from './pages/VerProforma';
import Facturas from './pages/Facturas';
import CrearFactura from './pages/CrearFactura';
import VerFactura from './pages/VerFactura';
import Boletas from './pages/Boletas';
import CrearBoleta from './pages/CrearBoleta';
import VerBoleta from './pages/VerBoleta';
import Catalogo from './pages/Catalogo';
import Configuracion from './pages/Configuracion';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!session ? <Register /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/proformas"
          element={session ? <Proformas /> : <Navigate to="/login" />}
        />
        <Route
          path="/crear-proforma"
          element={session ? <CrearProforma /> : <Navigate to="/login" />}
        />
        <Route
          path="/editar-proforma/:id"
          element={session ? <EditarProforma /> : <Navigate to="/login" />}
        />
        <Route
          path="/ver-proforma/:id"
          element={session ? <VerProforma /> : <Navigate to="/login" />}
        />
        <Route
          path="/catalogo"
          element={session ? <Catalogo /> : <Navigate to="/login" />}
        />
        <Route
          path="/configuracion"
          element={session ? <Configuracion /> : <Navigate to="/login" />}
        />
        <Route
          path="/facturas"
          element={session ? <Facturas /> : <Navigate to="/login" />}
        />
        <Route
          path="/crear-factura/:proformaId"
          element={session ? <CrearFactura /> : <Navigate to="/login" />}
        />
        <Route
          path="/ver-factura/:id"
          element={session ? <VerFactura /> : <Navigate to="/login" />}
        />
        <Route
          path="/boletas"
          element={session ? <Boletas /> : <Navigate to="/login" />}
        />
        <Route
          path="/crear-boleta/:proformaId"
          element={session ? <CrearBoleta /> : <Navigate to="/login" />}
        />
        <Route
          path="/ver-boleta/:id"
          element={session ? <VerBoleta /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
