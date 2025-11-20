# 🚀 Frontend Starten & Test Users Erstellen

Diese Anleitung zeigt, wie Sie das Frontend für verschiedene Umgebungen starten und Test-User erstellen.

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

## 🔧 Backend gleichzeitig starten

Öffnen Sie ein separates Terminal-Fenster:

### Backend für DEV:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

### Backend für TEST:
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

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

- **[SCHNELLREFERENZ.md](../SCHNELLREFERENZ.md)** - Übersicht aller Befehle
- **[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)** - Detaillierte Postman Anleitung
- **[WORKFLOW_ANLEITUNG.md](../WORKFLOW_ANLEITUNG.md)** - Vollständiger DEV/TEST/MAIN Workflow
- **[LOCAL_DEVELOPMENT_SETUP.md](../LOCAL_DEVELOPMENT_SETUP.md)** - Entwicklungsumgebung einrichten

---

## 🆘 Probleme?

### Frontend startet nicht
- Überprüfen Sie `npm install` wurde ausgeführt
- Port 4200/4300 bereits belegt? → Prozess beenden

### Backend startet nicht
- PostgreSQL läuft? → Service starten
- Datenbank existiert? → Siehe oben
- Migrationen angewendet? → `dotnet ef database update`

### User kann nicht erstellt werden
- Backend läuft auf richtigem Port?
- Datenbank und Tenant vorhanden?
- User existiert bereits? → Andere Email verwenden oder User in DB löschen

### Login funktioniert nicht
- Berechtigungen gesetzt? → SQL UPDATE ausführen (siehe oben)
- Token abgelaufen? → Neu einloggen
- Richtiger Port? → DEV=5015, TEST=5016

---

**Bei weiteren Fragen:** Siehe detaillierte Dokumentation oder kontaktieren Sie das Team.
