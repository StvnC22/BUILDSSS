@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 exit /b 1
)
if not exist .env.local (
  copy .env.example .env.local >nul
  echo Se creo .env.local en modo demo.
)
echo Iniciando Manta Cuida IA...
call npm run dev
