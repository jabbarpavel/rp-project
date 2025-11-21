# 🔧 Troubleshooting Guide

Common issues and solutions for Kynso CRM development and deployment.

---

## 📋 Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [Build & Deployment Issues](#build--deployment-issues)
5. [Network & CORS Issues](#network--cors-issues)
6. [Environment Issues](#environment-issues)

---

## 🔴 Backend Issues

### Backend Won't Start

#### Problem: Port Already in Use

**Symptoms:**
```
Failed to bind to address http://localhost:5015: address already in use
```

**Solution (Windows):**
```powershell
# Find process using the port
netstat -ano | findstr :5015

# Kill the process (replace <PID> with the actual PID)
taskkill /PID <PID> /F

# Restart backend
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Development
```

**Solution (Linux/Mac):**
```bash
# Find and kill process
lsof -ti:5015 | xargs kill -9

# Or more gracefully
kill $(lsof -t -i:5015)

# Restart backend
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

#### Problem: .NET SDK Version Mismatch

**Symptoms:**
```
System.IO.FileNotFoundException: Could not load file or assembly 'System.Runtime, Version=10.0.0.0'
```

**Solution:**
```bash
# Check current .NET version
dotnet --version

# Should show 8.0.x, if it shows 10.x:
# Verify global.json exists in repository root
cat global.json

# Should contain:
# {
#   "sdk": {
#     "version": "8.0.416",
#     "rollForward": "latestMinor"
#   }
# }

# If global.json is missing or incorrect, recreate it:
cd /path/to/rp-project
dotnet new globaljson --sdk-version 8.0.416 --force
```

#### Problem: Entity Framework Tools Not Found

**Symptoms:**
```
Could not execute because the specified command or file was not found.
Possible reasons for this include:
  * You misspelled a built-in dotnet command.
  * You intended to execute a .NET program, but dotnet-ef does not exist.
```

**Solution:**
```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef

# Or update if already installed
dotnet tool update --global dotnet-ef

# Verify installation
dotnet ef --version
```

#### Problem: NullReferenceException in CustomersController

**Symptoms:**
```
warning CS8602: Dereference of a possibly null reference.
```

**Location:** `src/backend/RP.CRM.Api/Controllers/CustomersController.cs:354`

**Solution:**
This is a warning, not an error. The code will work, but for cleaner code:

```csharp
// Add null check
if (customer?.SomeProperty != null)
{
    // Use property
}
```

---

## 🎨 Frontend Issues

### Frontend Won't Start

#### Problem: Dependencies Not Installed

**Symptoms:**
```
Error: Cannot find module '@angular/core'
```

**Solution:**
```bash
cd src/frontend

# Install dependencies
npm install

# If issues persist, clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Problem: Port 4200 Already in Use

**Symptoms:**
```
Port 4200 is already in use. Use '--port' to specify a different port.
```

**Solution:**
```bash
# Use a different port
npm start -- --port 4201

# Or kill the process using port 4200 (see Backend section)
```

#### Problem: Angular Build Errors

**Symptoms:**
```
Error: Module not found
Error: Can't resolve component
```

**Solution:**
```bash
cd src/frontend

# Clean build
rm -rf .angular node_modules

# Reinstall
npm install

# Try build again
npm run build:dev
```

---

## 🗄️ Database Issues

### Migration Issues

#### Problem: "Relation Already Exists"

**Symptoms:**
```
relation "ChangeLogs" already exists
relation "Users" already exists
```

**Cause:** Migration was partially applied or database has old schema.

**Solution 1: Reset Database (Recommended)**

**Windows:**
```powershell
.\reset-database.ps1
```

**Manual Reset:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate databases
DROP DATABASE IF EXISTS kynso_dev;
DROP DATABASE IF EXISTS kynso_test;
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;

\q

# Apply migrations
cd src/backend/RP.CRM.Api

# For DEV
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

# For TEST
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

**Solution 2: Remove Failed Migration**

```bash
cd src/backend/RP.CRM.Api

# Remove last migration
dotnet ef migrations remove

# Recreate migration
dotnet ef migrations add YourMigrationName

# Apply migration
dotnet ef database update
```

#### Problem: "Database is Being Accessed by Other Users"

**Symptoms:**
```
database "kynso_dev" is being accessed by other users
```

**Solution:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Terminate all connections to database
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'kynso_dev' AND pid <> pg_backend_pid();

# Now you can drop/modify the database
DROP DATABASE kynso_dev;
CREATE DATABASE kynso_dev;

\q
```

### Connection Issues

#### Problem: Cannot Connect to PostgreSQL

**Symptoms:**
```
Npgsql.NpgsqlException: Failed to connect to localhost:5432
```

**Solution:**

**Check if PostgreSQL is running:**

**Windows:**
```powershell
Get-Service postgresql*
# If not running:
Start-Service postgresql-x64-14
```

**Linux:**
```bash
sudo systemctl status postgresql
# If not running:
sudo systemctl start postgresql
```

**Mac:**
```bash
brew services list
# If not running:
brew services start postgresql
```

**Verify connection string:**

Check `appsettings.Development.json` or `appsettings.Test.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

Update password if needed.

#### Problem: Authentication Failed

**Symptoms:**
```
password authentication failed for user "postgres"
```

**Solution:**

**Find PostgreSQL data directory:**
```bash
psql -U postgres -c "SHOW data_directory"
```

**Edit pg_hba.conf:**
```bash
# Windows: C:\Program Files\PostgreSQL\14\data\pg_hba.conf
# Linux: /etc/postgresql/14/main/pg_hba.conf
# Mac: /usr/local/var/postgres/pg_hba.conf

# Change authentication method to 'trust' temporarily:
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             127.0.0.1/32            trust
```

**Restart PostgreSQL:**
```bash
# Windows
Restart-Service postgresql-x64-14

# Linux
sudo systemctl restart postgresql

# Mac
brew services restart postgresql
```

**Reset password:**
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q
```

**Revert pg_hba.conf to md5 or scram-sha-256 and restart PostgreSQL again.**

---

## 🏗️ Build & Deployment Issues

### Backend Build Issues

#### Problem: Build Warnings

**Symptoms:**
```
warning CS8602: Dereference of a possibly null reference
```

**Solution:**
These are nullable reference warnings. They won't prevent the build. To fix:

```csharp
// Add null checks
if (variable != null)
{
    variable.Property = value;
}

// Or use null-conditional operator
variable?.Property = value;

// Or null-coalescing operator
var result = variable?.Property ?? defaultValue;
```

### Frontend Build Issues

#### Problem: Build Budget Exceeded

**Symptoms:**
```
Warning: bundle initial exceeded maximum budget
```

**Solution:**

Edit `angular.json` to increase budgets:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  }
]
```

Or optimize build:
```bash
# Production build with optimization
npm run build:prod
```

---

## 🌐 Network & CORS Issues

### CORS Errors

#### Problem: CORS Error in Browser Console

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:5015/api/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Solution:**

**Verify backend is running:**
```bash
# Check backend console output
# Should see: "✅ CORS allowed origins: ..."
```

**Check CORS configuration in Program.cs:**

File: `src/backend/RP.CRM.Api/Program.cs`

Ensure CORS policy includes your frontend URL:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

**Verify environment-specific tenant configuration:**

- DEV: Should include localhost origins
- TEST: Should include test origins
- PROD: Should include production domains

#### Problem: API Requests Failing

**Symptoms:**
```
net::ERR_CONNECTION_REFUSED
```

**Solution:**

1. Verify backend is running
2. Check backend URL in frontend environment configuration
3. Verify no firewall blocking the port
4. Check backend is listening on correct port

---

## ⚙️ Environment Issues

### Wrong Environment Detected

#### Problem: Backend Uses Wrong Configuration

**Symptoms:**
- Backend connects to wrong database
- Wrong tenant configuration loaded
- Unexpected behavior

**Solution:**

**Check environment variable:**
```bash
# Windows PowerShell
$env:ASPNETCORE_ENVIRONMENT

# Linux/Mac
echo $ASPNETCORE_ENVIRONMENT
```

**Set correct environment:**
```bash
# Windows PowerShell
$env:ASPNETCORE_ENVIRONMENT="Development"  # or "Test" or "Production"

# Linux/Mac
export ASPNETCORE_ENVIRONMENT=Development
```

**Or use launch profile (recommended):**
```bash
# Always uses correct environment
dotnet run --launch-profile Development
dotnet run --launch-profile Test
dotnet run --launch-profile Production
```

### Configuration File Not Found

#### Problem: tenants.json or appsettings.json Missing

**Symptoms:**
```
Could not find file 'tenants.Development.json'
```

**Solution:**

Verify files exist:
```bash
cd src/backend/RP.CRM.Api
ls -la *.json
```

Should see:
- `appsettings.json`
- `appsettings.Development.json`
- `appsettings.Test.json`
- `appsettings.Production.json`
- `tenants.Development.json`
- `tenants.Test.json`
- `tenants.Production.json`

If missing, check git:
```bash
git status
git checkout -- src/backend/RP.CRM.Api/*.json
```

---

## 🔍 Diagnostic Commands

### Backend Diagnostics

```bash
# Check .NET version
dotnet --version

# Check EF tools
dotnet ef --version

# List migrations
cd src/backend/RP.CRM.Api
dotnet ef migrations list

# Check connection to database
dotnet ef database update --verbose

# Build backend
cd src/backend/RP.CRM.Api
dotnet build

# Run tests
cd src/backend/RP.CRM.Tests
dotnet test
```

### Frontend Diagnostics

```bash
# Check Node/npm versions
node --version
npm --version

# Check Angular CLI
ng version

# Verify dependencies
cd src/frontend
npm list --depth=0

# Check for vulnerabilities
npm audit

# Build frontend
npm run build:dev
```

### Database Diagnostics

```bash
# Connect to database
psql -U postgres -d kynso_dev

# List databases
\l

# List tables
\dt

# Describe table
\d "Users"

# Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Exit
\q
```

### System Diagnostics

**Windows:**
```powershell
# Check running services
Get-Service postgresql*
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}

# Check ports
netstat -ano | findstr :5015
netstat -ano | findstr :4200
```

**Linux/Mac:**
```bash
# Check services
systemctl status postgresql

# Check ports
lsof -i :5015
lsof -i :4200

# Check processes
ps aux | grep dotnet
ps aux | grep node
```

---

## 📞 Getting More Help

### Logging

#### Enable Verbose Logging

**Backend (appsettings.Development.json):**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  }
}
```

**Frontend:**
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for API requests
- Application tab for storage/cookies

### Common Log Locations

**Backend:**
- Console output (when running with `dotnet run`)
- `/var/log/kynso/` (production Linux)
- Windows Event Viewer (production Windows)

**Frontend:**
- Browser DevTools Console
- Network tab in DevTools

**Database:**
- PostgreSQL logs location varies by OS
- Check `pg_log` directory in PostgreSQL data directory

---

## 📚 Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [TENANT_WORKFLOW.md](TENANT_WORKFLOW.md) - Tenant management
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production deployment

---

**Still having issues?** 

1. Check the [GitHub Issues](https://github.com/jabbarpavel/rp-project/issues)
2. Review backend console output
3. Check frontend browser console (F12)
4. Verify all services are running
5. Try resetting the database with `reset-database.ps1`
