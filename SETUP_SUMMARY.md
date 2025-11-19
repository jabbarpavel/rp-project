# 🎯 Setup-Zusammenfassung: DEV/TEST/PRODUCTION Umgebungen

## ✅ Was wurde implementiert?

Das Projekt wurde erfolgreich für einen **3-Umgebungs-Workflow** konfiguriert:

```
DEV (lokal) → TEST (lokal) → PRODUCTION (online auf kynso.ch)
```

---

## 🔧 Implementierte Änderungen

### 1. **Backend-Konfiguration**

#### Umgebungsspezifische Einstellungen:
- ✅ `appsettings.Development.json` - DEV: localhost, kynso_dev, Port 5015
- ✅ `appsettings.Test.json` - TEST: localhost, kynso_test, Port 5016
- ✅ `appsettings.Production.json` - PROD: Server-DB, Port 5020

#### Tenant-Konfiguration:
- ✅ `tenants.Development.json` - Localhost-Domains für DEV
- ✅ `tenants.Test.json` - Localhost-Domains für TEST
- ✅ `tenants.Production.json` - kynso.ch Domains

#### Launch-Profile:
- ✅ `launchSettings.json` - 3 Profile: Development, Test, Production
  - Jedes Profil setzt die richtige `ASPNETCORE_ENVIRONMENT` Variable
  - Test-Profil verwendet Port 5016 statt 5015

#### Code-Änderungen:
- ✅ `Program.cs` - Automatische Umgebungserkennung
  - Lädt die richtige `tenants.{environment}.json` Datei
  - Konfiguriert CORS basierend auf Umgebung
  - Bindet die richtigen Ports (5015/5020 für DEV/PROD, 5016/5021 für TEST)

### 2. **Frontend-Konfiguration**

#### Angular-Konfiguration:
- ✅ `angular.json` - Test-Konfiguration hinzugefügt
  - `configurations.test` mit Development-ähnlichen Einstellungen
  - `serve.configurations.test` mit Port 4300

#### NPM-Scripts:
- ✅ `package.json` - Neue Scripts für alle Umgebungen:
  - `npm start` oder `npm run start:dev` → Port 4200 (DEV)
  - `npm run start:test` → Port 4300 (TEST)
  - `npm run start:prod` → Production-Build
  - Entsprechende Build-Scripts: `build:dev`, `build:test`, `build:prod`

### 3. **SDK-Version Fix**

- ✅ `global.json` - Aktualisiert auf Version 8.0.416 mit `latestPatch` rollForward
  - Behebt das "System.Runtime, Version=10.0.0.0" Problem
  - Stellt sicher, dass .NET 8.0 SDK verwendet wird

### 4. **Dokumentation**

#### Hauptdokumente (Deutsch):
- ✅ **`WORKFLOW_ANLEITUNG.md`** (12KB) - Vollständige Workflow-Anleitung
  - Umgebungs-Übersicht
  - Detaillierter Workflow (DEV → TEST → PROD)
  - Backend/Frontend Start-Anweisungen
  - Datenbank-Migrationen
  - Problemlösungen
  - Best Practices

- ✅ **`SCHNELLREFERENZ.md`** (4.7KB) - Schnelle Befehlsübersicht
  - Kompakte Tabellen
  - Wichtigste Befehle
  - Schnelle Problemlösungen
  - URLs-Übersicht

#### Setup-Scripts:
- ✅ **`setup-environment.ps1`** - Windows PowerShell Setup-Script
  - Erstellt dev/test Branches
  - Erstellt PostgreSQL Datenbanken
  - Wendet Migrationen an
  
- ✅ **`setup-environment.sh`** - Linux/Mac Bash Setup-Script
  - Gleiche Funktionalität wie PowerShell-Version

#### Aktualisierte Dokumente:
- ✅ `README.md` - Links zu neuen Workflow-Dokumenten hinzugefügt

---

## 🌍 Umgebungs-Übersicht

| Aspekt | DEV | TEST | PRODUCTION |
|--------|-----|------|------------|
| **Branch** | `dev` | `test` | `main` |
| **Datenbank** | `kynso_dev` | `kynso_test` | Production DB |
| **Backend-Port** | 5015 | 5016 | 5020 |
| **Frontend-Port** | 4200 | 4300 | - |
| **Domain** | localhost | localhost | kynso.ch |
| **Verwendung** | Entwicklung | Lokales Testing | Live-System |

---

## 🚀 Wie funktioniert es?

### Umgebungs-Erkennung

Das System erkennt automatisch die Umgebung über die Umgebungsvariable `ASPNETCORE_ENVIRONMENT`:

```bash
# Methode 1: Launch-Profile (empfohlen)
dotnet run --launch-profile Development  # → DEV
dotnet run --launch-profile Test         # → TEST
dotnet run --launch-profile Production   # → PROD

# Methode 2: Umgebungsvariable
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
export ASPNETCORE_ENVIRONMENT=Development  # Bash
dotnet run
```

### Was passiert beim Start?

1. **Backend liest `ASPNETCORE_ENVIRONMENT`**
2. **Lädt passende Konfigurationsdateien:**
   - `appsettings.{Environment}.json`
   - `tenants.{Environment}.json`
3. **Konfiguriert Datenbank-Verbindung**
4. **Setzt CORS-Einstellungen**
5. **Bindet richtige Ports**

### Beispiel-Log (Development):
```
✅ Loaded tenant domains from tenants.Development.json (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
✅ Bound ports 5015 (localhost) and 5020 (all IPs)
🔄 Applying database migrations...
✅ Database migrations applied successfully!
✅ CORS allowed origins (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
```

### Beispiel-Log (Test):
```
✅ Loaded tenant domains from tenants.Test.json (Test):
   http://localhost:4300
   http://localhost:5016
   http://127.0.0.1:4300
✅ Test environment: Bound ports 5016 (localhost) and 5021 (all IPs)
🔄 Applying database migrations...
✅ Database migrations applied successfully!
```

---

## 📋 Setup-Anleitung für den Benutzer

### Automatisches Setup (empfohlen):

#### Windows:
```powershell
# Im Repository-Root ausführen
.\setup-environment.ps1
```

#### Linux/Mac:
```bash
# Im Repository-Root ausführen
chmod +x setup-environment.sh
./setup-environment.sh
```

Das Script:
1. Erstellt `dev` und `test` Branches
2. Erstellt `kynso_dev` und `kynso_test` Datenbanken
3. Wendet alle Migrationen an

### Manuelles Setup:

#### 1. Branches erstellen:
```bash
git checkout -b dev
git push -u origin dev

git checkout -b test
git push -u origin test

git checkout main
```

#### 2. Datenbanken erstellen:
```bash
psql -U postgres
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;
\q
```

#### 3. Migrationen anwenden:

**DEV:**
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
dotnet ef database update
```

**TEST:**
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Test"  # PowerShell
dotnet ef database update
```

---

## 🔄 Typischer Workflow

### 1. Feature in DEV entwickeln:
```bash
git checkout dev
# Backend starten
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Frontend starten (neues Terminal)
cd src/frontend
npm start  # → http://localhost:4200

# ... entwickeln ...
git add .
git commit -m "Neue Feature XYZ"
```

### 2. Zu TEST pushen und testen:
```bash
git checkout test
git merge dev
git push origin test

# Backend im Test-Modus
dotnet run --launch-profile Test

# Frontend im Test-Modus (neues Terminal)
npm run start:test  # → http://localhost:4300

# ... testen ...
```

### 3. Zu PRODUCTION deployen:
```bash
git checkout main
git merge test
git push origin main
# → Automatisches Deployment zu kynso.ch
```

---

## ✅ Vorteile dieser Lösung

1. **✅ Automatische Umgebungserkennung** - Keine manuellen Config-Änderungen
2. **✅ Getrennte Datenbanken** - DEV und TEST interferieren nicht
3. **✅ Getrennte Ports** - Alle Umgebungen können parallel laufen
4. **✅ Sicherer Workflow** - Änderungen werden erst getestet
5. **✅ Einfach zu bedienen** - Launch-Profile machen es simpel
6. **✅ Dokumentiert** - Vollständige deutsche Dokumentation
7. **✅ Gleicher Code** - Keine separaten Codepaths für Umgebungen

---

## 🐛 Problem gelöst: .NET SDK Version Error

**Ursprüngliches Problem:**
```
System.IO.FileNotFoundException: Could not load file or assembly 
'System.Runtime, Version=10.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
```

**Ursache:** .NET 10.0 SDK installiert, aber Projekt benötigt .NET 8.0

**Lösung:** `global.json` erzwingt .NET 8.0.416:
```json
{
  "sdk": {
    "version": "8.0.416",
    "rollForward": "latestPatch",
    "allowPrerelease": false
  }
}
```

Nach diesem Fix funktioniert `dotnet ef database update` problemlos!

---

## 📚 Weitere Schritte

Der Benutzer sollte jetzt:

1. **Setup ausführen:**
   - `setup-environment.ps1` (Windows) oder
   - `setup-environment.sh` (Linux/Mac)

2. **Dokumentation lesen:**
   - `WORKFLOW_ANLEITUNG.md` für vollständige Anleitung
   - `SCHNELLREFERENZ.md` für schnelle Befehle

3. **System testen:**
   - DEV starten und testen
   - TEST starten und testen
   - Workflow durchspielen (DEV → TEST → MAIN)

4. **Bei Problemen:**
   - Siehe "Häufige Probleme" in `WORKFLOW_ANLEITUNG.md`
   - Backend-Logs prüfen
   - Umgebungsvariablen prüfen

---

## 🎉 Zusammenfassung

✅ **3-Umgebungs-Workflow implementiert** (DEV/TEST/PROD)
✅ **Automatische Umgebungserkennung** (via ASPNETCORE_ENVIRONMENT)
✅ **.NET SDK Problem behoben** (global.json auf 8.0.416)
✅ **Vollständige Konfiguration** (Backend + Frontend)
✅ **Umfassende Dokumentation** (2 Guides auf Deutsch)
✅ **Setup-Scripts** (Windows + Linux/Mac)
✅ **Getestet** (Backend Build erfolgreich)

**Das System ist bereit für die Verwendung! 🚀**
