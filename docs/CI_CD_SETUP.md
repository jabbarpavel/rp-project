# CI/CD Pipeline Setup Guide

## 📋 Übersicht

Dieses Dokument erklärt, wie du die GitHub Actions CI/CD Pipeline für automatische Tests und Deployments einrichtest.

## 🎯 Was die Pipeline macht

### Bei jedem Push/Pull Request:
1. ✅ Backend Tests ausführen
2. ✅ Frontend Tests ausführen
3. ✅ Code linting

### Bei Push auf Main Branch:
4. ✅ Docker Images bauen
5. ✅ Optional: Automatisches Deployment

## 🚀 Pipeline einrichten

### Schritt 1: GitHub Secrets konfigurieren

Gehe zu deinem Repository auf GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

#### Erforderliche Secrets:

**Für Docker Hub (Optional)**:
- `DOCKER_USERNAME`: Dein Docker Hub Username
- `DOCKER_PASSWORD`: Dein Docker Hub Password oder Access Token

**Für Production Deployment**:
- `PRODUCTION_HOST`: IP oder Hostname deines Production Servers
- `PRODUCTION_USER`: SSH Username (z.B. `root` oder `rp-crm`)
- `PRODUCTION_SSH_KEY`: Private SSH Key für Server-Zugang

### Schritt 2: SSH Key erstellen (für Deployment)

#### Auf deinem lokalen Computer:
```bash
# SSH Key Paar erstellen
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_rp_crm

# Privaten Key anzeigen (für GitHub Secret)
cat ~/.ssh/github_actions_rp_crm

# Öffentlichen Key anzeigen
cat ~/.ssh/github_actions_rp_crm.pub
```

#### Auf dem Production Server:
```bash
# Als deployment user einloggen
ssh root@your-server-ip

# Public Key zum Server hinzufügen
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Füge den öffentlichen Key ein (github_actions_rp_crm.pub Inhalt)

# Permissions setzen
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### In GitHub:
1. Gehe zu Repository Settings → Secrets → New secret
2. Name: `PRODUCTION_SSH_KEY`
3. Value: Inhalt von `~/.ssh/github_actions_rp_crm` (privater Key)

### Schritt 3: GitHub Environment erstellen

Für manuelle Deployment-Freigaben:

1. Gehe zu Repository Settings → Environments
2. Klicke "New environment"
3. Name: `production`
4. Optional: Environment protection rules aktivieren:
   - ✅ Required reviewers (empfohlen)
   - ✅ Wait timer (z.B. 5 Minuten)

## 🔧 Pipeline anpassen

### Backend Tests konfigurieren

Bearbeite `.github/workflows/ci-cd.yml`:

```yaml
backend-test:
  # Ändere .NET Version falls nötig
  env:
    DOTNET_VERSION: '8.0.x'  # oder '10.0.x'
```

### Frontend Tests konfigurieren

```yaml
frontend-test:
  # Ändere Node Version falls nötig
  env:
    NODE_VERSION: '20.x'  # oder '18.x'
```

### Deployment deaktivieren

Falls du kein automatisches Deployment möchtest:

```yaml
# Kommentiere den gesamten deploy-production Job aus
# oder entferne die Zeilen 100-130
```

## 📊 Pipeline Status

### Status Badge zum README hinzufügen

```markdown
[![CI/CD Pipeline](https://github.com/jabbarpavel/rp-project/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/jabbarpavel/rp-project/actions)
```

### Status ansehen

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf "Actions" Tab
3. Siehe alle Workflow Runs und deren Status

## 🎯 Workflow Triggers

### Automatische Triggers:

**Push auf main/develop**:
```bash
git push origin main
```

**Pull Request zu main/develop**:
```bash
# Erstelle PR auf GitHub
```

### Manuelle Triggers (Optional):

Füge zu `.github/workflows/ci-cd.yml` hinzu:

```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:  # Manueller Trigger
```

Dann kannst du Workflows manuell starten:
1. Actions Tab → CI/CD Pipeline → Run workflow

## 🔄 Deployment Prozess

### Automatisches Deployment (wenn konfiguriert):

1. Code auf `main` Branch pushen
2. Tests laufen automatisch
3. Bei erfolg: Docker Images werden gebaut
4. Deployment wartet auf Freigabe (falls Environment protection aktiviert)
5. Nach Freigabe: Deployment zum Production Server
6. Server führt aus:
   - Git Pull
   - Docker Build
   - Container Restart
   - Database Migration

### Manuelles Deployment:

Falls automatisches Deployment nicht gewünscht, nutze das Update-Script:

```bash
# Auf dem Server
cd /opt/rp-crm
./update-docker.sh
```

## 🛠️ Lokale Tests vor Push

### Backend Tests lokal:
```bash
cd src/backend
dotnet test
```

### Frontend Tests lokal:
```bash
cd src/frontend
npm test
```

### Docker Build lokal testen:
```bash
# Backend
docker build -f Dockerfile.backend -t rp-crm-backend:test .

# Frontend
docker build -f Dockerfile.frontend -t rp-crm-frontend:test .
```

## 📈 Erweiterte Konfiguration

### Matrix Testing (mehrere Versionen testen):

```yaml
backend-test:
  strategy:
    matrix:
      dotnet-version: ['8.0.x', '9.0.x']
  steps:
    - uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ matrix.dotnet-version }}
```

### Caching verbessern:

```yaml
- name: Cache .NET packages
  uses: actions/cache@v3
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
```

### Notifications hinzufügen:

```yaml
- name: Send Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

## 🔒 Sicherheits Best Practices

### Secrets Management:
- ✅ Nie Secrets im Code committen
- ✅ GitHub Secrets für sensible Daten nutzen
- ✅ Environment-spezifische Secrets verwenden
- ✅ Secrets regelmäßig rotieren

### SSH Key Security:
- ✅ Dedicated Key nur für GitHub Actions
- ✅ Key mit Passphrase schützen (optional)
- ✅ Auf Server: authorized_keys nur für diesen Key

### Workflow Permissions:
```yaml
permissions:
  contents: read
  packages: write
  deployments: write
```

## 🆘 Troubleshooting

### Tests schlagen fehl:

```bash
# Lokal die gleiche Umgebung simulieren
docker-compose -f docker-compose.test.yml up -d
cd src/backend
dotnet test
```

### Deployment schlägt fehl:

1. **SSH Verbindung prüfen**:
```bash
# Teste SSH Connection manuell
ssh -i ~/.ssh/github_actions_rp_crm user@server-ip
```

2. **Server Logs prüfen**:
```bash
# Auf dem Server
docker-compose logs -f
journalctl -u rp-crm-backend -f
```

3. **GitHub Actions Logs**:
   - Gehe zu Actions Tab
   - Klicke auf fehlgeschlagenen Run
   - Erweitere fehlgeschlagenen Step
   - Siehe detaillierte Fehler

### Docker Build schlägt fehl:

```yaml
# Füge Debugging zu Workflow hinzu
- name: Debug Docker Build
  run: |
    docker version
    docker-compose version
    ls -la
```

## 📚 Weitere Ressourcen

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Docker Build Actions**: https://github.com/docker/build-push-action
- **SSH Action**: https://github.com/appleboy/ssh-action

## ✅ Checklist

Setup Checklist:
- [ ] GitHub Secrets konfiguriert
- [ ] SSH Keys erstellt und hinzugefügt
- [ ] Production Environment erstellt
- [ ] Pipeline getestet (Push auf develop Branch)
- [ ] Deployment getestet
- [ ] Notifications konfiguriert (optional)
- [ ] Status Badge zum README hinzugefügt

---

**Tipp**: Starte mit Tests auf `develop` Branch bevor du auf `main` pushst!
