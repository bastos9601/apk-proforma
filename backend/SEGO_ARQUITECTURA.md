# 🏗️ Arquitectura Profesional - Integración con Sego

## 📋 Resumen

Sistema optimizado para obtener productos y precios de Sego con autenticación de distribuidor, aplicando automáticamente un margen del 50%.

## 🔄 Flujo de Datos

```
APK (Expo / React Native)
         ↓ fetch
Backend (Node.js + Playwright)
         ↓ Login distribuidor
Scraping productos con sesión
         ↓ Aplicar margen 50%
JSON seguro → APK
```

## ✅ Características Implementadas

### 1. **Seguridad**
- ✅ Credenciales en `.env` (NUNCA en el código ni en la APK)
- ✅ Variables: `SEGO_USER` y `SEGO_PASS`
- ✅ `.env` en `.gitignore`

### 2. **Optimización de Rendimiento**
- ✅ **Caché de 6 horas**: No scrapea en cada petición
- ✅ **Navegador Singleton**: Una sola instancia compartida
- ✅ **Cierre automático**: Por inactividad (30 min)
- ✅ Primera búsqueda: ~20 segundos
- ✅ Búsquedas siguientes: ~4ms (desde caché)

### 3. **Robustez**
- ✅ Manejo de errores con fallback
- ✅ Detección anti-bot deshabilitada
- ✅ Sesión persistente entre peticiones
- ✅ Limpieza automática de recursos

### 4. **Precios**
- ✅ Conversión USD → PEN (tipo de cambio 3.75)
- ✅ Margen del 50% aplicado automáticamente
- ✅ Precios estimados inteligentes como fallback
- ✅ Indicador de precio real vs estimado

## 📁 Archivos Clave

### `backend/servicios/sego-pro.servicio.js`
Servicio principal optimizado con:
- Navegador singleton
- Caché de 6 horas
- Interceptación de respuestas API
- Aplicación automática de margen

### `backend/controladores/producto.controlador.js`
Endpoint `/api/productos/buscar?q=termino` que:
- Busca en catálogo propio
- Busca en Sego con el servicio profesional
- Combina resultados
- Retorna JSON

### `backend/.env`
```env
SEGO_USER=Bradatecsrl@gmail.com
SEGO_PASS=20608918371
```

## 🚀 Uso desde la APK

```javascript
// En React Native / Expo
useEffect(() => {
  fetch('http://10.89.85.82:3000/api/productos/buscar?q=camara', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      setProductos(data.productos);
    });
}, []);
```

## 📊 Respuesta de la API

```json
{
  "mensaje": "Búsqueda completada",
  "termino": "camara",
  "cantidad": 25,
  "propios": 5,
  "sego": 20,
  "productos": [
    {
      "nombre": "CAM IP PT LENTE DUAL EXTERIOR 8MP",
      "descripcion": "...",
      "sku": "CS-H90-R100-8H44WKFL",
      "precio": 420.00,
      "precioBase": 280.00,
      "precioTexto": "S/ 420.00",
      "imagenUrl": "https://...",
      "fuente": "SEGO",
      "precioEstimado": true,
      "origen": "sego"
    }
  ]
}
```

## 🔧 Comandos Útiles

### Probar el servicio
```bash
cd backend
node test-pro.js
```

### Limpiar caché manualmente
```bash
curl http://localhost:3000/api/productos/cache/limpiar
```

### Ver logs del backend
```bash
# Los logs muestran:
# ✓ Login exitoso
# ✓ Productos obtenidos desde caché
# ✓ X productos guardados en caché
```

## 📈 Métricas de Rendimiento

| Métrica | Valor |
|---------|-------|
| Primera búsqueda | ~20 segundos |
| Búsquedas en caché | ~4ms |
| Mejora de velocidad | 99.98% |
| Duración del caché | 6 horas |
| Timeout inactividad | 30 minutos |

## 🛡️ Buenas Prácticas Implementadas

1. ✅ **No scrapear siempre**: Caché de 6 horas
2. ✅ **No abrir navegador por cada usuario**: Singleton
3. ✅ **Credenciales seguras**: Variables de entorno
4. ✅ **Manejo de cambios**: Múltiples selectores CSS
5. ✅ **Interceptación API**: Detección de endpoints JSON
6. ✅ **Limpieza de recursos**: Cierre automático

## 🔮 Mejoras Futuras

- [ ] Implementar cron job para actualizar caché cada 6 horas
- [ ] Agregar endpoint para actualizar precio de un producto específico
- [ ] Implementar rate limiting para evitar sobrecarga
- [ ] Agregar métricas y monitoreo
- [ ] Implementar sistema de notificaciones de cambios de precio

## 📞 Soporte

Si los precios no aparecen:
1. Verificar que las credenciales en `.env` sean correctas
2. Verificar que la cuenta sea de distribuidor aprobado
3. Contactar a Sego para confirmar acceso a precios
4. Los precios estimados funcionan como fallback automático

## 🎯 Fórmula de Precios

```
Precio Final = Precio Sego (con IGV) × 1.5
```

**IMPORTANTE**: Los precios en Sego ya están en SOLES, no en dólares.

Ejemplo:
- Precio Sego con IGV: S/ 98.42
- Con margen (+50%): S/ 98.42 × 1.5 = **S/ 147.63**

Otro ejemplo (Disco Duro Purple WD 1TB):
- Precio Sego con IGV: S/ 98.42
- Con margen (+50%): **S/ 147.63** ✓
