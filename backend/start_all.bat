@echo off
echo ===== AryanForge - Starting All Services =====
echo.

echo [1/3] Starting Flowise (port 3000)...
start "Flowise" cmd /c "cd /d %~dp0flowise && npx flowise start --port 3000"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Backend (port 8000)...
start "Backend" cmd /c "cd /d %~dp0 && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [3/3] Starting Frontend (port 4321)...
start "Frontend" cmd /c "cd /d %~dp0..\frontend && npm run dev"

echo.
echo All services started!
echo   Flowise : http://localhost:3000
echo   Backend : http://localhost:8000
echo   Frontend: http://localhost:4321
echo.
pause