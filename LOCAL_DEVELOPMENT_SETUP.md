# 🏠 Local Development Setup Guide

This guide helps you set up the RP-Project CRM system for local development and testing.

## 📋 Prerequisites

### Required Software
- **.NET 8.0 SDK** (Recommended: 8.0.x, not 10.x)
- **PostgreSQL** 14 or higher
- **Node.js** 20.x or higher
- **Visual Studio Code** or **Visual Studio 2022**

### Important: .NET SDK Version
The project targets **.NET 8.0**. If you have **.NET 10.0 SDK** installed, you may encounter issues with `dotnet ef` commands showing errors like:
```
System.IO.FileNotFoundException: Could not load file or assembly 'System.Runtime, Version=10.0.0.0'
```

**Solution:** Use .NET 8.0 SDK for this project. You can have multiple SDKs installed and specify which one to use via `global.json`.

## 🔧 Initial Setup

### 1. Database Setup

Create a local PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kynso_dev;

# Exit psql
\q
```

Default credentials used in development:
- **Host:** localhost
- **Database:** kynso_dev
- **Username:** postgres
- **Password:** admin123

**Note:** You can change these in `appsettings.Development.json`.

### 2. Configure Connection String

The connection string is already configured in `src/backend/RP.CRM.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123"
  }
}
```

Update the password if your PostgreSQL has a different password.

### 3. Apply Database Migrations

Navigate to the API project directory:

```bash
cd src/backend/RP.CRM.Api
```

Apply migrations:

```bash
dotnet ef database update
```

If you encounter the `System.Runtime, Version=10.0.0.0` error, ensure you're using .NET 8.0 SDK:

```bash
# Check your current SDK version
dotnet --version

# If it shows 10.x, create a global.json in the repository root
cd /path/to/rp-project
dotnet new globaljson --sdk-version 8.0.416 --force
```

### 4. Tenant Configuration

For local development, the system uses `tenants.Development.json` which includes localhost domains:

```json
[
  {
    "Name": "Local Development",
    "Domain": "localhost"
  },
  {
    "Name": "Local Finaro",
    "Domain": "finaro.local"
  },
  {
    "Name": "Local Demo",
    "Domain": "demo.local"
  }
]
```

These tenants will be automatically seeded into your database on first run.

## 🚀 Running the Application

### Backend (API)

```bash
cd src/backend/RP.CRM.Api
dotnet run
```

The API will start on:
- **http://localhost:5015** (main endpoint)
- **http://[::]:5020** (additional endpoint for all interfaces)

You should see output similar to:
```
✅ Loaded tenant domains from tenants.Development.json (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
🔄 Applying database migrations...
✅ Database migrations applied successfully!
✅ CORS allowed origins (Development):
   http://localhost:4200
   http://localhost:5015
   http://127.0.0.1:4200
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5015
```

### API Documentation

Once running, access the API documentation at:
- **Scalar UI:** http://localhost:5015/scalar/v1
- **Swagger:** (if configured)

### Frontend (Angular)

```bash
cd src/frontend
npm install
npm start
```

The frontend will start on **http://localhost:4200**

## 🔐 Test User Setup

After the database is set up, you can create test users through the API or seed them manually.

### Using the API

1. Register a new user via `/api/auth/register`
2. Login via `/api/auth/login`
3. Use the JWT token for authenticated requests

## 🧪 Testing

### Run Backend Tests

```bash
cd src/backend/RP.CRM.Tests
dotnet test
```

## 📝 Configuration Files

### Environment-Specific Files

The project uses environment-specific configuration:

- **Development:**
  - `appsettings.Development.json` - Local database connection
  - `tenants.Development.json` - Localhost tenant configuration

- **Production:**
  - `appsettings.Production.json` - Production database (set via environment variables)
  - `tenants.Production.json` - Production domains (finaro.kynso.ch, demo.kynso.ch)

### Switching Environments

The environment is determined by the `ASPNETCORE_ENVIRONMENT` variable:

```bash
# Development (default in launchSettings.json)
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
export ASPNETCORE_ENVIRONMENT=Development  # Bash

# Production
$env:ASPNETCORE_ENVIRONMENT="Production"   # PowerShell
export ASPNETCORE_ENVIRONMENT=Production   # Bash
```

## 🐛 Troubleshooting

### Issue: `dotnet ef database update` fails with System.Runtime error

**Problem:** Using .NET 10.0 SDK with a .NET 8.0 project.

**Solution:** Create a `global.json` file in the repository root:

```json
{
  "sdk": {
    "version": "8.0.416",
    "rollForward": "latestPatch"
  }
}
```

Then try the migration again:
```bash
dotnet ef database update
```

### Issue: Application connects to production database

**Problem:** Environment variable not set correctly.

**Solution:** Ensure `ASPNETCORE_ENVIRONMENT=Development` is set. Check `launchSettings.json`:

```json
{
  "profiles": {
    "http": {
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### Issue: CORS errors in browser

**Problem:** Frontend origin not allowed.

**Solution:** Verify `tenants.Development.json` includes localhost domains and the API is showing correct CORS origins in the startup logs.

### Issue: PostgreSQL connection refused

**Problem:** PostgreSQL is not running or connection details are wrong.

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Verify connection string in `appsettings.Development.json`

3. Test connection:
   ```bash
   psql -U postgres -d kynso_dev
   ```

## 🔄 Development Workflow

1. **Start PostgreSQL** - Ensure database is running
2. **Start Backend** - `cd src/backend/RP.CRM.Api && dotnet run`
3. **Start Frontend** - `cd src/frontend && npm start`
4. **Access Application** - http://localhost:4200
5. **Access API Docs** - http://localhost:5015/scalar/v1

## 📚 Additional Resources

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - General setup guide
- [README.md](README.md) - Project overview
- [PRODUCTION_SETUP_SUMMARY.md](PRODUCTION_SETUP_SUMMARY.md) - Production setup

## 💡 Tips

1. **Use Different Tenant Domains**: Edit `tenants.Development.json` to add custom tenant domains
2. **Database Seed Data**: Check the migrations for initial seed data
3. **VS Code Launch Config**: Use F5 to debug with breakpoints
4. **Hot Reload**: The API supports hot reload for quick development

## 🎯 Next Steps

After local setup:
1. Create test users
2. Add sample customer data
3. Test document upload/download
4. Verify multi-tenant isolation
5. Run the test suite

---

Happy coding! 🚀
