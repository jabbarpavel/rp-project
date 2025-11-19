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

## 🏃 Quick Start - Lokale Entwicklung

Für lokale Entwicklung und Tests siehe **[LOCAL_DEVELOPMENT_SETUP.md](LOCAL_DEVELOPMENT_SETUP.md)** - dieser Guide erklärt:
- Wie man die Entwicklungsumgebung einrichtet
- Wie man mit localhost arbeitet statt mit Produktionsdomains
- Wie man .NET SDK Versionsprobleme löst
- Wie man die lokale Datenbank konfiguriert

Für detaillierte Setup-Anweisungen siehe **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

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
