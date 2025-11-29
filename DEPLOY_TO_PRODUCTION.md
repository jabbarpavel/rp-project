# 🚀 Deployment auf Production - Schnellanleitung

## ✅ Voraussetzung

Deine Änderungen sind bereits auf GitHub im `main` Branch? **Dann direkt zu den 3 Schritten!** ⬇️

<details>
<summary>⚠️ Falls du lokale Änderungen hast, die noch nicht auf GitHub sind:</summary>

```bash
# Auf deinem lokalen Computer:
git add .
git commit -m "Deine Änderung"
git push origin main    # ⭐ Push zu GitHub!
```

> Ohne `git push origin main` sieht der Production Server deine Änderungen nicht!

</details>

---

## 📋 3 Schritte zum Production Deployment

### Schritt 1: Mit Server verbinden (SSH)

```bash
ssh ubuntu@83.228.225.166
```

> **Hinweis**: Falls du keinen SSH-Zugang hast, frage nach dem SSH-Key oder Passwort.

---

### Schritt 2: Zum App-Verzeichnis wechseln

```bash
cd /opt/kynso/prod/app
```

---

### Schritt 3: Code aktualisieren und Container neu starten

```bash
# Neuesten Code von GitHub holen
git pull origin main

# Container neu bauen und starten
docker-compose down
docker-compose up -d --build

# Warte 30-60 Sekunden, dann Status prüfen
docker-compose ps
```

---

## 🔍 Troubleshooting: Änderungen erscheinen nicht?

Falls deine Änderungen nach den 3 Schritten nicht sichtbar sind:

```bash
# 1. Prüfe ob git pull erfolgreich war
cd /opt/kynso/prod/app
git log --oneline -3
# ➜ Siehst du deinen Commit? Falls nicht: git pull origin main

# 2. Prüfe ob Container neu gebaut wurden
docker-compose ps
# ➜ Alle Container müssen "running (healthy)" zeigen

# 3. Falls Container nicht healthy: Logs prüfen
docker-compose logs backend | tail -50
docker-compose logs frontend | tail -50

# 4. Container komplett neu bauen (ohne Cache)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Browser-Cache leeren (Ctrl+Shift+R oder Inkognito-Modus)
```

---

## ✅ Erfolg überprüfen

### Container Status prüfen
```bash
docker-compose ps
```

**Erwartet:**
```
kynso-postgres    running (healthy)
kynso-backend     running (healthy)
kynso-frontend    running (healthy)
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

**Erwartet:**
```json
{"status":"healthy","timestamp":"...","service":"Kynso CRM API","database":"connected"}
```

### Im Browser testen
- https://finaro.kynso.ch/login
- https://demo.kynso.ch/login

---

## 🔧 Häufige Szenarien

### Nur Backend aktualisieren

```bash
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build backend
docker-compose logs backend | tail -50
```

### Nur Frontend aktualisieren

```bash
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build frontend
docker-compose logs frontend | tail -50
```

### Logs ansehen bei Problemen

```bash
# Alle Logs
docker-compose logs

# Nur Backend Logs
docker-compose logs backend -f

# Nur Frontend Logs
docker-compose logs frontend -f

# Drücke Ctrl+C zum Beenden
```

---

## 🔄 Kompletter Workflow: Dev → Test → Production

```bash
# 1. Entwickeln auf DEV
git checkout dev
# ... Code ändern ...
git add .
git commit -m "Meine Änderung"
git push origin dev  # Sichern auf GitHub

# 2. Testen auf TEST
git checkout test
git merge dev
git push origin test  # Sichern auf GitHub

# 3. Freigeben auf MAIN (idealerweise via Pull Request)
git checkout main
git merge test
git push origin main

# 4. Production Deployment
ssh ubuntu@83.228.225.166
cd /opt/kynso/prod/app
git pull origin main
docker-compose up -d --build
```

---

## ⚠️ Wichtige Hinweise

| ✅ DO | ❌ DON'T |
|-------|----------|
| Immer zuerst in DEV/TEST testen | Nie ungetesteten Code deployen |
| `git pull` VOR `docker-compose build` | Nie ohne `git pull` neu bauen |
| Logs nach Deployment prüfen | Nie Probleme ignorieren |
| Außerhalb der Hauptnutzungszeit deployen | Nie während Rush Hour |

---

## 🆘 Notfall-Rollback

Falls etwas schiefgeht:

```bash
# Letzte Commits anzeigen
git log --oneline -5

# Zurück zu vorherigem Commit (bleibt auf main Branch)
git reset --hard <commit-hash>

# Container neu starten
docker-compose up -d --build
```

---

## 📚 Weitere Dokumentation

- [DEPLOYMENT_WORKFLOW.md](docs/DEPLOYMENT_WORKFLOW.md) - Detaillierter Workflow
- [PRODUCTION_QUICK_FIX.md](PRODUCTION_QUICK_FIX.md) - Schnellhilfe bei Problemen
- [CI_CD_SETUP.md](docs/CI_CD_SETUP.md) - Automatisches Deployment Setup

---

**Fragen?** Öffne ein Issue auf GitHub oder schaue in die [Troubleshooting](docs/TROUBLESHOOTING.md) Dokumentation.
