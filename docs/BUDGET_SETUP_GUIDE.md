# 💰 Budget Setup Guide - Günstigste Production Lösung

## 🎯 Übersicht - Minimale Kosten

Dieser Guide zeigt dir die **günstigste funktionierende Lösung** für dein RP-CRM Projekt:
- ✅ **Development**: Lokal auf deinem Computer (KOSTENLOS)
- ✅ **Production**: Minimaler Cloud Server für erste Tests/Kunden
- ✅ **Marketing Website**: Einfache statische Seite
- ✅ **Subdomains**: Für Mandanten-Logins

**Geschätzte Gesamtzeit**: 4-6 Stunden  
**Monatliche Kosten**: **CHF 26-30/Monat** (statt CHF 70)

---

## 💰 Kostenaufstellung - Budget Version

| Produkt | Kosten/Monat | Kosten/Jahr | Was es ist |
|---------|--------------|-------------|------------|
| **Cloud Server** (klein) | CHF 25 | CHF 300 | 2 vCPU, 4 GB RAM |
| **Domain** (.ch) | CHF 1.25 | CHF 15 | meinecrm.ch |
| **SSL Zertifikat** | CHF 0 | CHF 0 | Let's Encrypt (gratis) |
| **Dev Umgebung** | CHF 0 | CHF 0 | Lokal auf deinem PC |
| **TOTAL** | **CHF 26.25/Monat** | **CHF 315/Jahr** | |

**Später optional hinzufügen**:
- Backups: +CHF 5/Monat (empfohlen ab Monat 2-3)
- Größerer Server: Upgrade auf 8 GB für +CHF 25/Monat

---

## 📋 Teil 1: Was du kaufen musst

### Schritt 1.1: Infomaniak Account erstellen

1. **Gehe zu**: https://www.infomaniak.com/de
2. **Klicke** "Anmelden" → "Konto erstellen"
3. **Fülle aus**: Name, E-Mail, Passwort
4. **Bestätige** E-Mail
5. **Logge ein**

**✅ Checkpoint**: Du bist im Infomaniak Dashboard

---

### Schritt 1.2: Domain kaufen

1. **Im Dashboard**: Klicke "Domain" → "Domain registrieren"
2. **Gib ein**: deinen Wunsch-Domain-Namen
3. **Wähle**: `.ch` (CHF 15/Jahr) oder `.com` (CHF 12/Jahr)
4. **Aktiviere**:
   - ✅ WHOIS Privacy (Datenschutz)
   - ✅ Auto-Renewal (automatische Verlängerung)
5. **Kaufe** die Domain

**✅ Checkpoint**: Domain gekauft (z.B. `meinecrm.ch`)

**Notiere**: Deine Domain: `___________________.ch`

---

### Schritt 1.3: Minimalen Cloud Server bestellen

**WICHTIG**: Wir nehmen den KLEINSTEN Server (2 vCPU, 4 GB RAM)

#### So bestellst du:

1. **Im Dashboard**: "Public Cloud" → "Neue Instanz erstellen"

2. **Konfiguration**:
   - **Region**: Schweiz (Geneva)
   - **OS**: Ubuntu 22.04 LTS
   - **Instanz-Typ**: 
     ```
     2 vCPU
     4 GB RAM
     40 GB SSD Storage
     ```
   - **Preis**: CHF 25/Monat ✅

3. **SSH Key** (einmalig erstellen):
   
   **Auf deinem Computer (Terminal/PowerShell)**:
   ```bash
   # SSH Key erstellen
   ssh-keygen -t ed25519 -C "meine-email@example.com"
   # Enter drücken für default Speicherort
   # Enter drücken für kein Passwort
   
   # Public Key anzeigen und kopieren
   # Windows:
   type %USERPROFILE%\.ssh\id_ed25519.pub
   
   # Mac/Linux:
   cat ~/.ssh/id_ed25519.pub
   ```
   
   - Kopiere den **kompletten** Public Key
   - Füge ihn bei Infomaniak ein

4. **Backup**: 
   - ❌ **NICHT aktivieren** (spart CHF 10/Monat)
   - Du machst später manuelle Backups

5. **Bestellen**: "Instanz erstellen"

6. **Warten**: 5-10 Minuten, dann bekommst du E-Mail mit Server-IP

**✅ Checkpoint**: Server läuft

**Notiere**: Server IP: `___.___.___.___`

---

## 🖥️ Teil 2: Development LOKAL (KOSTENLOS!)

**Wichtig**: Entwicklung machst du komplett auf deinem Computer!

### Schritt 2.1: Lokale Entwicklung einrichten

**Folge dem bestehenden SETUP_GUIDE.md**:

```bash
# Backend lokal starten
cd src/backend/RP.CRM.Api
dotnet run

# Frontend lokal starten (neues Terminal)
cd src/frontend
npm install
ng serve
```

**Zugriff**:
- Backend: http://localhost:5015
- Frontend: http://localhost:4200

### Warum lokal entwickeln?
- ✅ **Kostenlos** - keine Server-Kosten
- ✅ **Schnell** - keine Upload-Zeiten
- ✅ **Einfach** - wie du es gewohnt bist
- ✅ **Sicher** - kein Risiko in Production

**Development Workflow**:
1. Code auf deinem Computer schreiben
2. Lokal testen
3. Git commit + push
4. Erst wenn alles funktioniert: Zu Production deployen

**✅ Checkpoint**: Entwicklung läuft lokal wie gewohnt

---

## 🚀 Teil 3: Production Server einrichten

### Schritt 3.1: Erste Verbindung zum Server

```bash
# SSH zum Server (ersetze IP!)
ssh ubuntu@DEINE_SERVER_IP
```

Beim ersten Mal: Tippe `yes` + Enter

**Du bist jetzt auf dem Server!**

---

### Schritt 3.2: System vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Firewall einrichten
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
# Wenn gefragt: y + Enter

# Docker installieren
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

### Schritt 3.3: Verzeichnisse erstellen

```bash
# Arbeitsverzeichnis
sudo mkdir -p /opt/rp-crm/prod
sudo chown -R $USER:$USER /opt/rp-crm
sudo chmod -R 755 /opt/rp-crm

# Backup Verzeichnis (für später)
mkdir -p /opt/rp-crm/backups

# Marketing Website Verzeichnis
mkdir -p /opt/rp-crm/marketing
```

---

## 📦 Teil 4: Code auf Server deployen

### Schritt 4.1: Repository klonen

```bash
cd /opt/rp-crm/prod
git clone https://github.com/jabbarpavel/rp-project.git app
cd app
```

---

### Schritt 4.2: Production Konfiguration

#### .env Datei erstellen

```bash
cd /opt/rp-crm/prod/app
nano .env
```

**Füge ein** (sichere Passwörter setzen!):
```bash
# Database
POSTGRES_DB=rp_crm_prod
POSTGRES_USER=rp_crm_user
POSTGRES_PASSWORD=ÄNDERE_MICH_Sicheres_Passwort123!

# JWT Secret (mindestens 32 Zeichen!)
JWT_SECRET=ÄNDERE_MICH_Sehr_Langer_Zufälliger_String_Min32Zeichen!

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=8080
```

**Speichern**: Ctrl+O, Enter, Ctrl+X

---

#### Tenants konfigurieren

```bash
nano src/backend/RP.CRM.Api/tenants.json
```

**Ändere zu** (mit deiner Domain!):
```json
[
  {
    "Name": "Mandant1",
    "Domain": "mandant1.meinecrm.ch"
  },
  {
    "Name": "Mandant2",
    "Domain": "mandant2.meinecrm.ch"
  }
]
```

---

### Schritt 4.3: Docker Compose für Production

```bash
nano docker-compose.prod.yml
```

**Füge ein**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: rp-crm-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rp-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: rp-crm-backend
    restart: unless-stopped
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}
      - Jwt__Key=${JWT_SECRET}
    volumes:
      - backend_uploads:/app/uploads
      - ./src/backend/RP.CRM.Api/tenants.json:/app/tenants.json:ro
    ports:
      - "${BACKEND_PORT}:5000"
    depends_on:
      - postgres
    networks:
      - rp-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: rp-crm-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
    networks:
      - rp-network

volumes:
  postgres_data:
  backend_uploads:

networks:
  rp-network:
    driver: bridge
```

---

### Schritt 4.4: Anwendung starten

```bash
cd /opt/rp-crm/prod/app

# Docker Containers bauen und starten
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build
```

**Das dauert**: 10-15 Minuten beim ersten Mal!

**Status prüfen**:
```bash
docker-compose -f docker-compose.prod.yml ps
```

**Du solltest sehen**:
- rp-crm-postgres (Up)
- rp-crm-backend (Up)
- rp-crm-frontend (Up)

**Logs ansehen**:
```bash
docker-compose -f docker-compose.prod.yml logs -f
# Ctrl+C zum Beenden
```

**✅ Checkpoint**: App läuft in Docker!

---

## 🌐 Teil 5: DNS konfigurieren

### Schritt 5.1: DNS Records setzen

1. **Gehe zu Infomaniak Dashboard**
2. **Klicke** "Domains" → Deine Domain
3. **Klicke** "DNS Zone verwalten"

**Füge diese Records hinzu**:

| Typ | Host | Wert | TTL |
|-----|------|------|-----|
| A | @ | DEINE_SERVER_IP | 3600 |
| A | www | DEINE_SERVER_IP | 3600 |
| A | mandant1 | DEINE_SERVER_IP | 3600 |
| A | mandant2 | DEINE_SERVER_IP | 3600 |

**Für jeden Record**:
1. "+ Record hinzufügen"
2. Typ: A
3. Host: (siehe Tabelle)
4. Ziel: Deine Server-IP
5. Speichern

**Warten**: 15-30 Minuten für DNS Propagation

**Testen**:
```bash
# Auf deinem Computer
nslookup mandant1.meinecrm.ch
```

**✅ Checkpoint**: DNS ist konfiguriert

---

## 🔧 Teil 6: Nginx Reverse Proxy

### Schritt 6.1: Nginx installieren

```bash
# Auf dem Server
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### Schritt 6.2: Mandant 1 Konfiguration

```bash
sudo nano /etc/nginx/sites-available/mandant1
```

**Füge ein** (ersetze meinecrm.ch mit deiner Domain!):
```nginx
server {
    listen 80;
    server_name mandant1.meinecrm.ch;
    
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
sudo ln -s /etc/nginx/sites-available/mandant1 /etc/nginx/sites-enabled/
```

---

### Schritt 6.3: Mandant 2 Konfiguration

```bash
sudo nano /etc/nginx/sites-available/mandant2
```

**Gleiche Config**, nur Domain ändern:
```nginx
server {
    listen 80;
    server_name mandant2.meinecrm.ch;
    # ... rest wie mandant1
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mandant2 /etc/nginx/sites-enabled/
```

---

### Schritt 6.4: Marketing Website

```bash
sudo nano /etc/nginx/sites-available/marketing
```

```nginx
server {
    listen 80;
    server_name meinecrm.ch www.meinecrm.ch;
    
    root /opt/rp-crm/marketing;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/marketing /etc/nginx/sites-enabled/
```

---

### Schritt 6.5: Marketing Seite erstellen

```bash
nano /opt/rp-crm/marketing/index.html
```

**Einfache Seite**:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine CRM - Willkommen</title>
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
        <h1>🚀 Willkommen bei MeineCRM</h1>
        <p>Moderne CRM-Lösung für Ihr Unternehmen</p>
        <div class="links">
            <a href="http://mandant1.meinecrm.ch">Mandant 1 Login →</a>
            <a href="http://mandant2.meinecrm.ch">Mandant 2 Login →</a>
        </div>
    </div>
</body>
</html>
```

---

### Schritt 6.6: Nginx neu laden

```bash
# Konfiguration testen
sudo nginx -t

# Sollte zeigen: syntax is ok

# Nginx neu laden
sudo systemctl reload nginx
```

**✅ Checkpoint**: Nginx läuft!

---

## 🔒 Teil 7: SSL/HTTPS einrichten

### Schritt 7.1: Certbot installieren

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### Schritt 7.2: SSL für alle Domains

```bash
# Marketing Website
sudo certbot --nginx -d meinecrm.ch -d www.meinecrm.ch

# Mandant 1
sudo certbot --nginx -d mandant1.meinecrm.ch

# Mandant 2
sudo certbot --nginx -d mandant2.meinecrm.ch
```

**Bei jedem Befehl**:
1. E-Mail eingeben
2. Terms: `Y`
3. News: `N` 
4. Redirect zu HTTPS: `2` (Ja!)

**✅ Checkpoint**: HTTPS funktioniert überall! 🔒

---

## 🎉 Teil 8: Alles testen!

### Test 1: Marketing Website

**Browser**: https://meinecrm.ch

**Du siehst**: Grünes Schloss 🔒 + Marketing Seite

---

### Test 2: Mandant 1

**Browser**: https://mandant1.meinecrm.ch

**Du siehst**: Angular App + Login

---

### Test 3: Mandant 2

**Browser**: https://mandant2.meinecrm.ch

**Du siehst**: Angular App + Login

---

## 🔄 Teil 9: Updates deployen

### Update Script erstellen

```bash
sudo nano /usr/local/bin/update-production.sh
```

**Füge ein**:
```bash
#!/bin/bash

echo "Updating Production..."

cd /opt/rp-crm/prod/app

# Git pull
git pull origin main

# Rebuild und restart
docker-compose -f docker-compose.prod.yml --env-file .env down
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "Update completed!"
```

```bash
sudo chmod +x /usr/local/bin/update-production.sh
```

**Verwendung**:
```bash
sudo /usr/local/bin/update-production.sh
```

---

## 💾 Teil 10: Einfache Backups (manuell)

### Backup Script

```bash
nano /usr/local/bin/backup-production.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/opt/rp-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Datenbank Backup
docker exec rp-crm-postgres pg_dump -U rp_crm_user rp_crm_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads Backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/rp-crm/prod/app/uploads 2>/dev/null

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-production.sh
```

**Manuell ausführen** (einmal pro Woche):
```bash
/usr/local/bin/backup-production.sh
```

**Später automatisieren** (optional):
```bash
# Crontab editieren
crontab -e

# Hinzufügen (jeden Sonntag um 2 Uhr):
0 2 * * 0 /usr/local/bin/backup-production.sh
```

---

## ✅ Was du jetzt hast - Budget Version

### 🌐 Live URLs:
- ✅ https://meinecrm.ch - Marketing Website
- ✅ https://mandant1.meinecrm.ch - Mandant 1
- ✅ https://mandant2.meinecrm.ch - Mandant 2

### 💰 Kosten:
- **CHF 26/Monat** statt CHF 70!

### 🖥️ Umgebungen:
- **Production**: Auf Cloud Server (für echte Kunden)
- **Development**: Lokal auf deinem Computer (kostenlos!)

### 🔒 Sicherheit:
- ✅ SSL/HTTPS überall
- ✅ Firewall aktiv
- ✅ Sichere Passwörter

### 📦 Services:
- ✅ Docker Container (einfach zu verwalten)
- ✅ PostgreSQL Datenbank
- ✅ Automatische Restarts

---

## 📊 Vergleich: Budget vs. Original

| Feature | Original Setup | Budget Setup | Ersparnis |
|---------|---------------|--------------|-----------|
| **Dev Umgebung** | Auf Server | Lokal (gratis) | CHF 10-15 |
| **Test Umgebung** | Auf Server | Keine (lokal testen) | CHF 10-15 |
| **Server Größe** | 8 GB RAM | 4 GB RAM | CHF 25 |
| **Backups** | Automatisch | Manuell | CHF 10 |
| **TOTAL** | CHF 70/Monat | CHF 26/Monat | **CHF 44** |

---

## 🚀 Upgrade-Pfad (für später)

### Wenn du mehr brauchst:

**Phase 1 (Start - JETZT)**:
```
Kosten: CHF 26/Monat
- 1 Production Server (4 GB)
- 2 Mandanten
- Dev lokal
```

**Phase 2 (nach 2-3 Monaten)**:
```
Kosten: CHF 31/Monat (+CHF 5)
- Automatische Backups hinzufügen
```

**Phase 3 (nach 6 Monaten, wenn mehr Kunden)**:
```
Kosten: CHF 51/Monat (+CHF 20)
- Server auf 8 GB upgraden
- Test-Umgebung auf Server hinzufügen
```

**Phase 4 (später, wenn professionell)**:
```
Kosten: CHF 70/Monat (+CHF 19)
- Noch größerer Server
- Dev auf Server
- Prod + Test + Dev
```

---

## 🆘 Troubleshooting

### Container startet nicht
```bash
# Logs ansehen
cd /opt/rp-crm/prod/app
docker-compose -f docker-compose.prod.yml logs
```

### Website nicht erreichbar
```bash
# DNS prüfen
nslookup mandant1.meinecrm.ch

# Nginx prüfen
sudo systemctl status nginx
sudo nginx -t
```

### Datenbank Fehler
```bash
# Container Status
docker ps

# Postgres Logs
docker logs rp-crm-postgres
```

---

## ✅ Zusammenfassung - Budget Setup

### Was du gespart hast:
- ❌ Keine Test-Umgebung auf Server (lokal testen)
- ❌ Keine Dev-Umgebung auf Server (lokal entwickeln)
- ❌ Kleinerer Server (4 GB statt 8 GB)
- ❌ Keine automatischen Backups (manuell)
- **= CHF 44/Monat gespart!**

### Was du hast:
- ✅ Funktionierende Production mit 2 Mandanten
- ✅ Marketing Website
- ✅ SSL/HTTPS überall
- ✅ Docker Container
- ✅ Development lokal (wie gewohnt)

### Nächste Schritte:
1. **Teste** alles gründlich
2. **Erste Kunden** onboarden
3. **Manuelle Backups** einmal pro Woche
4. **Upgrade** wenn nötig (später)

---

## 🎯 Quick Start Checkliste

- [ ] Infomaniak Account erstellt
- [ ] Domain gekauft (CHF 15/Jahr)
- [ ] Cloud Server bestellt (4 GB, CHF 25/Monat)
- [ ] Server konfiguriert (Firewall, Docker)
- [ ] Code deployed
- [ ] DNS konfiguriert
- [ ] Nginx konfiguriert
- [ ] SSL aktiviert
- [ ] Alles getestet
- [ ] Erstes Backup gemacht

**Total Zeit**: 4-6 Stunden  
**Total Kosten**: CHF 26/Monat

---

## 🎉 FERTIG!

Du hast jetzt eine **funktionierende, kostengünstige Production-Umgebung**!

**Bei Fragen oder Problemen**: Schreib einfach, ich helfe dir weiter!

**Später upgraden**: Jederzeit möglich wenn Projekt wächst!
