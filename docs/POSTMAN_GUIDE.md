# Postman Guide - API Testing & User Creation

## Übersicht

Diese Anleitung zeigt, wie Sie mit Postman neue Benutzer erstellen und die API testen können.

## 1. Postman Setup

### Postman installieren
1. Download von [postman.com](https://www.postman.com/downloads/)
2. Installieren und starten

### Neue Collection erstellen
1. Klicken Sie auf "New" → "Collection"
2. Name: "RP CRM API"
3. Speichern

## 2. Environment Variables einrichten

1. Klicken Sie auf "Environments" → "Create Environment"
2. Name: "RP CRM Local"
3. Variablen hinzufügen:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| baseUrl | http://localhost:5020 | http://localhost:5020 |
| jwt_token | (leer lassen) | (wird automatisch gesetzt) |
| tenantId | 1 | 1 |

4. Speichern und aktivieren (Dropdown oben rechts)

## 3. Neuen User registrieren

### Request erstellen

**Method:** POST  
**URL:** `{{baseUrl}}/api/user/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@finaro.com",
  "password": "Admin123!",
  "tenantId": 1
}
```

**Antwort (Success 200):**
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

### Weitere Test-User erstellen

**Standard User:**
```json
{
  "email": "user@finaro.com",
  "password": "User123!",
  "tenantId": 1
}
```

**User für anderen Tenant:**
```json
{
  "email": "admin@democorp.com",
  "password": "Admin123!",
  "tenantId": 2
}
```

## 4. User einloggen

### Request erstellen

**Method:** POST  
**URL:** `{{baseUrl}}/api/user/login`

**Headers:**
```
Content-Type: application/json
Host: finaro
```

**Body (raw JSON):**
```json
{
  "email": "admin@finaro.com",
  "password": "Admin123!"
}
```

**Antwort (Success 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenantId": 1,
  "tenantName": "Finaro"
}
```

### Token automatisch speichern (Test Script)

Klicken Sie auf den Tab "Tests" im Request und fügen Sie hinzu:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("tenantId", response.tenantId);
    console.log("Token gespeichert:", response.token.substring(0, 20) + "...");
}
```

## 5. Benutzer-Berechtigungen setzen

Nach dem Erstellen eines Users müssen Sie die Berechtigungen in der Datenbank setzen:

### Mit psql oder pgAdmin:

```sql
-- User zu Admin machen (alle Rechte)
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Email" = 'admin@finaro.com';

-- Standard User (basic permissions)
UPDATE "Users" 
SET "Permissions" = 55 
WHERE "Email" = 'user@finaro.com';
```

## 6. Geschützte Endpoints testen

### Aktuellen User abrufen

**Method:** GET  
**URL:** `{{baseUrl}}/api/user/me`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
TenantID: {{tenantId}}
```

**Antwort:**
```json
{
  "id": 1,
  "email": "admin@finaro.com",
  "firstName": "Max",
  "name": "Mustermann",
  "phone": "+41 79 123 45 67",
  "isActive": true,
  "role": "Admin",
  "tenantId": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "tenantName": "Finaro"
}
```

### Kunden abrufen

**Method:** GET  
**URL:** `{{baseUrl}}/api/customer`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
TenantID: {{tenantId}}
```

## 7. Authorization Header automatisch setzen

Um nicht bei jedem Request den Header manuell setzen zu müssen:

1. Gehe zu Collection "RP CRM API"
2. Klicke auf "Authorization" Tab
3. Type: "Bearer Token"
4. Token: `{{jwt_token}}`
5. Speichern

Jetzt wird der Token automatisch bei allen Requests in dieser Collection verwendet!

### TenantID Header automatisch setzen

1. Collection "RP CRM API" → Tab "Headers"
2. Key: `TenantID`, Value: `{{tenantId}}`
3. Speichern

## 8. Komplette Request-Sammlung

### 1. Register User
```
POST {{baseUrl}}/api/user/register
Body: { "email": "...", "password": "...", "tenantId": 1 }
```

### 2. Login
```
POST {{baseUrl}}/api/user/login
Headers: Host: finaro
Body: { "email": "...", "password": "..." }
Tests: pm.environment.set("jwt_token", response.token)
```

### 3. Get Current User
```
GET {{baseUrl}}/api/user/me
Auth: Bearer {{jwt_token}}
```

### 4. Update Profile
```
PUT {{baseUrl}}/api/user/me
Auth: Bearer {{jwt_token}}
Body: { "firstName": "Max", "name": "Mustermann", "phone": "+41 79 123 45 67" }
```

### 5. Get Customers
```
GET {{baseUrl}}/api/customer
Auth: Bearer {{jwt_token}}
```

### 6. Get Customer by ID
```
GET {{baseUrl}}/api/customer/1
Auth: Bearer {{jwt_token}}
```

### 7. Create Customer
```
POST {{baseUrl}}/api/customer
Auth: Bearer {{jwt_token}}
Body: { "firstName": "...", "name": "...", "email": "...", "ahvNum": "..." }
```

### 8. Update Customer
```
PUT {{baseUrl}}/api/customer/1
Auth: Bearer {{jwt_token}}
Body: { "firstName": "...", "name": "...", "email": "...", "ahvNum": "..." }
```

### 9. Delete Customer
```
DELETE {{baseUrl}}/api/customer/1
Auth: Bearer {{jwt_token}}
```

### 10. Get Documents for Customer
```
GET {{baseUrl}}/api/documents/customer/1
Auth: Bearer {{jwt_token}}
```

### 11. Upload Document
```
POST {{baseUrl}}/api/documents
Auth: Bearer {{jwt_token}}
Body: form-data
  - customerId: 1
  - file: [Select File]
```

### 12. Download Document
```
GET {{baseUrl}}/api/documents/1/download
Auth: Bearer {{jwt_token}}
```

### 13. Delete Document
```
DELETE {{baseUrl}}/api/documents/1
Auth: Bearer {{jwt_token}}
```

## 9. Troubleshooting

### "Unauthorized" Fehler
- Token ist abgelaufen → Neu einloggen
- Token nicht gesetzt → Login-Request mit Test Script ausführen
- TenantID Header fehlt → Überprüfen und setzen

### "Forbidden" Fehler
- User hat keine Berechtigung für diese Aktion
- Berechtigungen in Datenbank überprüfen und anpassen

### "Unknown tenant" Fehler
- Host-Header fehlt oder falsch
- Setzen Sie `Host: finaro` im Login-Request

### "Tenant not found" Fehler
- TenantID im Environment falsch
- Überprüfen Sie die Tenants-Tabelle in der Datenbank

## 10. Best Practices

1. **Separate Environments:** Erstellen Sie verschiedene Environments für Dev, Staging, Production
2. **Pre-request Scripts:** Automatisieren Sie Token-Refresh
3. **Tests:** Fügen Sie Tests hinzu, um API-Antworten zu validieren
4. **Variables:** Nutzen Sie Variables für wiederkehrende IDs
5. **Collections:** Organisieren Sie Requests in Ordnern

## 11. Export/Import Collection

### Collection exportieren
1. Rechtsklick auf Collection
2. "Export"
3. Format: Collection v2.1
4. Speichern als `RP-CRM-API.postman_collection.json`

### Collection importieren
1. "Import" Button
2. File auswählen oder Drag & Drop
3. Import bestätigen

## 12. Quick Start Checkliste

- [ ] Postman installiert
- [ ] Environment "RP CRM Local" erstellt mit baseUrl
- [ ] Backend läuft auf Port 5020
- [ ] User mit POST /api/user/register erstellt
- [ ] Login mit POST /api/user/login durchgeführt
- [ ] Token automatisch gespeichert (Test Script)
- [ ] Berechtigungen in DB gesetzt (UPDATE Users SET Permissions = 4095)
- [ ] Geschützte Endpoints getestet (GET /api/user/me)
- [ ] Authorization Header automatisch für Collection gesetzt

---

Bei Fragen: Siehe SETUP_GUIDE.md für Backend-Setup oder PERMISSIONS_GUIDE.md für Berechtigungen.
