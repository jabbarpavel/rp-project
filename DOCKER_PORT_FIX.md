# 🔧 Docker Port Binding Fix - Zusammenfassung

## Problem

Das Backend in Docker wurde auf Port 5000 gemappt (`5000:5000` in docker-compose.yml), aber die Anwendung hörte nicht auf diesem Port. Stattdessen lauschte sie auf Port 5015/5020 aufgrund einer hardcodierten Kestrel-Konfiguration in `Program.cs`.

### Symptome
- Docker-Container lief (`docker ps` zeigte Container als "running")
- Port Mapping zeigte `0.0.0.0:5000->5000/tcp`
- Health Check schlug fehl (Container als "unhealthy" markiert)
- curl-Requests auf Port 5000 schlugen fehl: "Connection reset by peer"
- Backend-Logs zeigten: "Bound ports 5015 (localhost) and 5020 (all IPs)"

## Root Cause

Die Kestrel-Konfiguration in `Program.cs` hatte **immer** die Ports hardcodiert:

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5015);
    options.ListenAnyIP(5020);
});
```

Dies überschrieb die Umgebungsvariable `ASPNETCORE_URLS=http://+:5000`, die in `Dockerfile.backend` und `docker-compose.yml` gesetzt wurde.

## Lösung

Die Kestrel-Konfiguration wurde angepasst, um `ASPNETCORE_URLS` zu respektieren:

```csharp
var aspnetcoreUrls = builder.Configuration["ASPNETCORE_URLS"];
if (string.IsNullOrEmpty(aspnetcoreUrls))
{
    // Lokale Entwicklung - verwende custom ports
    builder.WebHost.ConfigureKestrel(options =>
    {
        if (environment == "Test")
        {
            options.ListenLocalhost(5016);
            options.ListenAnyIP(5021);
        }
        else
        {
            options.ListenLocalhost(5015);
            options.ListenAnyIP(5020);
        }
    });
}
else
{
    // Docker/Production - verwende ASPNETCORE_URLS
    Console.WriteLine($"✅ Using ASPNETCORE_URLS: {aspnetcoreUrls}");
}
```

## Verhalten nach dem Fix

### Docker/Production (mit ASPNETCORE_URLS)
```bash
# Im Container wird gesetzt:
ASPNETCORE_URLS=http://+:5000

# Backend lauscht auf:
Port 5000 (alle Interfaces)

# Zugriff möglich über:
http://localhost:5000/api/health          # Vom Server aus
http://83.228.225.166:5000/api/health     # Von extern
https://finaro.kynso.ch/api/health        # Über Nginx
```

### Lokale Entwicklung (ohne ASPNETCORE_URLS)
```bash
# Development Environment:
dotnet run --launch-profile Development
# Lauscht auf: localhost:5015, 0.0.0.0:5020

# Test Environment:
dotnet run --launch-profile Test
# Lauscht auf: localhost:5016, 0.0.0.0:5021
```

## Deployment-Schritte

Nach dem Pull des Updates:

1. **Code aktualisieren:**
   ```bash
   cd /opt/kynso/prod/app
   git pull origin main
   ```

2. **Backend Container neu bauen und starten:**
   ```bash
   docker-compose up -d --build backend
   ```

3. **Überprüfen:**
   ```bash
   # Container Status
   docker-compose ps
   
   # Backend Logs
   docker-compose logs backend | tail -20
   
   # Sollte zeigen:
   # ✅ Using ASPNETCORE_URLS: http://+:5000
   
   # Health Check testen
   curl http://localhost:5000/api/health
   ```

4. **User erstellen:**
   ```bash
   # Finaro User
   curl -X POST http://localhost:5000/api/user/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@finaro.com","password":"FinaroAdmin2025!","tenantId":1}'
   
   # Demo User
   curl -X POST http://localhost:5000/api/user/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@demo.com","password":"DemoAdmin2025!","tenantId":2}'
   ```

5. **Admin-Rechte setzen:**
   ```bash
   docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod
   
   UPDATE "Users" SET "Permissions" = 4095, "Role" = 'Admin' 
   WHERE "Email" = 'admin@finaro.com';
   
   UPDATE "Users" SET "Permissions" = 4095, "Role" = 'Admin' 
   WHERE "Email" = 'admin@demo.com';
   
   \q
   ```

6. **Login testen:**
   - Finaro: https://finaro.kynso.ch/login
   - Demo: https://demo.kynso.ch/login

## Technische Details

### Warum hat das nicht funktioniert?

In ASP.NET Core gibt es eine **Prioritätsreihenfolge** für die Port-Konfiguration:

1. ✅ **WebHost.ConfigureKestrel()** - Höchste Priorität (wurde verwendet)
2. ❌ **ASPNETCORE_URLS** - Wurde durch ConfigureKestrel überschrieben
3. ❌ **launchSettings.json** - Nur für local development

Da `ConfigureKestrel()` **immer** aufgerufen wurde, hatte `ASPNETCORE_URLS` keine Wirkung.

### Die Lösung

Durch das **Prüfen** ob `ASPNETCORE_URLS` gesetzt ist, können wir zwischen Docker und lokaler Entwicklung unterscheiden:
- **Docker:** Setzt ASPNETCORE_URLS → Keine ConfigureKestrel-Konfiguration → Port 5000
- **Lokal:** Keine ASPNETCORE_URLS → ConfigureKestrel aktiv → Port 5015/5016

## Vorteile

✅ **Flexible Konfiguration:** Docker und lokale Entwicklung funktionieren beide  
✅ **Standard-Konvention:** Docker verwendet die übliche ASPNETCORE_URLS Konvention  
✅ **Keine Breaking Changes:** Lokale Entwicklung funktioniert weiterhin wie gewohnt  
✅ **Health Checks funktionieren:** Docker Health Checks auf Port 5000 funktionieren jetzt  
✅ **User-Erstellung möglich:** API-Requests auf Port 5000 funktionieren

## Troubleshooting

Falls nach dem Update weiterhin Probleme auftreten:

1. **Container komplett neu starten:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. **Logs prüfen:**
   ```bash
   docker-compose logs backend | grep -E "Using ASPNETCORE_URLS|Bound ports"
   ```
   
   Erwartete Ausgabe: `✅ Using ASPNETCORE_URLS: http://+:5000`
   
   Falls immer noch "Bound ports 5015..." erscheint, wurde der Container nicht neu gebaut.

3. **Image neu bauen erzwingen:**
   ```bash
   docker-compose build --no-cache backend
   docker-compose up -d backend
   ```

## Weitere Informationen

- **Dokumentation:** `docs/PRODUCTION_USER_CREATION.md`
- **Quick Reference:** `production-create-users.http`
- **Health Check:** `docs/SERVICE_TESTING.md`

---

**Status:** ✅ Behoben  
**Commit:** 9d4e876  
**Datum:** 2025-11-21
