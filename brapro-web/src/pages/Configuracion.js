import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import Navbar from '../components/Navbar';
import './Pages.css';

function Configuracion() {
  const [config, setConfig] = useState({
    nombre_empresa: '',
    representante: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    cuenta_banco: '',
    cci: '',
    tipo_cambio: '3.80',
    logo_url: '',
    logo_bcp_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoLogoBcp, setSubiendoLogoBcp] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('configuracion')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: existente } = await supabase
        .from('configuracion')
        .select('id')
        .eq('usuario_id', user.id)
        .single();

      if (existente) {
        const { error } = await supabase
          .from('configuracion')
          .update(config)
          .eq('usuario_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracion')
          .insert([{ ...config, usuario_id: user.id }]);

        if (error) throw error;
      }

      alert('✅ Configuración guardada');
    } catch (error) {
      alert('Error al guardar configuración');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (campo, valor) => {
    setConfig({ ...config, [campo]: valor });
  };

  const subirImagen = async (archivo, tipo) => {
    try {
      const timestamp = Date.now();
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `${tipo}_${timestamp}.${extension}`;

      const { error } = await supabase.storage
        .from('proformas')
        .upload(nombreArchivo, archivo, {
          contentType: archivo.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('proformas')
        .getPublicUrl(nombreArchivo);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error al subir imagen:', err);
      throw err;
    }
  };

  const handleLogoChange = async (e, tipo) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB');
      return;
    }

    if (tipo === 'empresa') {
      setSubiendoLogo(true);
    } else {
      setSubiendoLogoBcp(true);
    }

    try {
      const url = await subirImagen(archivo, tipo);
      
      if (tipo === 'empresa') {
        handleChange('logo_url', url);
      } else {
        handleChange('logo_bcp_url', url);
      }

      alert('✅ Imagen subida exitosamente');
    } catch (error) {
      alert('Error al subir imagen');
    } finally {
      if (tipo === 'empresa') {
        setSubiendoLogo(false);
      } else {
        setSubiendoLogoBcp(false);
      }
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
      <div className="container">
        <h1>⚙️ Configuración</h1>

        <div className="card">
          <h3>Información de la Empresa</h3>
          
          <div className="input-group">
            <label>Nombre de la Empresa</label>
            <input
              type="text"
              value={config.nombre_empresa}
              onChange={(e) => handleChange('nombre_empresa', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Representante</label>
            <input
              type="text"
              value={config.representante}
              onChange={(e) => handleChange('representante', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>RUC</label>
            <input
              type="text"
              value={config.ruc}
              onChange={(e) => handleChange('ruc', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Dirección</label>
            <input
              type="text"
              value={config.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={config.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h3>Datos Bancarios</h3>
          
          <div className="input-group">
            <label>Cuenta Bancaria</label>
            <input
              type="text"
              value={config.cuenta_banco}
              onChange={(e) => handleChange('cuenta_banco', e.target.value)}
              placeholder="Ej: 480-77406530-0-76"
            />
          </div>

          <div className="input-group">
            <label>CCI (Código de Cuenta Interbancario)</label>
            <input
              type="text"
              value={config.cci}
              onChange={(e) => handleChange('cci', e.target.value)}
              placeholder="Ej: 002-480-177406530076-25"
            />
          </div>

          <div className="input-group">
            <label>Tipo de Cambio (USD a PEN)</label>
            <input
              type="number"
              step="0.01"
              value={config.tipo_cambio}
              onChange={(e) => handleChange('tipo_cambio', e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h3>Logos</h3>
          
          <div className="input-group">
            <label>Logo de la Empresa</label>
            {config.logo_url && (
              <div className="logo-preview">
                <img src={config.logo_url} alt="Logo empresa" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e, 'empresa')}
              disabled={subiendoLogo}
            />
            {subiendoLogo && <p className="upload-status">Subiendo imagen...</p>}
          </div>

          <div className="input-group">
            <label>Logo BCP</label>
            {config.logo_bcp_url && (
              <div className="logo-preview">
                <img src={config.logo_bcp_url} alt="Logo BCP" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e, 'bcp')}
              disabled={subiendoLogoBcp}
            />
            {subiendoLogoBcp && <p className="upload-status">Subiendo imagen...</p>}
          </div>
        </div>

        <div className="card">
          <button
            onClick={guardarConfiguracion}
            className="btn btn-primary"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Configuracion;
