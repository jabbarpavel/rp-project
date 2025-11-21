# 🔧 Backend Starten - Ausführliche Anleitung

Diese Anleitung zeigt detailliert, wie Sie das Backend für verschiedene Umgebungen starten.

---

## 📊 Übersicht der Backend-Umgebungen

| Umgebung | Launch-Profil | Port | Datenbank | API Docs URL |
|----------|--------------|------|-----------|--------------|
| **Development** | `Development` | 5015 | kynso_dev | http://localhost:5015/scalar/v1 |
| **Test** | `Test` | 5016 | kynso_test | http://localhost:5016/scalar/v1 |
| **Production** | `Production` | 5015 | Production DB | http://localhost:5015/scalar/v1 |

---

## 🚀 Methode 1: Mit Launch-Profil (Empfohlen)

Dies ist die einfachste und empfohlene Methode.

### Backend für DEVELOPMENT starten

```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

**Was passiert:**
- Backend startet auf **Port 5015**
- Verwendet **kynso_dev** Datenbank
- ASPNETCORE_ENVIRONMENT wird auf "Development" gesetzt
- Verwendet `appsettings.Development.json` für Konfiguration

**Erwartete Ausgabe:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
```

**API Dokumentation:** http://localhost:5015/scalar/v1

### Backend für TEST starten

```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

**Was passiert:**
- Backend startet auf **Port 5016**
- Verwendet **kynso_test** Datenbank
- ASPNETCORE_ENVIRONMENT wird auf "Test" gesetzt
- Verwendet `appsettings.Test.json` für Konfiguration

**API Dokumentation:** http://localhost:5016/scalar/v1

### Backend für PRODUCTION starten (lokal)

```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Production
```

**Was passiert:**
- Backend startet auf **Port 5015**
- Verwendet Production Datenbank (Connection String aus appsettings.Production.json)
- ASPNETCORE_ENVIRONMENT wird auf "Production" gesetzt

⚠️ **Hinweis:** Verwenden Sie Production nur für lokale Tests. Auf dem Server wird das Backend über Systemd/Docker gestartet.

---

## 🔧 Methode 2: Mit Umgebungsvariable

Falls Sie mehr Kontrolle über die Umgebung benötigen:

### PowerShell (Windows)

```powershell
cd src/backend/RP.CRM.Api

# Für Development
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run

# Für Test
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run --urls "http://localhost:5016"

# Für Production
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

### Bash (Linux/Mac)

```bash
cd src/backend/RP.CRM.Api

# Für Development
export ASPNETCORE_ENVIRONMENT=Development
dotnet run

# Für Test
export ASPNETCORE_ENVIRONMENT=Test
dotnet run --urls "http://localhost:5016"

# Für Production
export ASPNETCORE_ENVIRONMENT=Production
dotnet run
```

**Hinweis:** Bei dieser Methode müssen Sie den Port für Test manuell mit `--urls` setzen.

---

## 🔍 Launch-Profil Details

Die Launch-Profile sind in `Properties/launchSettings.json` definiert:

### Development Profil
```json
{
  "commandName": "Project",
  "dotnetRunMessages": true,
  "launchBrowser": false,
  "applicationUrl": "http://localhost:5015",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development"
  }
}
```

### Test Profil
```json
{
  "commandName": "Project",
  "dotnetRunMessages": true,
  "launchBrowser": false,
  "applicationUrl": "http://localhost:5016",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Test"
  }
}
```

### Production Profil
```json
{
  "commandName": "Project",
  "dotnetRunMessages": true,
  "launchBrowser": false,
  "applicationUrl": "http://localhost:5015",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Production"
  }
}
```

---

## 📝 Configuration Files (appsettings)

Jede Umgebung verwendet ihre eigene Konfigurationsdatei:

### Development
- **Datei:** `appsettings.Development.json`
- **Connection String:** `Host=localhost;Database=kynso_dev;Username=postgres;Password=...`
- **JWT Key:** Development-specific key
- **Logging:** Verbose logging aktiviert

### Test
- **Datei:** `appsettings.Test.json`
- **Connection String:** `Host=localhost;Database=kynso_test;Username=postgres;Password=...`
- **JWT Key:** Test-specific key (kann gleich wie Dev sein)
- **Logging:** Standard logging

### Production
- **Datei:** `appsettings.Production.json`
- **Connection String:** Production database connection
- **JWT Key:** Secure production key
- **Logging:** Error logging only

**Base Configuration:** `appsettings.json` enthält gemeinsame Einstellungen, die von allen Umgebungen geerbt werden.

---

## ✅ Backend Status überprüfen

Nach dem Start können Sie den Backend-Status überprüfen:

### 1. Health Check
```bash
curl http://localhost:5015/weatherforecast
```

Erwartete Antwort: JSON-Array mit Wetterdaten

### 2. API Dokumentation öffnen
- **Development:** http://localhost:5015/scalar/v1
- **Test:** http://localhost:5016/scalar/v1

### 3. Test User registrieren
```bash
curl -X POST http://localhost:5015/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "tenantId": 1
  }'
```

---

## 🎯 Mehrere Backends gleichzeitig

Sie können DEV und TEST Backend gleichzeitig laufen lassen:

```bash
# Terminal 1: DEV Backend
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Terminal 2: TEST Backend
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

Da sie auf unterschiedlichen Ports laufen (5015 vs 5016), gibt es keine Konflikte.

---

## 🐛 Troubleshooting

### Problem: "Address already in use" (Port belegt)

**Windows:**
```powershell
# Port 5015 prüfen
netstat -ano | findstr :5015

# Prozess beenden
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Port 5015 prüfen
lsof -ti:5015

# Prozess beenden
lsof -ti:5015 | xargs kill -9
```

### Problem: "Cannot connect to PostgreSQL"

1. **PostgreSQL läuft?**
   ```bash
   # Windows
   Get-Service postgresql*
   Start-Service postgresql
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   
   # Mac
   brew services list
   brew services start postgresql
   ```

2. **Datenbank existiert?**
   ```bash
   psql -U postgres -l | grep kynso
   ```

3. **Connection String korrekt?**
   - Prüfen Sie `appsettings.Development.json` oder `appsettings.Test.json`
   - Format: `Host=localhost;Database=kynso_dev;Username=postgres;Password=...`

### Problem: "Pending migrations"

```bash
cd src/backend/RP.CRM.Api

# Für Development
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

# Für Test
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

### Problem: .NET Version falsch

```bash
# Aktuelle Version prüfen
dotnet --version

# Sollte 8.0.x anzeigen (nicht 10.x!)

# global.json prüfen
cat global.json
```

### Problem: CORS-Fehler im Frontend

Das Backend muss mit der richtigen Umgebung gestartet werden. Im Log sollte stehen:
```
✅ CORS allowed origins: http://localhost:4200, http://localhost:4300
```

Falls nicht, starten Sie das Backend mit dem richtigen Launch-Profil neu.

### Problem: JWT Token funktioniert nicht

1. **JWT Secret in appsettings gesetzt?**
   ```json
   {
     "Jwt": {
       "Key": "my_ultra_secret_key_123456789_very_long_key"
     }
   }
   ```

2. **Token abgelaufen?**
   - Token gilt 6 Stunden
   - Neu einloggen erforderlich

---

## 📋 Quick Reference

```bash
# Backend starten - verschiedene Umgebungen
dotnet run --launch-profile Development  # Port 5015, DB: kynso_dev
dotnet run --launch-profile Test         # Port 5016, DB: kynso_test
dotnet run --launch-profile Production   # Port 5015, DB: production

# Backend mit manueller Umgebung
$env:ASPNETCORE_ENVIRONMENT="Development"; dotnet run   # PowerShell
export ASPNETCORE_ENVIRONMENT=Development; dotnet run   # Bash

# Backend Status prüfen
curl http://localhost:5015/weatherforecast

# API Dokumentation
# http://localhost:5015/scalar/v1  (Development)
# http://localhost:5016/scalar/v1  (Test)

# Migrationen anwenden
$env:ASPNETCORE_ENVIRONMENT="Development"; dotnet ef database update
$env:ASPNETCORE_ENVIRONMENT="Test"; dotnet ef database update
```

---

## 🔗 Weiterführende Dokumentation

- **[FRONTEND_START_UND_TEST_USERS.md](FRONTEND_START_UND_TEST_USERS.md)** - Frontend starten & Test Users
- **[SCHNELLREFERENZ.md](../SCHNELLREFERENZ.md)** - Befehls-Übersicht
- **[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)** - API Testing mit Postman
- **[LOCAL_DEVELOPMENT_SETUP.md](../LOCAL_DEVELOPMENT_SETUP.md)** - Entwicklungsumgebung Setup
- **[DATENBANK_RESET_ANLEITUNG.md](../DATENBANK_RESET_ANLEITUNG.md)** - Datenbank-Probleme beheben

---

**Bei weiteren Fragen:** Siehe andere Dokumentation oder kontaktieren Sie das Team.
