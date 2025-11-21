# 🧪 Service Testing Guide

This guide explains how to test if your frontend and backend services are running correctly.

## Quick Test

After starting both services, run the test script to verify they are working:

### Linux/Mac
```bash
./test-services.sh
```

### Windows PowerShell
```powershell
.\test-services.ps1
```

### Test Environment
```bash
# Linux/Mac
./test-services.sh Test

# Windows
.\test-services.ps1 -Environment Test
```

## What the Test Script Does

The test script checks:

1. **Backend Health Check** - Calls `/api/health` endpoint
   - Verifies the API is responding
   - Checks database connectivity
   - Returns service status

2. **Frontend Accessibility** - Checks the frontend URL
   - Verifies the Angular app is running
   - Confirms the web server is accessible

## Expected Output

### ✅ When All Services Are Running

```
==========================================
🔍 Testing Kynso CRM Services
==========================================

Environment: Development
Backend URL: http://localhost:5015
Frontend URL: http://localhost:4200

------------------------------------------
🔧 Testing Backend...
------------------------------------------
✅ Backend is running
Response: {"status":"healthy","timestamp":"2025-11-21T15:00:00Z","service":"Kynso CRM API","database":"connected"}

------------------------------------------
🎨 Testing Frontend...
------------------------------------------
✅ Frontend is running
Accessible at: http://localhost:4200

==========================================
📊 Summary
==========================================
✅ All services are running!

You can access:
  - Frontend: http://localhost:4200
  - Backend API: http://localhost:5015
  - API Docs: http://localhost:5015/scalar/v1
```

### ⚠️ When Services Are Not Running

```
==========================================
🔍 Testing Kynso CRM Services
==========================================

Environment: Development
Backend URL: http://localhost:5015
Frontend URL: http://localhost:4200

------------------------------------------
🔧 Testing Backend...
------------------------------------------
❌ Backend is not responding
Expected URL: http://localhost:5015/api/health

To start the backend:
  cd src/backend/RP.CRM.Api && dotnet run --launch-profile Development

------------------------------------------
🎨 Testing Frontend...
------------------------------------------
❌ Frontend is not responding
Expected URL: http://localhost:4200

To start the frontend:
  cd src/frontend && npm start

==========================================
📊 Summary
==========================================
⚠️  Some services are not running
  - Backend: Not running
  - Frontend: Not running

Please start the missing services and try again.
```

## Health Endpoint Details

### Endpoint
```
GET /api/health
```

### Response (Healthy)
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T15:00:00.123Z",
  "service": "Kynso CRM API",
  "database": "connected"
}
```

### Response (Unhealthy)
```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-21T15:00:00.123Z",
  "service": "Kynso CRM API",
  "database": "disconnected",
  "error": "Connection error message"
}
```

## Manual Testing

### Test Backend Manually
```bash
# Using curl
curl http://localhost:5015/api/health

# Using PowerShell
Invoke-WebRequest -Uri http://localhost:5015/api/health
```

### Test Frontend Manually
Open your browser and navigate to:
- Development: http://localhost:4200
- Test: http://localhost:4300

## Environment Ports

| Environment | Backend Port | Frontend Port |
|-------------|--------------|---------------|
| Development | 5015         | 4200          |
| Test        | 5016         | 4300          |
| Production  | 5020         | N/A           |

## Troubleshooting

### Backend Not Starting
1. Check if PostgreSQL is running
2. Verify database exists (kynso_dev or kynso_test)
3. Check connection string in appsettings
4. Run migrations: `dotnet ef database update`

### Frontend Not Starting
1. Install dependencies: `npm install`
2. Check Node.js version: `node --version` (should be 20.x+)
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and reinstall

### Port Already in Use
```bash
# Find process using port (Linux/Mac)
lsof -i :5015

# Find process using port (Windows)
netstat -ano | findstr :5015

# Kill the process and restart
```

## CI/CD Integration

The health check endpoint is also used in docker-compose.yml for container health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Next Steps

After verifying services are running:
1. Check the API documentation: http://localhost:5015/scalar/v1
2. Login to the frontend and test functionality
3. Run automated tests: `dotnet test` (backend)
4. Check logs for any warnings or errors

For more information, see:
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Complete development guide
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues
