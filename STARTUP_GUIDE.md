# 🚀 Startup Guide - Kynso CRM

This guide provides **ONE clear way** to start the application in each environment (Test, Production).

---

## 📋 Prerequisites

Before starting, ensure you have:
- **.NET 8.0 SDK** (Version 8.0.416 or higher)
- **Node.js** 20.x or higher  
- **PostgreSQL** 14 or higher (for Test)
- **Docker** and **Docker Compose** (for Production)

---

## 🌍 Environment Overview

| Environment | Branch | Backend Port | Frontend Port | Database | Purpose |
|------------|--------|--------------|---------------|----------|---------|
| **Test** | `test` | 5016 | 4300 | kynso_test | Entwicklung & Testing |
| **Production** | `main` | 5000 | 8080 | Production DB | Live System (finaro.kynso.ch) |

---

## 🧪 Test Environment (Tägliche Arbeit)

### Backend starten

**Windows (PowerShell):**
```powershell
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Test
```

**Linux/Mac (Bash):**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

✅ Backend läuft auf: **http://localhost:5016**  
✅ API Docs: **http://localhost:5016/scalar/v1**

### Frontend starten

```bash
cd src/frontend
npm install  # Nur beim ersten Mal
npm run start:test
```

✅ Frontend läuft auf: **http://localhost:4300**

### Verifizieren

Browser öffnen: **http://localhost:4300**

---

## 🚀 Production Environment

Production läuft in Docker auf dem Server.

### Start Everything

```bash
docker-compose up --build -d
```

### Verify

```bash
# Container-Status prüfen
docker-compose ps

# Backend-Health prüfen
curl http://localhost:8080/api/health
```

✅ Live System: **https://finaro.kynso.ch**

### Stop Everything

```bash
docker-compose down
```

---

## 🔍 Health Checks

- **Test:** http://localhost:5016/api/health
- **Production:** https://finaro.kynso.ch/api/health

### API Documentation

- **Test:** http://localhost:5016/scalar/v1

---

## 🐛 Troubleshooting

### Backend startet nicht

**Problem:** "Database connection failed"

**Lösung:** PostgreSQL läuft? Datenbank existiert?

```sql
-- In psql ausführen:
CREATE DATABASE kynso_test;
```

### Port bereits belegt

**Windows:**
```powershell
netstat -ano | findstr :5016
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:5016 | xargs kill -9
```

### Frontend Build-Fehler

```bash
cd src/frontend
rm -rf node_modules package-lock.json
npm install
npm run start:test
```

### Docker-Probleme

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f backend
```

---

## 📝 Workflow

```
test branch → Entwickeln & Testen lokal
     ↓
Pull Request erstellen (test → main)
     ↓
main branch → Automatisch auf finaro.kynso.ch deployed
```

---

## 🔗 Weitere Ressourcen

- [README.md](README.md) - Projektübersicht
- [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md) - Deployment Guide
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Häufige Probleme
