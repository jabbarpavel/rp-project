# 🎯 Lösung für "Connection Refused" Problem

## Dein Problem

Du hast versucht, einen User in der Produktion zu erstellen, aber bekamst diesen Fehler:

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@finaro.com", "password": "FinaroAdmin2025!", "tenantId": 1}'

curl: (7) Failed to connect to localhost port 5000 after 0 ms: Connection refused
```

## Was war das Problem?

Der Backend-Container läuft möglicherweise nicht, oder er hört auf dem falschen Port. Dies kann mehrere Ursachen haben:

1. **Container läuft nicht** - Docker Container ist gestoppt oder crashed
2. **Falscher Port** - Backend hört auf Port 5015/5020 statt 5000
3. **Datenbank-Problem** - Backend kann sich nicht mit PostgreSQL verbinden
4. **Konfigurationsfehler** - ASPNETCORE_URLS ist nicht gesetzt

## Die Lösung

Ich habe eine **komplette Troubleshooting-Lösung** für dich erstellt:

### 🚀 Schnellstart (auf deinem Server)

```bash
cd /opt/kynso/prod/app
./diagnose-production.sh
```

Dieses Script prüft automatisch **alle möglichen Probleme** und gibt dir konkrete Lösungen.

### 📚 Neue Dokumentation

1. **SCHNELLE_HILFE.md** (Deutsch) 🇩🇪
   - Schnelle Befehle und Lösungen
   - Häufigste Probleme und Fixes
   - Schritt-für-Schritt Anleitung

2. **QUICK_FIX_GUIDE.md** (English) 🇬🇧
   - Fast troubleshooting commands
   - Common issues and solutions
   - Step-by-step guide

3. **docs/PRODUCTION_TROUBLESHOOTING.md** (English) ��
   - Komplette Troubleshooting-Anleitung
   - 10 Diagnose-Schritte
   - Detaillierte Erklärungen

### 🔧 Was wurde verbessert

1. **Diagnose-Script** (`diagnose-production.sh`)
   - Prüft Docker-Status
   - Prüft Container-Status
   - Prüft Port-Konfiguration
   - Prüft Datenbank-Verbindung
   - Prüft Health-Endpoint
   - Zeigt konkrete Lösungen

2. **Besseres Backend-Logging** (`Program.cs`)
   - Zeigt beim Start alle wichtigen Infos
   - Zeigt Port-Konfiguration
   - Zeigt Datenbank-Status
   - Zeigt Tenant-Status

3. **Dokumentation**
   - Quick-Fix Guides
   - Detaillierte Troubleshooting-Anleitung
   - Deutsche und englische Version

## Was du jetzt tun solltest

### Schritt 1: Diagnose ausführen

Auf deinem Production-Server (83.228.225.166):

```bash
cd /opt/kynso/prod/app
./diagnose-production.sh
```

Das Script sagt dir **genau**, was das Problem ist.

### Schritt 2: Problem beheben

**Falls Backend auf falschem Port läuft:**
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

**Falls Container nicht läuft:**
```bash
docker-compose up -d
```

**Falls nichts hilft:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Schritt 3: Testen

```bash
# Health-Check
curl http://localhost:5000/api/health

# User erstellen
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.com",
    "password": "FinaroAdmin2025!",
    "tenantId": 1
  }'
```

### Schritt 4: Admin-Rechte setzen

```bash
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod

UPDATE "Users" SET "Permissions" = 4095, "Role" = 'Admin' 
WHERE "Email" = 'admin@finaro.com';

\q
```

### Schritt 5: Login testen

Öffne https://finaro.kynso.ch/login und logge dich ein.

## Wichtige Befehle im Überblick

```bash
# Container-Status prüfen
docker-compose ps

# Backend-Logs anzeigen
docker-compose logs backend --tail=50

# Diagnose ausführen
./diagnose-production.sh

# Backend neu starten
docker-compose restart backend

# Backend neu bauen
docker-compose build --no-cache backend
docker-compose up -d backend

# Health-Check
curl http://localhost:5000/api/health

# Tenants anzeigen
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod \
  -c "SELECT \"Id\", \"Name\", \"Domain\" FROM \"Tenants\";"
```

## Weitere Hilfe

- **SCHNELLE_HILFE.md** - Schnelle Lösungen (Deutsch)
- **QUICK_FIX_GUIDE.md** - Quick solutions (English)
- **docs/PRODUCTION_TROUBLESHOOTING.md** - Detaillierte Anleitung

## Zusammenfassung

Dein Problem sollte jetzt lösbar sein:

1. ✅ Diagnose-Script erstellt
2. ✅ Dokumentation hinzugefügt
3. ✅ Backend-Logging verbessert
4. ✅ Schritt-für-Schritt Anleitungen
5. ✅ Deutsche Dokumentation

**Nächster Schritt:** Führe `./diagnose-production.sh` auf deinem Server aus!

---

**Erstellt:** 2025-11-21  
**Alle Checks:** ✅ Build ✅ Code Review ✅ Security Scan
