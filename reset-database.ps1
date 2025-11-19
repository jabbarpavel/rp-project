# Datenbank Reset Script für Windows PowerShell
# Dieses Script behebt Migrations-Konflikte durch einen kompletten Datenbank-Reset

param(
    [string]$PostgresPassword = "",
    [switch]$SkipConfirmation
)

# Funktion zum Finden von PostgreSQL psql
function Find-PostgreSQLPath {
    Write-Host "Suche PostgreSQL Installation..." -ForegroundColor Cyan
    
    # Prüfe ob psql bereits im PATH ist
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) {
        Write-Host "psql gefunden in PATH" -ForegroundColor Green
        return $psqlCmd.Source
    }
    
    # Suche in typischen PostgreSQL Installationspfaden
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\*\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\*\bin\psql.exe",
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin\psql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        # Sortiere nach Version (neueste zuerst) um PostgreSQL 18, 17, 16, etc. zu bevorzugen
        $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | 
                 Sort-Object DirectoryName -Descending | 
                 Select-Object -First 1
        if ($found) {
            Write-Host "psql gefunden: $($found.DirectoryName)" -ForegroundColor Green
            $env:PATH = "$($found.DirectoryName);$env:PATH"
            return $found.FullName
        }
    }
    
    Write-Host "PostgreSQL (psql) nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte installiere PostgreSQL oder fuege den bin Ordner zum PATH hinzu." -ForegroundColor Yellow
    Write-Host "Beispiel: C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Gray
    return $null
}

Write-Host ""
Write-Host "Kynso CRM - Datenbank Reset" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Warnung: Dieses Script loescht folgende Datenbanken:" -ForegroundColor Yellow
Write-Host "   - kynso_dev" -ForegroundColor Yellow
Write-Host "   - kynso_test" -ForegroundColor Yellow
Write-Host ""
Write-Host "Alle Daten gehen verloren." -ForegroundColor Red
Write-Host ""

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Bist du sicher? Gib 'JA' ein"
    if ($confirm -ne "JA") {
        Write-Host "Abgebrochen." -ForegroundColor Gray
        exit 0
    }
}

if (-not (Test-Path "global.json")) {
    Write-Host "Fehler: Script muss im Repository Root ausgefuehrt werden." -ForegroundColor Red
    exit 1
}

# Finde PostgreSQL
Write-Host ""
$psqlPath = Find-PostgreSQLPath
if (-not $psqlPath) {
    Write-Host "PostgreSQL muss installiert sein, um fortzufahren." -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $securePassword = Read-Host "PostgreSQL Passwort fuer postgres" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
}

Write-Host ""
Write-Host "Schritt 1: Beende Verbindungen" -ForegroundColor Cyan

$env:PGPASSWORD = $PostgresPassword

$null = & psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'kynso_dev' AND pid <> pg_backend_pid();" 2>&1
$null = & psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'kynso_test' AND pid <> pg_backend_pid();" 2>&1

Write-Host "Verbindungen beendet" -ForegroundColor Green

Write-Host ""
Write-Host "Schritt 2: Loesche Datenbanken" -ForegroundColor Cyan

$null = & psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kynso_dev;" 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "kynso_dev geloescht" -ForegroundColor Green } else { Write-Host "Fehler beim Loeschen von kynso_dev" -ForegroundColor Yellow }

$null = & psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kynso_test;" 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "kynso_test geloescht" -ForegroundColor Green } else { Write-Host "Fehler beim Loeschen von kynso_test" -ForegroundColor Yellow }

Write-Host ""
Write-Host "Schritt 3: Erstelle neue Datenbanken" -ForegroundColor Cyan

$null = & psql -U postgres -d postgres -c "CREATE DATABASE kynso_dev OWNER = postgres ENCODING = 'UTF8';" 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "kynso_dev erstellt" -ForegroundColor Green } else { Write-Host "Fehler beim Erstellen von kynso_dev" -ForegroundColor Red; exit 1 }

$null = & psql -U postgres -d postgres -c "CREATE DATABASE kynso_test OWNER = postgres ENCODING = 'UTF8';" 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "kynso_test erstellt" -ForegroundColor Green } else { Write-Host "Fehler beim Erstellen von kynso_test" -ForegroundColor Red; exit 1 }

$env:PGPASSWORD = ""

Write-Host ""
Write-Host "Schritt 4: Wende Migrationen an" -ForegroundColor Cyan

cd src\backend\RP.CRM.Api

Write-Host "DEV Migrationen"
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef database update --no-build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { dotnet ef database update }

Write-Host "TEST Migrationen"
$env:ASPNETCORE_ENVIRONMENT = "Test"
dotnet ef database update --no-build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { dotnet ef database update }

cd ..\..\..

Write-Host ""
Write-Host "Datenbank Reset abgeschlossen." -ForegroundColor Green
Write-Host "Backend starten: cd src\backend\RP.CRM.Api && dotnet run --launch-profile Development"
Write-Host "Frontend starten: cd src\frontend && npm start"
Write-Host "Hinweise: siehe DATENBANK_RESET_ANLEITUNG.md"
