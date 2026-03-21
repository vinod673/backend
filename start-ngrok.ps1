# Run this PowerShell script to start ngrok for both frontend and backend

# Start ngrok for frontend (port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000"

# Wait a bit
Start-Sleep -Seconds 2

# Start ngrok for backend (port 5000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5000"

Write-Host "✅ ngrok tunnels started!"
Write-Host "Frontend: Check ngrok window for HTTPS URL (port 3000)"
Write-Host "Backend: Check ngrok window for HTTPS URL (port 5000)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy the HTTPS URLs from ngrok windows"
Write-Host "2. Update backend/.env:"
Write-Host "   FRONTEND_URL=https://your-frontend.ngrok.io"
Write-Host "   BACKEND_URL=https://your-backend.ngrok.io"
Write-Host "3. Restart backend server"
