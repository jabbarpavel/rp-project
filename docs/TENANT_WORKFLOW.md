# 🏢 Tenant Workflow - From Creation to Production Deployment

This document describes the complete process from creating a new tenant to deploying it to production.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tenant Creation Process](#tenant-creation-process)
3. [Development Phase](#development-phase)
4. [Testing Phase](#testing-phase)
5. [Pre-Production Checklist](#pre-production-checklist)
6. [Production Deployment](#production-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)

---

## 🎯 Overview

### Workflow Stages

```
1. Create Tenant (DEV)
   ↓
2. Configure & Test (DEV)
   ↓
3. Migrate to TEST
   ↓
4. Comprehensive Testing (TEST)
   ↓
5. Pre-Production Checks
   ↓
6. Deploy to PRODUCTION
   ↓
7. Post-Deployment Verification
```

### Environments

| Stage | Environment | Purpose |
|-------|------------|---------|
| **1-2** | DEV | Initial tenant setup and basic testing |
| **3-4** | TEST | Comprehensive testing and validation |
| **5-7** | PROD | Live deployment and monitoring |

---

## 🔧 Tenant Creation Process

### Step 1: Add Tenant to DEV Configuration

#### 1.1 Update `tenants.Development.json`

File: `src/backend/RP.CRM.Api/tenants.Development.json`

```json
[
  {
    "Name": "Existing Tenant",
    "Domain": "localhost"
  },
  {
    "Name": "New Tenant Name",
    "Domain": "newtenant.local"
  }
]
```

#### 1.2 Update Local Hosts File (For Multi-Tenant Testing)

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac:** `/etc/hosts`

Add:
```
127.0.0.1 newtenant.local
```

### Step 2: Create Tenant in Database

#### 2.1 Start Backend in DEV Mode

```bash
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development
```

The application will automatically create the tenant from the configuration file.

#### 2.2 Verify Tenant Creation

Connect to DEV database:
```bash
psql -U postgres -d kynso_dev
```

Check tenant:
```sql
SELECT "Id", "Name", "ConnectionString", "CreatedAt" FROM "Tenants";
```

You should see your new tenant listed.

### Step 3: Create Initial Admin User

#### 3.1 Using API (Recommended)

**Via Scalar UI:** http://localhost:5015/scalar/v1

Navigate to `POST /api/User/register` and use:

```json
{
  "email": "admin@newtenant.local",
  "password": "SecurePassword123!",
  "tenantId": 2
}
```

**Via curl:**
```bash
curl -X POST http://localhost:5015/api/User/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@newtenant.local",
    "password": "SecurePassword123!",
    "tenantId": 2
  }'
```

#### 3.2 Set Admin Permissions

```bash
psql -U postgres -d kynso_dev
```

```sql
-- Set all permissions (admin level)
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Email" = 'admin@newtenant.local';

-- Verify
SELECT "Id", "Email", "TenantId", "Permissions", "IsActive" 
FROM "Users" 
WHERE "Email" = 'admin@newtenant.local';
```

**Permission Values:**
- `55` - Standard User (View/Create/Edit Customers, View/Upload Documents)
- `4095` - Admin (All permissions)

### Step 4: Create Test Users

Create additional test users with different permission levels:

```bash
# Standard User
curl -X POST http://localhost:5015/api/User/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@newtenant.local",
    "password": "UserPassword123!",
    "tenantId": 2
  }'

# Manager User
curl -X POST http://localhost:5015/api/User/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@newtenant.local",
    "password": "ManagerPassword123!",
    "tenantId": 2
  }'
```

Set appropriate permissions:
```sql
-- Standard user permissions
UPDATE "Users" SET "Permissions" = 55 
WHERE "Email" = 'user@newtenant.local';

-- Manager permissions (add delete permissions)
UPDATE "Users" SET "Permissions" = 511 
WHERE "Email" = 'manager@newtenant.local';
```

---

## 🛠️ Development Phase

### DEV Environment Testing

#### 1. Login Testing

1. Start frontend: `npm run start:dev`
2. Navigate to: http://localhost:4200
3. Test login with admin user
4. Verify successful authentication

#### 2. Basic Functionality Testing

Test core features:
- ✅ User can log in
- ✅ Dashboard loads correctly
- ✅ Can create customers
- ✅ Can view customer list
- ✅ Can edit customer details
- ✅ Can upload documents
- ✅ Can download documents
- ✅ Can delete documents (if permission)
- ✅ Permission system works correctly

#### 3. Data Creation

Create sample data for testing:
- At least 5-10 test customers
- Different types of documents
- Test various permission scenarios

#### 4. Document Test Data

Keep track of:
- Created customers (ID, name)
- Created documents (type, size)
- Test user credentials
- Any custom configurations

---

## 🧪 Testing Phase

### Step 1: Migrate Tenant Configuration to TEST

#### 1.1 Update `tenants.Test.json`

File: `src/backend/RP.CRM.Api/tenants.Test.json`

```json
[
  {
    "Name": "Existing Test Tenant",
    "Domain": "localhost"
  },
  {
    "Name": "New Tenant Name",
    "Domain": "newtenant.test.local"
  }
]
```

#### 1.2 Update Hosts File

Add:
```
127.0.0.1 newtenant.test.local
```

### Step 2: Migrate to TEST Branch

```bash
# Commit DEV changes
git checkout dev
git add .
git commit -m "Add new tenant: New Tenant Name"
git push origin dev

# Merge to TEST
git checkout test
git merge dev
git push origin test
```

### Step 3: Setup TEST Database

```bash
cd src/backend/RP.CRM.Api

# Set TEST environment
$env:ASPNETCORE_ENVIRONMENT="Test"

# Apply any new migrations
dotnet ef database update
```

### Step 4: Create Tenant and Users in TEST

Start TEST backend:
```bash
dotnet run --launch-profile Test
```

Repeat the tenant and user creation process for TEST environment:
- Backend runs on: http://localhost:5016
- Frontend runs on: http://localhost:4300 (use `npm run start:test`)
- Database: `kynso_test`

### Step 5: Comprehensive Testing in TEST

#### Functional Testing Checklist

- [ ] **Authentication & Authorization**
  - [ ] Admin can log in
  - [ ] Standard user can log in
  - [ ] Manager can log in
  - [ ] Logout works correctly
  - [ ] Session persistence works
  - [ ] Permission-based UI elements show/hide correctly

- [ ] **Customer Management**
  - [ ] Create new customer
  - [ ] Edit existing customer
  - [ ] View customer details
  - [ ] Delete customer (admin only)
  - [ ] Search/filter customers
  - [ ] Pagination works

- [ ] **Document Management**
  - [ ] Upload document (various file types)
  - [ ] Download document
  - [ ] Delete document (if permitted)
  - [ ] View document list
  - [ ] File size limits enforced (max 10 MB)

- [ ] **User Management** (Admin only)
  - [ ] View user list
  - [ ] Create new user
  - [ ] Edit user permissions
  - [ ] Deactivate/activate user

- [ ] **Multi-Tenant Isolation**
  - [ ] Users can only see their tenant's data
  - [ ] Cross-tenant access is blocked
  - [ ] Document storage is tenant-isolated

#### Performance Testing

- [ ] Load time < 2 seconds for dashboard
- [ ] API response time < 500ms for typical queries
- [ ] Document upload works smoothly for files up to 10 MB
- [ ] List views handle 100+ records

#### Security Testing

- [ ] SQL injection protection (try in search fields)
- [ ] XSS protection (try script tags in customer names)
- [ ] CORS properly configured
- [ ] Unauthorized API access blocked
- [ ] File upload restrictions enforced

#### Browser Testing

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

---

## ✅ Pre-Production Checklist

Before deploying to production, verify:

### Configuration

- [ ] Production configuration files are updated
- [ ] Environment variables are set
- [ ] Database connection strings are correct
- [ ] JWT secrets are production-ready (strong, unique)
- [ ] CORS origins include production domains
- [ ] Logging is configured appropriately

### Tenant Setup

- [ ] Tenant configuration in `tenants.Production.json` is correct
- [ ] Production subdomain is registered (e.g., newtenant.kynso.ch)
- [ ] DNS records are configured
- [ ] SSL certificates are ready

### Database

- [ ] Production database is backed up
- [ ] Migration scripts are tested
- [ ] Database user has appropriate permissions
- [ ] Connection pooling is configured

### Security

- [ ] All passwords are strong and unique
- [ ] API keys/secrets are not in source code
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Rate limiting is enabled

### Backup & Recovery

- [ ] Database backup strategy is in place
- [ ] Document storage backup is configured
- [ ] Recovery procedures are documented
- [ ] Rollback plan is prepared

---

## 🚀 Production Deployment

### Step 1: Update Production Configuration

#### 1.1 Update `tenants.Production.json`

File: `src/backend/RP.CRM.Api/tenants.Production.json`

```json
[
  {
    "Name": "Finaro",
    "Domain": "finaro.kynso.ch"
  },
  {
    "Name": "Demo",
    "Domain": "demo.kynso.ch"
  },
  {
    "Name": "New Tenant Name",
    "Domain": "newtenant.kynso.ch"
  }
]
```

#### 1.2 Configure DNS

In your DNS provider (e.g., Infomaniak):

Add A record:
```
newtenant.kynso.ch → <server-ip-address>
```

Or CNAME if using subdomain:
```
newtenant.kynso.ch → kynso.ch
```

### Step 2: Deploy to Production

#### 2.1 Merge to Main Branch

```bash
# Commit TEST changes
git checkout test
git add .
git commit -m "Tenant configuration tested and ready for production"
git push origin test

# Merge to MAIN
git checkout main
git merge test
git push origin main
```

#### 2.2 Deploy Backend

**Option A: Manual Deployment**

SSH into production server:
```bash
ssh user@server-ip
```

Pull latest changes:
```bash
cd /var/www/kynso-backend
git pull origin main
dotnet publish -c Release -o ./publish
sudo systemctl restart kynso-backend
```

**Option B: Docker Deployment**

```bash
# Build and deploy using docker-compose
docker-compose down
docker-compose build
docker-compose up -d
```

**Option C: CI/CD (If configured)**

Push to main triggers automatic deployment via GitHub Actions.

#### 2.3 Apply Database Migrations

SSH into server:
```bash
cd /var/www/kynso-backend

# Run migrations
dotnet ef database update
```

Or if using Docker:
```bash
docker-compose exec backend dotnet ef database update
```

### Step 3: Create Production Tenant and Users

#### 3.1 Access Production API

Production API: https://kynso.ch:5020 (or configured domain)

#### 3.2 Create Admin User

Use production API to create the tenant admin:

```bash
curl -X POST https://kynso.ch:5020/api/User/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@newtenant.com",
    "password": "ProductionSecurePassword123!",
    "tenantId": 3
  }'
```

#### 3.3 Set Permissions

Connect to production database:
```bash
psql -h localhost -U kynso_user -d kynso_prod
```

Set admin permissions:
```sql
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Email" = 'admin@newtenant.com';
```

---

## ✅ Post-Deployment Verification

### Immediate Checks (Within 1 hour)

- [ ] **Tenant Access**
  - [ ] Can access https://newtenant.kynso.ch
  - [ ] SSL certificate is valid
  - [ ] No CORS errors

- [ ] **Authentication**
  - [ ] Admin can log in
  - [ ] Login redirects correctly
  - [ ] Session persists across page refreshes

- [ ] **Basic Functionality**
  - [ ] Dashboard loads
  - [ ] Can create a customer
  - [ ] Can upload a document
  - [ ] Can view customer list

- [ ] **Infrastructure**
  - [ ] Backend service is running
  - [ ] Frontend is served correctly
  - [ ] Database connections are stable
  - [ ] No errors in logs

### Short-Term Monitoring (Within 24 hours)

- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify backup jobs run successfully
- [ ] Monitor API response times
- [ ] Check disk space usage
- [ ] Verify email notifications work (if configured)

### User Acceptance Testing (Within 1 week)

- [ ] Client admin user trained
- [ ] Client can perform daily tasks
- [ ] All required features working
- [ ] Performance is acceptable
- [ ] No blocking issues reported

---

## 📊 Monitoring & Maintenance

### Regular Checks

**Daily:**
- Monitor error logs
- Check system resources (CPU, memory, disk)
- Verify backups completed successfully

**Weekly:**
- Review application performance
- Check database size and growth
- Update dependencies if needed

**Monthly:**
- Security updates
- Performance optimization
- Backup verification (test restore)

### Troubleshooting Production Issues

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

For production-specific issues:
1. Check application logs: `/var/log/kynso/` or Docker logs
2. Check database logs
3. Check Nginx logs (if using reverse proxy)
4. Verify DNS and SSL certificates
5. Check system resources

---

## 🔄 Tenant Removal Process

If you need to remove a tenant:

### 1. Backup Data
```bash
# Backup tenant data
pg_dump -U postgres -d kynso_prod -t '"Customers"' --data-only \
  -f tenant_backup.sql --where "TenantId=3"
```

### 2. Remove from Configuration

Remove tenant from `tenants.Production.json`

### 3. Deactivate in Database
```sql
-- Deactivate users
UPDATE "Users" SET "IsActive" = false WHERE "TenantId" = 3;

-- Or delete tenant data (irreversible!)
DELETE FROM "Documents" WHERE "CustomerId" IN 
  (SELECT "Id" FROM "Customers" WHERE "TenantId" = 3);
DELETE FROM "Customers" WHERE "TenantId" = 3;
DELETE FROM "Users" WHERE "TenantId" = 3;
DELETE FROM "Tenants" WHERE "Id" = 3;
```

### 4. Remove DNS Record

Remove the A/CNAME record for the tenant subdomain.

---

## 📚 Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development environment setup
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Production deployment details
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [PERMISSIONS_GUIDE.md](PERMISSIONS_GUIDE.md) - Permission system details

---

**Complete Tenant Workflow Checklist:**

```
☐ 1. Add tenant to DEV config
☐ 2. Create tenant in DEV database
☐ 3. Create admin and test users in DEV
☐ 4. Test basic functionality in DEV
☐ 5. Add tenant to TEST config
☐ 6. Merge DEV to TEST branch
☐ 7. Create tenant in TEST database
☐ 8. Create users in TEST
☐ 9. Comprehensive testing in TEST
☐ 10. Complete pre-production checklist
☐ 11. Update production configuration
☐ 12. Configure DNS
☐ 13. Merge TEST to MAIN
☐ 14. Deploy to production
☐ 15. Apply production migrations
☐ 16. Create production users
☐ 17. Post-deployment verification
☐ 18. User acceptance testing
```

---

**🎉 Tenant is now live in production!**
