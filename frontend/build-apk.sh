#!/bin/bash

# Script para compilar APK de BRAPRO
# Uso: ./build-apk.sh [preview|production]

echo "🚀 BRAPRO - Compilador de APK"
echo "================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio frontend/"
    exit 1
fi

# Verificar que EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "📦 Instalando EAS CLI..."
    npm install -g eas-cli
fi

# Verificar login
echo "🔐 Verificando sesión de Expo..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  No has iniciado sesión en Expo"
    echo "Ejecuta: eas login"
    exit 1
fi

# Determinar perfil de build
PROFILE=${1:-preview}

if [ "$PROFILE" != "preview" ] && [ "$PROFILE" != "production" ]; then
    echo "❌ Perfil inválido. Usa: preview o production"
    exit 1
fi

echo ""
echo "📱 Compilando APK con perfil: $PROFILE"
echo ""

# Limpiar caché
echo "🧹 Limpiando caché..."
rm -rf node_modules/.cache

# Compilar
echo "🔨 Iniciando compilación..."
echo "⏱️  Esto puede tardar 10-20 minutos..."
echo ""

eas build --platform android --profile $PROFILE

echo ""
echo "✅ ¡Compilación completada!"
echo ""
echo "📥 Descarga tu APK desde el link que apareció arriba"
echo "📱 Transfiere el APK a tu celular e instálalo"
echo ""
echo "💡 Tip: Habilita 'Instalar apps desconocidas' en tu Android"
echo ""
