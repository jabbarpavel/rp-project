# Testing Guide für Connection Fix

Dieses Dokument beschreibt, wie die Connection-Fix-Änderungen getestet werden können.

## Voraussetzungen
- PostgreSQL muss laufen
- Datenbanken `kynso_dev` und `kynso_test` müssen existieren
- .NET 8.0 SDK installiert
- Node.js 20+ installiert

## Test 1: Development Environment

### Schritt 1: Backend starten
```bash
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

**Erwartete Ausgabe:**
```
🌍 Environment: Development
✅ Test environment: Bound ports 5015 (localhost) and 5020 (all IPs)
✅ API base URL gesetzt: http://localhost:5020
```

### Schritt 2: Frontend starten (neues Terminal)
```bash
cd src/frontend
npm start
```

**Erwartete Ausgabe:**
```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
```

### Schritt 3: Browser öffnen
1. Öffne http://localhost:4200
2. Öffne Browser DevTools (F12)
3. Gehe zur Console-Tab
4. Schaue nach folgenden Log-Einträgen:

**Erwartete Console-Logs:**
```
✅ ConfigService - Base URL set to: http://localhost:5020
   Environment detected: Development
✅ AuthService - Using base URL: http://localhost:5020
✅ ApiService - Using base URL: http://localhost:5020
```

### Schritt 4: Login testen
1. Gehe zur Login-Seite
2. Gib Test-Credentials ein:
   - Email: `admin@finaro.local`
   - Passwort: `admin123`
3. Schaue in DevTools → Network Tab

**Erwartete Network-Request:**
```
Request URL: http://localhost:5020/user/login
Request Method: POST
Status: 200 OK (wenn User existiert) oder 401 (wenn nicht)
```

**WICHTIG:** Es sollte **NICHT** sein:
- ❌ `http://localhost:5015/user/login` (falscher Port)
- ❌ `http://finaro.localhost:5020/user/login` (falscher Host)

---

## Test 2: Test Environment

### Schritt 1: Backend starten
```bash
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Test dotnet run
```

**Erwartete Ausgabe:**
```
🌍 Environment: Test
✅ Test environment: Bound ports 5016 (localhost) and 5021 (all IPs)
```

### Schritt 2: Frontend starten (neues Terminal)
```bash
cd src/frontend
npm run start:test
```

**Erwartete Ausgabe:**
```
** Angular Live Development Server is listening on localhost:4300, open your browser on http://localhost:4300/ **
```

### Schritt 3: Browser öffnen
1. Öffne http://localhost:4300
2. Öffne Browser DevTools (F12)
3. Schaue in der Console nach:

**Erwartete Console-Logs:**
```
✅ ConfigService - Base URL set to: http://localhost:5021
   Environment detected: Test
✅ AuthService - Using base URL: http://localhost:5021
✅ ApiService - Using base URL: http://localhost:5021
```

### Schritt 4: Login testen
1. Gehe zur Login-Seite
2. Versuche Login
3. Schaue in DevTools → Network Tab

**Erwartete Network-Request:**
```
Request URL: http://localhost:5021/user/login
Request Method: POST
```

**WICHTIG:** Port muss **5021** sein, nicht 5020!

---

## Test 3: Production Environment (Docker)

### Schritt 1: Docker Compose starten
```bash
docker-compose up --build
```

### Schritt 2: Browser öffnen
1. Öffne http://localhost:8080
2. Öffne Browser DevTools
3. Schaue in der Console

**Erwartete Console-Logs:**
```
✅ ConfigService - Base URL set to http://localhost:8080
   Environment detected: Production
```

### Schritt 3: API testen
```bash
curl http://localhost:8080/api/health
```

**Erwartete Antwort:**
```json
{"status":"healthy"}
```

---

## Test 4: CORS-Test

### Test 4.1: Development CORS
Mit Backend auf Port 5020 und Frontend auf Port 4200:

```bash
# Terminal 1: Backend
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run

# Terminal 2: Frontend
cd src/frontend
npm start
```

**Erwartung:** Keine CORS-Fehler in der Browser-Console

### Test 4.2: Test CORS
Mit Backend auf Port 5021 und Frontend auf Port 4300:

```bash
# Terminal 1: Backend
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Test dotnet run

# Terminal 2: Frontend
cd src/frontend
npm run start:test
```

**Erwartung:** Keine CORS-Fehler in der Browser-Console

---

## Test 5: API-Endpoint-Test

### Direkter API-Test (Backend muss laufen)

#### Development:
```bash
# Health Check
curl http://localhost:5020/api/health

# Login (wenn User existiert)
curl -X POST http://localhost:5020/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.local","password":"admin123"}'
```

#### Test:
```bash
# Health Check
curl http://localhost:5021/api/health

# Login
curl -X POST http://localhost:5021/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.local","password":"admin123"}'
```

---

## Troubleshooting

### Problem: "ERR_CONNECTION_REFUSED"
**Mögliche Ursachen:**
1. Backend läuft nicht → Starte Backend neu
2. Falscher Port → Überprüfe Console-Logs für ConfigService
3. Firewall blockiert → Deaktiviere Firewall temporär

### Problem: CORS-Fehler
**Mögliche Ursachen:**
1. Backend erlaubt Frontend-Origin nicht
2. Überprüfe Backend-Logs für "CORS allowed origins"
3. Stelle sicher, dass tenant.json Files korrekt sind

### Problem: Falsche Backend-URL
**Debug-Schritte:**
1. Öffne Browser DevTools → Console
2. Suche nach "ConfigService - Base URL set to"
3. Wenn falsch, überprüfe:
   - Frontend-Port (4200 für Dev, 4300 für Test)
   - Hostname (sollte localhost sein für lokale Tests)

### Problem: 404 Not Found
**Mögliche Ursachen:**
1. Backend-Route existiert nicht
2. Überprüfe API-Controller
3. Schaue in Backend-Logs

---

## Erfolgskriterien

✅ **Development:**
- Frontend läuft auf Port 4200
- Backend läuft auf Port 5020
- Login-Request geht an http://localhost:5020/user/login
- Keine CORS-Fehler
- Keine Connection-Refused-Fehler

✅ **Test:**
- Frontend läuft auf Port 4300
- Backend läuft auf Port 5021
- Login-Request geht an http://localhost:5021/user/login
- Keine CORS-Fehler
- Keine Connection-Refused-Fehler

✅ **Production:**
- Docker Container laufen
- Frontend erreichbar über http://localhost:8080
- Backend erreichbar über http://localhost:8080/api/*
- Keine CORS-Fehler

---

## Automatisierte Tests (optional)

Erstelle ein Test-Script:

```bash
#!/bin/bash
# test-connection.sh

echo "🧪 Testing Connection Configuration..."

# Test 1: Check if ConfigService exists
if [ -f "src/frontend/src/app/core/services/config.service.ts" ]; then
    echo "✅ ConfigService exists"
else
    echo "❌ ConfigService not found"
    exit 1
fi

# Test 2: Check if AuthService imports ConfigService
if grep -q "ConfigService" "src/frontend/src/app/core/services/auth.service.ts"; then
    echo "✅ AuthService imports ConfigService"
else
    echo "❌ AuthService doesn't import ConfigService"
    exit 1
fi

# Test 3: Check if ApiService imports ConfigService
if grep -q "ConfigService" "src/frontend/src/app/core/services/api.service.ts"; then
    echo "✅ ApiService imports ConfigService"
else
    echo "❌ ApiService doesn't import ConfigService"
    exit 1
fi

# Test 4: Check if static tenants.json import is removed
if grep -q "import tenants from" "src/frontend/src/app/core/services/auth.service.ts"; then
    echo "❌ AuthService still has static tenants.json import"
    exit 1
else
    echo "✅ Static tenants.json import removed from AuthService"
fi

echo ""
echo "✅ All checks passed!"
```

Ausführen:
```bash
chmod +x test-connection.sh
./test-connection.sh
```
