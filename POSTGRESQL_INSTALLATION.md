# PostgreSQL Installation und Setup Guide

## Kompatibilität
✅ **Unterstützte PostgreSQL Versionen**: 14, 15, 16, 17, 18 (und höher)  
✅ **Dein System**: PostgreSQL 18 ist vollständig kompatibel!

Das Script findet automatisch alle installierten PostgreSQL Versionen (14-18+) und bevorzugt die neueste.

## Problem
Das Script kann `psql` nicht finden, da PostgreSQL entweder nicht installiert ist oder nicht im PATH verfügbar ist.

## Lösung: PostgreSQL neu installieren/konfigurieren

### Option 1: PostgreSQL neu installieren (Empfohlen)

#### Schritt 1: PostgreSQL herunterladen
1. Gehe zu: https://www.postgresql.org/download/windows/
2. Klicke auf "Download the installer"
3. Wähle die neueste Version (z.B. PostgreSQL 16.x, 17.x oder 18.x)
4. Lade den Windows x86-64 Installer herunter

#### Schritt 2: Installation
1. **Starte den Installer** (Rechtsklick → Als Administrator ausführen)
2. **Installation Directory**: Standard lassen (z.B. `C:\Program Files\PostgreSQL\18`)
3. **Components auswählen**:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder (optional)
   - ✅ Command Line Tools (WICHTIG!)
4. **Data Directory**: Standard lassen
5. **Passwort für postgres User**: `admin123` (oder dein eigenes)
   - ⚠️ **WICHTIG**: Merke dir dieses Passwort!
6. **Port**: `5432` (Standard)
7. **Locale**: `German, Germany` oder `Default locale`
8. **Installation starten**: Klicke "Next" bis zur Installation
9. Warte bis die Installation abgeschlossen ist
10. **Stack Builder**: Kannst du überspringen (Finish)

#### Schritt 3: PATH prüfen/hinzufügen

**Automatisch (sollte normalerweise automatisch sein)**:
- Der Installer fügt PostgreSQL normalerweise automatisch zum PATH hinzu

**Manuell prüfen**:
1. Öffne PowerShell als **Administrator**
2. Teste ob psql funktioniert:
   ```powershell
   psql --version
   ```
3. Wenn es funktioniert, siehst du z.B.:
   ```
   psql (PostgreSQL) 18.0
   # Oder: psql (PostgreSQL) 16.x, 17.x, etc.
   ```

**Falls psql nicht gefunden wird, manuell zum PATH hinzufügen**:

1. **Finde den PostgreSQL bin Ordner**:
   ```powershell
   # Für PostgreSQL 18:
   C:\Program Files\PostgreSQL\18\bin
   
   # Oder für andere Versionen:
   C:\Program Files\PostgreSQL\17\bin
   C:\Program Files\PostgreSQL\16\bin
   C:\Program Files\PostgreSQL\15\bin
   ```

2. **Füge zum PATH hinzu**:
   - Drücke `Windows + Pause` (oder Rechtsklick auf "Dieser PC" → Eigenschaften)
   - Klicke auf "Erweiterte Systemeinstellungen"
   - Klicke auf "Umgebungsvariablen"
   - Unter "Systemvariablen" finde "Path" und klicke "Bearbeiten"
   - Klicke "Neu"
   - Füge hinzu: `C:\Program Files\PostgreSQL\18\bin` (oder deine Version)
   - Klicke "OK" auf allen Dialogen
   
3. **Starte PowerShell NEU** und teste:
   ```powershell
   psql --version
   ```

---

### Option 2: Bestehende PostgreSQL Installation finden

Falls PostgreSQL bereits installiert ist, aber nicht gefunden wird:

```powershell
# Suche nach PostgreSQL Installationen
Get-ChildItem "C:\Program Files\PostgreSQL\" -Recurse -Filter psql.exe | Select-Object FullName

# Oder suche systemweit
Get-ChildItem C:\ -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object FullName
```

Wenn du eine Installation findest (z.B. `C:\Program Files\PostgreSQL\16\bin\psql.exe`), füge das Verzeichnis zum PATH hinzu (siehe Option 1, Schritt 3).

---

### Option 3: pgAdmin 4 verwenden (Alternative)

Falls du PostgreSQL nicht via Kommandozeile verwenden möchtest, kannst du die Datenbanken auch manuell in pgAdmin 4 erstellen:

1. **Öffne pgAdmin 4**
2. **Verbinde zum Server**:
   - Rechtsklick auf "Servers" → "Create" → "Server"
   - Name: `localhost`
   - Connection Tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: `admin123` (oder dein Passwort)
   - Klicke "Save"

3. **Erstelle Datenbanken manuell**:
   - Rechtsklick auf "Databases" → "Create" → "Database"
   - Database: `kynso_dev`
   - Owner: `postgres`
   - Klicke "Save"
   - Wiederhole für `kynso_test`

4. **Führe Migrationen aus**:
   ```powershell
   cd C:\Users\jabba\Desktop\rp-project\src\backend\RP.CRM.Api
   
   # DEV Migrationen
   $env:ASPNETCORE_ENVIRONMENT = "Development"
   dotnet ef database update
   
   # TEST Migrationen
   $env:ASPNETCORE_ENVIRONMENT = "Test"
   dotnet ef database update
   ```

---

## Nach der Installation: System testen

### 1. PostgreSQL Service prüfen
```powershell
# Prüfe ob PostgreSQL läuft
Get-Service postgresql*

# Sollte anzeigen:
# Status: Running
```

Falls der Service nicht läuft:
```powershell
# Starte den Service
Start-Service postgresql-x64-16  # oder deine Version
```

### 2. Verbindung testen
```powershell
# Teste Verbindung (wird nach Passwort fragen)
psql -U postgres -d postgres

# Im psql Prompt:
\l  # Liste alle Datenbanken
\q  # Beenden
```

### 3. Reset-Script ausführen
```powershell
cd C:\Users\jabba\Desktop\rp-project
.\reset-database.ps1
```

**Erwartete Ausgabe**:
```
Kynso CRM - Datenbank Reset
================================

Warnung: Dieses Script loescht folgende Datenbanken:
   - kynso_dev
   - kynso_test

Alle Daten gehen verloren.

Bist du sicher? Gib 'JA' ein: JA

Suche PostgreSQL Installation...
psql gefunden in PATH

PostgreSQL Passwort fuer postgres: ********

Schritt 1: Beende Verbindungen
Verbindungen beendet

Schritt 2: Loesche Datenbanken
kynso_dev geloescht
kynso_test geloescht

Schritt 3: Erstelle neue Datenbanken
kynso_dev erstellt
kynso_test erstellt

Schritt 4: Wende Migrationen an
DEV Migrationen
TEST Migrationen

Datenbank Reset abgeschlossen.
```

---

## Häufige Probleme

### Problem: "psql: error: connection to server on socket failed"
**Lösung**: PostgreSQL Service läuft nicht
```powershell
Start-Service postgresql-x64-16
```

### Problem: "psql: error: FATAL: password authentication failed"
**Lösung**: Falsches Passwort
- Verwende das Passwort, das du bei der Installation gesetzt hast
- Standard in unserer Anleitung: `admin123`

### Problem: "psql: error: could not connect to server: Connection refused"
**Lösung**: PostgreSQL läuft nicht auf Port 5432
```powershell
# Prüfe welcher Port verwendet wird
Get-Content "C:\Program Files\PostgreSQL\16\data\postgresql.conf" | Select-String "port"
```

### Problem: "Die Benennung 'psql' wurde nicht erkannt"
**Lösung**: PostgreSQL bin Ordner ist nicht im PATH
- Folge Option 1, Schritt 3 oben
- Oder das reset-database.ps1 Script findet es automatisch

---

## Zusammenfassung

**Nach erfolgreicher Installation/Konfiguration**:

1. ✅ PostgreSQL ist installiert
2. ✅ psql funktioniert in PowerShell
3. ✅ Service läuft
4. ✅ Du kennst dein postgres Passwort
5. ✅ reset-database.ps1 funktioniert

**Jetzt kannst du fortfahren mit**:
```powershell
# 1. Datenbank zurücksetzen
.\reset-database.ps1

# 2. Backend starten
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Development

# 3. Frontend starten (neues Terminal)
cd src\frontend
npm start
```

Siehe **VOLLSTÄNDIGE_ANLEITUNG.md** für die komplette Schritt-für-Schritt Anleitung!
