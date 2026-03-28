@echo off
REM Script para compilar APK de BRAPRO en Windows
REM Uso: build-apk.bat [preview|production]

echo ========================================
echo    BRAPRO - Compilador de APK
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: Ejecuta este script desde el directorio frontend/
    exit /b 1
)

REM Verificar que EAS CLI esta instalado
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando EAS CLI...
    call npm install -g eas-cli
)

REM Verificar login
echo Verificando sesion de Expo...
call eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo No has iniciado sesion en Expo
    echo Ejecuta: eas login
    exit /b 1
)

REM Determinar perfil de build
set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=preview

if not "%PROFILE%"=="preview" if not "%PROFILE%"=="production" (
    echo Perfil invalido. Usa: preview o production
    exit /b 1
)

echo.
echo Compilando APK con perfil: %PROFILE%
echo.

REM Limpiar cache
echo Limpiando cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

REM Compilar
echo Iniciando compilacion...
echo Esto puede tardar 10-20 minutos...
echo.

call eas build --platform android --profile %PROFILE%

echo.
echo Compilacion completada!
echo.
echo Descarga tu APK desde el link que aparecio arriba
echo Transfiere el APK a tu celular e instalalo
echo.
echo Tip: Habilita 'Instalar apps desconocidas' en tu Android
echo.

pause
