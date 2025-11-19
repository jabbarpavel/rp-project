# Datenbank Reset Anleitung

Diese Anleitung zeigt, wie du die PostgreSQL-Datenbanken komplett neu aufsetzen kannst, wenn Migrations-Konflikte auftreten.

## Problem

Die Fehlermeldung "Relation »ChangeLogs« existiert bereits" bedeutet, dass:
1. Die Datenbank-Tabellen bereits existieren
2. Aber die `__EFMigrationsHistory` Tabelle fehlt oder nicht synchron ist
3. Entity Framework versucht, bereits existierende Tabellen zu erstellen

## Lösung: Kompletter Datenbank-Reset

### Schritt 1: Alle Verbindungen zur Datenbank trennen

#### Option A: Via pgAdmin 4
1. Öffne **pgAdmin 4**
2. Verbinde dich mit deinem PostgreSQL Server
3. Klicke mit der rechten Maustaste auf die Datenbank **kynso_dev**
4. Wähle **"Disconnect Database"**
5. Wiederhole für **kynso_test** falls vorhanden

#### Option B: Via SQL (wenn Option A nicht funktioniert)
1. Öffne **pgAdmin 4** → Query Tool (auf der postgres Datenbank)
2. Führe diesen SQL-Befehl aus:

```sql
-- Beende alle aktiven Verbindungen zu kynso_dev
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'kynso_dev'
  AND pid <> pg_backend_pid();

-- Beende alle aktiven Verbindungen zu kynso_test
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'kynso_test'
  AND pid <> pg_backend_pid();
```

### Schritt 2: Datenbanken löschen

#### Via pgAdmin 4:
1. In pgAdmin 4, klicke mit der rechten Maustaste auf **kynso_dev**
2. Wähle **"Delete/Drop"**
3. Bestätige mit "Yes"
4. Wiederhole für **kynso_test**

#### Via SQL:
```sql
DROP DATABASE IF EXISTS kynso_dev;
DROP DATABASE IF EXISTS kynso_test;
```

### Schritt 3: Neue Datenbanken erstellen

#### Via pgAdmin 4:
1. Klicke mit der rechten Maustaste auf **"Databases"**
2. Wähle **"Create" → "Database..."**
3. Name: `kynso_dev`
4. Owner: `postgres`
5. Klicke auf **"Save"**
6. Wiederhole für `kynso_test`

#### Via SQL:
```sql
CREATE DATABASE kynso_dev
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'German_Germany.1252'
    LC_CTYPE = 'German_Germany.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE DATABASE kynso_test
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'German_Germany.1252'
    LC_CTYPE = 'German_Germany.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### Schritt 4: Migrations zurücksetzen und neu erstellen

#### Alte Migrations löschen (nur wenn nötig):
```powershell
# Im Repository-Root
cd src\backend\RP.CRM.Infrastructure
Remove-Item -Path "Migrations\*" -Force
```

#### Neue Migration erstellen:
```powershell
cd src\backend\RP.CRM.Api
dotnet ef migrations add InitialCreate --project ..\RP.CRM.Infrastructure --output-dir Migrations
```

### Schritt 5: Migrationen anwenden

#### Für Development:
```powershell
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef database update
```

#### Für Test:
```powershell
$env:ASPNETCORE_ENVIRONMENT = "Test"
dotnet ef database update
```

## Alternative: Migrations-Historie manuell korrigieren

Falls du die Daten behalten möchtest und nur die Migration-Historie reparieren willst:

### Schritt 1: Prüfe welche Migration aktuell ist

```powershell
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef migrations list
```

### Schritt 2: Lösche die `__EFMigrationsHistory` Tabelle

Via pgAdmin 4 Query Tool:
```sql
-- Für kynso_dev
\c kynso_dev
DROP TABLE IF EXISTS "__EFMigrationsHistory";

-- Für kynso_test
\c kynso_test
DROP TABLE IF EXISTS "__EFMigrationsHistory";
```

### Schritt 3: Erstelle die Historie neu ohne Tabellen zu erstellen

```powershell
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Nutze die SQL Script Option um zu sehen was passieren würde
dotnet ef database update --script

# Wenn alles OK aussieht, führe nur die Historie-Updates aus
# Markiere die Migration als angewendet ohne sie wirklich auszuführen
dotnet ef database update --no-build
```

## Häufige Probleme

### "database is being accessed by other users"
- **Lösung**: Schließe alle Verbindungen (siehe Schritt 1)
- Stelle sicher dass:
  - Backend nicht läuft (`dotnet run` beendet)
  - pgAdmin 4 Abfragen geschlossen sind
  - Visual Studio Code SQL Extensions getrennt sind

### "System.Runtime, Version=10.0.0.0" Fehler
- **Problem**: dotnet-ef Tool Version passt nicht zu .NET SDK
- **Lösung**: 
  ```powershell
  dotnet tool uninstall --global dotnet-ef
  dotnet tool install --global dotnet-ef --version 8.0.11
  ```

### Migration wird angewendet aber Tabellen fehlen
- **Lösung**: Kompletter Reset (siehe oben)

## Empfohlene Entwicklungsroutine

1. **Immer in DEV Branch arbeiten**
   ```bash
   git checkout dev
   ```

2. **Backend starten mit:**
   ```powershell
   cd src\backend\RP.CRM.Api
   dotnet run --launch-profile Development
   ```

3. **Migrations erstellen wenn Entities sich ändern:**
   ```powershell
   cd src\backend\RP.CRM.Api
   dotnet ef migrations add <MigrationName> --project ..\RP.CRM.Infrastructure
   dotnet ef database update
   ```

4. **Bei Problemen: Reset wie oben beschrieben**

## Nützliche Befehle

```powershell
# Zeige alle Migrationen
dotnet ef migrations list

# Zeige letzte angewendete Migration
dotnet ef migrations script

# Rollback zur vorherigen Migration
dotnet ef database update <PreviousMigrationName>

# Zeige Connection String
dotnet user-secrets list

# Prüfe Datenbank Status
dotnet ef database drop --dry-run
```

## Support

Bei weiteren Problemen:
1. Prüfe die Connection Strings in `appsettings.Development.json`
2. Stelle sicher dass PostgreSQL läuft
3. Prüfe die Logs in der Console
4. Siehe `WORKFLOW_ANLEITUNG.md` für allgemeine Entwicklungs-Workflows
