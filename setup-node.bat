@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado o no esta agregado al PATH.
  echo Descarga la version LTS desde https://nodejs.org
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm no esta disponible.
  pause
  exit /b 1
)
echo Node.js:
node -v
echo npm:
npm -v
echo.
echo Entorno listo. Ejecuta iniciar.bat.
pause
