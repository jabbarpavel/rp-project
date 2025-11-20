# 🚀 Vollständige Anleitung: Von Git Pull bis zum laufenden System

**Datum**: 19. November 2025  
**Branch**: `copilot/check-project-state-net8`  
**Status**: ✅ Alle Fixes sind fertig und getestet

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Hole die neuesten Änderungen 🔄

```powershell
# Öffne PowerShell und navigiere zu deinem Projekt
cd C:\Users\jabba\Desktop\rp-project

# Stelle sicher, dass du auf dem richtigen Branch bist
git checkout copilot/check-project-state-net8

# Hole die neuesten Änderungen vom Server
git pull origin copilot/check-project-state-net8
```

**Erwartete Ausgabe**:
```
From https://github.com/jabbarpavel/rp-project
 * branch            copilot/check-project-state-net8 -> FETCH_HEAD
Updating 30e554d..57a869b
Fast-forward
 reset-database.ps1 | 12 ++++++------
 1 file changed, 6 insertions(+), 6 deletions(-)
```

---

### Schritt 2: Datenbank zurücksetzen 🗄️

```powershell
# Führe das Reset-Script aus (im Projekt-Root)
.\reset-database.ps1
```

**Was passiert**:
1. Script fragt: `Bist du sicher? Gib 'JA' ein um fortzufahren`
   - **Tippe**: `JA` und drücke Enter

2. Script fragt: `PostgreSQL Passwort für user 'postgres'`
   - **Tippe**: `admin123` und drücke Enter

3. Script führt automatisch aus:
   - ✅ Beendet alle Datenbankverbindungen
   - ✅ Löscht alte Datenbanken (kynso_dev, kynso_test)
   - ✅ Erstellt neue saubere Datenbanken
   - ✅ Wendet Entity Framework Migrationen an

**Erwartete Ausgabe**:
```
🔄 Kynso CRM - Datenbank Reset
================================

⚠️  Warnung: Dieses Script wird folgende Datenbanken LÖSCHEN:
   - kynso_dev
   - kynso_test

Alle Daten gehen verloren!

Bist du sicher? Gib 'JA' ein um fortzufahren: JA
PostgreSQL Passwort für user 'postgres': ********

🔧 Schritt 1: Beende alle Datenbankverbindungen...
  ✅ Verbindungen beendet

🗑️  Schritt 2: Lösche alte Datenbanken...
  ✅ kynso_dev gelöscht
  ✅ kynso_test gelöscht

🆕 Schritt 3: Erstelle neue Datenbanken...
  ✅ kynso_dev erstellt
  ✅ kynso_test erstellt

🔄 Schritt 4: Wende Entity Framework Migrationen an...
  📦 Wende DEV Migrationen an...
  ✅ DEV Migrationen erfolgreich angewendet!
  📦 Wende TEST Migrationen an...
  ✅ TEST Migrationen erfolgreich angewendet!

✅ Datenbank Reset abgeschlossen!

📋 Nächste Schritte:
  1. Starte Backend: cd src\backend\RP.CRM.Api && dotnet run --launch-profile Development
  2. Starte Frontend: cd src\frontend && npm start
```

---

### Schritt 3: Backend starten 🎯

**Terminal 1** (Backend):
```powershell
# Navigiere zum Backend-Projekt
cd C:\Users\jabba\Desktop\rp-project\src\backend\RP.CRM.Api

# Starte das Backend in Development-Modus
dotnet run --launch-profile Development
```

**Erwartete Ausgabe**:
```
Buildvorgang wird ausgeführt...
✅ Loaded tenant domains from tenants.Development.json (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
   http://finaro.local:4200
   https://finaro.local:4200
   http://demo.local:4200
   https://demo.local:4200
✅ Bound ports 5015 (localhost) and 5020 (all IPs)
🔄 Applying database migrations...
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (30ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      SELECT EXISTS (...)
✅ Database migrations applied successfully!
✅ Ensured tenant exists: Finaro (ID: 1)
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://0.0.0.0:5020
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Backend ist jetzt erreichbar auf**:
- API: http://localhost:5015
- Swagger UI: http://localhost:5015/swagger
- Scalar UI: http://localhost:5015/scalar/v1

> ⚠️ **WICHTIG**: Lasse dieses Terminal-Fenster offen! Das Backend muss laufen bleiben.

---

### Schritt 4: Frontend starten 🎨

**Öffne ein NEUES Terminal** (Terminal 2 - Frontend):
```powershell
# Navigiere zum Frontend-Projekt
cd C:\Users\jabba\Desktop\rp-project\src\frontend

# Installiere Dependencies (nur beim ersten Mal nötig)
npm install

# Starte den Development Server
npm start
```

**Erwartete Ausgabe**:
```
> rp-crm-frontend@0.0.0 start
> ng serve

Initial Chunk Files | Names         |  Raw Size
polyfills.js        | polyfills     |   [Size]
main.js             | main          |   [Size]
styles.css          | styles        |   [Size]

                    | Initial Total |   [Size]

Application bundle generation complete. [Time]s

Watch mode enabled. Watching for file changes...
➜  Local:   http://localhost:4200/
➜  press h + enter to show help
```

**Frontend ist jetzt erreichbar auf**:
- Hauptseite: http://localhost:4200

> ⚠️ **WICHTIG**: Lasse auch dieses Terminal-Fenster offen! Das Frontend muss laufen bleiben.

---

### Schritt 5: System testen ✅

#### A) Frontend testen
1. **Öffne Browser**: http://localhost:4200
2. **Teste Navigation**: Schaue ob die Seite lädt
3. **Teste Login** (falls vorhanden mit Seed-Daten)

#### B) Backend API testen
1. **Öffne Swagger**: http://localhost:5015/swagger
2. **Teste einen Endpoint**:
   - Klicke z.B. auf `GET /api/tenants`
   - Klicke auf "Try it out"
   - Klicke auf "Execute"
   - Sollte Status 200 und Daten zurückgeben

#### C) Datenbank prüfen (mit pgAdmin 4)
1. **Öffne pgAdmin 4**
2. **Verbinde zu deinem Server** (localhost)
3. **Navigiere zu**: Servers → PostgreSQL → Databases → **kynso_dev**
4. **Prüfe Tabellen**: Rechtsklick auf "kynso_dev" → Query Tool
5. **Führe aus**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
6. **Erwartete Tabellen**:
   - __EFMigrationsHistory ✅
   - ChangeLogs ✅
   - Tenants ✅
   - Users ✅
   - Customers ✅
   - Documents ✅
   - CustomerTasks ✅
   - CustomerRelationships ✅

---

## 🎉 Fertig!

Du solltest jetzt haben:
- ✅ Backend läuft auf http://localhost:5015
- ✅ Frontend läuft auf http://localhost:4200
- ✅ Datenbank ist sauber und migriert
- ✅ Keine Fehler in den Terminals

---

## 🆘 Troubleshooting

### Problem: Script hat Parsing-Fehler
**Lösung**: Stelle sicher, dass du die neueste Version hast:
```powershell
git pull origin copilot/check-project-state-net8
```

### Problem: "database is being accessed by other users"
**Lösung**:
1. Schließe alle pgAdmin Query-Fenster
2. Beende Backend (Ctrl+C im Terminal)
3. Führe Script erneut aus

### Problem: Backend startet nicht - "System.Runtime 10.0.0.0" Fehler
**Lösung**:
```powershell
# Deinstalliere dotnet-ef
dotnet tool uninstall --global dotnet-ef

# Installiere die richtige Version
dotnet tool install --global dotnet-ef --version 8.0.11

# Prüfe Version
dotnet ef --version
# Sollte anzeigen: 8.0.11

# Lösche Caches
dotnet nuget locals all --clear

# Führe DB-Reset erneut aus
.\reset-database.ps1
```

### Problem: Backend startet nicht - Port 5015 bereits belegt
**Lösung**:
```powershell
# Finde den Prozess auf Port 5015
netstat -ano | findstr :5015

# Beende den Prozess (ersetze <PID> mit der Prozess-ID)
taskkill /PID <PID> /F
```

### Problem: Frontend startet nicht - Port 4200 bereits belegt
**Lösung**:
```powershell
# Finde den Prozess auf Port 4200
netstat -ano | findstr :4200

# Beende den Prozess (ersetze <PID> mit der Prozess-ID)
taskkill /PID <PID> /F
```

---

## 📚 Weitere Ressourcen

- **NÄCHSTE_SCHRITTE.md** - Kompakte Anleitung für schnellen Start
- **DATENBANK_RESET_ANLEITUNG.md** - Ausführliche DB-Problemlösung
- **WORKFLOW_ANLEITUNG.md** - DEV/TEST/MAIN Workflow
- **SCHNELLREFERENZ.md** - Befehls-Übersicht für tägliche Nutzung
- **README.md** - Projekt-Übersicht

---

## 📞 Bei weiteren Problemen

1. Schaue in **DATENBANK_RESET_ANLEITUNG.md** für DB-spezifische Probleme
2. Schaue in **PROJEKT_ÜBERPRÜFUNG_ZUSAMMENFASSUNG.md** für technische Details
3. Prüfe die Terminal-Ausgaben für spezifische Fehlermeldungen

---

**Viel Erfolg mit der Entwicklung! 🚀**

Dein System läuft jetzt auf dem DEV Branch und ist bereit für die Entwicklung!
