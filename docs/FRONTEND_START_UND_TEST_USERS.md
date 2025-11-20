# 🚀 Frontend Starten & Test Users Erstellen

Diese Anleitung zeigt, wie Sie das Frontend für verschiedene Umgebungen starten und Test-User erstellen.

> 💡 **Für ausführliche Backend-Informationen:** Siehe [BACKEND_START_ANLEITUNG.md](BACKEND_START_ANLEITUNG.md)

---

## 📱 Frontend Starten

Das Frontend kann für verschiedene Umgebungen separat gestartet werden:

### ✅ Development (DEV)
```bash
cd src/frontend
npm run start:dev
```
- **URL**: http://localhost:4200
- **Backend**: Port 5015 (Development)
- **Datenbank**: kynso_dev

### ✅ Test (TEST)
```bash
cd src/frontend
npm run start:test
```
- **URL**: http://localhost:4300
- **Backend**: Port 5016 (Test)
- **Datenbank**: kynso_test

### Production (PROD)
```bash
cd src/frontend
npm run start:prod
```
- **URL**: http://localhost:4200
- **Backend**: Port 5020 (Production)

---

## 🔧 Backend Starten

Das Backend kann für verschiedene Umgebungen mit unterschiedlichen Launch-Profilen gestartet werden.

### Verfügbare Backend-Profile

| Profil | Port | Datenbank | Verwendung |
|--------|------|-----------|------------|
| **Development** | 5015 | kynso_dev | Lokale Entwicklung |
| **Test** | 5016 | kynso_test | Lokales Testen |
| **Production** | 5015 | Production DB | Production (Server) |

### Methode 1: Mit Launch-Profil (Empfohlen) 🌟

Öffnen Sie ein separates Terminal-Fenster:

#### Backend für DEV:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```
- **Port**: http://localhost:5015
- **API Docs**: http://localhost:5015/scalar/v1
- **Datenbank**: kynso_dev

#### Backend für TEST:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```
- **Port**: http://localhost:5016
- **API Docs**: http://localhost:5016/scalar/v1
- **Datenbank**: kynso_test

#### Backend für PRODUCTION (lokal):
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Production
```
- **Port**: http://localhost:5015
- **API Docs**: http://localhost:5015/scalar/v1
- **Datenbank**: Production DB (siehe appsettings.Production.json)

### Methode 2: Mit Umgebungsvariable

Falls Sie die Umgebung manuell setzen möchten:

#### PowerShell (Windows):
```powershell
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

#### Bash (Linux/Mac):
```bash
cd src/backend/RP.CRM.Api
export ASPNETCORE_ENVIRONMENT=Development
dotnet run
```

**Verfügbare Umgebungen:**
- `Development` → Port 5015, DB: kynso_dev
- `Test` → Port 5016, DB: kynso_test
- `Production` → Port 5015, DB: Production

### Backend Status überprüfen

Nach dem Start sollten Sie folgende Ausgabe sehen:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
```

### Backend Endpoints testen

**Health Check:**
```bash
curl http://localhost:5015/weatherforecast
```

**API Dokumentation öffnen:**
- DEV: http://localhost:5015/scalar/v1
- TEST: http://localhost:5016/scalar/v1

---

## 👤 Test Users Erstellen

### Methode 1: Mit VS Code REST Client Extension

1. Installieren Sie die Extension: **REST Client** von Huachao Mao
2. Öffnen Sie die Datei: `docs/TEST_USERS_SETUP.http`
3. Klicken Sie auf "Send Request" über den HTTP-Requests

**Vordefinierte Test-User:**
- **DEV**: `dev@kynso.ch` / `123456` (TenantID: 1)
- **TEST**: `test@kynso.ch` / `123456` (TenantID: 1)

### Methode 2: Mit Postman

1. Importieren Sie die Collection: `docs/Kynso_Test_Users.postman_collection.json`
2. Führen Sie die Requests der Reihe nach aus:
   - Für DEV: Requests 1-3
   - Für TEST: Requests 4-6

### Methode 3: Manuell mit curl

**DEV User erstellen:**
```bash
curl -X POST http://localhost:5015/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@kynso.ch",
    "password": "123456",
    "tenantId": 1
  }'
```

**TEST User erstellen:**
```bash
curl -X POST http://localhost:5016/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@kynso.ch",
    "password": "123456",
    "tenantId": 1
  }'
```

---

## 🔐 Berechtigungen setzen (Optional)

Nach dem Erstellen der User, Admin-Rechte vergeben:

### Für DEV (kynso_dev):
```sql
psql -U postgres -d kynso_dev
UPDATE "Users" SET "Permissions" = 4095 WHERE "Email" = 'dev@kynso.ch';
```

### Für TEST (kynso_test):
```sql
psql -U postgres -d kynso_test
UPDATE "Users" SET "Permissions" = 4095 WHERE "Email" = 'test@kynso.ch';
```

**Hinweis:** `4095` = Admin mit allen Rechten

---

## 📋 Kompletter Workflow

### 1️⃣ DEV Umgebung testen

```bash
# Terminal 1: Backend starten
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Terminal 2: Frontend starten
cd src/frontend
npm run start:dev

# Terminal 3: Test-User erstellen (einmalig)
# Verwenden Sie eine der oben genannten Methoden
```

Dann öffnen: http://localhost:4200

### 2️⃣ TEST Umgebung testen

```bash
# Terminal 1: Backend starten
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test

# Terminal 2: Frontend starten
cd src/frontend
npm run start:test

# Terminal 3: Test-User erstellen (einmalig)
# Verwenden Sie eine der oben genannten Methoden
```

Dann öffnen: http://localhost:4300

---

## ⚠️ Wichtige Hinweise

1. **Datenbanken müssen existieren:**
   - `kynso_dev` für Development
   - `kynso_test` für Test
   
   Falls nicht vorhanden:
   ```bash
   psql -U postgres
   CREATE DATABASE kynso_dev;
   CREATE DATABASE kynso_test;
   \q
   ```

2. **Migrationen anwenden:**
   ```bash
   cd src/backend/RP.CRM.Api
   
   # Für DEV
   $env:ASPNETCORE_ENVIRONMENT="Development"
   dotnet ef database update
   
   # Für TEST
   $env:ASPNETCORE_ENVIRONMENT="Test"
   dotnet ef database update
   ```

3. **Tenant muss existieren:**
   Der Tenant mit ID 1 muss in der Datenbank vorhanden sein. Falls nicht, erstellen Sie ihn:
   ```sql
   INSERT INTO "Tenants" ("Name", "Domain", "IsActive") 
   VALUES ('Default', 'localhost', true);
   ```

---

## 🔗 Weitere Dokumentation

- **[BACKEND_START_ANLEITUNG.md](BACKEND_START_ANLEITUNG.md)** - ⭐ **NEU!** Ausführliche Backend-Anleitung
- **[SCHNELLREFERENZ.md](../SCHNELLREFERENZ.md)** - Übersicht aller Befehle
- **[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)** - Detaillierte Postman Anleitung
- **[WORKFLOW_ANLEITUNG.md](../WORKFLOW_ANLEITUNG.md)** - Vollständiger DEV/TEST/MAIN Workflow
- **[LOCAL_DEVELOPMENT_SETUP.md](../LOCAL_DEVELOPMENT_SETUP.md)** - Entwicklungsumgebung einrichten

---

## 🆘 Probleme?

### Frontend startet nicht
- Überprüfen Sie `npm install` wurde ausgeführt
- Port 4200/4300 bereits belegt? → Prozess beenden
- Node.js installiert? → `node --version` (sollte 20.x oder höher sein)

### Backend startet nicht
- PostgreSQL läuft? → Service starten (`Start-Service postgresql` oder `brew services start postgresql`)
- Datenbank existiert? → Siehe oben (CREATE DATABASE kynso_dev/kynso_test)
- Migrationen angewendet? → `dotnet ef database update`
- Port bereits belegt? 
  ```bash
  # Windows: Port 5015/5016 prüfen
  netstat -ano | findstr :5015
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5015 | xargs kill -9
  ```
- .NET Version falsch? → `dotnet --version` (sollte 8.0.x sein, siehe global.json)
- Falsche Umgebung aktiv? → Launch-Profile prüfen oder Umgebungsvariable setzen

### Backend läuft, aber API antwortet nicht
- CORS-Fehler im Browser? → Backend-Log prüfen: "✅ CORS allowed origins"
- Firewall blockiert Port? → Port 5015/5016 freigeben
- Falscher Port in Frontend-Config? → Check Angular environment files

### User kann nicht erstellt werden
- Backend läuft auf richtigem Port? → DEV=5015, TEST=5016
- Datenbank und Tenant vorhanden? → Tenant mit ID 1 muss existieren
- User existiert bereits? → Andere Email verwenden oder User in DB löschen
- Connection String korrekt? → Siehe appsettings.Development.json / appsettings.Test.json

### Login funktioniert nicht
- Berechtigungen gesetzt? → SQL UPDATE ausführen (siehe oben)
- Token abgelaufen? → Neu einloggen (Token gilt 6 Stunden)
- Richtiger Port? → DEV=5015, TEST=5016
- Host-Header fehlt? → Bei Login `Host: localhost` setzen
- JWT Secret fehlt? → appsettings.json prüfen

### Datenbank-Probleme
- Migration schlägt fehl? → Siehe [DATENBANK_RESET_ANLEITUNG.md](../DATENBANK_RESET_ANLEITUNG.md)
- Connection String ungültig? → PostgreSQL Credentials in appsettings prüfen
- Falsche Datenbank verwendet? → ASPNETCORE_ENVIRONMENT korrekt gesetzt?

---

**Bei weiteren Fragen:** Siehe detaillierte Dokumentation oder kontaktieren Sie das Team.
