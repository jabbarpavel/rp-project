# 🚨 SCHNELLHILFE: Production Probleme beheben

## ⚡ TL;DR - Schnelle Lösung

Wenn du diese Probleme hast:
1. ❌ **demo.kynso.ch zeigt "Welcome to nginx!"**
2. ❌ **Container zeigen (unhealthy) Status**

### Schnelle Lösung auf dem Server:

**Option A: Automatisches All-in-One Script (Empfohlen)**

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166

# Gehe zum App-Verzeichnis
cd /opt/kynso/prod/app

# Hole die neuesten Fixes
git pull origin main

# Führe das komplette Fix-Script aus
./apply-production-fix.sh
```

Das Script macht alles automatisch:
- ✅ Code aktualisieren
- ✅ nginx konfigurieren
- ✅ Container neu starten
- ✅ Alles testen

**Option B: Manuelle Schritte**

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166

# Gehe zum App-Verzeichnis
cd /opt/kynso/prod/app

# Hole die neuesten Fixes
git pull origin main

# Fix nginx Konfiguration für demo.kynso.ch
sudo ./fix-demo-nginx.sh

# Container neu starten (mit verbesserten Health Checks)
docker-compose down
docker-compose up -d

# Warte 90 Sekunden für Backend Start
sleep 90

# Prüfe Status
docker-compose ps
```

**Fertig!** 🎉

---

## 📋 Problem 1: demo.kynso.ch zeigt nginx Default-Seite

### Symptom
Wenn du https://demo.kynso.ch aufrufst, siehst du:
```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed and working.
```

### Ursache
Die nginx Konfiguration auf dem Production-Server für `demo.kynso.ch` fehlt oder ist nicht aktiviert.

### Lösung

**Option A: Automatisches Fix-Script (Empfohlen)**

```bash
# Auf dem Production-Server
cd /opt/kynso/prod/app
sudo ./fix-demo-nginx.sh
```

Das Script:
- ✅ Erstellt nginx Konfiguration für demo.kynso.ch
- ✅ Aktiviert die Konfiguration
- ✅ Entfernt nginx Default-Seite
- ✅ Testet und lädt nginx neu

**Option B: Manuelle Schritte**

Siehe [docs/PRODUCTION_FIX_DEMO_HEALTH.md](docs/PRODUCTION_FIX_DEMO_HEALTH.md) für detaillierte manuelle Anleitung.

### Nach dem Fix

```bash
# SSL für demo.kynso.ch einrichten
sudo certbot --nginx -d demo.kynso.ch

# Testen
curl -I https://demo.kynso.ch
# Sollte zeigen: HTTP/2 200
```

---

## 📋 Problem 2: Container Status zeigt "unhealthy"

### Symptom
```bash
docker-compose ps

NAME             STATUS
kynso-backend    Up 6 minutes (unhealthy)
kynso-frontend   Up 6 minutes (unhealthy)
kynso-postgres   Up 6 minutes (healthy)
```

### Ursache
1. **Backend braucht lange zum Starten** - Datenbank-Migrationen, Tenant-Loading
2. **Frontend wartet auf Backend** - Dependency chain
3. **Health Checks zu streng** - Zu wenig Retries oder Start-Zeit

### Ist das ein echtes Problem?

**Oft NEIN!** 

Die Container können trotzdem funktionieren. Prüfe:

```bash
# Teste Backend direkt
curl http://localhost:5000/api/health
# Sollte: {"status":"healthy",...}

# Teste Frontend direkt  
curl -I http://localhost:8080/
# Sollte: HTTP/1.1 200 OK

# Teste von außen
curl -I https://demo.kynso.ch
curl -I https://finaro.kynso.ch
# Beide sollten: HTTP/2 200
```

**Wenn alle Tests ✅ sind**: System funktioniert! Der "unhealthy" Status ist nur ein internes Monitoring-Feature.

### Lösung: Verbesserte Health Checks

Dieses Repository enthält bereits verbesserte Health Checks:

**Backend Health Check:**
```yaml
healthcheck:
  interval: 30s      # Prüfe alle 30 Sekunden
  timeout: 10s       # Warte max 10 Sekunden
  retries: 5         # Mehr Retries (war 3)
  start_period: 90s  # Mehr Start-Zeit (war 60s)
```

**Frontend Health Check:**
```yaml
healthcheck:
  interval: 30s
  timeout: 10s
  retries: 5         # Mehr Retries (war 3)
  start_period: 30s  # Mehr Start-Zeit (war 15s)
```

**Nach git pull anwenden:**

```bash
cd /opt/kynso/prod/app
git pull origin main
docker-compose down
docker-compose up -d

# Warte 90 Sekunden
sleep 90

# Jetzt sollten Container "healthy" sein
docker-compose ps
```

### Wenn Container immer noch "unhealthy"

```bash
# 1. Logs prüfen
docker-compose logs backend --tail=100
docker-compose logs frontend --tail=50

# 2. Manuell Health Checks testen
docker exec kynso-backend curl -v http://localhost:5000/api/health
docker exec kynso-frontend wget --spider http://localhost/

# 3. Datenbank Verbindung prüfen
docker exec kynso-backend sh -c 'curl http://localhost:5000/api/health'
```

**Häufige Backend Logs beim Start:**
```
✅ Kynso CRM API - Starting Up
✅ Environment: Production
✅ Loaded tenant domains from tenants.Production.json
✅ Database connection successful
✅ Applying migrations...
✅ Migrations applied successfully
✅ Now listening on: http://0.0.0.0:5000
```

---

## 🔍 Diagnose Tool

Für eine vollständige Diagnose:

```bash
cd /opt/kynso/prod/app
./diagnose-production.sh
```

Prüft:
- ✅ Docker Installation
- ✅ Container Status und Health
- ✅ Ports und Netzwerk
- ✅ Datenbank Verbindung
- ✅ Health Endpoints
- ✅ Umgebungsvariablen
- ✅ nginx Konfiguration

---

## 🎯 Erfolgs-Checkliste

Nach den Fixes solltest du folgendes haben:

### URLs funktionieren
- ✅ https://kynso.ch → Marketing Seite mit Links
- ✅ https://finaro.kynso.ch → Kynso Login für Finaro
- ✅ https://demo.kynso.ch → Kynso Login für Demo (nicht nginx default!)

### Container Status
```bash
docker-compose ps

# Entweder:
# ✅ Alle zeigen "healthy" nach 90 Sekunden
# Oder:
# ✅ Zeigen "Up" und externe Tests funktionieren
```

### Tests bestehen
```bash
# Backend
curl http://localhost:5000/api/health
# → {"status":"healthy",...}

# Frontend  
curl -I http://localhost:8080/
# → HTTP/1.1 200 OK

# Demo extern
curl -I https://demo.kynso.ch
# → HTTP/2 200 (nicht 301, nicht 404)

# Finaro extern
curl -I https://finaro.kynso.ch  
# → HTTP/2 200
```

### Login funktioniert
- ✅ Kann sich bei finaro.kynso.ch einloggen
- ✅ Kann sich bei demo.kynso.ch einloggen
- ✅ Nach Login: Dashboard wird angezeigt

---

## 📚 Weitere Hilfe

### Detaillierte Anleitungen
- [docs/PRODUCTION_FIX_DEMO_HEALTH.md](docs/PRODUCTION_FIX_DEMO_HEALTH.md) - Vollständige Problemlösung
- [docs/Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) - Komplettes Production Setup
- [docs/PRODUCTION_TROUBLESHOOTING.md](docs/PRODUCTION_TROUBLESHOOTING.md) - Weitere Troubleshooting-Tipps
- [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Schnelle Fixes für häufige Probleme

### Scripts
- `./apply-production-fix.sh` - **⭐ All-in-One Fix** - Automatische Komplettlösung
- `./fix-demo-nginx.sh` - Behebt nginx Konfiguration für demo.kynso.ch
- `./diagnose-production.sh` - Vollständige System-Diagnose
- `./test-services.sh` - Testet Backend und Frontend

### Container Befehle
```bash
# Status prüfen
docker-compose ps

# Logs ansehen
docker-compose logs -f
docker-compose logs backend --tail=100
docker-compose logs frontend --tail=50

# Container neu starten
docker-compose restart backend
docker-compose restart frontend

# Kompletter Neustart
docker-compose down
docker-compose up -d

# Rebuild (nach Code-Änderungen)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### nginx Befehle
```bash
# Status prüfen
sudo systemctl status nginx

# Konfiguration testen
sudo nginx -t

# Neu laden (nach Änderungen)
sudo systemctl reload nginx

# Neu starten
sudo systemctl restart nginx

# Aktive Konfigurationen anzeigen
ls -la /etc/nginx/sites-enabled/

# Vollständige Konfiguration anzeigen
sudo nginx -T
```

---

## 🆘 Wenn nichts funktioniert

1. **Sammle Diagnostik-Informationen:**
```bash
cd /opt/kynso/prod/app
./diagnose-production.sh > diagnostic-report.txt 2>&1
docker-compose logs >> diagnostic-report.txt
sudo nginx -T >> diagnostic-report.txt
```

2. **Prüfe die Basics:**
```bash
# Sind Docker Container überhaupt gestartet?
docker ps

# Läuft nginx?
sudo systemctl status nginx

# Sind die Ports frei?
sudo netstat -tlnp | grep -E ":(80|443|5000|8080)"
```

3. **Nuclear Option - Kompletter Neustart:**
```bash
cd /opt/kynso/prod/app

# Code aktualisieren
git pull origin main

# Nginx neu konfigurieren
sudo ./fix-demo-nginx.sh

# Docker komplett neu
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Warte für Backend Start
sleep 90

# Status prüfen
docker-compose ps
./diagnose-production.sh
```

---

**Erstellt:** 2025-11-22  
**Für:** Production Server kynso.ch (83.228.225.166)  
**Probleme:** demo.kynso.ch nginx default, Container unhealthy  
**Status:** ✅ BEHOBEN mit diesen Scripts und Konfigurationen
