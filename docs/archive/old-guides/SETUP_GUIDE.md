# VS Code Setup und Start Guide

**Hinweis:** Dieser Guide ist für die **lokale Entwicklung**. Für die Production-Umgebung siehe [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md).

## 📋 Voraussetzungen

Stelle sicher, dass folgende Tools installiert sind:
- ✅ .NET 8 SDK
- ✅ Node.js (v18+)
- ✅ PostgreSQL
- ✅ VS Code

## 🗄️ Schritt 1: Database Migration

### 1.1 PostgreSQL starten und Datenbank erstellen

Öffne ein Terminal und stelle sicher, dass PostgreSQL läuft:

```bash
# PostgreSQL Service Status prüfen (Linux/Mac)
sudo systemctl status postgresql

# Oder auf Windows:
# Services öffnen und PostgreSQL Service suchen
```

### 1.2 Datenbank erstellen (falls noch nicht vorhanden)

**Für lokale Entwicklung** verwenden wir die Datenbank `kynso_dev`:

```bash
# In PostgreSQL einloggen
psql -U postgres

# Datenbank erstellen
CREATE DATABASE kynso_dev;

# Beenden
\q
```

**Hinweis:** Die Production-Umgebung verwendet `kynso_prod` - siehe [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md).

```bash
# In PostgreSQL einloggen
psql -U postgres

# Datenbank erstellen
CREATE DATABASE kynso_dev;

# Beenden
\q
```

### 1.3 Connection String prüfen

Die Datenbankverbindung ist in `src/backend/RP.CRM.Api/appsettings.json` konfiguriert:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

**⚠️ WICHTIG:** Passe Username und Password an deine PostgreSQL-Installation an!

### 1.4 Migration ausführen

Öffne ein Terminal in VS Code und navigiere zum API-Projekt:

```bash
# Zum Backend-Verzeichnis wechseln
cd src/backend/RP.CRM.Api

# Migration auf Datenbank anwenden
dotnet ef database update

# Du solltest diese Ausgabe sehen:
# ✅ Applying migration '20251117210538_AddPermissionsAndDocuments'
# ✅ Done.
```

**Alternative:** Falls `dotnet ef` nicht gefunden wird:

```bash
# EF Core Tools global installieren
dotnet tool install --global dotnet-ef

# Dann nochmal versuchen
dotnet ef database update
```

---

## 🚀 Schritt 2: Backend starten

### 2.1 Terminal für Backend öffnen

In VS Code:
1. Drücke `` Ctrl + ` `` (Backtick) um Terminal zu öffnen
2. Oder: Menü → Terminal → New Terminal

### 2.2 Backend starten

```bash
# Zum Backend-Verzeichnis
cd src/backend/RP.CRM.Api

# Backend starten
dotnet run

# Oder mit Watch-Modus (empfohlen für Entwicklung):
dotnet watch run
```

**✅ Erfolgreich wenn du siehst:**
```
✅ Loaded tenant domains:
   http://finaro:4200
   https://finaro:4200
✅ Bound port 5020 for all tenant hostnames
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://[::]:5020
```

**Backend läuft jetzt auf:**
- http://localhost:5015
- http://localhost:5020

**Swagger/Scalar API Dokumentation:**
- http://localhost:5015/scalar/v1

---

## 🎨 Schritt 3: Frontend starten

### 3.1 Neues Terminal öffnen

**WICHTIG:** Das Backend-Terminal offen lassen! Öffne ein NEUES Terminal:
- Klicke auf das **+** Symbol im Terminal-Panel
- Oder: `` Ctrl + Shift + ` ``

### 3.2 Dependencies installieren (nur beim ersten Mal)

```bash
# Zum Frontend-Verzeichnis
cd src/frontend

# Dependencies installieren
npm install
```

### 3.3 Frontend starten

```bash
# Noch im Frontend-Verzeichnis
ng serve

# Oder mit spezifischem Port:
ng serve --port 4200
```

**✅ Erfolgreich wenn du siehst:**
```
✔ Browser application bundle generation complete.
Initial chunk files | Names | Size
...
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

**Frontend läuft jetzt auf:**
- http://localhost:4200

---

## 🔧 Schritt 4: Hosts-Datei anpassen (WICHTIG!)

Das Projekt verwendet Multi-Tenant Domains. Du musst die Hosts-Datei anpassen:

### Windows:
1. Öffne `C:\Windows\System32\drivers\etc\hosts` als Administrator
2. Füge hinzu:
   ```
   127.0.0.1 finaro
   127.0.0.1 finaro.local
   ```

### Linux/Mac:
```bash
sudo nano /etc/hosts

# Füge hinzu:
127.0.0.1 finaro
127.0.0.1 finaro.local
```

Speichern und schließen.

---

## 🌐 Schritt 5: Im Browser öffnen

Öffne einen Browser und gehe zu:

```
http://finaro:4200
```

**Nicht** http://localhost:4200 verwenden, da das Tenant-System die Domain erkennt!

---

## 📝 VS Code Workflow Zusammenfassung

### Setup (einmalig):
1. PostgreSQL einrichten
2. Connection String anpassen
3. `dotnet ef database update` ausführen
4. `npm install` im Frontend
5. Hosts-Datei anpassen

### Tägliche Entwicklung:

**Terminal 1 - Backend:**
```bash
cd src/backend/RP.CRM.Api
dotnet watch run
```

**Terminal 2 - Frontend:**
```bash
cd src/frontend
ng serve
```

**Browser:**
```
http://finaro:4200
```

---

## 🆕 Neue Features testen

### Dokumente hochladen:

1. Gehe zu http://finaro:4200
2. Logge dich ein (falls noch nicht geschehen)
3. Gehe zu Kunden → Wähle einen Kunden aus
4. Scrolle nach unten zur "Dokumente" Sektion (unter Hauptberater)
5. Klicke auf **"+ Hochladen"**
6. Wähle eine Datei (max 10 MB)
7. Datei wird hochgeladen und erscheint in der Liste

### Datenbank Zugriff (für Testing & Entwicklung):

Um direkt auf die lokale Entwicklungsdatenbank zuzugreifen:

```bash
# In die PostgreSQL Datenbank einloggen
psql -U postgres -d kynso_dev

# Falls Passwort gefragt wird, verwende dein lokales PostgreSQL Passwort
# (Standard ist oft 'postgres' oder 'admin123' je nach Installation)
```

**Häufige Befehle in psql:**
```sql
-- Alle Tabellen anzeigen
\dt

-- Tabellenstruktur anzeigen
\d "Users"

-- Datenbank verlassen
\q
```

**Hinweis**: Für Production-Zugriff siehe [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) - Teil 7: Datenbank Zugriff.

---

### Permissions testen:

Die Permissions sind aktuell in der Datenbank konfiguriert:
- Standard User: `Permissions = 55` (View/Create/Edit Customers, View/Upload Documents)
- Admin: `Permissions = 4095` (Alle Rechte)

Du kannst Permissions direkt in der DB ändern:

```sql
-- User Permissions anzeigen
SELECT Id, Email, Permissions FROM "Users";

-- User zu Admin machen
UPDATE "Users" SET "Permissions" = 4095 WHERE "Email" = 'deine@email.com';

-- Zurück zu User
UPDATE "Users" SET "Permissions" = 55 WHERE "Email" = 'deine@email.com';
```

### Neuen Benutzer erstellen (Lokal):

**Via Register API:**

```bash
# Stelle sicher, dass Backend läuft (localhost:5015)
curl -X POST http://localhost:5015/api/User/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "tenantId": 1
  }'
```

**Tenant ID ermitteln:**
```sql
-- In psql
SELECT "Id", "Name" FROM "Tenants";
```

**Benutzer überprüfen:**
```sql
-- Alle lokalen Benutzer anzeigen
SELECT "Id", "Email", "TenantId", "Permissions", "IsActive" FROM "Users";
```

**Hinweis**: Für Production siehe [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) - Schritt 7.2.

---

## 🛠️ Troubleshooting

### Backend startet nicht:
```bash
# Port bereits in Verwendung?
# Auf Windows:
netstat -ano | findstr :5020

# Auf Linux/Mac:
lsof -i :5020

# Prozess beenden und neu starten
```

### Frontend startet nicht:
```bash
# Node modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
```

### Migration schlägt fehl:
```bash
# Stelle sicher, dass PostgreSQL läuft
# Prüfe Connection String in appsettings.json
# Prüfe ob Datenbank existiert

# Migration nochmal versuchen
cd src/backend/RP.CRM.Api
dotnet ef database update --verbose
```

### "Tenant not found" Fehler:
- Prüfe Hosts-Datei
- Verwende http://finaro:4200 (nicht localhost)
- Prüfe tenants.json im Backend

### Dokumente werden nicht angezeigt:
```bash
# Uploads-Verzeichnis erstellen
mkdir -p src/backend/RP.CRM.Api/uploads/1

# Permissions prüfen (Linux/Mac)
chmod 755 src/backend/RP.CRM.Api/uploads
```

---

## 📚 Weitere Befehle

### Backend Tests ausführen:
```bash
cd src/backend
dotnet test
```

### Frontend Tests:
```bash
cd src/frontend
ng test
```

### Backend Build:
```bash
cd src/backend
dotnet build
```

### Frontend Build (Production):
```bash
cd src/frontend
ng build --configuration production
```

### Migration erstellen (falls du Änderungen machst):
```bash
cd src/backend/RP.CRM.Api
dotnet ef migrations add MeineMigration --project ../RP.CRM.Infrastructure
```

---

## ✅ Checkliste für ersten Start

- [ ] PostgreSQL läuft
- [ ] Datenbank `kynso_dev` existiert
- [ ] Connection String ist korrekt
- [ ] Migration ausgeführt (`dotnet ef database update`)
- [ ] Backend gestartet (`dotnet watch run`)
- [ ] Frontend Dependencies installiert (`npm install`)
- [ ] Frontend gestartet (`ng serve`)
- [ ] Hosts-Datei angepasst
- [ ] Browser geöffnet auf http://finaro:4200

---

Viel Erfolg! 🚀
