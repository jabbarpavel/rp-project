# 🔧 Production Fix: demo.kynso.ch & Container Health Issues

## Problem Zusammenfassung

Du hast zwei Probleme auf deinem Production Server gemeldet:

1. **demo.kynso.ch zeigt "Welcome to nginx!"** statt der Kynso Login-Seite
2. **Container Status zeigt "unhealthy"** für backend und frontend

---

## 🎯 Problem 1: demo.kynso.ch zeigt nginx Default-Seite

### Ursache

Die externe nginx-Konfiguration auf deinem Production-Server ist nicht korrekt eingerichtet oder die Konfiguration für `demo.kynso.ch` wurde nicht aktiviert.

### Diagnose auf dem Server

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166

# Prüfe welche nginx Konfigurationen aktiviert sind
ls -la /etc/nginx/sites-enabled/

# Prüfe ob die demo Konfiguration existiert
ls -la /etc/nginx/sites-available/demo

# Teste nginx Konfiguration
sudo nginx -t

# Prüfe nginx Status
sudo systemctl status nginx
```

### Lösung: Nginx Konfiguration für demo.kynso.ch

#### Schritt 1: Demo Konfiguration erstellen (falls nicht vorhanden)

```bash
sudo nano /etc/nginx/sites-available/demo
```

Füge folgende Konfiguration ein:

```nginx
server {
    listen 80;
    server_name demo.kynso.ch;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /user/ {
        proxy_pass http://localhost:5000/user/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    client_max_body_size 10M;
}
```

Speichern: `Ctrl+O`, `Enter`, `Ctrl+X`

#### Schritt 2: Symbolischen Link erstellen (Konfiguration aktivieren)

```bash
# Prüfe ob der Link bereits existiert
ls -la /etc/nginx/sites-enabled/demo

# Falls nicht, erstelle ihn
sudo ln -s /etc/nginx/sites-available/demo /etc/nginx/sites-enabled/demo
```

#### Schritt 3: Default nginx Seite deaktivieren (optional, aber empfohlen)

```bash
# Entferne die default Konfiguration falls sie stört
sudo rm /etc/nginx/sites-enabled/default
```

#### Schritt 4: Nginx Konfiguration testen und neu laden

```bash
# Teste die Konfiguration
sudo nginx -t

# Sollte ausgeben:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Nginx neu laden
sudo systemctl reload nginx

# Nginx Status prüfen
sudo systemctl status nginx
```

#### Schritt 5: SSL/HTTPS für demo.kynso.ch einrichten (falls noch nicht gemacht)

```bash
# Certbot für demo.kynso.ch ausführen
sudo certbot --nginx -d demo.kynso.ch

# Folge den Anweisungen:
# 1. E-Mail eingeben (falls gefragt)
# 2. Terms akzeptieren: Y
# 3. Redirect zu HTTPS: 2 (Ja, redirect)
```

#### Schritt 6: Testen

```bash
# Teste HTTP (sollte zu HTTPS redirecten)
curl -I http://demo.kynso.ch

# Teste HTTPS
curl -I https://demo.kynso.ch

# Teste von außen im Browser
# https://demo.kynso.ch
```

### Überprüfung

Nach diesen Schritten solltest du:
- ✅ Beim Besuch von https://demo.kynso.ch die Kynso Login-Seite sehen
- ✅ Keine "Welcome to nginx!" Nachricht mehr sehen

---

## 🏥 Problem 2: Container zeigen "unhealthy" Status

### Ursache

Die Health Checks in `docker-compose.yml` sind möglicherweise zu streng oder die Container brauchen mehr Zeit zum Starten.

### Aktuelle Situation verstehen

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166

# Gehe zum App-Verzeichnis
cd /opt/kynso/prod/app

# Prüfe Container Status
docker-compose ps

# Detaillierte Health Check Status
docker inspect kynso-backend --format='{{json .State.Health}}' | jq
docker inspect kynso-frontend --format='{{json .State.Health}}' | jq

# Logs ansehen für Fehler
docker-compose logs backend --tail=50
docker-compose logs frontend --tail=50
```

### Was "unhealthy" bedeutet

- **Backend unhealthy**: Der Health-Check-Endpoint `/api/health` antwortet nicht richtig
- **Frontend unhealthy**: Die Root-URL `/` ist nicht erreichbar

**Wichtig**: Containers können trotzdem funktionieren, auch wenn sie "unhealthy" sind! Aber es zeigt ein potenzielles Problem an.

### Lösung: Health Check Konfiguration optimieren

Die Health Checks in deiner `docker-compose.yml` sind bereits gut konfiguriert mit:
- `start_period: 60s` für backend (gibt dem Backend Zeit zum Starten)
- `start_period: 15s` für frontend

**Falls die Container als "unhealthy" markiert sind, aber funktionieren:**

1. **Warte länger** - Backend braucht bis zu 90 Sekunden beim ersten Start
2. **Prüfe die Logs** - Suche nach tatsächlichen Fehlern

```bash
# Backend Logs live ansehen
docker-compose logs -f backend

# Was du sehen solltest:
# ✅ "Kynso CRM API - Starting Up"
# ✅ "Loaded tenant domains from tenants.Production.json"
# ✅ "Now listening on: http://0.0.0.0:5000"
# ✅ Database migrations applied

# Frontend Logs
docker-compose logs -f frontend

# Was du sehen solltest:
# ✅ Nginx startet
# ✅ Keine Fehler
```

### Häufige Gründe für "unhealthy" Status

#### 1. Backend: Datenbank-Migration läuft noch

```bash
# Prüfe Backend Logs
docker-compose logs backend | grep -i "migration\|database\|health"

# Der Backend braucht Zeit für:
# - Datenbankverbindung herstellen
# - Migrations anwenden
# - Tenants laden
# - Health-Endpoint starten
```

**Lösung**: Warte 60-90 Sekunden nach `docker-compose up -d`

#### 2. Frontend: Backend ist noch nicht bereit

Das Frontend hat eine Abhängigkeit zum Backend:
```yaml
depends_on:
  - backend
```

Wenn Backend unhealthy ist, kann Frontend auch unhealthy werden.

**Lösung**: Warte bis Backend "healthy" ist, dann wird Frontend auch "healthy"

#### 3. Health Check Timeout zu kurz

Falls die Health Checks konstant fehlschlagen:

```bash
# Manuell den Health-Endpoint testen
docker exec kynso-backend curl -f http://localhost:5000/api/health

# Frontend testen
docker exec kynso-frontend wget --quiet --tries=1 --spider http://localhost/
```

### Health Check Konfiguration anpassen (falls nötig)

Falls die Container wirklich Probleme haben (nicht nur langsam starten), kannst du die Health Checks anpassen:

```yaml
# docker-compose.yml - Backend Health Check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s      # Prüfe alle 30 Sekunden
  timeout: 10s       # Warte max 10 Sekunden auf Antwort
  retries: 5         # Versuche 5 mal bevor "unhealthy"
  start_period: 90s  # Gib 90 Sekunden Zeit beim Start (erhöht von 60s)

# docker-compose.yml - Frontend Health Check  
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s  # Erhöht von 15s
```

Nach Änderungen:
```bash
docker-compose down
docker-compose up -d
```

### Testen ob alles funktioniert (trotz "unhealthy")

```bash
# Teste Backend direkt
curl http://localhost:5000/api/health

# Sollte zurückgeben:
# {"status":"healthy","timestamp":"...","service":"Kynso CRM API","database":"connected"}

# Teste Frontend direkt
curl -I http://localhost:8080/

# Sollte zurückgeben:
# HTTP/1.1 200 OK

# Teste von außen
curl -I https://finaro.kynso.ch
curl -I https://demo.kynso.ch
```

### Wenn alles von außen funktioniert, aber "unhealthy" anzeigt

Das ist in Ordnung! Der Health-Status ist ein internes Monitoring-Feature. Solange:
- ✅ https://finaro.kynso.ch funktioniert
- ✅ https://demo.kynso.ch funktioniert
- ✅ Login funktioniert
- ✅ API funktioniert

...dann ist das System produktionsbereit, auch wenn Docker "unhealthy" zeigt.

---

## 🔍 Vollständige Diagnose durchführen

### Schritt 1: Diagnose-Script ausführen

```bash
cd /opt/kynso/prod/app
./diagnose-production.sh
```

Dieses Script prüft:
- Docker Installation
- Container Status
- Port-Konfiguration
- Datenbank-Verbindung
- Health Endpoints
- Umgebungsvariablen

### Schritt 2: Manuelle Tests

```bash
# 1. Prüfe ob alle Container laufen
docker-compose ps

# 2. Prüfe nginx auf dem Host
sudo systemctl status nginx
sudo nginx -t

# 3. Prüfe DNS
nslookup demo.kynso.ch
nslookup finaro.kynso.ch

# 4. Prüfe Ports
sudo netstat -tlnp | grep -E ":(80|443|5000|8080)"

# 5. Teste Endpoints
curl http://localhost:5000/api/health
curl http://localhost:8080/
curl https://demo.kynso.ch
curl https://finaro.kynso.ch
```

---

## 📋 Schritt-für-Schritt Komplettlösung

Falls du alle Probleme auf einmal beheben willst:

```bash
# 1. SSH zum Server
ssh ubuntu@83.228.225.166

# 2. Gehe zum App-Verzeichnis
cd /opt/kynso/prod/app

# 3. Code aktualisieren (wichtig!)
git pull origin main

# 4. Stelle sicher, dass nginx Konfiguration für demo existiert
sudo nano /etc/nginx/sites-available/demo
# (Füge die Konfiguration von oben ein, falls nicht vorhanden)

# 5. Aktiviere die demo Konfiguration
sudo ln -sf /etc/nginx/sites-available/demo /etc/nginx/sites-enabled/demo

# 6. Teste und lade nginx neu
sudo nginx -t
sudo systemctl reload nginx

# 7. SSL für demo einrichten (falls noch nicht gemacht)
sudo certbot --nginx -d demo.kynso.ch

# 8. Container neu starten (optional, falls Änderungen gemacht wurden)
docker-compose down
docker-compose up -d

# 9. Warte 90 Sekunden für Backend Start
echo "Warte 90 Sekunden für Backend Start..."
sleep 90

# 10. Prüfe Status
docker-compose ps

# 11. Teste alle Endpoints
echo "Teste Backend..."
curl http://localhost:5000/api/health

echo "Teste Frontend..."
curl -I http://localhost:8080/

echo "Teste finaro.kynso.ch..."
curl -I https://finaro.kynso.ch

echo "Teste demo.kynso.ch..."
curl -I https://demo.kynso.ch
```

---

## ✅ Erfolgs-Kriterien

Nach der Behebung solltest du sehen:

### 1. demo.kynso.ch funktioniert
```bash
# Im Browser: https://demo.kynso.ch
# → Zeigt Kynso Login-Seite
# → KEINE "Welcome to nginx!" Nachricht

# Per curl:
curl -I https://demo.kynso.ch
# → HTTP/2 200 (nicht 301, nicht 404)
```

### 2. Container Status
```bash
docker-compose ps

# Ausgabe sollte zeigen:
# kynso-backend    Up X minutes (healthy)    # oder ohne healthy ist ok
# kynso-frontend   Up X minutes (healthy)    # oder ohne healthy ist ok
# kynso-postgres   Up X minutes (healthy)
```

### 3. Beide Domains erreichbar
- ✅ https://finaro.kynso.ch → Login-Seite
- ✅ https://demo.kynso.ch → Login-Seite
- ✅ https://kynso.ch → Marketing-Seite

### 4. Login funktioniert auf beiden Domains
- ✅ Kann sich bei finaro.kynso.ch einloggen
- ✅ Kann sich bei demo.kynso.ch einloggen

---

## 🆘 Wenn es immer noch nicht funktioniert

### demo.kynso.ch zeigt immer noch nginx Default

1. **Prüfe, welche nginx Konfiguration aktiv ist:**
```bash
sudo nginx -T | grep -A 20 "server_name demo.kynso.ch"
```

2. **Prüfe ob der richtige nginx läuft:**
```bash
ps aux | grep nginx
sudo systemctl status nginx
```

3. **Default nginx Seite entfernen:**
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

4. **SSL Konfiguration prüfen:**
```bash
ls -la /etc/letsencrypt/live/demo.kynso.ch/
```

### Container bleiben "unhealthy"

1. **Backend Logs analysieren:**
```bash
docker-compose logs backend | grep -i "error\|exception\|fail"
```

2. **Health Endpoint manuell testen:**
```bash
docker exec kynso-backend curl -v http://localhost:5000/api/health
```

3. **Datenbank Verbindung prüfen:**
```bash
docker exec kynso-backend sh -c 'echo "Testing DB..." && curl http://localhost:5000/api/health'
```

4. **Complete Rebuild (Notfall-Option):**
```bash
cd /opt/kynso/prod/app
docker-compose down -v  # ACHTUNG: Löscht Datenbank!
# Oder ohne -v um Daten zu behalten:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Support

Falls du immer noch Probleme hast:

1. **Führe Diagnose aus und speichere Output:**
```bash
cd /opt/kynso/prod/app
./diagnose-production.sh > diagnostic-output.txt 2>&1
docker-compose logs >> diagnostic-output.txt
```

2. **Sammle relevante Informationen:**
- Output von `docker-compose ps`
- Output von `sudo nginx -T`
- Output von `curl -I https://demo.kynso.ch`
- Backend und Frontend Logs

3. **Prüfe Dokumentation:**
- [Kynso_Setup_guide.md](./Kynso_Setup_guide.md) - Vollständige Setup-Anleitung
- [PRODUCTION_TROUBLESHOOTING.md](./PRODUCTION_TROUBLESHOOTING.md) - Weitere Troubleshooting-Tipps

---

**Erstellt:** 2025-11-22  
**Probleme:** demo.kynso.ch zeigt nginx default, Container unhealthy  
**Lösung:** nginx Konfiguration korrigieren, Health Checks verstehen
