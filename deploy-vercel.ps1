# Vercel Deployment Script for ArenaX Gaming
# This script deploys the frontend to Vercel

Write-Host "🚀 Starting Vercel Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    if (-not $vercelVersion) {
        throw "Vercel CLI not found"
    }
    Write-Host "✅ Vercel CLI detected: v$vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
}

# Navigate to project directory
Set-Location "c:\New folder"

# Login to Vercel (if not already logged in)
Write-Host ""
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
try {
    vercel whoami 2>$null | Out-Null
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Deploy to Vercel
Write-Host ""
Write-Host "🎯 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Project: arenax-gaming" -ForegroundColor White
Write-Host ""

# Run deployment
vercel deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 IMPORTANT NOTES:" -ForegroundColor Yellow
    Write-Host "1. Make sure to add environment variables in Vercel dashboard:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_API_URL (update to your production backend URL)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Your backend needs to be deployed separately (Railway, Render, or Heroku)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Update NEXT_PUBLIC_API_URL after deploying your backend" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Please check the error above." -ForegroundColor Red
}

Set-Location "c:\New folder"
