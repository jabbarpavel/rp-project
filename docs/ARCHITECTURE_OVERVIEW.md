# 🏗️ Architektur-Übersicht - Dein Setup

## Visuelle Darstellung

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INTERNET / BENUTZER                                │
└────────────────────┬────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INFOMANIAK DNS                                      │
│                                                                               │
│  meinecrm.ch                 ──→  Server IP: 185.12.34.56                   │
│  www.meinecrm.ch             ──→  Server IP: 185.12.34.56                   │
│  mandant1.meinecrm.ch        ──→  Server IP: 185.12.34.56                   │
│  mandant2.meinecrm.ch        ──→  Server IP: 185.12.34.56                   │
│  test.meinecrm.ch            ──→  Server IP: 185.12.34.56                   │
│  dev.meinecrm.ch             ──→  Server IP: 185.12.34.56                   │
└────────────────────┬────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INFOMANIAK CLOUD SERVER (8GB RAM, 4 vCPU)                │
│                           Ubuntu 22.04 LTS                                   │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         FIREWALL (UFW)                                 │ │
│  │  Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      NGINX REVERSE PROXY                               │ │
│  │                       (SSL Terminierung)                               │ │
│  │                                                                         │ │
│  │  meinecrm.ch:443           ──→  /opt/rp-crm/marketing/index.html      │ │
│  │  mandant1.meinecrm.ch:443  ──→  localhost:8080 (Frontend Prod)        │ │
│  │                                  localhost:5000 (Backend Prod)         │ │
│  │  mandant2.meinecrm.ch:443  ──→  localhost:8080 (Frontend Prod)        │ │
│  │                                  localhost:5000 (Backend Prod)         │ │
│  │  test.meinecrm.ch:443      ──→  localhost:8180 (Frontend Test)        │ │
│  │                                  localhost:5100 (Backend Test)         │ │
│  │  dev.meinecrm.ch:443       ──→  localhost:8280 (Frontend Dev)         │ │
│  │                                  localhost:5200 (Backend Dev)          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         DOCKER ENGINE                                  │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │          PRODUCTION UMGEBUNG (/opt/rp-crm/prod)                  │ │ │
│  │  │                                                                   │ │ │
│  │  │  [PostgreSQL Prod]  [Backend Prod]  [Frontend Prod]              │ │ │
│  │  │   Port: 5432         Port: 5000      Port: 8080                  │ │ │
│  │  │   DB: rp_crm_prod    .NET 8 API      Angular 20                  │ │ │
│  │  │                                                                   │ │ │
│  │  │   Tenants:                                                        │ │ │
│  │  │   - Mandant1 (mandant1.meinecrm.ch)                              │ │ │
│  │  │   - Mandant2 (mandant2.meinecrm.ch)                              │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │          TEST UMGEBUNG (/opt/rp-crm/test)                        │ │ │
│  │  │                                                                   │ │ │
│  │  │  [PostgreSQL Test]  [Backend Test]  [Frontend Test]              │ │ │
│  │  │   Port: 5433         Port: 5100     Port: 8180                   │ │ │
│  │  │   DB: rp_crm_test    .NET 8 API     Angular 20                   │ │ │
│  │  │                                                                   │ │ │
│  │  │   Tenants:                                                        │ │ │
│  │  │   - TestMandant (test.meinecrm.ch)                               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │          DEV UMGEBUNG (/opt/rp-crm/dev)                          │ │ │
│  │  │                                                                   │ │ │
│  │  │  [PostgreSQL Dev]   [Backend Dev]   [Frontend Dev]               │ │ │
│  │  │   Port: 5434         Port: 5200     Port: 8280                   │ │ │
│  │  │   DB: rp_crm_dev     .NET 8 API     Angular 20                   │ │ │
│  │  │                                                                   │ │ │
│  │  │   Tenants:                                                        │ │ │
│  │  │   - DevMandant (dev.meinecrm.ch)                                 │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    STORAGE & BACKUPS                                   │ │
│  │                                                                         │ │
│  │  /opt/rp-crm/backups/                                                 │ │
│  │  ├── prod_db_YYYYMMDD.sql.gz                                          │ │
│  │  ├── test_db_YYYYMMDD.sql.gz                                          │ │
│  │  ├── dev_db_YYYYMMDD.sql.gz                                           │ │
│  │  └── prod_uploads_YYYYMMDD.tar.gz                                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ports Übersicht

### Öffentliche Ports (über Internet erreichbar):

| Port | Service | Zugriff |
|------|---------|---------|
| 22 | SSH | Nur du (mit SSH Key) |
| 80 | HTTP | Alle (redirect zu HTTPS) |
| 443 | HTTPS | Alle (über Nginx) |

### Interne Ports (nur auf Server):

| Port | Service | Umgebung |
|------|---------|----------|
| 5000 | Backend API | Production |
| 5100 | Backend API | Test |
| 5200 | Backend API | Dev |
| 8080 | Frontend | Production |
| 8180 | Frontend | Test |
| 8280 | Frontend | Dev |
| 5432 | PostgreSQL | Production |
| 5433 | PostgreSQL | Test |
| 5434 | PostgreSQL | Dev |

---

## Request Flow Beispiel

### Benutzer besucht mandant1.meinecrm.ch:

```
1. Browser ──→ DNS Lookup: mandant1.meinecrm.ch
              ↓
              DNS antwortet: 185.12.34.56

2. Browser ──→ HTTPS Request zu 185.12.34.56:443
              ↓
              Nginx empfängt Request

3. Nginx  ──→ Prüft Host Header: "mandant1.meinecrm.ch"
              ↓
              Routet zu localhost:8080 (Frontend) und localhost:5000 (Backend API)

4. Frontend Container ──→ Liefert Angular App
              ↓
              Browser lädt App

5. Angular App ──→ API Calls zu /api/...
              ↓
              Nginx routet zu localhost:5000

6. Backend Container ──→ Prüft Tenant (mandant1.meinecrm.ch)
              ↓
              Lädt Tenant-Config aus tenants.json
              ↓
              Zugriff auf PostgreSQL (localhost:5432)
              ↓
              Liefert Daten zurück

7. Browser ←── Zeigt Daten an
```

---

## Umgebungen im Detail

### 🚀 Production (Prod)

**Zweck**: Für echte Kunden, live System

**Zugriff**: 
- mandant1.meinecrm.ch
- mandant2.meinecrm.ch

**Datenbank**: `rp_crm_prod`

**Backups**: Täglich um 2:00 Uhr

**Updates**: Nur nach gründlichem Testen!

**Konfiguration**:
- `/opt/rp-crm/prod/app/.env.production`
- `/opt/rp-crm/prod/app/src/backend/RP.CRM.Api/tenants.json`

---

### 🧪 Test

**Zweck**: Neue Features testen, bevor sie live gehen

**Zugriff**: test.meinecrm.ch

**Datenbank**: `rp_crm_test` (mit Test-Daten)

**Updates**: Häufig, um neue Features zu testen

**Workflow**:
1. Feature in Dev entwickeln
2. Zu Test deployen
3. Gründlich testen
4. Wenn OK: Zu Prod deployen

**Konfiguration**:
- `/opt/rp-crm/test/app/.env.test`
- `/opt/rp-crm/test/app/src/backend/RP.CRM.Api/tenants.json`

---

### 💻 Dev (Development)

**Zweck**: Entwicklung neuer Features

**Zugriff**: dev.meinecrm.ch

**Datenbank**: `rp_crm_dev` (kann jederzeit zurückgesetzt werden)

**Updates**: Sehr häufig, bei jedem Code-Change

**Workflow**:
1. Lokale Entwicklung
2. Code pushen zu Git
3. Auf Dev Server pullen und neu deployen
4. Feature testen
5. Wenn OK: Zu Test deployen

**Konfiguration**:
- `/opt/rp-crm/dev/app/.env.dev`
- `/opt/rp-crm/dev/app/src/backend/RP.CRM.Api/tenants.json`

---

## Sicherheitsschichten

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Infomaniak Infrastructure Security             │
│ - DDoS Protection                                        │
│ - Network Isolation                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ Layer 2: Server Firewall (UFW)                          │
│ - Nur Ports 22, 80, 443 offen                           │
│ - SSH nur mit Key                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ Layer 3: Nginx (SSL Terminierung)                       │
│ - SSL/TLS Verschlüsselung                                │
│ - Security Headers                                       │
│ - Request Rate Limiting                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ Layer 4: Application (Backend)                          │
│ - JWT Authentication                                     │
│ - Permission-based Access Control                        │
│ - Tenant Isolation                                       │
│ - Input Validation                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ Layer 5: Database                                        │
│ - Separate Datenbanken pro Umgebung                     │
│ - User mit minimalen Rechten                            │
│ - Nur localhost Zugriff                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Datenfluss zwischen Umgebungen

```
                    ┌─────────────┐
                    │  Git Repo   │
                    │  (GitHub)   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    DEV      │ │    TEST     │ │    PROD     │
    │             │ │             │ │             │
    │  Entwickeln │→│   Testen    │→│   Live      │
    │             │ │             │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘

    Code Flow: Dev → Test → Prod
    Data Flow: Prod ← Test ← Dev (nie umgekehrt!)
```

**Wichtig**: 
- Code geht von Dev → Test → Prod
- Daten aus Prod NIEMALS zu Dev/Test kopieren (DSGVO!)
- Für Test: Fake-Daten oder anonymisierte Daten verwenden

---

## Backup Strategie

```
┌──────────────────────────────────────────────────────┐
│            Backup Schedule (Cron)                    │
│               Jeden Tag um 2:00 Uhr                  │
└──────────────────┬───────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ Datenbanken │         │  Uploads    │
│             │         │   (Files)   │
│ - Prod DB   │         │ - Prod      │
│ - Test DB   │         │             │
│ - Dev DB    │         │             │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ pg_dump + gzip        │ tar + gzip
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
           ┌───────────────┐
           │   /backups/   │
           │               │
           │ Retention:    │
           │ 7 Tage lokal  │
           └───────────────┘
```

**Empfehlung für später**:
- Offsite Backup zu Infomaniak kDrive
- Oder: AWS S3, Backblaze B2
- Retention: 30 Tage offsite

---

## Ressourcen Verwendung (Schätzung)

### Server: 8 GB RAM, 4 vCPU

```
┌─────────────────────────────────────────────┐
│           RAM Allocation (8 GB)             │
├─────────────────────────────────────────────┤
│ System OS           │ 1 GB    │ ████████   │
│ Docker Engine       │ 0.5 GB  │ ████       │
│ Nginx               │ 0.3 GB  │ ███        │
│                     │         │            │
│ Prod PostgreSQL     │ 1.5 GB  │ ████████   │
│ Prod Backend        │ 1 GB    │ ████████   │
│ Prod Frontend       │ 0.2 GB  │ ██         │
│                     │         │            │
│ Test PostgreSQL     │ 1 GB    │ ████████   │
│ Test Backend        │ 0.7 GB  │ ██████     │
│ Test Frontend       │ 0.2 GB  │ ██         │
│                     │         │            │
│ Dev PostgreSQL      │ 0.8 GB  │ ██████     │
│ Dev Backend         │ 0.5 GB  │ ████       │
│ Dev Frontend        │ 0.2 GB  │ ██         │
│                     │         │            │
│ Reserve/Buffer      │ 0.1 GB  │ █          │
├─────────────────────────────────────────────┤
│ Total Used          │ ~7.9 GB │            │
└─────────────────────────────────────────────┘
```

**CPU Verwendung**:
- Normal: 10-20% (Idle)
- Bei Builds: 60-80%
- Bei Last (viele Nutzer): 30-50%

**Disk Space**:
- System: ~10 GB
- Docker Images: ~5 GB
- Datenbanken: ~5 GB (wächst mit Nutzung)
- Uploads: Variable (je nach Dokumenten)
- Backups: ~2 GB (pro Woche)
- **Total**: ~25 GB, mit 80 GB Disk bist du sicher

---

## Monitoring Dashboard (empfohlen)

**Einfache Lösung**: Grafana + Prometheus

**Was überwachen**:
- ✅ Server: CPU, RAM, Disk
- ✅ Docker: Container Status
- ✅ Nginx: Requests, Response Times
- ✅ Datenbank: Connections, Query Performance
- ✅ Backups: Success/Failure

**Später einrichten** nach COMPLETE_SETUP_GUIDE.md

---

## Skalierungs-Optionen (für die Zukunft)

### Option 1: Vertikale Skalierung
```
Aktuell: 8 GB RAM, 4 vCPU
         ↓
Upgrade: 16 GB RAM, 8 vCPU (bei Infomaniak)
```

**Wann**: Wenn Server langsam wird

---

### Option 2: Horizontale Skalierung (später)
```
     ┌──────────────┐
     │ Load Balancer│
     └──────┬───────┘
            │
     ┌──────┴───────┐
     │              │
┌────▼────┐    ┌────▼────┐
│ Server 1│    │ Server 2│
└─────────┘    └─────────┘
     │              │
     └──────┬───────┘
            │
     ┌──────▼───────┐
     │  Managed DB  │
     │  (Separate)  │
     └──────────────┘
```

**Wann**: Wenn du >100 aktive Nutzer gleichzeitig hast

---

## Network Diagram

```
                    INTERNET
                       │
                       ▼
            ┌──────────────────┐
            │  Infomaniak DNS  │
            └────────┬─────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │mandant1│  │mandant2│  │  www   │
    └───┬────┘  └───┬────┘  └───┬────┘
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  Server Firewall │
         │   (UFW: 22,80,   │
         │        443)      │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Nginx (SSL)     │
         │  Port 443        │
         └─────────┬────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
  ┌────────┐  ┌────────┐  ┌────────┐
  │  Prod  │  │  Test  │  │  Dev   │
  │ Docker │  │ Docker │  │ Docker │
  │Network │  │Network │  │Network │
  └────────┘  └────────┘  └────────┘
      │           │           │
      ▼           ▼           ▼
  [Backend]   [Backend]   [Backend]
  [Frontend]  [Frontend]  [Frontend]
  [PostgreSQL][PostgreSQL][PostgreSQL]
```

---

## Kosten-Übersicht (Monatlich)

| Service | Kosten | Notizen |
|---------|--------|---------|
| Cloud Server (8GB, 4 vCPU) | CHF 60 | Bei Infomaniak |
| Domain (.ch) | CHF 1.25 | CHF 15/Jahr ÷ 12 |
| Automatische Backups | CHF 10 | Optional aber empfohlen |
| SSL Zertifikate | CHF 0 | Let's Encrypt (gratis) |
| **TOTAL** | **CHF 71.25/Monat** | **~CHF 855/Jahr** |

**Skalierung**: 
- +16GB Server: CHF 110/Monat
- +Managed DB: CHF 15/Monat extra

---

## Quick Reference Commands

### Status Checks
```bash
# Alle Container
docker ps

# Nginx Status
sudo systemctl status nginx

# Disk Space
df -h

# RAM Usage
free -h
```

### Logs
```bash
# Production Logs
cd /opt/rp-crm/prod/app && docker-compose -f docker-compose.prod.yml logs -f

# Nginx Logs
sudo tail -f /var/log/nginx/error.log
```

### Updates
```bash
# Production Update
sudo /usr/local/bin/update-environment.sh prod

# Test Update
sudo /usr/local/bin/update-environment.sh test
```

### Backups
```bash
# Manuelles Backup
sudo /usr/local/bin/backup-all.sh

# Backups ansehen
ls -lh /opt/rp-crm/backups/
```

---

## Zusammenfassung

Du hast jetzt ein **professionelles, skalierbares Multi-Tenant CRM System** mit:

- ✅ Separate Dev, Test, Prod Umgebungen
- ✅ Marketing Website auf Hauptdomain
- ✅ Subdomains für jeden Mandanten
- ✅ SSL/HTTPS überall
- ✅ Automatische Backups
- ✅ Isolierte Docker Container
- ✅ Professionelle Sicherheit

**Kosten**: ~CHF 70/Monat  
**Wartung**: ~2-4 Stunden/Monat  
**Skalierbarkeit**: Bis 100+ Nutzer ohne Änderungen

**Nächste Schritte**: Folge COMPLETE_SETUP_GUIDE.md für die Implementierung!
