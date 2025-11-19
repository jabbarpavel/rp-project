# 🚀 Kynso CRM - Entwicklungs-Workflow & Anleitung

Dieses Dokument beschreibt den vollständigen Workflow für die Entwicklung, das Testen und die Bereitstellung des Kynso CRM-Systems mit drei Umgebungen: **DEV**, **TEST** und **PRODUCTION**.

---

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Umgebungen](#umgebungen)
3. [Voraussetzungen](#voraussetzungen)
4. [Ersteinrichtung](#ersteinrichtung)
5. [Branch-Struktur](#branch-struktur)
6. [Workflow](#workflow)
7. [Backend starten](#backend-starten)
8. [Frontend starten](#frontend-starten)
9. [Datenbank-Migrationen](#datenbank-migrationen)
10. [Häufige Probleme](#häufige-probleme)

---

## 🎯 Überblick

Das Projekt verwendet drei getrennte Umgebungen für einen sicheren und strukturierten Entwicklungsprozess:

```
DEV (lokal) → TEST (lokal) → PRODUCTION (kynso.ch)
```

**Workflow-Konzept:**
1. Entwicklung und Experimente in **DEV**
2. Wenn zufrieden: Push zu **TEST** und lokale Tests durchführen
3. Wenn Tests erfolgreich: Push zu **MAIN** für Online-Deployment auf kynso.ch

---

## 🌍 Umgebungen

### 1. **DEV** (Development) - Lokale Entwicklung
- **Branch:** `dev`
- **Datenbank:** `kynso_dev`
- **Backend-Port:** 5015
- **Frontend-Port:** 4200
- **Domain:** localhost
- **Verwendung:** Experimentieren, neue Features entwickeln

### 2. **TEST** (Testing) - Lokales Testing
- **Branch:** `test`
- **Datenbank:** `kynso_test`
- **Backend-Port:** 5016
- **Frontend-Port:** 4300
- **Domain:** localhost
- **Verwendung:** Änderungen lokal testen vor Production

### 3. **PRODUCTION** (Main) - Online
- **Branch:** `main`
- **Datenbank:** Production DB (auf Server)
- **Backend-Port:** 5020
- **Domain:** kynso.ch (finaro.kynso.ch, demo.kynso.ch)
- **Verwendung:** Live-System für Endbenutzer

---

## 📦 Voraussetzungen

### Software installieren:
- ✅ **.NET 8.0 SDK** (Version 8.0.416 oder höher)
- ✅ **Node.js** (Version 20.x oder höher)
- ✅ **PostgreSQL** (Version 14 oder höher)
- ✅ **Git**
- ✅ **VS Code** oder **Visual Studio 2022**

### .NET SDK Version prüfen:
```bash
dotnet --version
```

Falls Version 10.x angezeigt wird, wurde die `global.json` bereits konfiguriert, um .NET 8.0 zu erzwingen.

### PostgreSQL prüfen:
```bash
# Windows PowerShell
Get-Service postgresql*

# Linux/Mac
sudo systemctl status postgresql
```

---

## 🔧 Ersteinrichtung

### 1. Repository klonen
```bash
git clone https://github.com/jabbarpavel/rp-project.git
cd rp-project
```

### 2. Branches erstellen
```bash
# Dev-Branch erstellen (falls nicht vorhanden)
git checkout -b dev
git push -u origin dev

# Test-Branch erstellen (falls nicht vorhanden)
git checkout -b test
git push -u origin test

# Zurück zu main
git checkout main
```

### 3. Datenbanken erstellen

#### DEV-Datenbank:
```bash
# PostgreSQL öffnen
psql -U postgres

# Datenbank erstellen
CREATE DATABASE kynso_dev;

# Beenden
\q
```

#### TEST-Datenbank:
```bash
psql -U postgres
CREATE DATABASE kynso_test;
\q
```

#### Production-Datenbank:
Die Production-Datenbank läuft auf dem Server (kynso.ch) und wird über Umgebungsvariablen konfiguriert.

### 4. Abhängigkeiten installieren

#### Backend:
```bash
cd src/backend/RP.CRM.Api
dotnet restore
```

#### Frontend:
```bash
cd src/frontend
npm install
```

---

## 🌳 Branch-Struktur

```
main          → Production (kynso.ch)
  ↑
test          → Lokales Testing
  ↑
dev           → Lokale Entwicklung
```

**Wichtig:** Alle drei Branches haben den gleichen Code! Nur die Umgebungsvariable `ASPNETCORE_ENVIRONMENT` bestimmt, welche Konfiguration verwendet wird.

---

## 🔄 Workflow

### Schritt 1: In DEV entwickeln

```bash
# 1. Zu dev-Branch wechseln
git checkout dev

# 2. Backend starten (Development-Umgebung)
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# 3. Frontend starten (in neuem Terminal)
cd src/frontend
npm run start:dev
```

**Entwickle deine Features...**

### Schritt 2: Zu TEST pushen

```bash
# 1. Änderungen committen
git add .
git commit -m "Beschreibung der Änderungen"

# 2. Zu test-Branch wechseln
git checkout test

# 3. dev-Branch mergen
git merge dev

# 4. Zu GitHub pushen
git push origin test

# 5. Backend im Test-Modus starten
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test

# 6. Frontend im Test-Modus starten (in neuem Terminal)
cd src/frontend
npm run start:test
```

**Teste deine Änderungen lokal auf Port 4300...**

### Schritt 3: Zu PRODUCTION pushen

```bash
# Wenn Tests erfolgreich sind:

# 1. Zu main-Branch wechseln
git checkout main

# 2. test-Branch mergen
git merge test

# 3. Zu GitHub pushen
git push origin main
```

Das System wird automatisch auf **kynso.ch** deployed!

---

## 🖥️ Backend starten

### Option 1: Mit Launch-Profilen (empfohlen)

#### Development:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

#### Test:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

#### Production (lokal testen):
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Production
```

### Option 2: Mit Umgebungsvariablen

#### PowerShell (Windows):
```powershell
# Development
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run

# Test
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run

# Production
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

#### Bash (Linux/Mac):
```bash
# Development
export ASPNETCORE_ENVIRONMENT=Development
dotnet run

# Test
export ASPNETCORE_ENVIRONMENT=Test
dotnet run

# Production
export ASPNETCORE_ENVIRONMENT=Production
dotnet run
```

### Backend-Ausgabe verstehen:

**Development:**
```
✅ Loaded tenant domains from tenants.Development.json (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
✅ Bound ports 5015 (localhost) and 5020 (all IPs)
```

**Test:**
```
✅ Loaded tenant domains from tenants.Test.json (Test):
   http://localhost:4300
   http://localhost:5016
   http://127.0.0.1:4300
✅ Test environment: Bound ports 5016 (localhost) and 5021 (all IPs)
```

---

## 🎨 Frontend starten

### Development:
```bash
cd src/frontend
npm run start:dev
# oder einfach
npm start
```
→ Öffnet http://localhost:4200

### Test:
```bash
cd src/frontend
npm run start:test
```
→ Öffnet http://localhost:4300

### Production (lokal testen):
```bash
cd src/frontend
npm run start:prod
```
→ Öffnet http://localhost:4200

---

## 🗄️ Datenbank-Migrationen

### Migration erstellen (wenn du Entity-Models änderst):

```bash
cd src/backend/RP.CRM.Api

# Neue Migration erstellen
dotnet ef migrations add MeineMigrationBeschreibung
```

### Migration anwenden:

#### Development:
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
dotnet ef database update
```

#### Test:
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Test"  # PowerShell
dotnet ef database update
```

#### Production (auf dem Server):
```bash
# SSH zum Server
ssh user@kynso.ch
cd /opt/rp-crm
export ASPNETCORE_ENVIRONMENT=Production
dotnet ef database update
```

### Migration zurücksetzen:
```bash
# Zurück zur vorherigen Migration
dotnet ef database update VorigeMigrationName

# Alle Migrationen zurücksetzen
dotnet ef database update 0
```

### Migration löschen:
```bash
# Letzte Migration löschen (nur wenn nicht angewendet!)
dotnet ef migrations remove
```

---

## 🔍 API testen

### Swagger/Scalar UI (nur Development):
- Development: http://localhost:5015/scalar/v1
- Test: http://localhost:5016/scalar/v1

### Mit curl:

#### Development:
```bash
curl http://localhost:5015/api/tenants
```

#### Test:
```bash
curl http://localhost:5016/api/tenants
```

---

## ❗ Häufige Probleme

### Problem 1: `dotnet ef database update` schlägt fehl mit "System.Runtime, Version=10.0.0.0"

**Ursache:** Du verwendest .NET 10.0 SDK, aber das Projekt benötigt .NET 8.0.

**Lösung:** Die `global.json` im Repository-Root erzwingt bereits .NET 8.0:
```bash
# Prüfen
dotnet --version
# Sollte jetzt 8.0.416 (oder ähnlich) zeigen

# Falls nicht, global.json prüfen
cat global.json
```

### Problem 2: Backend verbindet sich mit falscher Datenbank

**Ursache:** Falsche Umgebung gesetzt.

**Lösung:**
```bash
# Umgebung prüfen
echo $env:ASPNETCORE_ENVIRONMENT  # PowerShell
echo $ASPNETCORE_ENVIRONMENT      # Bash

# Korrekte Umgebung setzen
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
export ASPNETCORE_ENVIRONMENT=Development  # Bash
```

### Problem 3: CORS-Fehler im Browser

**Ursache:** Backend läuft nicht oder falsche Ports.

**Lösung:**
1. Backend muss laufen
2. Ports prüfen:
   - DEV: Frontend 4200, Backend 5015
   - TEST: Frontend 4300, Backend 5016
3. Backend-Log prüfen: "✅ CORS allowed origins" sollte korrekte URLs zeigen

### Problem 4: PostgreSQL Connection refused

**Lösung:**
```bash
# PostgreSQL starten
# Windows
Start-Service postgresql

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

### Problem 5: Port bereits belegt

**Fehler:** "Address already in use"

**Lösung:**
```bash
# Windows - Port-Prozess finden und beenden
netstat -ano | findstr :5015
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5015 | xargs kill -9
```

### Problem 6: Frontend kann Backend nicht erreichen

**Lösung:**
1. Backend-URL in Browser testen: http://localhost:5015/api/tenants
2. Browser-Console auf CORS-Fehler prüfen
3. Backend-Log auf "CORS allowed origins" prüfen

---

## 📁 Konfigurationsdateien-Übersicht

### Backend:

| Datei | Umgebung | Datenbank | Ports |
|-------|----------|-----------|-------|
| `appsettings.Development.json` | DEV | kynso_dev | 5015, 5020 |
| `appsettings.Test.json` | TEST | kynso_test | 5016, 5021 |
| `appsettings.Production.json` | PROD | Server DB | 5020 |
| `tenants.Development.json` | DEV | localhost | - |
| `tenants.Test.json` | TEST | localhost | - |
| `tenants.Production.json` | PROD | kynso.ch | - |

### Frontend:

| Befehl | Umgebung | Port |
|--------|----------|------|
| `npm start` oder `npm run start:dev` | DEV | 4200 |
| `npm run start:test` | TEST | 4300 |
| `npm run start:prod` | PROD | 4200 |

---

## 🎯 Checkliste für einen kompletten Workflow

### Neue Feature entwickeln:

- [ ] Zu `dev` Branch wechseln: `git checkout dev`
- [ ] Backend starten: `dotnet run --launch-profile Development`
- [ ] Frontend starten: `npm run start:dev`
- [ ] Feature entwickeln und testen
- [ ] Änderungen committen: `git commit -m "Feature XYZ"`

### Feature zu TEST pushen:

- [ ] Zu `test` Branch wechseln: `git checkout test`
- [ ] dev mergen: `git merge dev`
- [ ] Pushen: `git push origin test`
- [ ] Backend im Test-Modus starten: `dotnet run --launch-profile Test`
- [ ] Frontend im Test-Modus starten: `npm run start:test`
- [ ] Alle Tests durchführen

### Feature zu PRODUCTION deployen:

- [ ] Zu `main` Branch wechseln: `git checkout main`
- [ ] test mergen: `git merge test`
- [ ] Pushen: `git push origin main`
- [ ] Deployment auf kynso.ch erfolgt automatisch (oder manuell auf Server)
- [ ] Feature auf https://kynso.ch testen

---

## 🚀 Schnellstart-Befehle

### DEV starten:
```bash
# Terminal 1 - Backend
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Terminal 2 - Frontend
cd src/frontend
npm start
```

### TEST starten:
```bash
# Terminal 1 - Backend
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test

# Terminal 2 - Frontend
cd src/frontend
npm run start:test
```

### Datenbank migrieren:
```bash
cd src/backend/RP.CRM.Api

# DEV
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

# TEST
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

---

## 📚 Weitere Ressourcen

- [README.md](../README.md) - Projekt-Übersicht
- [LOCAL_DEVELOPMENT_SETUP.md](../LOCAL_DEVELOPMENT_SETUP.md) - Detaillierte Entwicklungs-Setup
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Allgemeiner Setup-Guide
- [PRODUCTION_SETUP_SUMMARY.md](../PRODUCTION_SETUP_SUMMARY.md) - Production-Deployment

---

## 💡 Best Practices

1. **Immer in DEV entwickeln** - Nie direkt in TEST oder MAIN
2. **Tests in TEST durchführen** - Vor jedem Production-Push
3. **Regelmäßig committen** - Kleine, häufige Commits sind besser
4. **Beschreibende Commit-Messages** - z.B. "Füge Customer-Export-Funktion hinzu"
5. **Vor dem Merge testen** - Stelle sicher, dass alles funktioniert
6. **Datenbank-Backups** - Besonders vor großen Migrationen

---

## 🆘 Support

Bei Problemen oder Fragen:
1. Prüfe diese Dokumentation
2. Prüfe die Log-Ausgaben von Backend und Frontend
3. Prüfe Browser-Console auf JavaScript-Fehler
4. Prüfe PostgreSQL-Logs

---

**Viel Erfolg bei der Entwicklung! 🚀**
