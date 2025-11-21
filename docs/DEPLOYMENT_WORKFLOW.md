# 🚀 Deployment Workflow - Von Dev zu Production

## 📋 Übersicht

Dieses Dokument erklärt den kompletten Workflow von der lokalen Entwicklung bis zur Production-Deployment.

**Der Workflow:**
```
💻 Lokal (Dev) → 🧪 Lokal (Test) → ✅ Git Push → 🌐 Production Deploy
```

---

## 🌍 Die drei Umgebungen

| Umgebung | Wo läuft es? | Branch | Datenbank | Verwendung |
|----------|--------------|--------|-----------|------------|
| **DEV** | Dein Laptop | `dev` | kynso_dev | Entwicklung & Experimente |
| **TEST** | Dein Laptop | `test` | kynso_test | Testing vor Production |
| **PROD** | Server (83.228.225.166) | `main` | kynso_prod | Live System für Benutzer |

---

## 📝 Der komplette Workflow im Detail

### Phase 1: Entwicklung (DEV)

#### 1.1 Code ändern auf DEV

```bash
# Wechsle zum dev Branch
git checkout dev

# Starte Backend (Terminal 1)
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
# Läuft auf http://localhost:5015

# Starte Frontend (Terminal 2)
cd src/frontend
npm start
# Läuft auf http://localhost:4200
```

#### 1.2 Entwickle & Teste lokal

- ✅ Mache deine Code-Änderungen
- ✅ Teste die Funktionalität im Browser
- ✅ Überprüfe, dass alles funktioniert

#### 1.3 Commit deine Änderungen

```bash
# Zeige geänderte Dateien
git status

# Füge Dateien hinzu
git add .

# Commit mit Beschreibung
git commit -m "Beschreibung deiner Änderung"
```

---

### Phase 2: Testing (TEST)

#### 2.1 Merge zu TEST Branch

```bash
# Wechsle zum test Branch
git checkout test

# Merge deine Dev-Änderungen
git merge dev

# Bei Konflikten: Löse sie und dann:
git add .
git commit -m "Merge dev to test"
```

#### 2.2 Teste in TEST Umgebung

```bash
# Starte Backend für TEST (Terminal 1)
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
# Läuft auf http://localhost:5016

# Starte Frontend für TEST (Terminal 2)
cd src/frontend
npm run start:test
# Läuft auf http://localhost:4300
```

#### 2.3 Umfassende Tests durchführen

- ✅ Teste alle geänderten Features
- ✅ Teste Edge Cases
- ✅ Überprüfe, dass nichts kaputt gegangen ist
- ✅ Lass andere Tester testen (optional)

---

### Phase 3: Production Deployment

#### 3.1 Merge zu MAIN Branch

```bash
# Wenn Test erfolgreich, wechsle zu main
git checkout main

# Merge test Branch
git merge test

# Bei Konflikten: Löse sie und dann:
git add .
git commit -m "Merge test to main"
```

#### 3.2 Push zu GitHub

```bash
# Push den main Branch zu GitHub
git push origin main
```

**⚠️ AB HIER wird es ernst!** Der Code ist jetzt auf GitHub und bereit für Production.

#### 3.3 Deployment auf Production Server

##### Option A: Manuelles Deployment (EMPFOHLEN für wichtige Updates)

```bash
# 1. Verbinde zum Production Server
ssh ubuntu@83.228.225.166

# 2. Gehe zum App-Verzeichnis
cd /opt/kynso/prod/app

# 3. Ziehe die neuesten Änderungen von GitHub
git pull origin main

# 4. Zeige was geändert wurde
git log -3 --oneline

# 5. Baue die Container neu (mit neuem Code)
docker-compose down
docker-compose up -d --build

# 6. Warte ~30-60 Sekunden bis Container starten

# 7. Überprüfe den Status
docker-compose ps

# 8. Überprüfe die Logs
docker-compose logs backend | tail -50
docker-compose logs frontend | tail -50
```

##### Option B: Nur Backend oder Frontend neu starten

**Nur Backend neu starten:**
```bash
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app

# Code aktualisieren
git pull origin main

# Nur Backend neu bauen und starten
docker-compose up -d --build backend

# Logs prüfen
docker-compose logs backend -f
# Drücke Ctrl+C zum Beenden
```

**Nur Frontend neu starten:**
```bash
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app

# Code aktualisieren
git pull origin main

# Nur Frontend neu bauen und starten
docker-compose up -d --build frontend

# Logs prüfen
docker-compose logs frontend -f
# Drücke Ctrl+C zum Beenden
```

---

## 🔄 Production Container Management

### Container Status prüfen

```bash
# Alle Container anzeigen
docker-compose ps

# Sollte zeigen:
# kynso-postgres    running (healthy)
# kynso-backend     running (healthy)
# kynso-frontend    running (healthy)
```

### Container Logs ansehen

```bash
# Alle Logs
docker-compose logs

# Nur Backend
docker-compose logs backend

# Nur Frontend
docker-compose logs frontend

# Live Logs (folge den Logs in Echtzeit)
docker-compose logs -f backend
# Drücke Ctrl+C zum Beenden

# Nur die letzten 50 Zeilen
docker-compose logs backend --tail 50
```

### Container neu starten (ohne neu bauen)

```bash
# Wenn kein neuer Code, nur Neustart nötig
docker-compose restart backend
docker-compose restart frontend

# Oder alle Container
docker-compose restart
```

### Container komplett neu bauen

```bash
# Wenn Code-Änderungen vorhanden sind
cd /opt/kynso/prod/app
git pull origin main

# Stoppe alles
docker-compose down

# Baue und starte neu
docker-compose up -d --build

# Oder nur ein Service:
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Container stoppen und starten

```bash
# Stoppen (Container bleiben erhalten)
docker-compose stop

# Starten (bereits existierende Container)
docker-compose start

# Komplett entfernen und neu erstellen
docker-compose down
docker-compose up -d
```

---

## 🧪 Testing nach Deployment

### 1. Backend Health Check

```bash
# Vom Server aus (via SSH)
curl http://localhost:5000/api/health

# Von extern (von deinem Laptop) - HTTPS erforderlich
curl https://finaro.kynso.ch/api/health

# Erwartete Antwort:
# {"status":"healthy","timestamp":"...","service":"Kynso CRM API","database":"connected"}
```

> **💡 Hinweis:** Von extern (dein Computer) muss HTTPS verwendet werden. HTTP funktioniert nur auf dem Server über localhost, da der externe nginx HTTP auf HTTPS umleitet.

### 2. Frontend testen

Öffne im Browser:
- Finaro: https://finaro.kynso.ch/login
- Demo: https://demo.kynso.ch/login

### 3. Funktionalität testen

- ✅ Login mit Test-User
- ✅ Teste die geänderten Features
- ✅ Überprüfe kritische Funktionen

---

## 📊 Typischer Workflow - Beispiel

### Szenario: Du hast einen Bug gefixt

```bash
# 1. DEV - Entwicklung
git checkout dev
# ... Code ändern ...
git add .
git commit -m "Fix: Kunde kann nicht gelöscht werden"

# 2. Teste lokal in DEV
dotnet run --launch-profile Development  # Backend
npm start                                 # Frontend
# ... Teste den Fix ...

# 3. TEST - Merge und teste
git checkout test
git merge dev
dotnet run --launch-profile Test         # Backend
npm run start:test                       # Frontend
# ... Umfassende Tests ...

# 4. MAIN - Bereit für Production
git checkout main
git merge test
git push origin main

# 5. PRODUCTION - Deployment
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build

# 6. Verifizieren
curl http://localhost:5000/api/health
# Teste in Browser: https://finaro.kynso.ch/login
```

### Szenario: Du hast ein neues Feature entwickelt

```bash
# 1. DEV - Entwicklung über mehrere Tage
git checkout dev

# Tag 1
# ... Code schreiben ...
git add .
git commit -m "Feature: Kundenfilter - Teil 1"

# Tag 2
# ... Mehr Code ...
git add .
git commit -m "Feature: Kundenfilter - Teil 2"

# Tag 3
# ... Feature fertig ...
git add .
git commit -m "Feature: Kundenfilter - fertiggestellt"

# 2. TEST - Merge alles und teste
git checkout test
git merge dev
# ... Teste das komplette Feature ...

# 3. MAIN - Wenn zufrieden
git checkout main
git merge test
git push origin main

# 4. PRODUCTION - Deploy
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build

# 5. Teste in Production
# ... Vollständige Tests auf live System ...
```

---

## 🔧 Häufige Szenarien

### Nur Dokumentation geändert

```bash
# Kein Code geändert, nur .md Dateien
git checkout main
git merge dev
git push origin main

# Production: Kein Neustart nötig!
# (außer du willst README.md auf dem Server aktualisieren)
```

### Nur Backend geändert

```bash
git checkout main
git merge dev
git push origin main

# Production: Nur Backend neu starten
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build backend
```

### Nur Frontend geändert

```bash
git checkout main
git merge dev
git push origin main

# Production: Nur Frontend neu starten
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build frontend
```

### Backend + Frontend geändert

```bash
git checkout main
git merge dev
git push origin main

# Production: Beide neu starten
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build
```

### Datenbank-Migration erforderlich

```bash
git checkout main
git merge dev
git push origin main

# Production: Mit Vorsicht!
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app

# 1. Backup erstellen (WICHTIG!)
docker exec kynso-postgres pg_dump -U kynso_user kynso_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Code aktualisieren
git pull origin main

# 3. Container neu starten (Migrations laufen automatisch)
docker-compose up -d --build backend

# 4. Logs prüfen ob Migration erfolgreich
docker-compose logs backend | grep -i migration
```

---

## ⚠️ Wichtige Hinweise

### DO's ✅

- ✅ **IMMER** zuerst in DEV testen
- ✅ **IMMER** in TEST verifizieren vor Production
- ✅ **IMMER** `git pull origin main` vor `docker-compose build`
- ✅ **IMMER** Logs prüfen nach Deployment
- ✅ **IMMER** Health Check testen nach Deployment
- ✅ Backups vor größeren Änderungen

### DON'Ts ❌

- ❌ **NIEMALS** direkt auf main entwickeln
- ❌ **NIEMALS** ungetesteten Code zu main mergen
- ❌ **NIEMALS** in Production ohne Backup deployen
- ❌ **NIEMALS** Container neu bauen ohne `git pull`
- ❌ **NIEMALS** während Hauptnutzungszeiten deployen (außer Notfall)

---

## 🆘 Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend

# Alte Container entfernen und neu starten
docker-compose down
docker-compose up -d
```

### "Connection refused" Fehler

```bash
# Prüfe ob Container läuft
docker-compose ps

# Prüfe Ports
netstat -tulpn | grep 5000

# Container neu starten
docker-compose restart backend
```

### Code-Änderungen nicht sichtbar

```bash
# Stelle sicher, dass du git pull gemacht hast
git pull origin main

# Baue Container NEU (wichtig: --build Flag!)
docker-compose up -d --build

# Prüfe ob richtiger Code deployed ist
docker-compose exec backend cat /app/appsettings.json
```

### Rollback bei Problemen

```bash
# Zeige letzte Commits
git log --oneline -10

# Gehe zurück zu vorherigem Commit
git checkout <commit-hash>

# Baue Container neu
docker-compose up -d --build

# Wenn OK, mache es permanent:
git checkout main
git reset --hard <commit-hash>
git push origin main --force  # ⚠️ Vorsicht!
```

---

## 📚 Weitere Dokumentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Lokale Entwicklung Setup
- [Kynso_Setup_guide.md](Kynso_Setup_guide.md) - Production Server Setup
- [PRODUCTION_USER_CREATION.md](PRODUCTION_USER_CREATION.md) - User erstellen
- [SERVICE_TESTING.md](SERVICE_TESTING.md) - Services testen
- [DOCKER_PORT_FIX.md](../DOCKER_PORT_FIX.md) - Port-Konfiguration

---

## 🎯 Quick Reference

```bash
# Lokale Entwicklung
git checkout dev
dotnet run --launch-profile Development
npm start

# Lokales Testing
git checkout test
git merge dev
dotnet run --launch-profile Test
npm run start:test

# Production Deployment
git checkout main
git merge test
git push origin main
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build

# Production Health Check
curl http://localhost:5000/api/health
```

---

**Status:** ✅ Ready to use  
**Zuletzt aktualisiert:** 2025-11-21
