# 🚀 Development Guide - Dev & Test Environment

This guide covers everything you need to develop and test the Kynso CRM system locally.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Overview](#environment-overview)
3. [Initial Setup](#initial-setup)
4. [Starting the System](#starting-the-system)
5. [Database Management](#database-management)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

### Required Software
- **.NET 8.0 SDK** (Version 8.0.416 or higher)
- **Node.js** 20.x or higher
- **PostgreSQL** 14 or higher
- **Git**
- **VS Code** or **Visual Studio 2022**

### Verify Installation

```bash
# Check .NET version
dotnet --version
# Should show 8.0.x (not 10.x!)

# Check Node.js version
node --version
# Should show v20.x or higher

# Check PostgreSQL
psql --version
# Should show PostgreSQL 14 or higher
```

---

## 🌍 Environment Overview

The project uses three separate environments:

| Environment | Branch | Database | Backend Port | Frontend Port | Usage |
|------------|--------|----------|--------------|---------------|-------|
| **DEV** | `dev` | kynso_dev | 5015 | 4200 | Local development & experiments |
| **TEST** | `test` | kynso_test | 5016 | 4300 | Local testing before production |
| **PROD** | `main` | Server DB | 5020 | - | Live system (kynso.ch) |

### Environment Flow
```
DEV (develop) → TEST (validate) → PROD (deploy)
```

---

## 🔧 Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/jabbarpavel/rp-project.git
cd rp-project
```

### 2. Setup Environment Script

The setup script will automatically:
- ✅ Check prerequisites (.NET, PostgreSQL)
- ✅ Install `dotnet-ef` tool if needed
- ✅ Create `dev` and `test` branches
- ✅ Create `kynso_dev` and `kynso_test` databases
- ✅ Apply all migrations

**Windows (PowerShell):**
```powershell
.\setup-environment.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-environment.sh
./setup-environment.sh
```

### 3. Manual Setup (Alternative)

If the setup script fails, you can set up manually:

#### Create Databases
```bash
# Connect to PostgreSQL
psql -U postgres

# Create databases
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;

# Exit
\q
```

#### Create Branches
```bash
# Create dev branch
git checkout -b dev
git push -u origin dev

# Create test branch
git checkout -b test
git push -u origin test

# Return to main
git checkout main
```

#### Apply Migrations

**For DEV:**
```bash
cd src/backend/RP.CRM.Api

# Set environment (PowerShell)
$env:ASPNETCORE_ENVIRONMENT="Development"

# Or for Linux/Mac
export ASPNETCORE_ENVIRONMENT=Development

# Apply migrations
dotnet ef database update
```

**For TEST:**
```bash
cd src/backend/RP.CRM.Api

# Set environment (PowerShell)
$env:ASPNETCORE_ENVIRONMENT="Test"

# Or for Linux/Mac
export ASPNETCORE_ENVIRONMENT=Test

# Apply migrations
dotnet ef database update
```

---

## 🚀 Starting the System

### Development Environment (DEV)

**Terminal 1 - Backend:**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

Expected output:
```
✅ Loaded tenant domains from tenants.Development.json (Development)
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
```

**Backend URLs:**
- API: http://localhost:5015
- API Documentation (Scalar): http://localhost:5015/scalar/v1

**Terminal 2 - Frontend:**
```bash
cd src/frontend

# First time only: install dependencies
npm install

# Start development server
npm run start:dev
# or simply: npm start
```

Expected output:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

**Frontend URL:** http://localhost:4200

### Test Environment (TEST)

**Terminal 1 - Backend:**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```

**Backend URLs:**
- API: http://localhost:5016
- API Documentation (Scalar): http://localhost:5016/scalar/v1

**Terminal 2 - Frontend:**
```bash
cd src/frontend
npm run start:test
```

**Frontend URL:** http://localhost:4300

### Running DEV and TEST Simultaneously

You can run both environments at the same time since they use different ports:
- Open 4 terminal windows
- 2 for DEV (backend + frontend)
- 2 for TEST (backend + frontend)

---

## 🗄️ Database Management

### Creating Migrations

When you make changes to entity models, create a migration:

```bash
cd src/backend/RP.CRM.Api
dotnet ef migrations add YourMigrationName
```

### Applying Migrations

**To DEV database:**
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
dotnet ef database update
```

**To TEST database:**
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Test"  # PowerShell
dotnet ef database update
```

### Resetting Database

If you encounter migration conflicts or want a fresh start:

**Windows (PowerShell):**
```powershell
.\reset-database.ps1
```

This script will:
1. Terminate all database connections
2. Drop existing databases (kynso_dev, kynso_test)
3. Create new clean databases
4. Apply all migrations

**Manual Reset:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate databases
DROP DATABASE IF EXISTS kynso_dev;
DROP DATABASE IF EXISTS kynso_test;
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;

# Exit
\q

# Apply migrations (repeat for both environments)
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

### Database Access

**Connect to DEV database:**
```bash
psql -U postgres -d kynso_dev
```

**Connect to TEST database:**
```bash
psql -U postgres -d kynso_test
```

**Useful psql commands:**
```sql
-- List all tables
\dt

-- Describe table structure
\d "Users"

-- View all users
SELECT "Id", "Email", "TenantId", "Permissions" FROM "Users";

-- Exit
\q
```

---

## 🔄 Development Workflow

### 1. Develop in DEV

```bash
# Switch to dev branch
git checkout dev

# Make your changes
# ... code ...

# Test locally on DEV environment
# Backend: http://localhost:5015
# Frontend: http://localhost:4200

# Commit changes
git add .
git commit -m "Add new feature"
git push origin dev
```

### 2. Test in TEST

```bash
# Switch to test branch
git checkout test

# Merge changes from dev
git merge dev

# Push to test branch
git push origin test

# Test locally on TEST environment
# Backend: http://localhost:5016
# Frontend: http://localhost:4300

# If tests pass, proceed to production
# If tests fail, fix in dev and repeat
```

### 3. Deploy to PRODUCTION

```bash
# Switch to main branch
git checkout main

# Merge changes from test
git merge test

# Push to main (triggers production deployment)
git push origin main
```

---

## 🧪 Testing

### Backend Tests

```bash
cd src/backend/RP.CRM.Tests
dotnet test
```

### Frontend Tests

```bash
cd src/frontend
npm test
```

### Manual API Testing

Use the built-in API documentation:
- **DEV:** http://localhost:5015/scalar/v1
- **TEST:** http://localhost:5016/scalar/v1

Or use the Postman collection:
- `docs/Kynso_Test_Users.postman_collection.json`
- `docs/TEST_USERS_SETUP.http`

---

## 🐛 Troubleshooting

### Common Issues

#### Problem: Port Already in Use

**Windows:**
```powershell
# Find process using port 5015
netstat -ano | findstr :5015

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process on port 5015
lsof -ti:5015 | xargs kill -9
```

#### Problem: .NET SDK Version Mismatch

```bash
# Check version
dotnet --version

# Should show 8.0.x
# If it shows 10.x, check global.json exists in repository root
cat global.json
```

The `global.json` file ensures .NET 8.0 is used:
```json
{
  "sdk": {
    "version": "8.0.416",
    "rollForward": "latestMinor"
  }
}
```

#### Problem: PostgreSQL Not Running

**Windows:**
```powershell
# Check status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-14
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql
```

**Mac:**
```bash
# Start PostgreSQL
brew services start postgresql
```

#### Problem: Database Connection Failed

Check connection string in `appsettings.Development.json` or `appsettings.Test.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

Update the password if your PostgreSQL uses a different password.

#### Problem: Migration Errors

If you see errors like "relation already exists" or "database is being accessed by other users":

1. Use the reset script: `.\reset-database.ps1`
2. Or manually drop and recreate databases (see [Resetting Database](#resetting-database))

#### Problem: CORS Errors in Frontend

Ensure:
1. Backend is running
2. Backend is using the correct environment (check console output)
3. Backend log shows: "✅ CORS allowed origins"

#### Problem: Frontend Build Fails

```bash
# Clear node_modules and reinstall
cd src/frontend
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

For detailed troubleshooting, see:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- Backend logs in terminal
- Frontend console in browser (F12)
- PostgreSQL logs: Check PostgreSQL data directory

---

## 📚 Quick Reference

### Common Commands

```bash
# Backend - Start DEV
cd src/backend/RP.CRM.Api && dotnet run --launch-profile Development

# Backend - Start TEST
cd src/backend/RP.CRM.Api && dotnet run --launch-profile Test

# Frontend - Start DEV
cd src/frontend && npm run start:dev

# Frontend - Start TEST
cd src/frontend && npm run start:test

# Create migration
cd src/backend/RP.CRM.Api && dotnet ef migrations add MigrationName

# Apply migration to DEV
$env:ASPNETCORE_ENVIRONMENT="Development" && dotnet ef database update

# Apply migration to TEST
$env:ASPNETCORE_ENVIRONMENT="Test" && dotnet ef database update

# Run backend tests
cd src/backend/RP.CRM.Tests && dotnet test

# Run frontend tests
cd src/frontend && npm test
```

### Configuration Files

- `src/backend/RP.CRM.Api/appsettings.Development.json` - DEV config
- `src/backend/RP.CRM.Api/appsettings.Test.json` - TEST config
- `src/backend/RP.CRM.Api/appsettings.Production.json` - PROD config
- `src/backend/RP.CRM.Api/tenants.Development.json` - DEV tenants
- `src/backend/RP.CRM.Api/tenants.Test.json` - TEST tenants
- `src/backend/RP.CRM.Api/tenants.Production.json` - PROD tenants

---

## 📖 Related Documentation

- [README.md](../README.md) - Project overview
- [TENANT_WORKFLOW.md](TENANT_WORKFLOW.md) - Tenant management process
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production deployment

---

**Happy Coding! 🎉**
