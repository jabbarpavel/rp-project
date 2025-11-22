# 🔧 Production Login Fix - Deployment Guide

## Problem Solved

Your production environment at **https://finaro.kynso.ch** was showing this error when trying to login:

```
POST https://finaro.kynso.ch/user/login 405 (Not Allowed)
```

This has been **FIXED** by adding the missing nginx proxy configuration.

---

## What Was Wrong

The frontend container's `nginx.conf` was only configured to serve static files (HTML, CSS, JS). When the Angular app tried to make API calls to `/user/login`, nginx didn't know what to do with it and returned a **405 Not Allowed** error.

### Why Dev/Test Worked But Production Didn't

- **Dev/Test**: Run on `localhost` with different ports (frontend:4200, backend:5015/5016)
  - The frontend directly connects to `http://localhost:5015/user/login`
  - No reverse proxy needed
  
- **Production**: Run with same domain (https://finaro.kynso.ch)
  - Frontend tries to call `https://finaro.kynso.ch/user/login`
  - Nginx must proxy this to the backend container
  - **The proxy rules were missing!**

---

## What Was Fixed

Updated `docker/nginx.conf` to add proxy rules:

```nginx
# Backend API endpoints
location /api/ {
    proxy_pass http://backend:5000/api/;
    # ... proper headers and timeouts ...
}

# Backend User endpoints (login/register)
location /user/ {
    proxy_pass http://backend:5000/user/;
    # ... proper headers and timeouts ...
}

# Scalar API Docs
location /scalar/ {
    proxy_pass http://backend:5000/scalar/;
    # ... proper headers ...
}
```

Now nginx knows to forward these requests to the backend container instead of trying to serve them as static files.

---

## 🚀 How to Deploy the Fix

### Step 1: Pull the Latest Code

On your production server:

```bash
cd /opt/kynso/prod/app
git pull origin main
```

**Note:** Replace `main` with the branch name where this fix is merged if different.

### Step 2: Rebuild the Frontend Container

The frontend container needs to be rebuilt with the new nginx configuration:

```bash
docker-compose build frontend
```

### Step 3: Restart the Frontend Container

```bash
docker-compose up -d frontend
```

### Step 4: Verify the Deployment

Check that the container started successfully:

```bash
docker-compose ps
```

Expected output:
```
NAME             IMAGE                STATUS
kynso-frontend   app-frontend         Up X seconds (healthy)
```

Check the logs for any errors:

```bash
docker-compose logs frontend --tail=20
```

---

## ✅ Testing the Fix

### Test 1: Health Check (Optional)

```bash
curl https://finaro.kynso.ch/api/health
```

Expected: `{"status":"healthy",...}`

### Test 2: Login from Browser

1. Go to **https://finaro.kynso.ch/login**
2. Enter your credentials
3. Click "Login"

**Expected Result:** ✅ Login should work successfully!

### Test 3: Check Browser Console (F12)

Open browser developer tools (F12) and check the Network tab:

Before fix:
```
POST https://finaro.kynso.ch/user/login 405 (Not Allowed)
```

After fix:
```
POST https://finaro.kynso.ch/user/login 200 OK
```

---

## 🔍 Troubleshooting

### If login still doesn't work:

1. **Check that frontend container is running:**
   ```bash
   docker-compose ps frontend
   ```

2. **Check frontend logs:**
   ```bash
   docker-compose logs frontend --tail=50
   ```

3. **Check backend is running:**
   ```bash
   docker-compose ps backend
   docker-compose logs backend --tail=50
   ```

4. **Verify nginx configuration was updated:**
   ```bash
   docker exec -it kynso-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /user"
   ```
   
   Should show the proxy_pass configuration.

5. **Complete rebuild (if needed):**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

---

## 📚 Additional Resources

- Full troubleshooting guide: `docs/PRODUCTION_TROUBLESHOOTING.md`
- Production deployment guide: `docs/PRODUCTION_DEPLOYMENT.md`
- Docker guide: `docs/DOCKER_GUIDE.md`

---

## Summary

✅ **Fixed:** `docker/nginx.conf` - Added proxy rules for `/api/`, `/user/`, and `/scalar/` endpoints  
✅ **Documented:** Added troubleshooting section for 405 errors  
✅ **Tested:** Configuration validated  

**Deploy with:** 
```bash
cd /opt/kynso/prod/app
git pull origin main
docker-compose build frontend
docker-compose up -d frontend
```

**Verify:** Login at https://finaro.kynso.ch/login should work! ✨

---

**Created:** 2025-11-22  
**Issue:** Production login returns 405 Not Allowed  
**Status:** ✅ RESOLVED
