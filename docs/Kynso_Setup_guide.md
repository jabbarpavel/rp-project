# 💰 Kynso Setup Guide - Production Setup

## 🎯 Übersicht

Dieser Guide zeigt dir die komplette Konfiguration für dein **Kynso** CRM System:
- ✅ **Production**: Cloud Server bereits bereit
- ✅ **Domain**: kynso.ch
- ✅ **Server IP**: 83.228.225.166
- ✅ **Subdomains**: finaro.kynso.ch & demo.kynso.ch

**Server Details**:
- Domain: **kynso.ch**
- IP-Adresse: **83.228.225.166**
- Mandant 1: **finaro.kynso.ch** (Finaro)
- Mandant 2: **demo.kynso.ch** (Demo)

---

## 📋 Server Konfiguration

### Bereits konfigurierte Einstellungen

Der Server ist bereits unter `/opt/kynso/prod/app` eingerichtet mit folgenden Einstellungen in der `.env` Datei:

```bash
# Database
POSTGRES_DB=kynso_prod
POSTGRES_USER=kynso_user
POSTGRES_PASSWORD=Kynso5796

# JWT Secret:
JWT_SECRET=Kynso5796Kynso5796Kynso5796R!P.E

# Ports:
BACKEND_PORT=5000
FRONTEND_PORT=8080
```

---

## 🚀 Teil 1: Production Server vorbereiten

### Schritt 1.1: Erste Verbindung zum Server

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166
```

Beim ersten Mal: Tippe `yes` + Enter

**Du bist jetzt auf dem Server!**

---

### Schritt 1.2: System aktualisieren (falls noch nicht geschehen)

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Firewall einrichten (falls noch nicht gemacht)
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Docker installieren (falls noch nicht installiert)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Prüfen
docker --version
docker-compose --version
```

**✅ Checkpoint**: Server ist vorbereitet

---

### Schritt 1.3: Verzeichnisse erstellen (falls noch nicht vorhanden)

```bash
# Arbeitsverzeichnis
sudo mkdir -p /opt/kynso/prod
sudo chown -R $USER:$USER /opt/kynso
sudo chmod -R 755 /opt/kynso

# Backup Verzeichnis
mkdir -p /opt/kynso/backups

# Marketing Website Verzeichnis
mkdir -p /opt/kynso/marketing
```

---

## 📦 Teil 2: Kynso CRM deployen

### Schritt 2.1: Repository klonen (oder Code aktualisieren)

```bash
cd /opt/kynso/prod

# Wenn noch nicht geklont:
git clone https://github.com/jabbarpavel/rp-project.git app

# Wenn bereits vorhanden, Code aktualisieren:
cd app
git pull origin main
```

---

### Schritt 2.2: Production .env Datei prüfen

```bash
cd /opt/kynso/prod/app
cat .env
```

Die Datei sollte folgendes enthalten:

```bash
# Database
POSTGRES_DB=kynso_prod
POSTGRES_USER=kynso_user
POSTGRES_PASSWORD=Kynso5796

# JWT Secret
JWT_SECRET=Kynso5796Kynso5796Kynso5796R!P.E

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=8080
```

Falls die Datei fehlt oder falsch ist:

```bash
nano .env
```

Füge die obigen Werte ein und speichere mit: Ctrl+O, Enter, Ctrl+X

---

### Schritt 2.3: Tenants Konfiguration prüfen

Die `tenants.json` Datei sollte bereits korrekt konfiguriert sein:

```bash
cat src/backend/RP.CRM.Api/tenants.json
```

Sollte anzeigen:

```json
[
  {
    "Name": "Finaro",
    "Domain": "finaro.kynso.ch"
  },
  {
    "Name": "Demo",
    "Domain": "demo.kynso.ch"
  }
]
```

Falls Änderungen nötig sind:

```bash
nano src/backend/RP.CRM.Api/tenants.json
```

---

### Schritt 2.4: Docker Container starten/neu starten

```bash
cd /opt/kynso/prod/app

# Alte Container stoppen und entfernen (falls vorhanden)
docker-compose down

# Neue Container bauen und starten
docker-compose --env-file .env up -d --build
```

**Das dauert**: 5-10 Minuten beim ersten Mal!

**Status prüfen**:
```bash
docker-compose ps
```

**Du solltest sehen**:
- kynso-postgres (Up)
- kynso-backend (Up)
- kynso-frontend (Up)

**Logs ansehen**:
```bash
docker-compose logs -f
# Ctrl+C zum Beenden
```

**✅ Checkpoint**: Kynso CRM läuft in Docker!

---

## 🌐 Teil 3: DNS konfigurieren

### Schritt 3.1: DNS Records in Infomaniak setzen

1. **Gehe zu Infomaniak Dashboard**
2. **Klicke** "Domains" → kynso.ch
3. **Klicke** "DNS Zone verwalten"

**Füge diese Records hinzu** (falls noch nicht vorhanden):

| Typ | Host | Wert | TTL |
|-----|------|------|-----|
| A | @ | 83.228.225.166 | 3600 |
| A | www | 83.228.225.166 | 3600 |
| A | finaro | 83.228.225.166 | 3600 |
| A | demo | 83.228.225.166 | 3600 |

**Für jeden Record**:
1. "+ Record hinzufügen"
2. Typ: A
3. Host: (siehe Tabelle)
4. Ziel: 83.228.225.166
5. Speichern

**Warten**: 15-30 Minuten für DNS Propagation

**Testen**:
```bash
# Auf deinem Computer oder Server
nslookup finaro.kynso.ch
nslookup demo.kynso.ch
```

**✅ Checkpoint**: DNS ist konfiguriert

---

## 🔧 Teil 4: Nginx Reverse Proxy konfigurieren

### Schritt 4.1: Nginx installieren (falls noch nicht installiert)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### Schritt 4.2: Finaro (Mandant 1) Konfiguration

```bash
sudo nano /etc/nginx/sites-available/finaro
```

**Füge ein**:
```nginx
server {
    listen 80;
    server_name finaro.kynso.ch;
    
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
    }
    
    client_max_body_size 10M;
}
```

**Aktivieren**:
```bash
sudo ln -s /etc/nginx/sites-available/finaro /etc/nginx/sites-enabled/
```

---

### Schritt 4.3: Demo (Mandant 2) Konfiguration

```bash
sudo nano /etc/nginx/sites-available/demo
```

**Füge ein**:
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
    }
    
    client_max_body_size 10M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/demo /etc/nginx/sites-enabled/
```

---

### Schritt 4.4: Haupt-Website (kynso.ch)

```bash
sudo nano /etc/nginx/sites-available/kynso-main
```

```nginx
server {
    listen 80;
    server_name kynso.ch www.kynso.ch;
    
    root /opt/kynso/marketing;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kynso-main /etc/nginx/sites-enabled/
```

---

### Schritt 4.5: Marketing Seite erstellen

```bash
nano /opt/kynso/marketing/index.html
```

**Einfache Marketing Seite**:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kynso - Moderne CRM Lösung</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 40px;
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.3em; margin-bottom: 30px; }
        .links {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        a {
            background: white;
            color: #667eea;
            padding: 20px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            transition: transform 0.3s;
        }
        a:hover { transform: translateY(-5px); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Willkommen bei Kynso</h1>
        <p>Moderne CRM-Lösung für Ihr Unternehmen</p>
        <div class="links">
            <a href="https://finaro.kynso.ch">Finaro Login →</a>
            <a href="https://demo.kynso.ch">Demo Login →</a>
        </div>
    </div>
</body>
</html>
```

Speichern: Ctrl+O, Enter, Ctrl+X

---

### Schritt 4.6: Nginx Konfiguration testen und neu laden

```bash
# Konfiguration testen
sudo nginx -t

# Sollte zeigen: syntax is ok

# Nginx neu laden
sudo systemctl reload nginx
```

**✅ Checkpoint**: Nginx läuft!

---

## 🔒 Teil 5: SSL/HTTPS mit Let's Encrypt einrichten

### Schritt 5.1: Certbot installieren

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### Schritt 5.2: SSL Zertifikate für alle Domains

```bash
# Haupt-Website
sudo certbot --nginx -d kynso.ch -d www.kynso.ch

# Finaro
sudo certbot --nginx -d finaro.kynso.ch

# Demo
sudo certbot --nginx -d demo.kynso.ch
```

**Bei jedem Befehl**:
1. E-Mail eingeben
2. Terms: `Y`
3. News: `N` 
4. Redirect zu HTTPS: `2` (Ja!)

**✅ Checkpoint**: HTTPS funktioniert überall! 🔒

---

## 🎉 Teil 6: Alles testen!

### Test 1: Haupt-Website

**Browser**: https://kynso.ch

**Du siehst**: Grünes Schloss 🔒 + Marketing Seite

---

### Test 2: Finaro Mandant

**Browser**: https://finaro.kynso.ch

**Du siehst**: Kynso CRM Login für Finaro

---

### Test 3: Demo Mandant

**Browser**: https://demo.kynso.ch

**Du siehst**: Kynso CRM Login für Demo

---

## 🔄 Teil 7: Updates deployen

### Update Script erstellen

```bash
sudo nano /usr/local/bin/update-kynso.sh
```

**Füge ein**:
```bash
#!/bin/bash

echo "Updating Kynso Production..."

cd /opt/kynso/prod/app

# Git pull
git pull origin main

# Rebuild und restart
docker-compose --env-file .env down
docker-compose --env-file .env up -d --build

echo "Kynso update completed!"
```

```bash
sudo chmod +x /usr/local/bin/update-kynso.sh
```

**Verwendung**:
```bash
sudo /usr/local/bin/update-kynso.sh
```

---

## 💾 Teil 8: Backups

### Backup Script erstellen

```bash
nano /usr/local/bin/backup-kynso.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/opt/kynso/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Datenbank Backup
docker exec kynso-postgres pg_dump -U kynso_user kynso_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads Backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/kynso/prod/app/uploads 2>/dev/null

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-kynso.sh
```

**Manuell ausführen** (empfohlen: einmal pro Woche):
```bash
/usr/local/bin/backup-kynso.sh
```

**Automatisieren** (optional, jeden Sonntag um 2 Uhr):
```bash
crontab -e

# Hinzufügen:
0 2 * * 0 /usr/local/bin/backup-kynso.sh
```

---

## ✅ Zusammenfassung - Kynso System

### 🌐 Live URLs:
- ✅ https://kynso.ch - Haupt-Website / Marketing
- ✅ https://finaro.kynso.ch - Finaro Mandant
- ✅ https://demo.kynso.ch - Demo Mandant

### 💾 Datenbank:
- **Name**: kynso_prod
- **User**: kynso_user
- **Password**: Kynso5796

### 🔐 Sicherheit:
- **JWT Secret**: Kynso5796Kynso5796Kynso5796R!P.E
- ✅ SSL/HTTPS überall
- ✅ Firewall aktiv
- ✅ Sichere Passwörter

### 🐳 Docker Container:
- **kynso-postgres**: PostgreSQL Datenbank
- **kynso-backend**: .NET 8.0 Backend API (Port 5000)
- **kynso-frontend**: Angular Frontend (Port 8080)

### 🔧 Technologie:
- **.NET 8.0**: Backend Framework
- **PostgreSQL 15**: Datenbank
- **Angular**: Frontend
- **Docker**: Containerization
- **Nginx**: Reverse Proxy & SSL
- **Let's Encrypt**: SSL Zertifikate

---

## 🆘 Troubleshooting

### Container startet nicht
```bash
# Logs ansehen
cd /opt/kynso/prod/app
docker-compose logs
```

### Website nicht erreichbar
```bash
# DNS prüfen
nslookup finaro.kynso.ch

# Nginx prüfen
sudo systemctl status nginx
sudo nginx -t
```

### Datenbank Fehler
```bash
# Container Status
docker ps

# Postgres Logs
docker logs kynso-postgres
```

### Backend Fehler
```bash
# Backend Logs
docker logs kynso-frontend
```

---

## 🎯 Quick Reference - Häufige Befehle

```bash
# Container Status
docker-compose ps

# Logs ansehen
docker-compose logs -f

# Container neu starten
docker-compose restart

# Update deployen
sudo /usr/local/bin/update-kynso.sh

# Backup erstellen
/usr/local/bin/backup-kynso.sh

# Nginx neu laden
sudo systemctl reload nginx

# SSL Zertifikate erneuern
sudo certbot renew
```

---

## 🎉 FERTIG!

Dein **Kynso CRM System** läuft jetzt auf:
- Server: 83.228.225.166
- Domain: kynso.ch
- Mandanten: finaro & demo

**Bei Fragen oder Problemen**: Dokumentation prüfen oder Support kontaktieren!

---

## 📚 Weitere Dokumentation

- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Lokale Entwicklung
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Docker Details
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production Best Practices
