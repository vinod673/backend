@echo off
echo Starting ngrok for Frontend (Port 3000)...
start "ngrok - Frontend (3000)" cmd /k "ngrok http 3000"

timeout /t 2 /nobreak >nul

echo Starting ngrok for Backend (Port 5000)...
start "ngrok - Backend (5000)" cmd /k "ngrok http 5000"

echo.
echo ================================================
echo ✅ Both ngrok tunnels are starting!
echo ================================================
echo.
echo You should see TWO new windows:
echo   1. "ngrok - Frontend (3000)" 
echo   2. "ngrok - Backend (5000)"
echo.
echo From each window, copy the HTTPS URL shown.
echo.
echo Then update backend\.env with those URLs.
echo ================================================
pause
