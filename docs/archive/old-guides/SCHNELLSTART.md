# 🇩🇪 Schnellstart für Lokale Entwicklung

## Das Problem
Du hast Produktion auf kynso.ch eingerichtet, möchtest aber lokal entwickeln und testen. Die Konfiguration war nur für Produktion eingerichtet.

## Die Lösung

### 1. .NET SDK Problem beheben

Das Projekt nutzt **.NET 8.0**, aber du hast wahrscheinlich .NET 10.0 installiert.

**Erstelle eine `global.json` Datei** im Repository-Root (bereits erledigt ✅):

```json
{
  "sdk": {
    "version": "8.0.0",
    "rollForward": "latestMinor",
    "allowPrerelease": false
  }
}
```

### 2. Lokale Datenbank erstellen

```bash
# PostgreSQL öffnen
psql -U postgres

# Datenbank erstellen
CREATE DATABASE kynso_dev;

# Beenden
\q
```

### 3. Verbindungsstring überprüfen

Die Datei `src/backend/RP.CRM.Api/appsettings.Development.json` enthält jetzt:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

**Wichtig:** Passe das Passwort an, wenn dein PostgreSQL ein anderes verwendet!

### 4. Migrationen anwenden

```bash
cd src\backend\RP.CRM.Api
dotnet ef database update
```

Falls noch Fehler auftreten:
```bash
# Prüfe welche SDK Version aktiv ist
dotnet --version

# Sollte jetzt 8.0.x zeigen (nicht 10.x)
```

### 5. Backend starten

```bash
cd src\backend\RP.CRM.Api
dotnet run
```

Du solltest jetzt sehen:
```
✅ Loaded tenant domains from tenants.Development.json (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
```

Das Backend läuft auf: **http://localhost:5015**

### 6. Frontend starten (optional)

```bash
cd src\frontend
npm install
npm start
```

Das Frontend läuft auf: **http://localhost:4200**

## Was wurde geändert?

### Neue Dateien:
- ✅ **`tenants.Development.json`** - Localhost Konfiguration
- ✅ **`tenants.Production.json`** - Produktions-Domains (kynso.ch)
- ✅ **`appsettings.Production.json`** - Produktions-Einstellungen
- ✅ **`global.json`** - Erzwingt .NET 8.0 SDK
- ✅ **`LOCAL_DEVELOPMENT_SETUP.md`** - Ausführliche Anleitung

### Geänderte Dateien:
- ✅ **`Program.cs`** - Lädt jetzt umgebungsspezifische Tenant-Dateien
- ✅ **`appsettings.Development.json`** - Lokale Datenbankverbindung
- ✅ **`appsettings.json`** - Entfernte hardcodierte Verbindung
- ✅ **`AppDBContextFactory.cs`** - Liest jetzt aus appsettings

## Umgebungen wechseln

### Development (lokal)
- Verwendet `tenants.Development.json` (localhost)
- Verwendet lokale Datenbank (kynso_dev)
- Standard bei `dotnet run`

### Production (Server)
- Verwendet `tenants.Production.json` (kynso.ch)
- Verwendet Produktions-Datenbank
- Aktivieren mit: `$env:ASPNETCORE_ENVIRONMENT="Production"`

## Häufige Probleme

### Problem: `dotnet ef database update` schlägt fehl
**Lösung:** Stelle sicher, dass `global.json` existiert und .NET 8.0 nutzt

### Problem: Verbindet mit Produktions-DB
**Lösung:** Prüfe dass `ASPNETCORE_ENVIRONMENT=Development` gesetzt ist

### Problem: CORS-Fehler im Browser
**Lösung:** Backend muss laufen und `localhost` in CORS-Origins zeigen

## API Testen

Wenn das Backend läuft, kannst du die API testen:

**Swagger/Scalar UI:** http://localhost:5015/scalar/v1

## Nächste Schritte

1. ✅ Backend lokal starten
2. ✅ Migrations anwenden
3. ✅ Testbenutzer erstellen
4. ✅ Frontend starten (optional)
5. 🧪 API testen

## Weitere Hilfe

Siehe die ausführliche Anleitung: **[LOCAL_DEVELOPMENT_SETUP.md](LOCAL_DEVELOPMENT_SETUP.md)**

---

**Viel Erfolg! 🚀**
