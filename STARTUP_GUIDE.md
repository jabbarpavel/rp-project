# 🚀 Startup Guide - Kynso CRM

This guide provides **ONE clear way** to start the application in each environment (Development, Test, Production).

---

## 📋 Prerequisites

Before starting, ensure you have:
- **.NET 8.0 SDK** (Version 8.0.416 or higher)
- **Node.js** 20.x or higher  
- **PostgreSQL** 14 or higher (for Development/Test)
- **Docker** and **Docker Compose** (for Production)

---

## 🌍 Environment Overview

| Environment | Backend Port | Frontend Port | Database | Purpose |
|------------|--------------|---------------|----------|---------|
| **Development** | 5015 | 4200 | kynso_dev | Local development |
| **Test** | 5016 | 4300 | kynso_test | Pre-production testing |
| **Production** | 5000 | 8080 | Production DB | Live system |

---

## 🔧 Development Environment

### Backend

**Windows (PowerShell):**
```powershell
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

**Linux/Mac (Bash):**
```bash
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

**Alternative (all platforms):**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

✅ Backend will be available at: **http://localhost:5015**

### Frontend

```bash
cd src/frontend
npm install  # First time only
npm start
```

✅ Frontend will be available at: **http://localhost:4200**

### Verify

Open your browser at **http://localhost:4200**

---

## 🧪 Test Environment

### Backend

**Windows (PowerShell):**
```powershell
cd src\backend\RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run
```

**Linux/Mac (Bash):**
```bash
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Test dotnet run
```

**Alternative (all platforms):**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

✅ Backend will be available at: **http://localhost:5016**

### Frontend

```bash
cd src/frontend
npm run start:test
```

✅ Frontend will be available at: **http://localhost:4300**

### Verify

Open your browser at **http://localhost:4300**

---

## 🚀 Production Environment

Production runs in Docker with both frontend and backend containerized.

### Start Everything

```bash
docker-compose up --build -d
```

### Verify

```bash
# Check container status
docker-compose ps

# Test backend health
curl http://localhost:8080/api/health

# Open frontend in browser
open http://localhost:8080
```

✅ Application will be available at: **http://localhost:8080**

### Stop Everything

```bash
docker-compose down
```

---

## 🔍 Health Checks

### Backend Health Endpoints

- **Development:** http://localhost:5015/api/health
- **Test:** http://localhost:5016/api/health
- **Production:** http://localhost:8080/api/health

### API Documentation

- **Development:** http://localhost:5015/scalar/v1
- **Test:** http://localhost:5016/scalar/v1

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** "Database connection failed"

**Solution:** Make sure PostgreSQL is running and the database exists:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
# or check if it's running in Task Manager on Windows

# Create database if needed (in psql):
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;
```

### Port already in use

**Problem:** "Address already in use"

**Solution:** Kill the process using the port:

**Windows:**
```powershell
# Find process using port 5015
netstat -ano | findstr :5015
# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process using port 5015
lsof -ti:5015 | xargs kill -9
```

### Frontend build errors

**Problem:** npm install fails or build errors

**Solution:**
```bash
cd src/frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Docker issues

**Problem:** Containers not starting

**Solution:**
```bash
# Clean up and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📝 Notes

- **Development** is for active development and experiments
- **Test** is for testing before deploying to production  
- **Production** should only be deployed after successful testing
- Each environment has its own database and configuration
- The frontend automatically detects which backend to connect to based on the port it's running on

---

## 🔗 Additional Resources

- [README.md](README.md) - Project overview
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Detailed development guide
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues and solutions
