import { supabase } from '../config/supabase.config';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Subir imagen a Supabase Storage
 */
export const subirImagen = async (imagenUri) => {
  try {
    console.log('=== INICIO SUBIDA DE IMAGEN ===');
    console.log('URI de imagen:', imagenUri);
    
    // Verificar autenticación primero
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Usuario autenticado:', user?.id);
    
    if (authError || !user) {
      console.error('Error de autenticación:', authError);
      throw new Error('Usuario no autenticado. Por favor inicia sesión nuevamente.');
    }
    
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = imagenUri.split('.').pop()?.split('?')[0] || 'jpg';
    const nombreArchivo = `${timestamp}_${random}.${extension}`;
    console.log('Nombre de archivo:', nombreArchivo);
    
    // Determinar tipo de contenido basado en extensión
    const contentType = extension === 'png' ? 'image/png' : 
                       extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
                       extension === 'webp' ? 'image/webp' : 'image/jpeg';
    console.log(`Tipo de contenido: ${contentType}`);
    
    // Leer archivo como base64 usando FileSystem
    console.log('Leyendo imagen con FileSystem...');
    const base64 = await FileSystem.readAsStringAsync(imagenUri, {
      encoding: 'base64',
    });
    
    // Verificar tamaño aproximado
    const tamanoMB = (base64.length * 0.75) / (1024 * 1024);
    console.log(`Tamaño aproximado: ${tamanoMB.toFixed(2)} MB`);
    
    if (tamanoMB > 10) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }
    
    // Convertir base64 a ArrayBuffer
    console.log('Convirtiendo base64 a ArrayBuffer...');
    const arrayBuffer = decode(base64);
    
    // Subir a Supabase Storage (bucket público)
    console.log('Subiendo a bucket "proformas"...');
    const { data, error } = await supabase.storage
      .from('proformas')
      .upload(nombreArchivo, arrayBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error de Supabase Storage:', error);
      console.error('Código de error:', error.statusCode);
      console.error('Mensaje:', error.message);
      throw new Error(error.message || 'Error al subir imagen');
    }

    console.log('Imagen subida exitosamente:', data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('proformas')
      .getPublicUrl(nombreArchivo);

    console.log('URL pública generada:', urlData.publicUrl);
    console.log('=== FIN SUBIDA EXITOSA ===');
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('=== ERROR AL SUBIR IMAGEN ===');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    throw { error: error.message || 'Error al subir imagen' };
  }
};

/**
 * Eliminar imagen de Supabase Storage
 */
export const eliminarImagen = async (url) => {
  try {
    // Extraer el nombre del archivo de la URL
    const nombreArchivo = url.split('/').pop();
    
    if (!nombreArchivo) {
      console.warn('No se pudo extraer el nombre del archivo');
      return;
    }

    const { error } = await supabase.storage
      .from('proformas')
      .remove([nombreArchivo]);

    if (error) {
      console.error('Error al eliminar imagen:', error);
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
  }
};
