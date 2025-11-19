# Production Deployment Guide - RP CRM

## 📋 Übersicht

Dieser Guide zeigt dir Schritt-für-Schritt, wie du die RP CRM Anwendung auf einem Infomaniak Cloud Server (oder einem anderen Linux Server) in Produktion bringst.

## 🎯 Voraussetzungen

### Was du brauchst:
- ✅ Infomaniak Cloud Server (Ubuntu 22.04 LTS) - siehe INFOMANIAK_REQUIREMENTS.md
- ✅ Domain(s) für deine Tenants
- ✅ SSH-Zugang zum Server
- ✅ Root oder Sudo-Rechte
- ✅ Grundkenntnisse in Linux und Terminal

### Lokale Vorbereitung:
- ✅ Git installiert
- ✅ SSH Client (Terminal, PuTTY, etc.)
- ✅ Alle lokalen Änderungen committed und gepusht

## 🚀 Deployment Schritte

### Schritt 1: Server Vorbereitung

#### 1.1 Mit Server verbinden
```bash
ssh root@deine-server-ip
# Oder: ssh dein-username@deine-server-ip
```

#### 1.2 System aktualisieren
```bash
# System updaten
sudo apt update && sudo apt upgrade -y

# Nützliche Tools installieren
sudo apt install -y curl wget git unzip
```

#### 1.3 Firewall konfigurieren
```bash
# UFW Firewall aktivieren
sudo apt install -y ufw

# Standard Regeln setzen
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH erlauben (WICHTIG!)
sudo ufw allow 22/tcp

# HTTP und HTTPS erlauben
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall aktivieren
sudo ufw enable

# Status prüfen
sudo ufw status
```

### Schritt 2: Software Installation

#### 2.1 .NET 8 oder 10 SDK installieren
```bash
# Microsoft Package Repository hinzufügen
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# .NET SDK installieren (Version 8 oder 10)
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Oder für .NET 10 (falls verfügbar):
# sudo apt install -y dotnet-sdk-10.0

# Installation prüfen
dotnet --version
```

#### 2.2 Node.js installieren
```bash
# NodeSource Repository hinzufügen (Node.js 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js installieren
sudo apt install -y nodejs

# Installation prüfen
node --version
npm --version

# Angular CLI global installieren
sudo npm install -g @angular/cli
```

#### 2.3 PostgreSQL installieren
```bash
# PostgreSQL installieren
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL starten und aktivieren
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Status prüfen
sudo systemctl status postgresql
```

#### 2.4 Nginx als Reverse Proxy installieren
```bash
# Nginx installieren
sudo apt install -y nginx

# Nginx starten
sudo systemctl start nginx
sudo systemctl enable nginx

# Status prüfen
sudo systemctl status nginx
```

### Schritt 3: Datenbank einrichten

#### 3.1 PostgreSQL Konfiguration
```bash
# Als postgres User einloggen
sudo -u postgres psql

# In PostgreSQL Shell:
-- Datenbank erstellen
CREATE DATABASE rp_crm_production;

-- Produktions-User erstellen (ÄNDERE DAS PASSWORT!)
CREATE USER rp_crm_user WITH ENCRYPTED PASSWORD 'DEIN_SICHERES_PASSWORT_HIER';

-- Rechte vergeben
GRANT ALL PRIVILEGES ON DATABASE rp_crm_production TO rp_crm_user;
GRANT ALL ON SCHEMA public TO rp_crm_user;

-- Beenden
\q
```

#### 3.2 PostgreSQL für Remote-Verbindungen konfigurieren (optional)
```bash
# postgresql.conf editieren
sudo nano /etc/postgresql/14/main/postgresql.conf

# Finde und ändere:
listen_addresses = 'localhost'  # Nur lokale Verbindungen (SICHER)
# Oder für Remote-Zugriff (WENIGER SICHER):
# listen_addresses = '*'

# pg_hba.conf editieren
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Füge hinzu (für lokale Verbindungen):
local   all             rp_crm_user                              scram-sha-256
host    all             rp_crm_user     127.0.0.1/32            scram-sha-256

# PostgreSQL neu starten
sudo systemctl restart postgresql
```

### Schritt 4: Anwendung deployen

#### 4.1 Deployment-User erstellen
```bash
# Dedicated User für die App erstellen
sudo adduser --system --group --home /var/www/rp-crm rp-crm

# In das App-Verzeichnis wechseln
cd /var/www/rp-crm
```

#### 4.2 Code vom Repository holen
```bash
# Als Root oder mit sudo
sudo -u rp-crm git clone https://github.com/jabbarpavel/rp-project.git /var/www/rp-crm/app
cd /var/www/rp-crm/app

# Auf den richtigen Branch wechseln
sudo -u rp-crm git checkout main
# Oder: sudo -u rp-crm git checkout update-customer-management-ui-again
```

#### 4.3 Backend konfigurieren

##### 4.3.1 Production appsettings erstellen
```bash
# appsettings.Production.json erstellen
sudo -u rp-crm nano /var/www/rp-crm/app/src/backend/RP.CRM.Api/appsettings.Production.json
```

Inhalt:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Jwt": {
    "Key": "DEIN_ULTRA_SICHERER_JWT_KEY_MINDESTENS_32_ZEICHEN_LANG_123456789"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=rp_crm_production;Username=rp_crm_user;Password=DEIN_SICHERES_PASSWORT_HIER"
  },
  "Urls": "http://localhost:5000"
}
```

**WICHTIG**: Ändere:
- JWT Key zu einem zufälligen, langen String
- PostgreSQL Passwort zu deinem gewählten Passwort

##### 4.3.2 Tenants für Production konfigurieren
```bash
sudo -u rp-crm nano /var/www/rp-crm/app/src/backend/RP.CRM.Api/tenants.json
```

Ändere auf deine Production Domains:
```json
[
  {
    "Name": "Finaro",
    "Domain": "finaro.deine-domain.ch"
  },
  {
    "Name": "DemoCorp",
    "Domain": "democorp.deine-domain.ch"
  }
]
```

##### 4.3.3 Backend bauen und publishen
```bash
cd /var/www/rp-crm/app/src/backend/RP.CRM.Api

# Projekt bauen und publishen
sudo -u rp-crm dotnet publish -c Release -o /var/www/rp-crm/backend

# Uploads-Verzeichnis erstellen
sudo -u rp-crm mkdir -p /var/www/rp-crm/backend/uploads
sudo chmod 755 /var/www/rp-crm/backend/uploads
```

##### 4.3.4 Datenbank migrieren
```bash
cd /var/www/rp-crm/app/src/backend/RP.CRM.Api

# EF Core Tools installieren (falls nicht vorhanden)
dotnet tool install --global dotnet-ef

# Migration ausführen
sudo -u rp-crm dotnet ef database update --project ../RP.CRM.Infrastructure
```

#### 4.4 Frontend bauen

```bash
cd /var/www/rp-crm/app/src/frontend

# Dependencies installieren
sudo -u rp-crm npm ci --production

# Production Build erstellen
sudo -u rp-crm npm run build -- --configuration production

# Build nach /var/www/rp-crm/frontend kopieren
sudo mkdir -p /var/www/rp-crm/frontend
sudo cp -r dist/frontend/browser/* /var/www/rp-crm/frontend/
sudo chown -R rp-crm:rp-crm /var/www/rp-crm/frontend
```

### Schritt 5: Systemd Services erstellen

#### 5.1 Backend als Service
```bash
sudo nano /etc/systemd/system/rp-crm-backend.service
```

Inhalt:
```ini
[Unit]
Description=RP CRM Backend API
After=network.target postgresql.service

[Service]
Type=notify
User=rp-crm
Group=rp-crm
WorkingDirectory=/var/www/rp-crm/backend
ExecStart=/usr/bin/dotnet /var/www/rp-crm/backend/RP.CRM.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=rp-crm-backend
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

#### 5.2 Service aktivieren und starten
```bash
# Service neu laden
sudo systemctl daemon-reload

# Service aktivieren (Autostart)
sudo systemctl enable rp-crm-backend

# Service starten
sudo systemctl start rp-crm-backend

# Status prüfen
sudo systemctl status rp-crm-backend

# Logs ansehen
sudo journalctl -u rp-crm-backend -f
```

### Schritt 6: Nginx konfigurieren

#### 6.1 Nginx Konfiguration für Tenant 1 (Finaro)
```bash
sudo nano /etc/nginx/sites-available/finaro
```

Inhalt:
```nginx
server {
    listen 80;
    server_name finaro.deine-domain.ch;
    
    # Weiterleitung auf HTTPS (später mit Let's Encrypt)
    # return 301 https://$server_name$request_uri;
    
    # Frontend (Angular)
    location / {
        root /var/www/rp-crm/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache Headers für statische Dateien
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Scalar API Dokumentation
    location /scalar/ {
        proxy_pass http://localhost:5000/scalar/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Größere Uploads erlauben (für Dokumente)
    client_max_body_size 10M;
}
```

#### 6.2 Site aktivieren
```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/finaro /etc/nginx/sites-enabled/

# Für weitere Tenants wiederholen (democorp, etc.)
# sudo nano /etc/nginx/sites-available/democorp
# sudo ln -s /etc/nginx/sites-available/democorp /etc/nginx/sites-enabled/

# Nginx Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

### Schritt 7: SSL mit Let's Encrypt einrichten

#### 7.1 Certbot installieren
```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx
```

#### 7.2 SSL Zertifikate erstellen
```bash
# Für jeden Tenant ein Zertifikat erstellen
sudo certbot --nginx -d finaro.deine-domain.ch
# sudo certbot --nginx -d democorp.deine-domain.ch

# Folge den Anweisungen:
# - E-Mail Adresse eingeben
# - Terms akzeptieren
# - Wähle "Redirect" für automatische HTTPS Umleitung
```

#### 7.3 Auto-Renewal testen
```bash
# Certbot erstellt automatisch einen Cron Job
# Teste das Renewal:
sudo certbot renew --dry-run
```

### Schritt 8: DNS konfigurieren

Bei deinem Domain-Provider (z.B. Infomaniak):

#### 8.1 A Records erstellen
```
Type    Host        Value               TTL
A       finaro      <DEINE_SERVER_IP>   3600
A       democorp    <DEINE_SERVER_IP>   3600
```

#### 8.2 Optional: Subdomain-Wildcard
```
Type    Host        Value               TTL
A       *           <DEINE_SERVER_IP>   3600
```

#### 8.3 DNS Propagation testen
```bash
# Lokal testen
nslookup finaro.deine-domain.ch
dig finaro.deine-domain.ch

# Online Tools:
# https://dnschecker.org
```

### Schritt 9: Monitoring und Logs

#### 9.1 Backend Logs
```bash
# Live Logs ansehen
sudo journalctl -u rp-crm-backend -f

# Letzte 100 Zeilen
sudo journalctl -u rp-crm-backend -n 100

# Logs nach Datum
sudo journalctl -u rp-crm-backend --since "2025-01-01" --until "2025-01-02"
```

#### 9.2 Nginx Logs
```bash
# Access Log
sudo tail -f /var/log/nginx/access.log

# Error Log
sudo tail -f /var/log/nginx/error.log
```

#### 9.3 System Monitoring
```bash
# CPU und RAM Nutzung
htop

# Disk Usage
df -h

# Service Status
sudo systemctl status rp-crm-backend
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Schritt 10: Backups einrichten

#### 10.1 Backup Script erstellen
```bash
sudo nano /usr/local/bin/backup-rp-crm.sh
```

Inhalt:
```bash
#!/bin/bash

# Backup Konfiguration
BACKUP_DIR="/var/backups/rp-crm"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="rp_crm_production"
DB_USER="rp_crm_user"

# Backup Verzeichnis erstellen
mkdir -p $BACKUP_DIR

# Datenbank Backup
PGPASSWORD="DEIN_DB_PASSWORT" pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads Backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/rp-crm/backend/uploads

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Executable machen
sudo chmod +x /usr/local/bin/backup-rp-crm.sh
```

#### 10.2 Cron Job für automatische Backups
```bash
sudo crontab -e

# Täglich um 2:00 Uhr
0 2 * * * /usr/local/bin/backup-rp-crm.sh >> /var/log/rp-crm-backup.log 2>&1
```

## 🔄 Updates deployen

### Automated mit Script
```bash
sudo nano /usr/local/bin/update-rp-crm.sh
```

Inhalt:
```bash
#!/bin/bash

echo "Starting RP CRM Update..."

# In App Verzeichnis wechseln
cd /var/www/rp-crm/app

# Git Pull
sudo -u rp-crm git pull origin main

# Backend neu bauen
cd src/backend/RP.CRM.Api
sudo -u rp-crm dotnet publish -c Release -o /var/www/rp-crm/backend

# Migrations ausführen
sudo -u rp-crm dotnet ef database update --project ../RP.CRM.Infrastructure

# Backend Service neu starten
sudo systemctl restart rp-crm-backend

# Frontend neu bauen
cd /var/www/rp-crm/app/src/frontend
sudo -u rp-crm npm ci --production
sudo -u rp-crm npm run build -- --configuration production
sudo cp -r dist/frontend/browser/* /var/www/rp-crm/frontend/

echo "Update completed!"
```

```bash
sudo chmod +x /usr/local/bin/update-rp-crm.sh

# Ausführen:
sudo /usr/local/bin/update-rp-crm.sh
```

## 🔒 Sicherheits-Checkliste

### Pre-Production:
- [ ] JWT Secret Key geändert
- [ ] Starkes DB Passwort gesetzt
- [ ] Firewall konfiguriert (nur Port 22, 80, 443 offen)
- [ ] SSH mit Key-Auth (Passwort deaktiviert)
- [ ] PostgreSQL nur auf localhost
- [ ] SSL Zertifikate aktiviert
- [ ] HTTPS Redirect aktiv

### Post-Deployment:
- [ ] Fail2Ban installieren (Brute-Force Schutz)
- [ ] Automatische Security Updates aktivieren
- [ ] Monitoring eingerichtet
- [ ] Backups getestet
- [ ] Logs regelmäßig prüfen

### Optionale Verbesserungen:
- [ ] Rate Limiting in Nginx
- [ ] CORS richtig konfiguriert
- [ ] CSP Headers setzen
- [ ] WAF (Web Application Firewall)

## 📊 Performance Optimierung

### Caching
```nginx
# In Nginx Config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Compression
```nginx
# In /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### Database Tuning
```bash
# PostgreSQL Performance Tuning
sudo nano /etc/postgresql/14/main/postgresql.conf

# Beispiel für 4GB RAM Server:
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 4MB
```

## 🆘 Troubleshooting

### Backend startet nicht
```bash
# Logs prüfen
sudo journalctl -u rp-crm-backend -n 50

# Häufige Probleme:
# - DB Verbindung fehlgeschlagen -> Connection String prüfen
# - Port bereits belegt -> netstat -tulpn | grep 5000
# - Permissions -> sudo chown -R rp-crm:rp-crm /var/www/rp-crm
```

### 502 Bad Gateway
```bash
# Backend läuft nicht
sudo systemctl status rp-crm-backend

# Nginx Logs prüfen
sudo tail -f /var/log/nginx/error.log
```

### SSL Probleme
```bash
# Zertifikate erneuern
sudo certbot renew

# Nginx neu laden
sudo systemctl reload nginx
```

### Datenbank Verbindungsfehler
```bash
# PostgreSQL Status
sudo systemctl status postgresql

# Verbindung testen
psql -U rp_crm_user -h localhost -d rp_crm_production
```

## 📞 Support und Hilfe

- **Infomaniak Support**: https://www.infomaniak.com/de/support
- **Projekt Issues**: https://github.com/jabbarpavel/rp-project/issues
- **.NET Dokumentation**: https://docs.microsoft.com/dotnet
- **Angular Dokumentation**: https://angular.io/docs

## ✅ Success Checklist

Nach erfolgreichem Deployment solltest du:

- [ ] Backend erreichbar unter: https://finaro.deine-domain.ch/api/health
- [ ] Frontend lädt unter: https://finaro.deine-domain.ch
- [ ] Login funktioniert
- [ ] Kunden erstellen/bearbeiten funktioniert
- [ ] Dokumente hochladen funktioniert
- [ ] SSL Zertifikat gültig (grünes Schloss im Browser)
- [ ] Backups laufen täglich
- [ ] Logs werden geschrieben
- [ ] Service startet nach Server-Reboot automatisch

## 🎉 Fertig!

Deine RP CRM Anwendung läuft jetzt in Produktion! 🚀

**Wichtige nächste Schritte:**
1. Erstelle erste Production Users
2. Teste alle Features gründlich
3. Überwache Logs in den ersten Tagen
4. Dokumentiere deine Production URLs und Zugänge sicher

---

**Hinweis**: Dieser Guide ist eine Grundlage. Je nach spezifischen Anforderungen können zusätzliche Konfigurationen nötig sein.
