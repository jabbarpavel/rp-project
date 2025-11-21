# 🚑 Quick Fix Guide for Production Issues

If you're seeing "Connection refused" or similar errors in production, follow these quick steps:

## 1️⃣ Run the Diagnostic Script

```bash
cd /opt/kynso/prod/app  # or wherever your app is located
./diagnose-production.sh
```

This script will automatically check:
- ✅ Docker installation and service status
- ✅ Container status (running/healthy)
- ✅ Port configuration (correct ports)
- ✅ Database connectivity
- ✅ Health endpoint availability
- ✅ Environment variables

## 2️⃣ Check Container Status

```bash
docker-compose ps
```

**Expected:** All containers should be "Up" and "healthy"

**If backend is unhealthy or not running:**
```bash
docker-compose logs backend --tail=50
```

Look for:
- ✅ `Using ASPNETCORE_URLS: http://+:5000` (GOOD)
- ❌ `Bound ports 5015 (localhost) and 5020` (BAD - needs rebuild)

## 3️⃣ Quick Fix: Rebuild Backend

If the backend is using the wrong port (5015 instead of 5000):

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

Wait 30 seconds, then test:
```bash
curl http://localhost:5000/api/health
```

## 4️⃣ Nuclear Option: Complete Restart

If nothing works:

```bash
# Stop everything
docker-compose down

# Rebuild everything
docker-compose build --no-cache

# Start everything
docker-compose up -d

# Wait for services to be healthy (check every 10 seconds)
watch -n 10 'docker-compose ps'
```

## 5️⃣ Test User Registration

After the backend is healthy:

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.com",
    "password": "FinaroAdmin2025!",
    "tenantId": 1
  }'
```

**Expected:** A JSON response with user information

**If 301 redirect error:**
You're using HTTPS from outside the server. Use HTTP from the server itself.

## 📚 More Help

For detailed troubleshooting:
- [PRODUCTION_TROUBLESHOOTING.md](docs/PRODUCTION_TROUBLESHOOTING.md) - Complete troubleshooting guide
- [DOCKER_PORT_FIX.md](DOCKER_PORT_FIX.md) - Port configuration details
- [PRODUCTION_USER_CREATION.md](docs/PRODUCTION_USER_CREATION.md) - User creation guide

## 🆘 Still Having Issues?

1. Generate a diagnostic report:
   ```bash
   ./diagnose-production.sh > diagnostic-report.txt 2>&1
   docker-compose logs >> diagnostic-report.txt
   ```

2. Review the report and check against the detailed troubleshooting guide

3. Common issues:
   - Backend listening on wrong port → Rebuild container
   - Database not accessible → Check postgres container
   - Port 5000 already in use → Find and stop conflicting process
   - ASPNETCORE_URLS not set → Check docker-compose.yml

---

**Remember:** Always use HTTP (`http://localhost:5000`) when accessing from the server itself. Only use HTTPS when accessing from external sources.
