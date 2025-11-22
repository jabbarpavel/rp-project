# 🔧 Production Troubleshooting Guide - Connection Refused

## Problem

When trying to connect to the backend API in production, you get:

```bash
curl -X POST http://localhost:5000/api/user/register
curl: (7) Failed to connect to localhost port 5000 after 0 ms: Connection refused
```

This guide will help you diagnose and fix the issue step by step.

---

## Quick Diagnosis

Run this diagnostic script on your production server:

```bash
cd /opt/kynso/prod/app  # or wherever your app is located
./diagnose-production.sh
```

This script will check all common issues and provide specific solutions.

---

## Step-by-Step Troubleshooting

### Step 1: Check if Docker Container is Running

```bash
docker-compose ps
```

**Expected Output:**
```
NAME                IMAGE                     STATUS
kynso-backend       rp-project-backend        Up X minutes (healthy)
kynso-postgres      postgres:15-alpine        Up X minutes (healthy)
kynso-frontend      rp-project-frontend       Up X minutes (healthy)
```

**If backend is not running:**
```bash
docker-compose up -d backend
```

**If backend is "unhealthy":**
Continue to Step 2.

---

### Step 2: Check Backend Logs

```bash
docker-compose logs backend --tail=50
```

**Look for these key messages:**

✅ **Good Signs:**
```
✅ Using ASPNETCORE_URLS: http://+:5000
✅ Database migrations applied successfully!
Now listening on: http://[::]:5000
Application started. Press Ctrl+C to shut down.
```

❌ **Bad Signs:**
```
❌ Bound ports 5015 (localhost) and 5021 (all IPs)
❌ Migration failed: <error>
❌ Connection to database failed
```

**If you see "Bound ports 5015":**
The container is using the old configuration. Rebuild:
```bash
docker-compose down
docker-compose up -d --build backend
```

**If database connection fails:**
Continue to Step 3.

---

### Step 3: Check Database Connectivity

```bash
# Test if PostgreSQL is accessible from the backend container
docker exec -it kynso-backend bash -c "apt-get update && apt-get install -y postgresql-client && psql -h postgres -U kynso_user -d kynso_prod -c 'SELECT 1;'"
```

**Or simpler:**
```bash
docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT COUNT(*) FROM \"Tenants\";"
```

**If this fails:**
- Check if postgres container is running: `docker ps | grep postgres`
- Check postgres logs: `docker-compose logs postgres`
- Verify network: `docker network ls | grep kynso`

---

### Step 4: Check Port Binding

```bash
# Check if port 5000 is bound on the host
sudo netstat -tlnp | grep 5000
```

**Expected Output:**
```
tcp6       0      0 :::5000                 :::*                    LISTEN      <pid>/docker-proxy
```

**If port 5000 is not listed:**
The container is not exposing the port correctly. Check docker-compose.yml:
```yaml
backend:
  ports:
    - "5000:5000"  # This line should exist
```

**If another process is using port 5000:**
```bash
# Find what's using the port
sudo lsof -i :5000

# Kill the process (if safe to do so)
sudo kill -9 <PID>

# Restart backend
docker-compose restart backend
```

---

### Step 5: Check Health Endpoint

```bash
# From inside the container
docker exec -it kynso-backend curl -f http://localhost:5000/api/health

# From the host
curl http://localhost:5000/api/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T22:30:00Z",
  "service": "Kynso CRM API",
  "database": "connected"
}
```

**If this fails:**
- Check logs: `docker-compose logs backend`
- Verify database connection in Step 3
- Check if migrations were applied

---

### Step 6: Verify Docker Compose Configuration

Check that your `docker-compose.yml` has the correct configuration:

```yaml
backend:
  environment:
    - ASPNETCORE_ENVIRONMENT=Production
    - ASPNETCORE_URLS=http://+:5000  # CRITICAL: This must be set
  ports:
    - "5000:5000"  # Port mapping
```

**After any changes:**
```bash
docker-compose down
docker-compose up -d --build
```

---

### Step 7: Complete Rebuild (Nuclear Option)

If nothing works, do a complete rebuild:

```bash
# Stop and remove everything
docker-compose down -v

# Pull latest code
git pull origin main

# Rebuild images from scratch
docker-compose build --no-cache

# Start everything
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Check logs
docker-compose logs backend | tail -50
```

**⚠️ WARNING:** The `-v` flag removes volumes, including the database! Only use this if you have backups or in development.

**For production (preserve database):**
```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

---

## Common Issues and Solutions

### Issue 1: 405 Not Allowed on Login/API Requests

**Symptoms:**
```
POST https://finaro.kynso.ch/user/login 405 (Not Allowed)
```

Browser console shows:
```
POST https://finaro.kynso.ch/user/login 405 (Not Allowed)
```

Nginx logs show:
```
172.18.0.1 - - [22/Nov/2025:16:16:28 +0000] "POST /user/login HTTP/1.0" 405 559
```

**Root Cause:**
The frontend container's nginx configuration is missing proxy rules to forward API requests to the backend.

**Solution:**

The `docker/nginx.conf` file must include proxy blocks for backend endpoints. Check if these sections exist:

```nginx
# Backend API endpoints
location /api/ {
    proxy_pass http://backend:5000/api/;
    # ... proxy headers ...
}

# Backend User endpoints (for /user/login and /user/register)
location /user/ {
    proxy_pass http://backend:5000/user/;
    # ... proxy headers ...
}
```

**If these sections are missing:**

1. Update `docker/nginx.conf` with the correct proxy configuration
2. Rebuild the frontend container:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```
3. Verify the fix:
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Test login from the browser or:
   curl -X POST https://finaro.kynso.ch/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

**Why this happens:**
- The frontend makes API calls to the same domain (e.g., `https://finaro.kynso.ch/user/login`)
- Without proxy rules, nginx tries to serve these as static files
- Static files don't support POST/PUT/DELETE methods → 405 error
- The proxy configuration forwards requests to the backend container

---

### Issue 2: Container Keeps Restarting

**Symptoms:**
```bash
docker-compose ps
# Shows: Restarting (X) Y seconds ago
```

**Diagnosis:**
```bash
docker-compose logs backend --tail=100
```

**Solutions:**
- **Database connection error:** Check connection string in docker-compose.yml
- **Migration error:** Check if database exists and is accessible
- **Port already in use:** Check Step 4
- **Missing environment variables:** Verify docker-compose.yml configuration

---

### Issue 3: Health Check Fails

**Symptoms:**
```bash
docker-compose ps
# Shows: Up X minutes (unhealthy)
```

**Diagnosis:**
```bash
docker inspect kynso-backend | grep -A 10 Health
```

**Solutions:**
- Backend is not listening on port 5000 → Check logs for "Using ASPNETCORE_URLS"
- Database is not accessible → Check postgres container and connection
- curl is missing in container → Should not happen, but rebuild if needed

---

### Issue 4: Port 5000 Conflict

**Symptoms:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5000: bind: address already in use
```

**Solution:**
```bash
# Find what's using port 5000
sudo lsof -i :5000
sudo netstat -tlnp | grep 5000

# If it's an old docker-proxy:
docker-compose down
docker-compose up -d

# If it's another service:
# Either stop that service or change the port in docker-compose.yml:
ports:
  - "5001:5000"  # Use port 5001 on host instead
```

---

### Issue 5: Database Connection Fails

**Symptoms:**
```
Migration failed: Could not connect to server
```

**Solutions:**

1. **Check if postgres is running:**
   ```bash
   docker-compose ps postgres
   ```

2. **Check postgres logs:**
   ```bash
   docker-compose logs postgres
   ```

3. **Verify connection string:**
   ```bash
   docker exec -it kynso-backend printenv | grep ConnectionStrings
   ```
   Should show: `Host=postgres;Database=kynso_prod;Username=kynso_user;Password=...`

4. **Test connection manually:**
   ```bash
   docker exec -it kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT 1;"
   ```

5. **Ensure backend waits for postgres:**
   In docker-compose.yml:
   ```yaml
   backend:
     depends_on:
       postgres:
         condition: service_healthy
   ```

---

### Issue 6: Wrong Port Configuration

**Symptoms:**
Logs show:
```
✅ Bound ports 5015 (localhost) and 5020 (all IPs)
```
Instead of:
```
✅ Using ASPNETCORE_URLS: http://+:5000
```

**Solution:**
The backend is not recognizing `ASPNETCORE_URLS`. Rebuild:
```bash
docker-compose build --no-cache backend
docker-compose up -d backend

# Verify logs
docker-compose logs backend | grep -E "ASPNETCORE_URLS|Bound ports"
```

**Expected Output:**
```
✅ Using ASPNETCORE_URLS: http://+:5000
```

---

## Testing After Fix

After resolving the issue, test the following:

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "tenantId": 1
  }'
```

### 3. External Access (from your computer)
```bash
curl https://finaro.kynso.ch/api/health
```

---

## Prevention

To avoid these issues in the future:

1. **Always check container status after deployment:**
   ```bash
   docker-compose ps
   docker-compose logs backend | tail -20
   ```

2. **Set up monitoring:**
   - Use the health check endpoint: `/api/health`
   - Monitor Docker container status
   - Check logs regularly

3. **Use the diagnostic script:**
   ```bash
   ./diagnose-production.sh
   ```
   Run this after every deployment to catch issues early.

4. **Document your deployment:**
   Keep track of:
   - What version is deployed
   - When it was deployed
   - What changes were made
   - Any issues encountered

---

## Getting Help

If you still have issues after following this guide:

1. **Collect diagnostic information:**
   ```bash
   # Create a diagnostic report
   echo "=== Docker Compose Status ===" > diagnostic-report.txt
   docker-compose ps >> diagnostic-report.txt
   echo "" >> diagnostic-report.txt
   
   echo "=== Backend Logs ===" >> diagnostic-report.txt
   docker-compose logs backend --tail=100 >> diagnostic-report.txt
   echo "" >> diagnostic-report.txt
   
   echo "=== Postgres Logs ===" >> diagnostic-report.txt
   docker-compose logs postgres --tail=50 >> diagnostic-report.txt
   echo "" >> diagnostic-report.txt
   
   echo "=== Port Bindings ===" >> diagnostic-report.txt
   sudo netstat -tlnp | grep -E "5000|5432" >> diagnostic-report.txt
   echo "" >> diagnostic-report.txt
   
   echo "=== Docker Networks ===" >> diagnostic-report.txt
   docker network ls >> diagnostic-report.txt
   docker network inspect kynso-network >> diagnostic-report.txt
   ```

2. **Check documentation:**
   - [DOCKER_PORT_FIX.md](../DOCKER_PORT_FIX.md)
   - [PRODUCTION_USER_CREATION.md](PRODUCTION_USER_CREATION.md)
   - [HTTP_VS_HTTPS_GUIDE.md](HTTP_VS_HTTPS_GUIDE.md)

3. **Review recent changes:**
   ```bash
   git log --oneline -10
   git diff HEAD~1 docker-compose.yml
   git diff HEAD~1 src/backend/RP.CRM.Api/Program.cs
   ```

---

## Summary Checklist

When troubleshooting connection refused errors, check:

- [ ] Docker containers are running (`docker-compose ps`)
- [ ] Backend logs show correct port (`docker-compose logs backend`)
- [ ] Database is accessible (`docker exec -it kynso-postgres psql ...`)
- [ ] Port 5000 is bound on host (`sudo netstat -tlnp | grep 5000`)
- [ ] Health endpoint responds (`curl http://localhost:5000/api/health`)
- [ ] ASPNETCORE_URLS is set in docker-compose.yml
- [ ] No port conflicts with other services

---

**Last Updated:** 2025-11-22
**Version:** 1.1 - Added 405 Not Allowed troubleshooting
