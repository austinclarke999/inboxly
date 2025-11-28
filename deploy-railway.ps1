# Inboxly - Railway Deployment Script
# This script helps you deploy to Railway step by step

Write-Host "🚀 Inboxly Railway Deployment Helper" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

Write-Host "`n📝 Deployment Steps:" -ForegroundColor Yellow
Write-Host "1. Login to Railway (opens browser)" -ForegroundColor White
Write-Host "2. Initialize project" -ForegroundColor White
Write-Host "3. Deploy API" -ForegroundColor White
Write-Host "`n"

$continue = Read-Host "Ready to start? (y/n)"

if ($continue -ne "y") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit
}

# Step 1: Login
Write-Host "`n🔐 Step 1: Logging in to Railway..." -ForegroundColor Cyan
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in successfully" -ForegroundColor Green

# Step 2: Navigate to API directory
Write-Host "`n📁 Step 2: Navigating to API directory..." -ForegroundColor Cyan
Set-Location "apps\api"

# Step 3: Initialize Railway project
Write-Host "`n🎬 Step 3: Initializing Railway project..." -ForegroundColor Cyan
Write-Host "Choose 'Create new project' when prompted" -ForegroundColor Yellow
railway init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Project initialization failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project initialized" -ForegroundColor Green

# Step 4: Deploy
Write-Host "`n🚀 Step 4: Deploying API to Railway..." -ForegroundColor Cyan
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ API deployed successfully!" -ForegroundColor Green

# Next steps
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Add Redis database (New → Database → Redis)" -ForegroundColor White
Write-Host "3. Add PostgreSQL database (New → Database → PostgreSQL)" -ForegroundColor White
Write-Host "4. Add Worker service:" -ForegroundColor White
Write-Host "   - New → Empty Service → Name it 'workers'" -ForegroundColor Gray
Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor Gray
Write-Host "   - Start Command: npm run start:worker" -ForegroundColor Gray
Write-Host "5. Set environment variables in both API and Worker services" -ForegroundColor White
Write-Host "6. Deploy frontend to Vercel:" -ForegroundColor White
Write-Host "   cd ..\web" -ForegroundColor Gray
Write-Host "   vercel" -ForegroundColor Gray
Write-Host "`n"

Write-Host "📖 Full guide: railway_vercel_deployment.md" -ForegroundColor Cyan
Write-Host "✨ Deployment complete!" -ForegroundColor Green
