# Setup-Script für Windows PowerShell
# Dieses Script erstellt die Branches und Datenbanken für DEV/TEST/PRODUCTION Workflow

Write-Host "🚀 Kynso CRM - Umgebungs-Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Prüfe ob wir im Repository-Root sind
if (-not (Test-Path "global.json")) {
    Write-Host "❌ Fehler: Bitte führe dieses Script im Repository-Root aus!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Dieses Script wird:" -ForegroundColor Yellow
Write-Host "  1. DEV und TEST Branches erstellen" -ForegroundColor Yellow
Write-Host "  2. PostgreSQL Datenbanken erstellen (kynso_dev, kynso_test)" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Möchtest du fortfahren? (j/n)"
if ($continue -ne "j" -and $continue -ne "J") {
    Write-Host "Abgebrochen." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🌳 Erstelle Git Branches..." -ForegroundColor Cyan

# Prüfe aktuellen Branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  Aktueller Branch: $currentBranch" -ForegroundColor Gray

# Erstelle dev Branch falls nicht vorhanden
$devExists = git show-ref --verify --quiet refs/heads/dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✅ Erstelle dev Branch..." -ForegroundColor Green
    git checkout -b dev
    git push -u origin dev
    Write-Host "  ✅ dev Branch erstellt!" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  dev Branch existiert bereits" -ForegroundColor Gray
}

# Erstelle test Branch falls nicht vorhanden
$testExists = git show-ref --verify --quiet refs/heads/test
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✅ Erstelle test Branch..." -ForegroundColor Green
    git checkout -b test
    git push -u origin test
    Write-Host "  ✅ test Branch erstellt!" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  test Branch existiert bereits" -ForegroundColor Gray
}

# Zurück zum ursprünglichen Branch
git checkout $currentBranch

Write-Host ""
Write-Host "🗄️  Erstelle PostgreSQL Datenbanken..." -ForegroundColor Cyan

# Frage nach PostgreSQL-Passwort
$pgPassword = Read-Host "Bitte gib das PostgreSQL Passwort für user 'postgres' ein"

# Erstelle kynso_dev Datenbank
Write-Host "  Erstelle kynso_dev..." -ForegroundColor Gray
$env:PGPASSWORD = $pgPassword
$result = psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='kynso_dev'" 2>&1
if ($result -match "0 rows") {
    psql -U postgres -c "CREATE DATABASE kynso_dev;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ kynso_dev Datenbank erstellt!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler beim Erstellen von kynso_dev" -ForegroundColor Red
    }
} else {
    Write-Host "  ℹ️  kynso_dev existiert bereits" -ForegroundColor Gray
}

# Erstelle kynso_test Datenbank
Write-Host "  Erstelle kynso_test..." -ForegroundColor Gray
$result = psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='kynso_test'" 2>&1
if ($result -match "0 rows") {
    psql -U postgres -c "CREATE DATABASE kynso_test;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ kynso_test Datenbank erstellt!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler beim Erstellen von kynso_test" -ForegroundColor Red
    }
} else {
    Write-Host "  ℹ️  kynso_test existiert bereits" -ForegroundColor Gray
}

$env:PGPASSWORD = ""

Write-Host ""
Write-Host "🔧 Wende Datenbank-Migrationen an..." -ForegroundColor Cyan

# Development Migrationen
Write-Host "  Wende DEV Migrationen an..." -ForegroundColor Gray
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef database update
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ DEV Migrationen angewendet!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler bei DEV Migrationen" -ForegroundColor Yellow
}

# Test Migrationen
Write-Host "  Wende TEST Migrationen an..." -ForegroundColor Gray
$env:ASPNETCORE_ENVIRONMENT = "Test"
dotnet ef database update
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ TEST Migrationen angewendet!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler bei TEST Migrationen" -ForegroundColor Yellow
}

cd ..\..\..

Write-Host ""
Write-Host "✅ Setup abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Starte Backend: cd src\backend\RP.CRM.Api && dotnet run --launch-profile Development" -ForegroundColor White
Write-Host "  2. Starte Frontend: cd src\frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "📖 Siehe WORKFLOW_ANLEITUNG.md für vollständige Dokumentation" -ForegroundColor Cyan
Write-Host ""
