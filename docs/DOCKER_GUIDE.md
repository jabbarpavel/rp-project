# Docker Guide - RP CRM

## 🐳 Übersicht

Dieses Dokument erklärt, wie du die RP CRM Anwendung mit Docker und Docker Compose lokal testen und in Production deployen kannst.

## 📋 Voraussetzungen

### Was du brauchst:
- ✅ Docker (20.10+)
- ✅ Docker Compose (2.0+)
- ✅ Git

### Installation prüfen:
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start - Lokales Testing

### 1. Repository klonen
```bash
git clone https://github.com/jabbarpavel/rp-project.git
cd rp-project
```

### 2. Environment Variablen setzen
```bash
# .env Datei erstellen
cp .env.example .env

# Bearbeite .env und setze sichere Passwörter
nano .env
```

**Wichtig**: Ändere die Standardwerte in `.env`:
- `DB_PASSWORD`: Starkes Datenbank-Passwort
- `JWT_SECRET`: Langer, zufälliger String (min. 32 Zeichen)

### 3. Tenants konfigurieren
```bash
# Für Production Testing
nano src/backend/RP.CRM.Api/tenants.Production.json
```

Production Konfiguration (für lokales Docker testing):
```json
[
  {
    "Id": 1,
    "Name": "Finaro",
    "Domain": "finaro.kynso.ch"
  },
  {
    "Id": 2,
    "Name": "Demo",
    "Domain": "demo.kynso.ch"
  }
]
```

### 4. Docker Container starten
```bash
# Alle Services starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Oder nur spezifische Services
docker-compose logs -f backend
```

### 5. Datenbank migrieren
```bash
# Migration ausführen (beim ersten Start)
docker-compose exec backend dotnet ef database update --project /src/backend/RP.CRM.Infrastructure
```

### 6. Anwendung öffnen

**Frontend**: http://localhost
**Backend API**: http://localhost:5000
**API Dokumentation**: http://localhost:5000/scalar/v1

## 📦 Docker Compose Services

### Services Übersicht:

1. **postgres**: PostgreSQL 15 Datenbank
   - Port: 5432
   - Volume: postgres_data

2. **backend**: .NET API
   - Port: 5000
   - Volume: backend_uploads
   - Health check: http://localhost:5000/api/health

3. **frontend**: Angular App (Nginx)
   - Port: 80
   - Health check: http://localhost/

4. **nginx-proxy** (optional): Reverse Proxy
   - Port: 443 (HTTPS), 8080 (HTTP)
   - Nur mit `--profile production`

## 🔧 Docker Befehle

### Container Management
```bash
# Alle Services starten
docker-compose up -d

# Bestimmten Service starten
docker-compose up -d backend

# Services stoppen
docker-compose stop

# Services stoppen und entfernen
docker-compose down

# Services neu bauen
docker-compose build

# Services neu bauen und starten
docker-compose up -d --build
```

### Logs und Debugging
```bash
# Alle Logs
docker-compose logs -f

# Service-spezifische Logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Letzte 100 Zeilen
docker-compose logs --tail=100 backend

# In Container einsteigen
docker-compose exec backend /bin/bash
docker-compose exec postgres psql -U rp_crm_user -d rp_crm_production
```

### Status und Health
```bash
# Status aller Services
docker-compose ps

# Health Status
docker-compose ps --services --filter "health=healthy"
```

### Datenbank Operations
```bash
# Datenbank Migration
docker-compose exec backend dotnet ef database update

# Neue Migration erstellen
docker-compose exec backend dotnet ef migrations add MigrationName --project /src/backend/RP.CRM.Infrastructure

# SQL Shell öffnen
docker-compose exec postgres psql -U rp_crm_user -d rp_crm_production

# Datenbank Backup
docker-compose exec postgres pg_dump -U rp_crm_user rp_crm_production > backup.sql

# Datenbank Restore
docker-compose exec -T postgres psql -U rp_crm_user -d rp_crm_production < backup.sql
```

## 🌐 Production Deployment mit Docker

### Option 1: Docker auf Cloud Server

#### 1. Server vorbereiten
```bash
# SSH zum Server
ssh root@your-server-ip

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Projekt deployen
```bash
# Deployment Verzeichnis erstellen
mkdir -p /opt/rp-crm
cd /opt/rp-crm

# Repository klonen
git clone https://github.com/jabbarpavel/rp-project.git .

# Environment Variables setzen
cp .env.example .env
nano .env  # Sichere Passwörter setzen!

# Production Tenants konfigurieren
nano src/backend/RP.CRM.Api/tenants.json
```

Production tenants.json:
```json
[
  {
    "Name": "Finaro",
    "Domain": "finaro.your-domain.com"
  },
  {
    "Name": "DemoCorp",
    "Domain": "democorp.your-domain.com"
  }
]
```

#### 3. Mit Reverse Proxy starten
```bash
# Mit nginx-proxy profile
docker-compose --profile production up -d

# Logs prüfen
docker-compose logs -f
```

#### 4. SSL Zertifikate mit Certbot
```bash
# Certbot Container
docker run -it --rm \
  -v /opt/rp-crm/docker/ssl:/etc/letsencrypt \
  -v /opt/rp-crm/docker/certbot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d finaro.your-domain.com \
  -d democorp.your-domain.com
```

### Option 2: Docker Registry

#### 1. Images bauen und pushen
```bash
# Backend Image
docker build -f Dockerfile.backend -t your-registry.com/rp-crm-backend:latest .
docker push your-registry.com/rp-crm-backend:latest

# Frontend Image
docker build -f Dockerfile.frontend -t your-registry.com/rp-crm-frontend:latest .
docker push your-registry.com/rp-crm-frontend:latest
```

#### 2. Auf Server pullen und starten
```bash
# Images pullen
docker pull your-registry.com/rp-crm-backend:latest
docker pull your-registry.com/rp-crm-frontend:latest

# Starten
docker-compose up -d
```

## 🔄 Updates deployen

### Automated Update Script
```bash
#!/bin/bash
# update-docker.sh

cd /opt/rp-crm

# Git pull
git pull origin main

# Backup vor Update
docker-compose exec postgres pg_dump -U rp_crm_user rp_crm_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Rebuild und restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Migration
sleep 10
docker-compose exec backend dotnet ef database update

echo "Update completed!"
```

Ausführbar machen:
```bash
chmod +x update-docker.sh
./update-docker.sh
```

## 📊 Monitoring und Logs

### Logs sammeln
```bash
# Alle Logs in Datei
docker-compose logs > logs_$(date +%Y%m%d).txt

# Logs mit Zeitstempel
docker-compose logs -t > logs_with_time.txt
```

### Monitoring mit Docker Stats
```bash
# Live Resource Usage
docker stats

# Spezifischer Container
docker stats rp-crm-backend
```

### Health Checks
```bash
# Backend Health
curl http://localhost:5000/api/health

# Frontend Health
curl http://localhost/

# PostgreSQL Health
docker-compose exec postgres pg_isready -U rp_crm_user
```

## 💾 Backups mit Docker

### Automatisches Backup Script
```bash
#!/bin/bash
# docker-backup.sh

BACKUP_DIR="/opt/rp-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database Backup
docker-compose exec -T postgres pg_dump -U rp_crm_user rp_crm_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads Backup
docker run --rm -v rp-crm_backend_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Cron Job für automatische Backups
```bash
# Crontab editieren
crontab -e

# Täglich um 2 Uhr
0 2 * * * /opt/rp-crm/docker-backup.sh >> /var/log/rp-crm-backup.log 2>&1
```

## 🔒 Sicherheit

### Best Practices:
1. **Secrets nicht im Git**: `.env` nie committen!
2. **Starke Passwörter**: Generiere sichere, zufällige Passwörter
3. **Updates**: Regelmäßig Images updaten
4. **Networks**: Nutze Docker Networks für Isolation
5. **Non-root**: Images laufen als non-root user
6. **Volumes**: Nutze named volumes für Persistenz

### Secrets Management
```bash
# Docker Secrets (für Swarm Mode)
echo "my_secure_password" | docker secret create db_password -

# Oder mit Environment Files
cat > .env.production <<EOF
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)
EOF
```

## 🆘 Troubleshooting

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs backend

# Container inspect
docker inspect rp-crm-backend

# Ports prüfen
docker-compose ps
netstat -tulpn | grep LISTEN
```

### Datenbank Verbindungsfehler
```bash
# PostgreSQL Container Status
docker-compose ps postgres

# In Postgres Container
docker-compose exec postgres psql -U rp_crm_user -d rp_crm_production

# Connection String testen
docker-compose exec backend env | grep ConnectionStrings
```

### Build Fehler
```bash
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Performance Issues
```bash
# Resource Limits setzen
# In docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 📚 Weitere Ressourcen

- **Docker Docs**: https://docs.docker.com
- **Docker Compose Docs**: https://docs.docker.com/compose
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices

## ✅ Production Checklist

Vor dem Go-Live:
- [ ] Environment Variables gesetzt und sicher
- [ ] Tenants.json für Production Domains konfiguriert
- [ ] SSL Zertifikate eingerichtet
- [ ] Backups getestet
- [ ] Health Checks funktionieren
- [ ] Logs werden gesammelt
- [ ] Monitoring eingerichtet
- [ ] Firewall konfiguriert
- [ ] Updates-Prozess dokumentiert

---

**Hinweis**: Docker macht das Deployment einfacher, aber du musst trotzdem die Server-Infrastruktur verwalten. Für komplett managed Lösungen, schaue dir Platform-as-a-Service (PaaS) Optionen an.
