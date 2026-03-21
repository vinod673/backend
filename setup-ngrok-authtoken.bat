@echo off
echo ================================================
echo 🔑 ngrok Account Setup Guide
echo ================================================
echo.
echo Step 1: Sign up for FREE account
echo   Open: https://dashboard.ngrok.com/signup
echo.
echo Step 2: Get your authtoken
echo   Go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo   Copy the token (long string of letters/numbers)
echo.
echo Step 3: Paste your authtoken below
echo ================================================
echo.

set /p AUTHTOKEN="Enter your ngrok authtoken: "

if "%AUTHTOKEN%"=="" (
    echo ❌ No authtoken entered!
    goto :end
)

echo.
echo Installing authtoken...
ngrok config add-authtoken %AUTHTOKEN%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Success! ngrok is now configured.
    echo.
    echo Running ngrok tunnels...
    echo.
    start "ngrok - Frontend (3000)" cmd /k "ngrok http 3000"
    timeout /t 2 /nobreak >nul
    start "ngrok - Backend (5000)" cmd /k "ngrok http 5000"
    echo.
    echo ✅ Both tunnels starting! Check the new windows.
) else (
    echo.
    echo ❌ Failed to install authtoken. Please try again.
)

:end
echo.
pause
