#!/bin/bash
# Setup-Script für Linux/Mac
# Dieses Script erstellt die Branches und Datenbanken für DEV/TEST/PRODUCTION Workflow

echo "🚀 Kynso CRM - Umgebungs-Setup"
echo "================================"
echo ""

# Prüfe ob wir im Repository-Root sind
if [ ! -f "global.json" ]; then
    echo "❌ Fehler: Bitte führe dieses Script im Repository-Root aus!"
    exit 1
fi

# Funktion zum Prüfen und Installieren von dotnet-ef
ensure_dotnet_ef() {
    echo "🔍 Prüfe dotnet-ef Tool..."
    
    if dotnet tool list -g | grep -q "dotnet-ef"; then
        echo "  ✅ dotnet-ef ist bereits installiert"
        return 0
    fi
    
    echo "  📦 Installiere dotnet-ef Tool..."
    dotnet tool install --global dotnet-ef --version 8.0.11
    if [ $? -eq 0 ]; then
        echo "  ✅ dotnet-ef erfolgreich installiert!"
        return 0
    else
        echo "  ❌ Fehler bei der Installation von dotnet-ef"
        return 1
    fi
}

# Funktion zum Prüfen von PostgreSQL
check_postgresql() {
    echo "🔍 Prüfe PostgreSQL Installation..."
    
    if command -v psql &> /dev/null; then
        echo "  ✅ psql gefunden"
        return 0
    else
        echo "  ⚠️  PostgreSQL (psql) nicht gefunden!"
        echo "  📝 Bitte installiere PostgreSQL oder füge es zum PATH hinzu."
        return 1
    fi
}

echo ""
echo "🔧 Prüfe Voraussetzungen..."

# Prüfe .NET Version
DOTNET_VERSION=$(dotnet --version)
echo "  .NET SDK Version: $DOTNET_VERSION"
if [[ ! $DOTNET_VERSION =~ ^8\. ]]; then
    echo "  ⚠️  Warnung: Projekt benötigt .NET 8.0 SDK (global.json)"
fi

# Prüfe und installiere dotnet-ef
if ! ensure_dotnet_ef; then
    echo "❌ Kann nicht fortfahren ohne dotnet-ef Tool"
    exit 1
fi

# Prüfe PostgreSQL
SKIP_DATABASE=false
if ! check_postgresql; then
    read -p "Möchtest du ohne Datenbank-Setup fortfahren? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        SKIP_DATABASE=true
        echo "  ⏭️  Überspringe Datenbank-Setup"
    else
        echo "❌ Setup abgebrochen. Bitte installiere PostgreSQL zuerst."
        exit 1
    fi
fi

echo "📋 Dieses Script wird:"
echo "  1. DEV und TEST Branches erstellen"
echo "  2. PostgreSQL Datenbanken erstellen (kynso_dev, kynso_test)"
echo ""

read -p "Möchtest du fortfahren? (j/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "🌳 Erstelle Git Branches..."

# Prüfe aktuellen Branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "  Aktueller Branch: $CURRENT_BRANCH"

# Erstelle dev Branch falls nicht vorhanden
if ! git show-ref --verify --quiet refs/heads/dev; then
    echo "  ✅ Erstelle dev Branch..."
    git checkout -b dev
    git push -u origin dev
    echo "  ✅ dev Branch erstellt!"
else
    echo "  ℹ️  dev Branch existiert bereits"
fi

# Erstelle test Branch falls nicht vorhanden
if ! git show-ref --verify --quiet refs/heads/test; then
    echo "  ✅ Erstelle test Branch..."
    git checkout -b test
    git push -u origin test
    echo "  ✅ test Branch erstellt!"
else
    echo "  ℹ️  test Branch existiert bereits"
fi

# Zurück zum ursprünglichen Branch
git checkout $CURRENT_BRANCH

echo ""
if [ "$SKIP_DATABASE" = false ]; then
    echo "🗄️  Erstelle PostgreSQL Datenbanken..."

    # Frage nach PostgreSQL-Passwort
    read -sp "Bitte gib das PostgreSQL Passwort für user 'postgres' ein: " PG_PASSWORD
    echo ""

    export PGPASSWORD=$PG_PASSWORD

    # Erstelle kynso_dev Datenbank
    echo "  Erstelle kynso_dev..."
    if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw kynso_dev; then
        psql -U postgres -c "CREATE DATABASE kynso_dev;"
        if [ $? -eq 0 ]; then
            echo "  ✅ kynso_dev Datenbank erstellt!"
        else
            echo "  ❌ Fehler beim Erstellen von kynso_dev"
        fi
    else
        echo "  ℹ️  kynso_dev existiert bereits"
    fi

    # Erstelle kynso_test Datenbank
    echo "  Erstelle kynso_test..."
    if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw kynso_test; then
        psql -U postgres -c "CREATE DATABASE kynso_test;"
        if [ $? -eq 0 ]; then
            echo "  ✅ kynso_test Datenbank erstellt!"
        else
            echo "  ❌ Fehler beim Erstellen von kynso_test"
        fi
    else
        echo "  ℹ️  kynso_test existiert bereits"
    fi

    unset PGPASSWORD
else
    echo "⏭️  Datenbank-Setup übersprungen"
    echo ""
    echo "💡 Manuelle Datenbank-Erstellung:"
    echo "   1. Öffne psql oder ein anderes PostgreSQL Tool"
    echo "   2. Erstelle Datenbanken: kynso_dev, kynso_test"
    echo "   3. Führe Migrationen aus (siehe unten)"
fi

echo ""
echo "🔧 Wende Datenbank-Migrationen an..."

# NuGet Pakete wiederherstellen
echo "  📦 Stelle NuGet-Pakete wieder her..."
cd src/backend/RP.CRM.Api
dotnet restore
if [ $? -ne 0 ]; then
    echo "  ❌ Fehler bei der Paketwiederherstellung"
    cd ../../..
    exit 1
fi
echo "  ✅ Pakete erfolgreich wiederhergestellt!"

# Development Migrationen
echo "  Wende DEV Migrationen an..."
export ASPNETCORE_ENVIRONMENT=Development
dotnet ef database update
if [ $? -eq 0 ]; then
    echo "  ✅ DEV Migrationen angewendet!"
else
    echo "  ⚠️  Fehler bei DEV Migrationen"
fi

# Test Migrationen
echo "  Wende TEST Migrationen an..."
export ASPNETCORE_ENVIRONMENT=Test
dotnet ef database update
if [ $? -eq 0 ]; then
    echo "  ✅ TEST Migrationen angewendet!"
else
    echo "  ⚠️  Fehler bei TEST Migrationen"
fi

cd ../../..

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📚 Nächste Schritte:"
echo "  1. Starte Backend: cd src/backend/RP.CRM.Api && dotnet run --launch-profile Development"
echo "  2. Starte Frontend: cd src/frontend && npm start"
echo ""
echo "📖 Siehe WORKFLOW_ANLEITUNG.md für vollständige Dokumentation"
echo ""
