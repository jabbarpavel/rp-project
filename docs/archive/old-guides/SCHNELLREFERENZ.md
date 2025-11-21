# 🚀 Schnellreferenz - Kynso CRM Entwicklung

Kompakte Übersicht der wichtigsten Befehle für den täglichen Gebrauch.

---

## 🎯 Umgebungen auf einen Blick

| Umgebung | Branch | Datenbank | Backend-Port | Frontend-Port |
|----------|--------|-----------|--------------|---------------|
| **DEV** | `dev` | kynso_dev | 5015 | 4200 |
| **TEST** | `test` | kynso_test | 5016 | 4300 |
| **PROD** | `main` | Server DB | 5020 | - |

---

## 🏃 Starten

### DEV (Development)
```bash
# Backend (Terminal 1)
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Frontend (Terminal 2)
cd src/frontend
npm run start:dev
# oder einfach: npm start (nutzt dev als Standard)
# Öffnet: http://localhost:4200
```

### TEST (Testing)
```bash
# Backend (Terminal 1)
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Test

# Frontend (Terminal 2)
cd src/frontend
npm run start:test
# Öffnet: http://localhost:4300
```

---

## 🗄️ Datenbank

### Migration erstellen
```bash
cd src/backend/RP.CRM.Api
dotnet ef migrations add MeineMigrationName
```

### Migration anwenden - DEV
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
dotnet ef database update
```

### Migration anwenden - TEST
```bash
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Test"  # PowerShell
dotnet ef database update
```

### Datenbank neu erstellen
```bash
psql -U postgres
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;
\q
```

---

## 🔄 Workflow

### 1. In DEV entwickeln
```bash
git checkout dev
# ... entwickeln ...
git add .
git commit -m "Deine Änderung"
```

### 2. Zu TEST pushen
```bash
git checkout test
git merge dev
git push origin test
# ... lokal testen auf Port 4300 ...
```

### 3. Zu PRODUCTION pushen
```bash
git checkout main
git merge test
git push origin main
# ... automatisches Deployment zu kynso.ch ...
```

---

## 🔧 Häufige Befehle

### Git Branch wechseln
```bash
git checkout dev      # Zu DEV
git checkout test     # Zu TEST
git checkout main     # Zu MAIN
```

### Backend starten (verschiedene Wege)
```bash
# Weg 1: Mit Launch-Profil (empfohlen)
dotnet run --launch-profile Development
dotnet run --launch-profile Test

# Weg 2: Mit Umgebungsvariable
$env:ASPNETCORE_ENVIRONMENT="Development"  # PowerShell
export ASPNETCORE_ENVIRONMENT=Development  # Bash
dotnet run
```

### Frontend Build
```bash
npm run build:dev      # Development Build
npm run build:test     # Test Build
npm run build:prod     # Production Build
```

### .NET Version prüfen
```bash
dotnet --version
# Sollte 8.0.x zeigen (nicht 10.x!)
```

---

## 🐛 Schnelle Problemlösungen

### Problem: Port bereits belegt
```bash
# Windows
netstat -ano | findstr :5015
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5015 | xargs kill -9
```

### Problem: .NET 10.0 statt 8.0
```bash
# Prüfen
cat global.json
# Sollte "version": "8.0.416" enthalten
```

### Problem: PostgreSQL läuft nicht
```bash
# Windows
Start-Service postgresql

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

### Problem: CORS-Fehler
→ Backend muss laufen und korrekte Umgebung haben
→ Backend-Log prüfen: "✅ CORS allowed origins"

---

## 📍 Wichtige URLs

### Development
- Frontend: http://localhost:4200
- Backend: http://localhost:5015
- API-Docs: http://localhost:5015/scalar/v1

### Test
- Frontend: http://localhost:4300
- Backend: http://localhost:5016
- API-Docs: http://localhost:5016/scalar/v1

### Production
- Frontend: https://finaro.kynso.ch oder https://demo.kynso.ch
- Backend: https://kynso.ch (Port 5020)

---

## 📦 Installation (Erstmalig)

```bash
# 1. Repository klonen
git clone https://github.com/jabbarpavel/rp-project.git
cd rp-project

# 2. Branches erstellen
git checkout -b dev
git push -u origin dev
git checkout -b test
git push -u origin test
git checkout main

# 3. Datenbanken erstellen
psql -U postgres
CREATE DATABASE kynso_dev;
CREATE DATABASE kynso_test;
\q

# 4. Backend-Abhängigkeiten
cd src/backend/RP.CRM.Api
dotnet restore

# 5. Frontend-Abhängigkeiten
cd src/frontend
npm install

# 6. Migrationen anwenden
cd src/backend/RP.CRM.Api
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

---

## 💡 Tipps

- **Immer** zuerst in DEV entwickeln
- **Immer** in TEST lokal testen
- **Erst dann** zu MAIN pushen
- **Regelmäßig** committen
- **Vor Merge** testen

---

## 🔗 Weitere Dokumentation

- [WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md) - Vollständige Anleitung
- [LOCAL_DEVELOPMENT_SETUP.md](LOCAL_DEVELOPMENT_SETUP.md) - Setup-Details
- [README.md](README.md) - Projekt-Übersicht

---

**Schnell-Hilfe:** Bei Problemen → Siehe [WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md) Abschnitt "Häufige Probleme"
