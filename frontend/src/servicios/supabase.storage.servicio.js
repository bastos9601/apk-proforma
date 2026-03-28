import { supabase } from '../config/supabase.config';

/**
 * Subir imagen a Supabase Storage
 */
export const subirImagen = async (imagenUri) => {
  try {
    console.log('Subiendo imagen a Supabase Storage...');
    
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = imagenUri.split('.').pop()?.split('?')[0] || 'jpg';
    const nombreArchivo = `${timestamp}_${random}.${extension}`;
    
    // Convertir URI a blob
    const respuesta = await fetch(imagenUri);
    const blob = await respuesta.blob();
    
    // Verificar tamaño
    const tamanoMB = blob.size / (1024 * 1024);
    console.log(`Tamaño de imagen: ${tamanoMB.toFixed(2)} MB`);
    
    if (tamanoMB > 10) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }
    
    // Subir a Supabase Storage (bucket público)
    const { data, error } = await supabase.storage
      .from('proformas')
      .upload(nombreArchivo, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error de Supabase Storage:', error);
      throw new Error(error.message || 'Error al subir imagen');
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('proformas')
      .getPublicUrl(nombreArchivo);

    console.log('Imagen subida exitosamente:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('Error al subir imagen:', error);
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
