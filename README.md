# 🚀 Kynso - Multi-Tenant Customer Relationship Management

A modern, multi-tenant CRM system built with .NET 8 and Angular.

> **🎯 Quick Start?** See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for **ONE clear way** to start each environment (Test/Prod)!  
> **🚀 Deploy to Production?** See [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md) for a **simple 3-step guide** to deploy your changes!  
> **🚑 Production Issue?** See [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) for quick help.

---

## ✨ Features

- ✅ **Multi-Tenant Architecture** - Complete tenant isolation
- ✅ **Role-Based Access Control (RBAC)** - Fine-grained permissions
- ✅ **Customer Management** - Full CRUD operations
- ✅ **Document Management** - Upload, download, and manage documents
- ✅ **User Management** - Control users and permissions per tenant
- ✅ **RESTful API** - Well-documented with Swagger/Scalar
- ✅ **Responsive Frontend** - Modern Angular-based UI
- ✅ **PostgreSQL Database** - Reliable and scalable
- ✅ **JWT Authentication** - Secure token-based authentication

---

## 🎯 Quick Start

### Prerequisites

- **.NET 8.0 SDK** (Version 8.0.416 or higher)
- **Node.js** 20.x or higher
- **PostgreSQL** 14 or higher
- **Git**

### Setup (One-Time)

**Windows (PowerShell):**
```powershell
.\setup-environment.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-environment.sh
./setup-environment.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Install required tools
- ✅ Create test branch
- ✅ Create database (kynso_test)
- ✅ Apply migrations

### Start Test Environment

**Terminal 1 - Backend:**
```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test
```
Backend runs on: **http://localhost:5016**  
API Docs: **http://localhost:5016/scalar/v1**  
Health Check: **http://localhost:5016/api/health**

**Terminal 2 - Frontend:**
```bash
cd src/frontend
npm install  # First time only
npm run start:test
```
Frontend runs on: **http://localhost:4300**

### Test Services

To verify that both frontend and backend are running correctly:

**Windows (PowerShell):**
```powershell
.\test-services.ps1 -Environment Test
```

**Linux/Mac:**
```bash
./test-services.sh Test
```

This script will check:
- ✅ Backend API health status
- ✅ Frontend accessibility
- ✅ Provide helpful messages if services are not running

---

## 🌍 Environments

The project uses two environments:

| Environment | Branch | Database | Backend Port | Frontend Port |
|------------|--------|----------|--------------|---------------|
| **TEST** | `test` | kynso_test | 5016 | 4300 |
| **PROD** | `main` | Production | 5000 | - |

**Workflow:**
```
TEST (entwickeln & testen) → PROD (live schalten via PR → main)
```

---

## 📚 Documentation

### 🎯 Getting Started

| Document | Description |
|----------|-------------|
| **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** | **⭐ START HERE** - One clear way to start each environment |
| **[CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)** | **📝 NEW** - Complete guide to environment-specific settings |
| **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** | Complete development and testing guide |
| **[SERVICE_TESTING.md](docs/SERVICE_TESTING.md)** | Test if frontend and backend are running |
| **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common issues and solutions |

### 🔧 Development & Testing

| Document | Description |
|----------|-------------|
| **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** | **⭐ START HERE** - Complete dev/test environment guide |
| **[DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md)** | **🚀 NEW** - Complete workflow from Dev → Test → Production |
| **[SERVICE_TESTING.md](docs/SERVICE_TESTING.md)** | **🧪 NEW** - Test if frontend and backend are running |
| **[TENANT_WORKFLOW.md](docs/TENANT_WORKFLOW.md)** | **⭐ IMPORTANT** - Tenant creation to production deployment process |
| **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common issues and solutions |
| **[PRODUCTION_TROUBLESHOOTING.md](docs/PRODUCTION_TROUBLESHOOTING.md)** | **🔧 NEW** - Fix connection refused and other production issues |

### 🚀 Production Deployment

| Document | Description |
|----------|-------------|
| **[DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md)** | **⭐ START HERE** - Simple 3-step deployment guide |
| **[DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md)** | **📋 Detailed** - Complete Dev → Test → Production workflow |
| **[PRODUCTION_FIX_SUMMARY.md](PRODUCTION_FIX_SUMMARY.md)** | **🔧 Complete Overview** - All fixes and instructions |
| **[PRODUCTION_QUICK_FIX.md](PRODUCTION_QUICK_FIX.md)** | **🚨 SCHNELLHILFE** - Fix demo.kynso.ch & unhealthy containers |
| **[apply-production-fix.sh](apply-production-fix.sh)** | **🚀 All-in-One** - Single command to fix everything |
| **[fix-demo-nginx.sh](fix-demo-nginx.sh)** | **🔧 Script** - Auto-fix nginx config for demo.kynso.ch |
| **[PRODUCTION_FIX_DEMO_HEALTH.md](docs/PRODUCTION_FIX_DEMO_HEALTH.md)** | **📋 Detailed** - Complete guide for both issues |
| [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) | Kynso production setup (kynso.ch) |
| **[PRODUCTION_USER_CREATION.md](docs/PRODUCTION_USER_CREATION.md)** | **👤 Create users in production** |
| **[HTTP_VS_HTTPS_GUIDE.md](docs/HTTP_VS_HTTPS_GUIDE.md)** | **🔒 HTTP vs HTTPS - Fix 301 redirect issues** |
| [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) | General production deployment guide |
| [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md) | Docker-based deployment |
| [CI_CD_SETUP.md](docs/CI_CD_SETUP.md) | GitHub Actions CI/CD |
| [PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) | Production go-live checklist |

### 📖 Reference

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_OVERVIEW.md](docs/ARCHITECTURE_OVERVIEW.md) | System architecture |
| [PERMISSIONS_GUIDE.md](docs/PERMISSIONS_GUIDE.md) | Permission system details |
| [FEATURE_GUIDE.md](docs/FEATURE_GUIDE.md) | Feature documentation |
| [POSTMAN_GUIDE.md](docs/POSTMAN_GUIDE.md) | API testing guide |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | .NET 8.0, Entity Framework Core, PostgreSQL, JWT |
| **Frontend** | Angular 20, TypeScript, RxJS, SCSS |
| **DevOps** | Docker, Nginx, GitHub Actions, Let's Encrypt |

---

## 🏗️ Project Structure

```
rp-project/
├── src/
│   ├── backend/
│   │   ├── RP.CRM.Api/          # Main API project
│   │   ├── RP.CRM.Application/  # Business logic
│   │   ├── RP.CRM.Domain/       # Domain models
│   │   ├── RP.CRM.Infrastructure/ # Data access
│   │   └── RP.CRM.Tests/        # Tests
│   └── frontend/                 # Angular application
├── docs/                         # Documentation
├── docker/                       # Docker configurations
├── setup-environment.ps1         # Windows setup script
├── setup-environment.sh          # Linux/Mac setup script
└── docker-compose.yml           # Docker compose configuration
```

---

## 🎉 Production System

Kynso is live at:
- **Main Domain**: kynso.ch
- **Server**: 83.228.225.166
- **Tenants**:
  - Finaro: https://finaro.kynso.ch
  - Demo: https://demo.kynso.ch

See [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) for production details.

---

## 🔄 Workflow

### Daily Development

1. **Entwickeln & Testen** im TEST environment (branch: `test`)
2. **Live schalten** via Pull Request `test → main`

### Common Commands

```bash
# Start TEST backend
cd src/backend/RP.CRM.Api && dotnet run --launch-profile Test

# Start TEST frontend
cd src/frontend && npm run start:test

# Create migration
cd src/backend/RP.CRM.Api && dotnet ef migrations add MigrationName

# Apply migration
dotnet ef database update

# Run tests
cd src/backend/RP.CRM.Tests && dotnet test
```

---

## 📞 Support

- **Documentation**: See [docs/](docs/) folder
- **Issues**: Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Startup**: See [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
- **Tenant Management**: See [TENANT_WORKFLOW.md](docs/TENANT_WORKFLOW.md)

---

## 📝 License

Copyright © 2025 Kynso

---

**Ready to start?** 👉 See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for the quick start guide!
