# Kynso - Multi-Tenant Customer Relationship Management

Ein modernes, Multi-Tenant CRM System gebaut mit .NET 8 und Angular.

## 🚀 Features

- ✅ Multi-Tenant Architektur
- ✅ Role-Based Access Control (RBAC)
- ✅ Customer Management (CRUD)
- ✅ Document Management (Upload/Download/Delete)
- ✅ User Management mit Permissions
- ✅ RESTful API mit Swagger/Scalar Dokumentation
- ✅ Responsive Angular Frontend
- ✅ PostgreSQL Datenbank
- ✅ JWT Authentication

## 📋 Voraussetzungen

### Entwicklung:
- .NET 8.0 SDK
- Node.js 20.x oder höher
- PostgreSQL 14 oder höher
- VS Code oder Visual Studio

## 🏃 Quick Start

### 1️⃣ Umgebung einrichten

**Windows PowerShell:**
```powershell
.\setup-environment.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-environment.sh
./setup-environment.sh
```

### 2️⃣ Backend starten (DEV)
```powershell
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Development
```

### 3️⃣ Frontend starten (DEV)
```powershell
cd src\frontend
npm install
npm start
```

## 📚 Wichtige Dokumentation

### Entwicklung
- **[START_HIER.md](START_HIER.md)** - Schnellstart für neue Entwickler
- **[SCHNELLSTART.md](SCHNELLSTART.md)** - Kurzanleitung zum Loslegen
- **[WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md)** - Vollständiger DEV/TEST/MAIN Workflow
- **[SCHNELLREFERENZ.md](SCHNELLREFERENZ.md)** - Befehls-Referenz
- **[LOCAL_DEVELOPMENT_SETUP.md](LOCAL_DEVELOPMENT_SETUP.md)** - Lokale Entwicklungsumgebung

### Datenbank
- **[DATENBANK_RESET_ANLEITUNG.md](DATENBANK_RESET_ANLEITUNG.md)** - ⚠️ **NEU!** Migrations-Probleme beheben

### Setup & Deployment
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detaillierte Setup-Anweisungen

---

## 🌐 Production Deployment

### 📚 Dokumentation

#### 🎯 [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) - **KYNSO PRODUCTION SETUP**
Kompletter Setup Guide für Kynso Production System mit:
- Domain: kynso.ch
- Mandanten: finaro.kynso.ch & demo.kynso.ch
- Server IP: 83.228.225.166

#### 🚀 [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)
Allgemeiner Production Deployment Guide (Server, Nginx, SSL, Backups)

#### 🐳 [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)
Docker-basierte Deployment Alternative

#### 🔄 [CI_CD_SETUP.md](docs/CI_CD_SETUP.md)
GitHub Actions für Automatisierung

#### ✅ [PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md)
Go-Live Checkliste mit 100+ Punkten

---

## 🔧 Deployment Optionen

### Option 1: Kynso Production Setup
Folge [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md)

### Option 2: Allgemeines Deployment
Folge [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

### Option 3: Docker Deployment
Folge [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)

---

## 🛠️ Technologie Stack

**Backend**: .NET 8.0, Entity Framework Core, PostgreSQL, JWT  
**Frontend**: Angular 20, TypeScript, RxJS  
**DevOps**: Docker, Nginx, GitHub Actions, Let's Encrypt

---

## 🎉 Production System

Kynso läuft bereits auf:
- **Domain**: kynso.ch
- **Server**: 83.228.225.166
- **Finaro**: https://finaro.kynso.ch
- **Demo**: https://demo.kynso.ch

Siehe [Kynso_Setup_guide.md](docs/Kynso_Setup_guide.md) für Details! 🚀
