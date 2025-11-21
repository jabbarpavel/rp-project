# 🚑 Schnelle Hilfe für Produktions-Probleme

Falls du "Connection refused" oder ähnliche Fehler in der Produktion siehst, folge diesen schnellen Schritten:

## 1️⃣ Führe das Diagnose-Script aus

```bash
cd /opt/kynso/prod/app  # oder wo auch immer deine App liegt
./diagnose-production.sh
```

Dieses Script prüft automatisch:
- ✅ Docker Installation und Service-Status
- ✅ Container-Status (läuft/gesund)
- ✅ Port-Konfiguration (korrekte Ports)
- ✅ Datenbank-Verbindung
- ✅ Health-Endpoint Erreichbarkeit
- ✅ Umgebungsvariablen

## 2️⃣ Prüfe Container-Status

```bash
docker-compose ps
```

**Erwartet:** Alle Container sollten "Up" und "healthy" sein

**Falls Backend ungesund oder nicht läuft:**
```bash
docker-compose logs backend --tail=50
```

Achte auf:
- ✅ `Using ASPNETCORE_URLS: http://+:5000` (GUT)
- ❌ `Bound ports 5015 (localhost) and 5020` (SCHLECHT - Rebuild nötig)

## 3️⃣ Schnelle Lösung: Backend neu bauen

Falls das Backend den falschen Port verwendet (5015 statt 5000):

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

Warte 30 Sekunden, dann teste:
```bash
curl http://localhost:5000/api/health
```

## 4️⃣ Notlösung: Kompletter Neustart

Falls nichts funktioniert:

```bash
# Alles stoppen
docker-compose down

# Alles neu bauen
docker-compose build --no-cache

# Alles starten
docker-compose up -d

# Warte bis Services gesund sind (prüfe alle 10 Sekunden)
watch -n 10 'docker-compose ps'
```

## 5️⃣ User-Registrierung testen

Nachdem das Backend gesund ist:

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.com",
    "password": "FinaroAdmin2025!",
    "tenantId": 1
  }'
```

**Erwartet:** Eine JSON-Antwort mit User-Informationen

**Bei 301 Redirect Fehler:**
Du verwendest HTTPS von außerhalb des Servers. Verwende HTTP vom Server selbst.

## 📚 Weitere Hilfe

Für detaillierte Problemlösung:
- [PRODUCTION_TROUBLESHOOTING.md](docs/PRODUCTION_TROUBLESHOOTING.md) - Komplette Troubleshooting-Anleitung
- [DOCKER_PORT_FIX.md](DOCKER_PORT_FIX.md) - Port-Konfigurations-Details
- [PRODUCTION_USER_CREATION.md](docs/PRODUCTION_USER_CREATION.md) - User-Erstellungs-Anleitung

## 🆘 Immer noch Probleme?

1. Erstelle einen Diagnose-Report:
   ```bash
   ./diagnose-production.sh > diagnostic-report.txt 2>&1
   docker-compose logs >> diagnostic-report.txt
   ```

2. Prüfe den Report gegen die detaillierte Troubleshooting-Anleitung

3. Häufige Probleme:
   - Backend hört auf falschen Port → Container neu bauen
   - Datenbank nicht erreichbar → Postgres Container prüfen
   - Port 5000 bereits belegt → Konfliktierenden Prozess finden und stoppen
   - ASPNETCORE_URLS nicht gesetzt → docker-compose.yml prüfen

---

**Wichtig:** Verwende immer HTTP (`http://localhost:5000`) wenn du vom Server selbst zugreifst. Verwende nur HTTPS für externe Zugriffe.

## 🔍 Wichtigste Befehle im Überblick

```bash
# Container-Status prüfen
docker-compose ps

# Backend-Logs anzeigen
docker-compose logs backend --tail=50

# Health-Check testen
curl http://localhost:5000/api/health

# Backend neu bauen und starten
docker-compose build --no-cache backend
docker-compose up -d backend

# Datenbank-Verbindung testen
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT 1;"

# Tenants anzeigen
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT \"Id\", \"Name\", \"Domain\" FROM \"Tenants\";"

# Port-Nutzung prüfen
sudo netstat -tlnp | grep 5000

# Diagnose-Script ausführen
./diagnose-production.sh
```

## 💡 Erklärung des Problems

Dein Problem war:
```bash
ubuntu@main:~$ curl -X POST http://localhost:5000/api/user/register ...
curl: (7) Failed to connect to localhost port 5000 after 0 ms: Connection refused
```

**Mögliche Ursachen:**

1. **Backend-Container läuft nicht**
   - Lösung: `docker-compose up -d backend`

2. **Backend hört auf falschen Port** (5015 statt 5000)
   - Ursache: ASPNETCORE_URLS wird nicht respektiert
   - Lösung: Container neu bauen mit `docker-compose build --no-cache backend`

3. **Port 5000 ist nicht gebunden**
   - Ursache: Port-Mapping in docker-compose.yml fehlt oder falsch
   - Lösung: Prüfe `ports: - "5000:5000"` in docker-compose.yml

4. **Health-Check schlägt fehl**
   - Ursache: Backend startet nicht richtig, Datenbank-Problem
   - Lösung: Logs prüfen mit `docker-compose logs backend`

5. **Datenbank nicht erreichbar**
   - Ursache: Postgres-Container läuft nicht
   - Lösung: `docker-compose up -d postgres`

## ✅ Nach der Lösung

Sobald alles funktioniert:

1. **Health-Check prüfen:**
   ```bash
   curl http://localhost:5000/api/health
   # Sollte: {"status":"healthy",...} zurückgeben
   ```

2. **User erstellen:**
   ```bash
   curl -X POST http://localhost:5000/api/user/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@finaro.com","password":"FinaroAdmin2025!","tenantId":1}'
   ```

3. **Admin-Rechte setzen:**
   ```bash
   docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod
   UPDATE "Users" SET "Permissions" = 4095, "Role" = 'Admin' WHERE "Email" = 'admin@finaro.com';
   \q
   ```

4. **Login testen:**
   - Öffne: https://finaro.kynso.ch/login
   - Login mit: admin@finaro.com / FinaroAdmin2025!

---

**Aktualisiert:** 2025-11-21  
**Version:** 1.0
