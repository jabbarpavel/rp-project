# 👤 Production User Erstellung - Kynso CRM

## 📋 Übersicht

Diese Anleitung zeigt dir, wie du Benutzer für die **Production** Umgebung erstellen kannst.

**Production Setup:**
- 🌐 Haupt-Domain: kynso.ch
- 🏢 Finaro Tenant: finaro.kynso.ch
- 🎯 Demo Tenant: demo.kynso.ch
- 🖥️ Server: 83.228.225.166
- 🔌 Backend API: Port 5000 (Docker Container)

> **Hinweis zu Ports:** Das Backend in Docker verwendet Port 5000 (konfiguriert über `ASPNETCORE_URLS`). Bei lokaler Entwicklung wird Port 5015 (Development) oder 5016 (Test) verwendet.

---

## 🚀 Schnellanleitung

### Voraussetzungen

1. ✅ Backend und Frontend laufen auf dem Server
2. ✅ Tenants sind in der Datenbank angelegt (Finaro und Demo)
3. ✅ Du hast Zugriff auf ein Tool für API-Requests (curl, Postman, oder VS Code REST Client)

### Tenant IDs herausfinden

Bevor du User erstellst, musst du die Tenant IDs wissen. Verbinde dich per SSH zum Server:

```bash
ssh ubuntu@83.228.225.166
```

Dann verbinde zur Production Datenbank:

```bash
# Verbinde zur Datenbank
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod
```

Oder falls Docker nicht läuft, direkt mit psql:

```bash
psql -U kynso_user -d kynso_prod
```

Tenant IDs abfragen:

```sql
SELECT "Id", "Name", "Domain" FROM "Tenants";
```

Erwartetes Ergebnis:
```
 Id |  Name  |      Domain       
----+--------+-------------------
  1 | Finaro | finaro.kynso.ch
  2 | Demo   | demo.kynso.ch
```

Datenbank verlassen:
```sql
\q
```

---

## 🔧 Methode 1: User über API erstellen (EMPFOHLEN)

> **⚠️ WICHTIG - HTTP vs HTTPS:**
> - **Auf dem Server** (via SSH): Verwende `http://localhost:5000` - direkter Zugriff ohne SSL
> - **Von extern** (dein Computer): Verwende `https://finaro.kynso.ch` oder `https://demo.kynso.ch` - HTTPS erforderlich
> - **Warum?** Der externe nginx erzwingt HTTPS und leitet HTTP auf HTTPS um. Bei POST-Requests geht dabei der Request-Body verloren (301 Redirect).

### Option A: Mit curl (direkt auf dem Server)

#### 1. User für Finaro erstellen

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.com",
    "password": "FinaroAdmin2025!",
    "tenantId": 1
  }'
```

**Erwartete Antwort (Success):**
```json
{
  "id": 1,
  "email": "admin@finaro.com",
  "tenantId": 1,
  "firstName": "",
  "name": "",
  "phone": "",
  "isActive": true
}
```

#### 2. User für Demo erstellen

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "DemoAdmin2025!",
    "tenantId": 2
  }'
```

---

### Option B: Mit VS Code REST Client (von deinem lokalen Rechner)

Erstelle eine neue Datei: `production-users.http`

```http
### =============================================================================
### PRODUCTION ENVIRONMENT
### =============================================================================

@prod_baseUrl = https://finaro.kynso.ch/api
# WICHTIG: Verwende HTTPS für externe Zugriffe (von deinem Computer aus)
# Nur auf dem Server selbst kann HTTP verwendet werden: http://localhost:5000/api

### 1. User für Finaro erstellen (Tenant ID = 1)
POST {{prod_baseUrl}}/user/register
Content-Type: application/json

{
  "email": "admin@finaro.com",
  "password": "FinaroAdmin2025!",
  "tenantId": 1
}

### 2. User für Demo erstellen (Tenant ID = 2)
POST {{prod_baseUrl}}/user/register
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "DemoAdmin2025!",
  "tenantId": 2
}

### 3. Login testen (Finaro)
# @name finaroLogin
POST {{prod_baseUrl}}/user/login
Content-Type: application/json
Host: finaro.kynso.ch

{
  "email": "admin@finaro.com",
  "password": "FinaroAdmin2025!"
}

### 4. Login testen (Demo)
# @name demoLogin
POST {{prod_baseUrl}}/user/login
Content-Type: application/json
Host: demo.kynso.ch

{
  "email": "admin@demo.com",
  "password": "DemoAdmin2025!"
}

### 5. Aktuellen User abrufen (Finaro)
GET {{prod_baseUrl}}/user/me
Authorization: Bearer {{finaroLogin.response.body.token}}
TenantID: 1

### 6. Aktuellen User abrufen (Demo)
GET {{prod_baseUrl}}/user/me
Authorization: Bearer {{demoLogin.response.body.token}}
TenantID: 2
```

---

### Option C: Mit Postman

#### 1. Environment Setup

**Environment Name:** Kynso Production

**Variables:**
| Variable | Value |
|----------|-------|
| baseUrl | https://finaro.kynso.ch/api |
| jwt_token | (leer lassen) |

> **💡 Tipp:** Verwende immer HTTPS (`https://`) wenn du von deinem Computer aus zugreifst. HTTP funktioniert nur direkt auf dem Server über `localhost`.

#### 2. User für Finaro registrieren

- **Method:** POST
- **URL:** `{{baseUrl}}/user/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "admin@finaro.com",
    "password": "FinaroAdmin2025!",
    "tenantId": 1
  }
  ```

#### 3. User für Demo registrieren

- **Method:** POST
- **URL:** `{{baseUrl}}/user/register` (ändere baseUrl zu https://demo.kynso.ch/api)
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "admin@demo.com",
    "password": "DemoAdmin2025!",
    "tenantId": 2
  }
  ```

---

## 🔑 Login testen

### Finaro Login

1. Öffne Browser: https://finaro.kynso.ch/login
2. Email: `admin@finaro.com`
3. Passwort: `FinaroAdmin2025!`

### Demo Login

1. Öffne Browser: https://demo.kynso.ch/login
2. Email: `admin@demo.com`
3. Passwort: `DemoAdmin2025!`

---

## 👑 Admin-Rechte vergeben

Nach der User-Erstellung haben die User standardmäßig eingeschränkte Rechte. Um Admin-Rechte zu vergeben:

### SSH zum Server

```bash
ssh ubuntu@83.228.225.166
```

### Datenbank öffnen

```bash
# Mit Docker
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod

# Oder direkt
psql -U kynso_user -d kynso_prod
```

### Admin-Rechte setzen

```sql
-- Admin-Rechte für Finaro User
UPDATE "Users" 
SET "Permissions" = 4095, "Role" = 'Admin'
WHERE "Email" = 'admin@finaro.com';

-- Admin-Rechte für Demo User
UPDATE "Users" 
SET "Permissions" = 4095, "Role" = 'Admin'
WHERE "Email" = 'admin@demo.com';

-- Prüfen
SELECT "Id", "Email", "TenantId", "Role", "Permissions", "IsActive" 
FROM "Users";
```

**Permission Wert 4095 = Alle Rechte**

```sql
\q  -- Datenbank verlassen
```

---

## 🔍 Troubleshooting

### Problem: 301 Redirect bei curl/API-Anfragen

**Symptom**: 
```html
<html>
<head><title>301 Moved Permanently</title></head>
<body>
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
</body>
</html>
```

**Ursache**: Du versuchst von extern mit HTTP statt HTTPS zuzugreifen. Der nginx Server erzwingt HTTPS und leitet HTTP-Anfragen um. Bei POST-Requests geht dabei der Request-Body verloren.

**Lösung**:
```bash
# ❌ FALSCH - HTTP von extern:
curl -X POST http://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.ch","password":"123456","tenantId":1}'

# ✅ RICHTIG - HTTPS von extern:
curl -X POST https://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.ch","password":"123456","tenantId":1}'

# ✅ AUCH RICHTIG - HTTP auf dem Server (via SSH):
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.ch","password":"123456","tenantId":1}'
```

### Problem: "Welcome to nginx" anstatt Login-Seite

Das passiert wenn das Frontend nicht korrekt deployed ist. Prüfe:

```bash
# Auf dem Server
cd /opt/kynso/prod/app

# Docker Container Status prüfen
docker-compose ps

# Frontend Container Logs ansehen
docker-compose logs frontend

# Falls Container nicht läuft, neu starten
docker-compose up -d --build frontend
```

### Problem: "Unknown tenant for subdomain"

Das passiert wenn der Tenant nicht in der Datenbank existiert. Prüfe:

```bash
# Tenants in Datenbank prüfen
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT * FROM \"Tenants\";"
```

Falls Tenants fehlen, werden sie beim Backend-Start automatisch erstellt aus `tenants.Production.json`.

### Problem: User bereits vorhanden

Falls du die Fehlermeldung "User already exists" bekommst:

```sql
-- User löschen und neu anlegen
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod

DELETE FROM "Users" WHERE "Email" = 'admin@finaro.com';
-- Dann erneut über API registrieren
\q
```

### Problem: Login funktioniert nicht

1. **Passwort prüfen:** Mindestens 6 Zeichen erforderlich
2. **Tenant prüfen:** Stelle sicher dass du auf der richtigen Subdomain bist (finaro.kynso.ch für Finaro User)
3. **Backend Logs prüfen:**
   ```bash
   docker-compose logs backend | tail -50
   ```

---

## 📝 Empfohlene User-Struktur

### Für Finaro (Tenant ID: 1)

```
Admin User:
- Email: admin@finaro.com
- Password: FinaroAdmin2025! (oder dein eigenes starkes Passwort)
- Role: Admin
- Permissions: 4095

Test User:
- Email: user@finaro.com
- Password: FinaroUser2025!
- Role: User
- Permissions: 15 (Basis-Rechte)
```

### Für Demo (Tenant ID: 2)

```
Admin User:
- Email: admin@demo.com
- Password: DemoAdmin2025! (oder dein eigenes starkes Passwort)
- Role: Admin
- Permissions: 4095

Test User:
- Email: user@demo.com
- Password: DemoUser2025!
- Role: User
- Permissions: 15 (Basis-Rechte)
```

---

## 🔐 Sicherheitshinweise

1. ✅ **Ändere die Passwörter!** Die Beispiel-Passwörter sind nur für Demo-Zwecke
2. ✅ **Verwende starke Passwörter:** Mindestens 8 Zeichen, Groß/Kleinbuchstaben, Zahlen, Sonderzeichen
3. ✅ **Speichere Passwörter sicher:** Verwende einen Password Manager
4. ✅ **Produktions-Datenbank:** Erstelle regelmäßige Backups
5. ✅ **HTTPS:** Stelle sicher dass SSL-Zertifikate aktiv sind

---

## ✅ Checkliste

Nach der User-Erstellung:

- [ ] User für Finaro erstellt (Tenant ID: 1)
- [ ] User für Demo erstellt (Tenant ID: 2)
- [ ] Admin-Rechte in Datenbank vergeben
- [ ] Login getestet auf finaro.kynso.ch
- [ ] Login getestet auf demo.kynso.ch
- [ ] Passwörter sicher gespeichert
- [ ] Funktionen im System getestet (Kunden anlegen, etc.)

---

## 📚 Weitere Dokumentation

- [SERVICE_TESTING.md](SERVICE_TESTING.md) - Services testen
- [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) - API Testing mit Postman
- [Kynso_Setup_guide.md](Kynso_Setup_guide.md) - Production Setup
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Probleme lösen

---

**Status:** ✅ Ready to use
**Zuletzt aktualisiert:** 2025-11-21
