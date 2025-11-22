# 📝 Configuration Guide - Environment-Specific Settings

This document explains how the Kynso CRM application handles configuration across different environments.

---

## 🌍 Environment Overview

The application supports three environments:

| Environment | Backend Port | Frontend Port | Database | Tenant File |
|------------|--------------|---------------|----------|-------------|
| **Development** | 5015 | 4200 | kynso_dev | tenants.Development.json |
| **Test** | 5016 | 4300 | kynso_test | tenants.Test.json |
| **Production** | 5000 | 8080 | Production DB | tenants.Production.json |

---

## 🔧 Backend Configuration

### Tenant Configuration Files

The backend uses **environment-specific tenant files** located at:
```
src/backend/RP.CRM.Api/tenants.{Environment}.json
```

**Files:**
- `tenants.Development.json` - For Development environment
- `tenants.Test.json` - For Test environment  
- `tenants.Production.json` - For Production environment

**Format:**
```json
[
  {
    "Name": "Tenant Name",
    "Domain": "domain-or-localhost"
  }
]
```

**Examples:**

**Development/Test** (tenants.Development.json & tenants.Test.json):
```json
[
  {
    "Name": "Finaro",
    "Domain": "localhost"
  }
]
```

**Production** (tenants.Production.json):
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

### Application Settings

The backend uses **appsettings.{Environment}.json** files:

**Files:**
- `appsettings.json` - Base settings (no secrets)
- `appsettings.Development.json` - Development environment
- `appsettings.Test.json` - Test environment
- `appsettings.Production.json` - Production environment

**Key Settings:**
```json
{
  "Jwt": {
    "Key": "secret-key-here"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

### Launch Profiles

The backend can be started using **launch profiles** in `Properties/launchSettings.json`:

**Profiles:**
- `Development` - Port 5015, Environment: Development
- `Test` - Port 5016, Environment: Test
- `Production` - Port 5000, Environment: Production

**Usage:**
```bash
dotnet run --launch-profile Development
dotnet run --launch-profile Test
dotnet run --launch-profile Production
```

### Environment Variables

Alternatively, set the environment manually:

**Windows (PowerShell):**
```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

**Linux/Mac (Bash):**
```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

---

## 🎨 Frontend Configuration

### Automatic URL Detection

The frontend **automatically detects** the backend URL based on the port it's running on:

| Frontend Port | Environment | Backend URL |
|--------------|-------------|-------------|
| 4200 | Development | http://localhost:5015 |
| 4300 | Test | http://localhost:5016 |
| Other | Production | Same domain as frontend |

This is handled by the `ConfigService` at:
```
src/frontend/src/app/core/services/config.service.ts
```

**No tenant configuration files are needed for the frontend!**

### Angular Build Configurations

The frontend uses **Angular configurations** in `angular.json`:

**Configurations:**
- `development` - Development build (source maps, no optimization)
- `test` - Test build (source maps, no optimization)
- `production` - Production build (optimized, bundled)

**Usage:**
```bash
# Development
npm start
# or
npm run start:dev

# Test
npm run start:test

# Production (Docker)
npm run build:prod
```

---

## 🔄 How It Works

### Development Workflow

1. **Start Backend:**
   ```bash
   cd src/backend/RP.CRM.Api
   dotnet run --launch-profile Development
   ```
   - Loads `tenants.Development.json`
   - Loads `appsettings.Development.json`
   - Listens on port **5015**

2. **Start Frontend:**
   ```bash
   cd src/frontend
   npm start
   ```
   - Runs on port **4200**
   - ConfigService detects port 4200 → uses `http://localhost:5015`

### Test Workflow

1. **Start Backend:**
   ```bash
   cd src/backend/RP.CRM.Api
   dotnet run --launch-profile Test
   ```
   - Loads `tenants.Test.json`
   - Loads `appsettings.Test.json`
   - Listens on port **5016**

2. **Start Frontend:**
   ```bash
   cd src/frontend
   npm run start:test
   ```
   - Runs on port **4300**
   - ConfigService detects port 4300 → uses `http://localhost:5016`

### Production Workflow (Docker)

1. **Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   - Backend loads `tenants.Production.json`
   - Backend loads `appsettings.Production.json`
   - Backend runs on port **5000** (internal)
   - Frontend runs on port **80** (internal)
   - Nginx reverse proxy exposes **8080** externally

2. **Access:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8080/api/*
   - ConfigService detects production → uses same domain

---

## 🛡️ Security Best Practices

### DO NOT commit:
- ❌ Real passwords in `appsettings.Production.json`
- ❌ Real JWT keys in production settings
- ❌ Database connection strings with real passwords
- ❌ `.env` files with secrets

### DO commit:
- ✅ `tenants.{Environment}.json` files (no secrets)
- ✅ `appsettings.{Environment}.json` with **placeholder** values
- ✅ `appsettings.json` base configuration

### Production Secrets:

Use **environment variables** or **Docker secrets** for production:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - ConnectionStrings__DefaultConnection=${DB_CONNECTION}
      - Jwt__Key=${JWT_SECRET}
```

---

## 📋 Quick Reference

### Files Structure
```
src/backend/RP.CRM.Api/
├── appsettings.json                    # Base settings
├── appsettings.Development.json        # Dev settings
├── appsettings.Test.json               # Test settings
├── appsettings.Production.json         # Prod settings (no secrets)
├── tenants.Development.json            # Dev tenants
├── tenants.Test.json                   # Test tenants
├── tenants.Production.json             # Prod tenants
└── Properties/
    └── launchSettings.json             # Launch profiles

src/frontend/
├── angular.json                        # Build configurations
└── src/app/core/services/
    └── config.service.ts               # Auto URL detection
```

### Environment Selection

**Backend:**
```bash
# Option 1: Launch Profile
dotnet run --launch-profile Development

# Option 2: Environment Variable (PowerShell)
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run

# Option 3: Environment Variable (Bash)
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

**Frontend:**
```bash
# Development (port 4200)
npm start

# Test (port 4300)
npm run start:test

# Production (Docker)
docker-compose up
```

---

## 🔍 Troubleshooting

### Backend won't start

**Error:** `Required tenant configuration file not found`

**Solution:** Make sure `tenants.{Environment}.json` exists:
```bash
ls src/backend/RP.CRM.Api/tenants*.json
```

### Frontend can't connect to backend

**Check:**
1. Is backend running? `curl http://localhost:5015/api/health`
2. Is frontend on correct port? (4200 for Dev, 4300 for Test)
3. Check browser console for ConfigService logs

### Wrong environment loaded

**Backend:**
```bash
# Check what environment is active
echo $ASPNETCORE_ENVIRONMENT  # Linux/Mac
echo $env:ASPNETCORE_ENVIRONMENT  # PowerShell
```

**Frontend:**
- Open browser console
- Look for: `ConfigService - Base URL set to: ...`
- Port 4200 = Development, 4300 = Test, other = Production

---

## 📚 Related Documentation

- [STARTUP_GUIDE.md](../STARTUP_GUIDE.md) - How to start each environment
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Docker deployment
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

---

**Last Updated:** 2025-11-22
