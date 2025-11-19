# 🎯 Kompletter Setup Guide - Von 0 bis Production

## Übersicht

Dieser Guide führt dich **Schritt-für-Schritt** durch den kompletten Prozess:
1. ✅ Produkte bei Infomaniak einkaufen
2. ✅ Dev, Test und Production Umgebungen einrichten
3. ✅ Hauptwebseite (www.meinewebseite.ch) für Marketing aufsetzen
4. ✅ Subdomains für Mandanten (mandant1.meinewebseite.ch, mandant2.meinewebseite.ch)
5. ✅ Alles konfigurieren und live schalten

**Geschätzte Gesamtzeit**: 1-2 Tage  
**Kosten**: ~CHF 50-80/Monat

---

## 📋 Teil 1: Produkte bei Infomaniak einkaufen

### Schritt 1.1: Infomaniak Account erstellen

1. **Gehe zu**: https://www.infomaniak.com/de
2. **Klicke** oben rechts auf "Anmelden"
3. **Wähle** "Konto erstellen"
4. **Fülle aus**:
   - Vorname
   - Nachname
   - E-Mail Adresse (wichtig - hier kommen alle Infos hin!)
   - Passwort (stark, mind. 12 Zeichen)
   - Land: Schweiz
5. **Bestätige** E-Mail Adresse (Check dein Postfach)
6. **Logge ein** mit deinen Daten

**✅ Checkpoint**: Du bist jetzt im Infomaniak Dashboard

---

### Schritt 1.2: Domain registrieren

#### Was du brauchst:
- 1x Haupt-Domain für dein Projekt (z.B. `meinewebseite.ch`)

#### So bestellst du:

1. **Im Infomaniak Dashboard**:
   - Klicke links auf "Domain"
   - Klicke "Domain registrieren"

2. **Domain-Name eingeben**:
   - Gib deinen Wunsch-Domain ein: z.B. `meinecrm.ch` oder `meinerpapp.ch`
   - Klicke "Suchen"
   - **Wenn verfügbar**: Grünes Häkchen ✅
   - **Wenn nicht verfügbar**: Rotes X ❌ (versuche andere Namen)

3. **Domain auswählen**:
   - Wähle `.ch` (Schweiz) - ca. CHF 15/Jahr
   - Oder `.com` (International) - ca. CHF 12/Jahr
   - Klicke "In den Warenkorb"

4. **Domain-Optionen**:
   - ✅ **WHOIS Privacy**: JA (schützt deine persönlichen Daten)
   - ✅ **Auto-Renewal**: JA (Domain wird automatisch verlängert)
   - ✅ **DNS Management**: JA (wird automatisch aktiviert)

5. **Checkout**:
   - Klicke "Zur Kasse"
   - Überprüfe Bestellung
   - Zahlungsmethode wählen (Kreditkarte/TWINT/Rechnung)
   - "Bestellung abschließen"

6. **Warten**:
   - Du bekommst eine E-Mail (meistens innerhalb 5-15 Minuten)
   - Domain ist jetzt registriert!

**✅ Checkpoint**: Domain ist gekauft und erscheint in deinem Dashboard unter "Domains"

**Beispiel**: Wir nehmen an, du hast `meinecrm.ch` gekauft

---

### Schritt 1.3: Cloud Server (VPS) bestellen

#### Was du brauchst:
Für Dev, Test und Prod brauchst du **3 separate Server** ODER **1 größeren Server** mit Docker.

**Option A (Empfohlen für Anfang)**: 1 Server mit Docker für alle Umgebungen
**Option B (Professionell)**: 3 separate Server

Wir gehen mit **Option A** (einfacher, günstiger am Anfang)

#### So bestellst du den Server:

1. **Im Infomaniak Dashboard**:
   - Klicke links auf "Public Cloud"
   - Klicke "Neue Instanz erstellen"

2. **Server konfigurieren**:

   **Schritt 1: Region wählen**
   - Wähle: **Schweiz (Geneva oder Winterthur)**
   - Warum? Bessere Performance für Schweizer Nutzer

   **Schritt 2: Betriebssystem**
   - Wähle: **Ubuntu 22.04 LTS**
   - Warum? Stabil, gut dokumentiert, lange unterstützt

   **Schritt 3: Instanz-Typ (WICHTIG!)**
   
   Für Dev/Test/Prod auf einem Server:
   - **vCPU**: 4 Cores
   - **RAM**: 8 GB
   - **Storage**: 80 GB SSD
   - **Preis**: ca. CHF 50-60/Monat
   
   Warum so viel?
   - Dev-Umgebung: ~2 GB RAM
   - Test-Umgebung: ~2 GB RAM
   - Prod-Umgebung: ~3 GB RAM
   - System: ~1 GB RAM

   **Schritt 4: Hostname**
   - Gib einen Namen: z.B. `rp-crm-server` oder `prod-server-01`

   **Schritt 5: SSH Key (WICHTIG!)**
   
   Falls du noch keinen SSH Key hast:
   ```bash
   # Auf deinem lokalen Computer (Terminal/PowerShell):
   ssh-keygen -t ed25519 -C "dein-email@example.com"
   # Drücke Enter für default Speicherort
   # Drücke Enter für kein Passwort (oder setze eins für mehr Sicherheit)
   
   # Public Key anzeigen:
   # Windows PowerShell:
   type $HOME\.ssh\id_ed25519.pub
   
   # Mac/Linux:
   cat ~/.ssh/id_ed25519.pub
   ```
   
   - Kopiere den **kompletten** Inhalt (beginnt mit `ssh-ed25519 ...`)
   - Füge ihn im Infomaniak Formular ein bei "SSH Public Key"

   **Schritt 6: Backup (Optional aber empfohlen)**
   - ✅ Aktiviere "Automatische Backups"
   - Kostet: ca. CHF 10/Monat extra
   - Wert: Unbezahlbar wenn was schief geht!

3. **Bestellen**:
   - Überprüfe Zusammenfassung
   - Klicke "Instanz erstellen"
   - Bezahle

4. **Warten**:
   - Server wird vorbereitet (ca. 5-10 Minuten)
   - Du bekommst eine E-Mail mit:
     - Server IP-Adresse (z.B. `185.12.34.56`)
     - SSH Zugang

**✅ Checkpoint**: Server läuft, du hast IP-Adresse erhalten

**Notiere dir**:
- ✏️ Server IP: `_____._____._____.____`
- ✏️ SSH Username: `ubuntu` (Standard bei Ubuntu)

---

### Schritt 1.4: Zusammenfassung - Was du jetzt hast

| Produkt | Status | Kosten/Monat | Kosten/Jahr |
|---------|--------|--------------|-------------|
| Domain (meinecrm.ch) | ✅ Gekauft | - | CHF 15 |
| Cloud Server (8GB, 4 CPU) | ✅ Läuft | CHF 60 | CHF 720 |
| Backups | ✅ Aktiv | CHF 10 | CHF 120 |
| **TOTAL** | | **CHF 70/Monat** | **CHF 855/Jahr** |

**SSL Zertifikate**: Kostenlos (Let's Encrypt) ✅

---

## 🔧 Teil 2: Server Grundkonfiguration

### Schritt 2.1: Erstmalige Verbindung zum Server

#### Auf deinem Computer:

**Windows (PowerShell)**:
```powershell
# Ersetze IP mit deiner Server-IP
ssh ubuntu@185.12.34.56
```

**Mac/Linux (Terminal)**:
```bash
# Ersetze IP mit deiner Server-IP
ssh ubuntu@185.12.34.56
```

**Beim ersten Mal siehst du**:
```
The authenticity of host '185.12.34.56' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

- Tippe: `yes` und drücke Enter

**Du bist jetzt auf dem Server!** ✅

Du siehst so was wie:
```
ubuntu@rp-crm-server:~$
```

---

### Schritt 2.2: System aktualisieren

**WICHTIG**: Immer als Erstes das System updaten!

```bash
# System-Pakete aktualisieren
sudo apt update
```

**Was passiert?**: Server lädt Liste der verfügbaren Updates (dauert ~30 Sekunden)

```bash
# Updates installieren
sudo apt upgrade -y
```

**Was passiert?**: Installiert alle Updates (dauert 2-5 Minuten)

**Wenn gefragt "Restart services?"**: Drücke Enter (default: yes)

```bash
# Aufräumen
sudo apt autoremove -y
```

**Was passiert?**: Entfernt alte, nicht mehr benötigte Pakete

**✅ Checkpoint**: System ist aktuell

---

### Schritt 2.3: Firewall einrichten (SICHERHEIT!)

**Warum?**: Schützt deinen Server vor unerlaubten Zugriffen

```bash
# Firewall installieren (falls nicht vorhanden)
sudo apt install -y ufw

# Standard-Regeln: Alles eingehende blocken, alles ausgehende erlauben
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH erlauben (Port 22) - WICHTIG, sonst sperrst du dich selbst aus!
sudo ufw allow 22/tcp
sudo ufw allow ssh

# HTTP erlauben (Port 80)
sudo ufw allow 80/tcp
sudo ufw allow http

# HTTPS erlauben (Port 443)
sudo ufw allow 443/tcp
sudo ufw allow https

# Firewall aktivieren
sudo ufw enable
```

**Warnung erscheint**: "Command may disrupt existing ssh connections. Proceed with operation (y|n)?"
- Tippe: `y` und Enter

**Firewall Status prüfen**:
```bash
sudo ufw status verbose
```

**Du solltest sehen**:
```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

**✅ Checkpoint**: Firewall läuft und schützt deinen Server

---

### Schritt 2.4: Docker installieren

**Warum Docker?**: Einfacher, alle Umgebungen (Dev/Test/Prod) isoliert voneinander

```bash
# Docker Installations-Script herunterladen und ausführen
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Was passiert?**: Installiert Docker (dauert 1-2 Minuten)

```bash
# Docker dem aktuellen User erlauben (kein sudo mehr nötig)
sudo usermod -aG docker $USER

# Änderungen aktivieren
newgrp docker
```

```bash
# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Installation prüfen**:
```bash
docker --version
docker-compose --version
```

**Du solltest sehen** (Versionen können variieren):
```
Docker version 24.0.7
docker-compose version 2.23.0
```

**✅ Checkpoint**: Docker ist installiert und funktioniert

---

### Schritt 2.5: Verzeichnisstruktur erstellen

**Warum?**: Ordnung halten, alle Umgebungen sauber getrennt

```bash
# Hauptverzeichnis erstellen
sudo mkdir -p /opt/rp-crm

# Unterverzeichnisse für jede Umgebung
sudo mkdir -p /opt/rp-crm/dev
sudo mkdir -p /opt/rp-crm/test
sudo mkdir -p /opt/rp-crm/prod

# Marketing Website Verzeichnis
sudo mkdir -p /opt/rp-crm/marketing

# Backup Verzeichnis
sudo mkdir -p /opt/rp-crm/backups

# Eigentümer setzen (aktueller User)
sudo chown -R $USER:$USER /opt/rp-crm

# Permissions setzen
sudo chmod -R 755 /opt/rp-crm
```

**Struktur ansehen**:
```bash
tree -L 2 /opt/rp-crm
```

**Du siehst**:
```
/opt/rp-crm
├── backups/
├── dev/
├── marketing/
├── prod/
└── test/
```

**✅ Checkpoint**: Verzeichnisstruktur ist erstellt

---

## 🌐 Teil 3: DNS Konfiguration (Subdomains einrichten)

### Schritt 3.1: DNS Konzept verstehen

**Was wir aufbauen**:
```
meinecrm.ch                      → Marketing Website (Hauptseite)
www.meinecrm.ch                  → Auch Marketing Website
mandant1.meinecrm.ch             → Tenant 1 Login/App
mandant2.meinecrm.ch             → Tenant 2 Login/App
dev.meinecrm.ch                  → Development Umgebung
test.meinecrm.ch                 → Test Umgebung
```

**Alle zeigen auf den gleichen Server** (deine Server-IP)

---

### Schritt 3.2: DNS Records bei Infomaniak setzen

1. **Gehe zu Infomaniak Dashboard**
2. **Klicke** auf "Domains"
3. **Wähle** deine Domain (z.B. `meinecrm.ch`)
4. **Klicke** auf "DNS Zone verwalten"

#### A Records hinzufügen:

**Für jeden Eintrag, klicke "Record hinzufügen"**:

| Typ | Host | Wert | TTL |
|-----|------|------|-----|
| A | @ | DEINE_SERVER_IP | 3600 |
| A | www | DEINE_SERVER_IP | 3600 |
| A | mandant1 | DEINE_SERVER_IP | 3600 |
| A | mandant2 | DEINE_SERVER_IP | 3600 |
| A | dev | DEINE_SERVER_IP | 3600 |
| A | test | DEINE_SERVER_IP | 3600 |

**Ersetze `DEINE_SERVER_IP`** mit deiner echten IP (z.B. `185.12.34.56`)

**@ bedeutet**: Die Root-Domain (meinecrm.ch)

**Schritt-für-Schritt für einen Record**:
1. Klicke "+ Record hinzufügen"
2. Typ: Wähle "A"
3. Host: Gib ein `@` (für Haupt-Domain) oder `mandant1` (für Subdomain)
4. Ziel/Wert: Gib deine Server-IP ein
5. TTL: Lasse `3600` (Standard)
6. Klicke "Speichern"
7. Wiederhole für alle anderen Records

**Nach dem Speichern**:
- DNS Propagation dauert 5 Minuten bis 24 Stunden
- Meist aber nur 10-30 Minuten

---

### Schritt 3.3: DNS Propagation testen

**Nach 15-30 Minuten**:

Teste auf deinem lokalen Computer:

```bash
# Hauptdomain testen
nslookup meinecrm.ch

# Subdomain testen
nslookup mandant1.meinecrm.ch
```

**Du solltest sehen**:
```
Server:  ...
Address:  ...

Name:    mandant1.meinecrm.ch
Address:  185.12.34.56  <-- Deine Server IP
```

**Online Tool** (im Browser): https://dnschecker.org
- Gib ein: `mandant1.meinecrm.ch`
- Klicke "Search"
- Sollte überall grün sein mit deiner IP

**✅ Checkpoint**: DNS ist konfiguriert und funktioniert

---

## 📦 Teil 4: Code auf Server bringen

### Schritt 4.1: Git installieren

**Auf dem Server**:
```bash
sudo apt install -y git
```

---

### Schritt 4.2: Repository klonen

```bash
# In Production Verzeichnis wechseln
cd /opt/rp-crm/prod

# Repository klonen
git clone https://github.com/jabbarpavel/rp-project.git app

# In das Verzeichnis wechseln
cd app

# Auf den richtigen Branch wechseln (falls nötig)
git checkout main
```

**Struktur ansehen**:
```bash
ls -la
```

**Du siehst**:
- src/ (Source Code)
- docs/ (Dokumentation)
- docker-compose.yml
- Dockerfile.backend
- Dockerfile.frontend
- etc.

---

### Schritt 4.3: Code für andere Umgebungen kopieren

```bash
# Test Umgebung
cp -r /opt/rp-crm/prod/app /opt/rp-crm/test/app

# Dev Umgebung
cp -r /opt/rp-crm/prod/app /opt/rp-crm/dev/app
```

**✅ Checkpoint**: Code ist auf dem Server

---

## 🐳 Teil 5: Docker Umgebungen konfigurieren

### Schritt 5.1: Production Umgebung (.env Datei)

```bash
cd /opt/rp-crm/prod/app

# .env Datei erstellen
nano .env.production
```

**Füge ein** (ersetze Werte mit sicheren Passwörtern!):
```bash
# Environment
ASPNETCORE_ENVIRONMENT=Production

# Database
DB_PASSWORD=HIER_EIN_STARKES_PASSWORT_123456!  # ÄNDERE DIES!
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=rp_crm_prod
DATABASE_USER=rp_crm_prod_user

# JWT Secret (mindestens 32 Zeichen, zufällig!)
JWT_SECRET=prod_jwt_super_secret_key_min_32_chars_ÄNDERN_123456789!

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=8080
```

**Speichern**: Ctrl+O, Enter, Ctrl+X

**Sichere Passwörter generieren** (Optional, auf deinem Computer):
```bash
# Auf Mac/Linux:
openssl rand -base64 32

# Oder online: https://passwordsgenerator.net/
```

---

### Schritt 5.2: Test Umgebung (.env Datei)

```bash
cd /opt/rp-crm/test/app
nano .env.test
```

**Füge ein**:
```bash
ASPNETCORE_ENVIRONMENT=Test
DB_PASSWORD=test_passwort_123!
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=rp_crm_test
DATABASE_USER=rp_crm_test_user
JWT_SECRET=test_jwt_secret_key_min_32_chars_ÄNDERN!
BACKEND_PORT=5100
FRONTEND_PORT=8180
```

---

### Schritt 5.3: Dev Umgebung (.env Datei)

```bash
cd /opt/rp-crm/dev/app
nano .env.dev
```

**Füge ein**:
```bash
ASPNETCORE_ENVIRONMENT=Development
DB_PASSWORD=dev_passwort_123!
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=rp_crm_dev
DATABASE_USER=rp_crm_dev_user
JWT_SECRET=dev_jwt_secret_key_min_32_chars!
BACKEND_PORT=5200
FRONTEND_PORT=8280
```

**✅ Checkpoint**: Environment Dateien sind erstellt

---

### Schritt 5.4: Tenants Konfiguration anpassen

#### Production Tenants:

```bash
cd /opt/rp-crm/prod/app
nano src/backend/RP.CRM.Api/tenants.json
```

**Ändere zu** (mit deinen echten Domains!):
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

**Speichern**: Ctrl+O, Enter, Ctrl+X

#### Test Tenants:

```bash
cd /opt/rp-crm/test/app
nano src/backend/RP.CRM.Api/tenants.json
```

```json
[
  {
    "Name": "TestMandant1",
    "Domain": "test.meinecrm.ch"
  }
]
```

#### Dev Tenants:

```bash
cd /opt/rp-crm/dev/app
nano src/backend/RP.CRM.Api/tenants.json
```

```json
[
  {
    "Name": "DevMandant",
    "Domain": "dev.meinecrm.ch"
  }
]
```

**✅ Checkpoint**: Tenants sind konfiguriert

---

### Schritt 5.5: Docker Compose Dateien anpassen

#### Production docker-compose:

```bash
cd /opt/rp-crm/prod/app
nano docker-compose.prod.yml
```

**Erstelle** (falls nicht existiert):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: rp-crm-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - prod-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: rp-crm-backend-prod
    restart: unless-stopped
    environment:
      - ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT}
      - ConnectionStrings__DefaultConnection=Host=${DATABASE_HOST};Database=${DATABASE_NAME};Username=${DATABASE_USER};Password=${DB_PASSWORD}
      - Jwt__Key=${JWT_SECRET}
    volumes:
      - backend_prod_uploads:/app/uploads
      - ./src/backend/RP.CRM.Api/tenants.json:/app/tenants.json:ro
    ports:
      - "${BACKEND_PORT}:5000"
    depends_on:
      - postgres
    networks:
      - prod-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: rp-crm-frontend-prod
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
    networks:
      - prod-network

volumes:
  postgres_prod_data:
  backend_prod_uploads:

networks:
  prod-network:
    driver: bridge
```

**Gleiche Struktur für Test und Dev**, nur Namen ändern:
- Test: `docker-compose.test.yml` mit `test` Suffix in Container-Namen
- Dev: `docker-compose.dev.yml` mit `dev` Suffix in Container-Namen

---

## 🚀 Teil 6: Anwendungen starten

### Schritt 6.1: Production Umgebung starten

```bash
cd /opt/rp-crm/prod/app

# Docker Containers bauen und starten
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

**Was passiert?**:
1. Docker lädt Base Images herunter (dauert 5-10 Min beim ersten Mal)
2. Backend wird gebaut (dauert 3-5 Min)
3. Frontend wird gebaut (dauert 3-5 Min)
4. Containers starten

**Logs ansehen**:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

**Ctrl+C** zum Beenden (Container laufen weiter!)

**Container Status prüfen**:
```bash
docker-compose -f docker-compose.prod.yml ps
```

**Du solltest sehen**:
```
NAME                        STATUS              PORTS
rp-crm-postgres-prod        Up 5 minutes       0.0.0.0:5432->5432/tcp
rp-crm-backend-prod         Up 5 minutes       0.0.0.0:5000->5000/tcp
rp-crm-frontend-prod        Up 5 minutes       0.0.0.0:8080->80/tcp
```

**✅ Checkpoint**: Production läuft!

---

### Schritt 6.2: Test Umgebung starten

```bash
cd /opt/rp-crm/test/app
docker-compose -f docker-compose.test.yml --env-file .env.test up -d --build
```

---

### Schritt 6.3: Dev Umgebung starten

```bash
cd /opt/rp-crm/dev/app
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
```

---

### Schritt 6.4: Alle laufenden Container sehen

```bash
docker ps
```

**Du siehst jetzt 9 Container** (3 pro Umgebung):
- 3x PostgreSQL (prod, test, dev)
- 3x Backend (prod, test, dev)
- 3x Frontend (prod, test, dev)

**✅ Checkpoint**: Alle Umgebungen laufen!

---

## 🌐 Teil 7: Nginx Reverse Proxy einrichten

**Warum?**: Ein zentraler Eingang für alle Requests, SSL Terminierung

### Schritt 7.1: Nginx installieren

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### Schritt 7.2: Nginx Konfiguration für Production (Mandant 1)

```bash
sudo nano /etc/nginx/sites-available/mandant1-prod
```

**Füge ein**:
```nginx
server {
    listen 80;
    server_name mandant1.meinecrm.ch;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Scalar API Docs
    location /scalar/ {
        proxy_pass http://localhost:5000/scalar/;
        proxy_set_header Host $host;
    }
    
    client_max_body_size 10M;
}
```

**Aktivieren**:
```bash
sudo ln -s /etc/nginx/sites-available/mandant1-prod /etc/nginx/sites-enabled/
```

---

### Schritt 7.3: Nginx für Mandant 2

```bash
sudo nano /etc/nginx/sites-available/mandant2-prod
```

**Gleiche Konfiguration**, nur Domain ändern:
```nginx
server {
    listen 80;
    server_name mandant2.meinecrm.ch;
    # ... rest wie oben
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mandant2-prod /etc/nginx/sites-enabled/
```

---

### Schritt 7.4: Nginx für Test Umgebung

```bash
sudo nano /etc/nginx/sites-available/test
```

```nginx
server {
    listen 80;
    server_name test.meinecrm.ch;
    
    location / {
        proxy_pass http://localhost:8180;  # Test Frontend Port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:5100/api/;  # Test Backend Port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    client_max_body_size 10M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/test /etc/nginx/sites-enabled/
```

---

### Schritt 7.5: Nginx für Dev Umgebung

```bash
sudo nano /etc/nginx/sites-available/dev
```

```nginx
server {
    listen 80;
    server_name dev.meinecrm.ch;
    
    location / {
        proxy_pass http://localhost:8280;  # Dev Frontend Port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:5200/api/;  # Dev Backend Port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    client_max_body_size 10M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dev /etc/nginx/sites-enabled/
```

---

### Schritt 7.6: Nginx testen und neu laden

```bash
# Konfiguration testen
sudo nginx -t
```

**Sollte zeigen**: `syntax is ok` und `test is successful`

```bash
# Nginx neu laden
sudo systemctl reload nginx
```

**✅ Checkpoint**: Nginx routet Requests zu den richtigen Containern

---

## 🏠 Teil 8: Marketing Website einrichten

### Schritt 8.1: Einfache Marketing Seite erstellen

```bash
cd /opt/rp-crm/marketing

# HTML Datei erstellen
nano index.html
```

**Füge ein** (einfaches Beispiel):
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine CRM - Willkommen</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 20px;
            text-align: center;
        }
        .hero h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .hero p {
            font-size: 1.3em;
            margin-bottom: 30px;
        }
        .clients {
            padding: 60px 20px;
            text-align: center;
            background: #f5f5f5;
        }
        .clients h2 {
            margin-bottom: 40px;
            font-size: 2em;
        }
        .client-links {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        .client-card {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #333;
            transition: transform 0.3s;
            min-width: 250px;
        }
        .client-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .client-card h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
            color: #667eea;
        }
        .features {
            padding: 60px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .features h2 {
            text-align: center;
            margin-bottom: 40px;
            font-size: 2em;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }
        .feature {
            padding: 20px;
            text-align: center;
        }
        .feature h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>🚀 Willkommen bei MeineCRM</h1>
        <p>Die moderne CRM-Lösung für Ihr Unternehmen</p>
        <p>Verwalten Sie Ihre Kunden effizient und sicher</p>
    </div>

    <div class="clients">
        <h2>Mandanten Login</h2>
        <div class="client-links">
            <a href="http://mandant1.meinecrm.ch" class="client-card">
                <h3>Mandant 1</h3>
                <p>Zum Login →</p>
            </a>
            <a href="http://mandant2.meinecrm.ch" class="client-card">
                <h3>Mandant 2</h3>
                <p>Zum Login →</p>
            </a>
        </div>
    </div>

    <div class="features">
        <h2>Features</h2>
        <div class="feature-grid">
            <div class="feature">
                <h3>✅ Multi-Tenant</h3>
                <p>Separate Umgebungen für jeden Mandanten</p>
            </div>
            <div class="feature">
                <h3>🔒 Sicher</h3>
                <p>SSL-verschlüsselt und DSGVO-konform</p>
            </div>
            <div class="feature">
                <h3>☁️ Cloud-basiert</h3>
                <p>Immer und überall verfügbar</p>
            </div>
            <div class="feature">
                <h3>📱 Responsive</h3>
                <p>Funktioniert auf allen Geräten</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

### Schritt 8.2: Nginx für Marketing Website

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
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/marketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**✅ Checkpoint**: Marketing Website ist live!

---

## 🔒 Teil 9: SSL Zertifikate (HTTPS)

### Schritt 9.1: Certbot installieren

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### Schritt 9.2: SSL für alle Domains

**Für jeden Domain/Subdomain**:

```bash
# Marketing Website
sudo certbot --nginx -d meinecrm.ch -d www.meinecrm.ch

# Mandant 1
sudo certbot --nginx -d mandant1.meinecrm.ch

# Mandant 2
sudo certbot --nginx -d mandant2.meinecrm.ch

# Test Umgebung
sudo certbot --nginx -d test.meinecrm.ch

# Dev Umgebung
sudo certbot --nginx -d dev.meinecrm.ch
```

**Bei jedem Befehl**:
1. E-Mail eingeben (für Zertifikat-Ablauf Warnungen)
2. Terms akzeptieren: `Y`
3. News: `N` (optional)
4. Redirect zu HTTPS: `2` (empfohlen!)

**Dauert**: ~1 Minute pro Domain

---

### Schritt 9.3: Auto-Renewal testen

```bash
sudo certbot renew --dry-run
```

**Sollte zeigen**: `Congratulations, all simulated renewals succeeded`

**Certbot erneuert automatisch** alle 90 Tage!

**✅ Checkpoint**: Alle Sites haben HTTPS! 🔒

---

## 🎉 Teil 10: Alles testen!

### Test 1: Marketing Website

**Im Browser**: `https://meinecrm.ch`

**Du solltest sehen**:
- Grünes Schloss-Symbol 🔒
- Deine Marketing Seite
- Links zu Mandant 1 und 2

---

### Test 2: Mandant 1 Login

**Im Browser**: `https://mandant1.meinecrm.ch`

**Du solltest sehen**:
- Grünes Schloss-Symbol 🔒
- Angular App lädt
- Login Seite

---

### Test 3: Test Umgebung

**Im Browser**: `https://test.meinecrm.ch`

**Funktioniert?** ✅

---

### Test 4: Dev Umgebung

**Im Browser**: `https://dev.meinecrm.ch`

**Funktioniert?** ✅

---

### Test 5: Backend API

**Im Browser**: `https://mandant1.meinecrm.ch/scalar/v1`

**Du solltest sehen**: API Dokumentation (Scalar)

---

## 🔄 Teil 11: Updates deployen

### Update Script erstellen

```bash
sudo nano /usr/local/bin/update-environment.sh
```

**Füge ein**:
```bash
#!/bin/bash

# Welche Umgebung updaten? (prod, test, dev)
ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: update-environment.sh [prod|test|dev]"
    exit 1
fi

echo "Updating $ENV environment..."

cd /opt/rp-crm/$ENV/app

# Git pull
git pull origin main

# Docker neu bauen
docker-compose -f docker-compose.$ENV.yml --env-file .env.$ENV down
docker-compose -f docker-compose.$ENV.yml --env-file .env.$ENV up -d --build

echo "$ENV environment updated!"
```

```bash
sudo chmod +x /usr/local/bin/update-environment.sh
```

**Verwendung**:
```bash
# Production updaten
sudo /usr/local/bin/update-environment.sh prod

# Test updaten
sudo /usr/local/bin/update-environment.sh test

# Dev updaten
sudo /usr/local/bin/update-environment.sh dev
```

---

## 📊 Teil 12: Monitoring einrichten

### Alle Umgebungen Status sehen

```bash
# Alle Container
docker ps

# Logs einer Umgebung
cd /opt/rp-crm/prod/app
docker-compose -f docker-compose.prod.yml logs -f
```

### Nginx Status

```bash
sudo systemctl status nginx
```

### Disk Space prüfen

```bash
df -h
```

---

## 🔙 Teil 13: Backups

### Backup Script erstellen

```bash
sudo nano /usr/local/bin/backup-all.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/opt/rp-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting backups..."

# Production DB Backup
docker exec rp-crm-postgres-prod pg_dump -U rp_crm_prod_user rp_crm_prod | gzip > $BACKUP_DIR/prod_db_$DATE.sql.gz

# Test DB Backup
docker exec rp-crm-postgres-test pg_dump -U rp_crm_test_user rp_crm_test | gzip > $BACKUP_DIR/test_db_$DATE.sql.gz

# Dev DB Backup
docker exec rp-crm-postgres-dev pg_dump -U rp_crm_dev_user rp_crm_dev | gzip > $BACKUP_DIR/dev_db_$DATE.sql.gz

# Uploads Backup (Production)
tar -czf $BACKUP_DIR/prod_uploads_$DATE.tar.gz -C /opt/rp-crm/prod/app/uploads .

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backups completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/backup-all.sh
```

### Automatische tägliche Backups

```bash
# Cron Job hinzufügen
sudo crontab -e
```

**Füge hinzu**:
```
# Täglich um 2:00 Uhr Backups machen
0 2 * * * /usr/local/bin/backup-all.sh >> /var/log/rp-crm-backup.log 2>&1
```

**Speichern und beenden**

---

## ✅ FERTIG! Was du jetzt hast:

### 🌐 URLs:
- ✅ `https://meinecrm.ch` - Marketing Website
- ✅ `https://mandant1.meinecrm.ch` - Mandant 1 Login/App
- ✅ `https://mandant2.meinecrm.ch` - Mandant 2 Login/App
- ✅ `https://test.meinecrm.ch` - Test Umgebung
- ✅ `https://dev.meinecrm.ch` - Dev Umgebung

### 🎯 Umgebungen:
- ✅ **Production**: Für echte Kunden
- ✅ **Test**: Zum Testen neuer Features
- ✅ **Dev**: Für Entwicklung

### 🔒 Sicherheit:
- ✅ SSL/HTTPS überall
- ✅ Firewall konfiguriert
- ✅ Sichere Passwörter
- ✅ Tägliche Backups

### 📦 Services:
- ✅ Alle in Docker Containern
- ✅ Isoliert voneinander
- ✅ Einfach zu updaten

---

## 🆘 Troubleshooting

### Problem: Domain zeigt nicht auf Server

**Lösung**:
```bash
# DNS testen
nslookup mandant1.meinecrm.ch
```
Warte bis zu 24h für DNS Propagation

### Problem: Container startet nicht

**Lösung**:
```bash
# Logs ansehen
cd /opt/rp-crm/prod/app
docker-compose -f docker-compose.prod.yml logs
```

### Problem: Nginx Fehler

**Lösung**:
```bash
# Nginx Logs
sudo tail -f /var/log/nginx/error.log
```

### Problem: SSL funktioniert nicht

**Lösung**:
```bash
# Certbot neu versuchen
sudo certbot --nginx -d mandant1.meinecrm.ch --force-renew
```

---

## 📞 Hilfe & Support

- **Infomaniak Support**: https://www.infomaniak.com/de/support
- **Docker Docs**: https://docs.docker.com
- **Nginx Docs**: https://nginx.org/en/docs

---

## 🎊 Glückwunsch!

Du hast erfolgreich:
- ✅ Alle Produkte bei Infomaniak gekauft
- ✅ Server eingerichtet und konfiguriert
- ✅ Dev, Test und Prod Umgebungen erstellt
- ✅ Marketing Website deployed
- ✅ Subdomains für Mandanten konfiguriert
- ✅ SSL/HTTPS aktiviert
- ✅ Backups eingerichtet

**Deine Anwendung ist LIVE! 🚀**
