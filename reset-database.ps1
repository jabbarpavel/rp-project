# Datenbank Reset Script für Windows PowerShell
# Dieses Script behebt Migrations-Konflikte durch einen kompletten Datenbank-Reset

param(
    [string]$PostgresPassword = "",
    [switch]$SkipConfirmation
)

Write-Host ""
Write-Host "🔄 Kynso CRM - Datenbank Reset" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Warnung: Dieses Script wird folgende Datenbanken LÖSCHEN:" -ForegroundColor Yellow
Write-Host "   - kynso_dev" -ForegroundColor Yellow
Write-Host "   - kynso_test" -ForegroundColor Yellow
Write-Host ""
Write-Host "Alle Daten gehen verloren!" -ForegroundColor Red
Write-Host ""

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Bist du sicher? Gib 'JA' ein um fortzufahren"
    if ($confirm -ne "JA") {
        Write-Host "Abgebrochen." -ForegroundColor Gray
        exit 0
    }
}

# Prüfe ob wir im Repository-Root sind
if (-not (Test-Path "global.json")) {
    Write-Host "❌ Fehler: Bitte führe dieses Script im Repository-Root aus!" -ForegroundColor Red
    exit 1
}

# Frage nach PostgreSQL-Passwort falls nicht übergeben
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $PostgresPassword = Read-Host "PostgreSQL Passwort für user 'postgres'" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($PostgresPassword))
}

Write-Host ""
Write-Host "🔧 Schritt 1: Beende alle Datenbankverbindungen..." -ForegroundColor Cyan

$env:PGPASSWORD = $PostgresPassword

# Beende alle Verbindungen zu kynso_dev
$null = & psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'kynso_dev' AND pid != pg_backend_pid();" 2>&1
$null = & psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'kynso_test' AND pid != pg_backend_pid();" 2>&1

Write-Host "  ✅ Verbindungen beendet" -ForegroundColor Green

Write-Host ""
Write-Host "🗑️  Schritt 2: Lösche alte Datenbanken..." -ForegroundColor Cyan

# Lösche Datenbanken
$null = & psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kynso_dev;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ kynso_dev gelöscht" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler beim Löschen von kynso_dev (möglicherweise existiert sie nicht)" -ForegroundColor Yellow
}

$null = & psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kynso_test;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ kynso_test gelöscht" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler beim Löschen von kynso_test (möglicherweise existiert sie nicht)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🆕 Schritt 3: Erstelle neue Datenbanken..." -ForegroundColor Cyan

# Erstelle kynso_dev
$null = & psql -U postgres -d postgres -c "CREATE DATABASE kynso_dev OWNER = postgres ENCODING = 'UTF8';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ kynso_dev erstellt" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fehler beim Erstellen von kynso_dev" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

# Erstelle kynso_test
$null = & psql -U postgres -d postgres -c "CREATE DATABASE kynso_test OWNER = postgres ENCODING = 'UTF8';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ kynso_test erstellt" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fehler beim Erstellen von kynso_test" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

$env:PGPASSWORD = ""

Write-Host ""
Write-Host "🔄 Schritt 4: Wende Entity Framework Migrationen an..." -ForegroundColor Cyan

cd src\backend\RP.CRM.Api

# Development Migrationen
Write-Host "  📦 Wende DEV Migrationen an..." -ForegroundColor Gray
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef database update --no-build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ DEV Migrationen erfolgreich angewendet!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler bei DEV Migrationen - versuche mit Build..." -ForegroundColor Yellow
    dotnet ef database update
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ DEV Migrationen erfolgreich angewendet!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler bei DEV Migrationen" -ForegroundColor Red
    }
}

# Test Migrationen
Write-Host "  📦 Wende TEST Migrationen an..." -ForegroundColor Gray
$env:ASPNETCORE_ENVIRONMENT = "Test"
dotnet ef database update --no-build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ TEST Migrationen erfolgreich angewendet!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehler bei TEST Migrationen - versuche mit Build..." -ForegroundColor Yellow
    dotnet ef database update
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ TEST Migrationen erfolgreich angewendet!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler bei TEST Migrationen" -ForegroundColor Red
    }
}

cd ..\..\..

Write-Host ""
Write-Host "✅ Datenbank Reset abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Starte Backend: cd src\backend\RP.CRM.Api && dotnet run --launch-profile Development" -ForegroundColor White
Write-Host "  2. Starte Frontend: cd src\frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "💡 Bei weiteren Problemen siehe DATENBANK_RESET_ANLEITUNG.md" -ForegroundColor Gray
Write-Host ""
