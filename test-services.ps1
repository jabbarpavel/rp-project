# Script to test if frontend and backend services are running
# Usage: .\test-services.ps1
# Usage with environment: .\test-services.ps1 -Environment Test

param(
    [string]$Environment = "Development"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 Testing Kynso CRM Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Set ports based on environment
if ($Environment -eq "Test") {
    $BackendPort = 5016
    $FrontendPort = 4300
} else {
    $BackendPort = 5015
    $FrontendPort = 4200
}

$BackendUrl = "http://localhost:$BackendPort"
$FrontendUrl = "http://localhost:$FrontendPort"

Write-Host "Environment: $Environment"
Write-Host "Backend URL: $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""

$BackendFailed = $false
$FrontendFailed = $false

# Test Backend
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host "🔧 Testing Backend..." -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        Write-Host "Response: $($response.Content)"
    }
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "Expected URL: $BackendUrl/api/health"
    Write-Host ""
    Write-Host "To start the backend:"
    if ($Environment -eq "Test") {
        Write-Host "  cd src\backend\RP.CRM.Api; dotnet run --launch-profile Test" -ForegroundColor Cyan
    } else {
        Write-Host "  cd src\backend\RP.CRM.Api; dotnet run --launch-profile Development" -ForegroundColor Cyan
    }
    $BackendFailed = $true
}
Write-Host ""

# Test Frontend
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host "🎨 Testing Frontend..." -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
        Write-Host "Accessible at: $FrontendUrl"
    }
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    Write-Host "Expected URL: $FrontendUrl"
    Write-Host ""
    Write-Host "To start the frontend:"
    if ($Environment -eq "Test") {
        Write-Host "  cd src\frontend; npm run start:test" -ForegroundColor Cyan
    } else {
        Write-Host "  cd src\frontend; npm start" -ForegroundColor Cyan
    }
    $FrontendFailed = $true
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
if (-not $BackendFailed -and -not $FrontendFailed) {
    Write-Host "✅ All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can access:"
    Write-Host "  - Frontend: $FrontendUrl"
    Write-Host "  - Backend API: $BackendUrl"
    Write-Host "  - API Docs: $BackendUrl/scalar/v1"
    exit 0
} else {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
    if ($BackendFailed) {
        Write-Host "  - Backend: Not running" -ForegroundColor Red
    }
    if ($FrontendFailed) {
        Write-Host "  - Frontend: Not running" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please start the missing services and try again."
    exit 1
}
