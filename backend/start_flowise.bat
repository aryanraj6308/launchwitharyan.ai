@echo off
cd /d "%~dp0flowise"
echo Starting Flowise (AryanForge - port 3000)...
npx flowise start --port 3000
pause