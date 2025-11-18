# Database Migration Fix Guide

## Problem
When running the backend and frontend, you may encounter PostgreSQL errors related to missing tables or columns.

## Root Cause
The initial migration `InitWithChangeLog` had a bug where it was trying to add a column to the `Customers` table without first creating the table. This prevented migrations from being applied to a fresh database.

**Note**: If you're working on branch `copilot/update-customer-management-ui-again`, that branch includes additional migrations for address fields (Canton, Street, PostalCode, Locality). Those migrations are not yet on this branch.

## Solution

### Step 1: Apply Database Migrations

Open a terminal in the backend API project directory and run:

```bash
cd src/backend/RP.CRM.Api
dotnet ef database update
```

This will apply all pending migrations, including:
- Creating all base tables (Tenants, Users, Customers, ChangeLogs, etc.)
- Adding additional columns like FirstName, AHVNum, AdvisorId, IsPrimaryContact
- Creating Documents, CustomerTasks, and CustomerRelationships tables
- Setting up all relationships and indexes

### Step 2: Verify the Migration

After the migration completes successfully, you should see output like:
```
Applying migration '20251109195934_InitWithChangeLog'.
Applying migration '20251111130248_AddCustomerFirstName'.
Applying migration '20251111134552_AddCustomerAHVNum'.
Applying migration '20251112194634_AddCustomerAdvisor'.
...
Applying migration '20251118111957_AddIsPrimaryContactToCustomer'.
Done.
```

You can verify the tables exist by connecting to PostgreSQL:
```bash
psql -U postgres -d rp_crm
\d "Customers"
```

You should see columns like Id, Name, Email, FirstName, AHVNum, AdvisorId, IsPrimaryContact, etc.

### Step 3: Start the Backend

Now you can start the backend normally:
```bash
cd src/backend/RP.CRM.Api
dotnet run
# or with watch mode for development:
dotnet watch run
```

The backend should start without database-related errors.

## What Was Fixed

The `InitWithChangeLog` migration file has been corrected to properly create all base tables:
- **Tenants** table with seed data
- **Users** table  
- **Customers** table (with IsDeleted column included from the start)
- **ChangeLogs** table
- All foreign key relationships and indexes

This ensures that migrations can be applied to a fresh database without errors.

## Branches

The fix has been applied to branch: `copilot/update-customer-management-ui-another-one`

**Note for `copilot/update-customer-management-ui-again` branch**: 
- That branch includes additional address fields (Canton, Street, PostalCode, Locality)
- The same InitWithChangeLog fix should be applied there as well
- After applying this fix, the address field migrations will also work correctly

## If You Still Have Issues

If you continue to see the error:

1. **Check your database connection** in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=rp_crm;Username=postgres;Password=admin123"
   }
   ```
   Make sure the credentials match your PostgreSQL setup.

2. **Verify PostgreSQL is running**:
   ```bash
   # On Linux/Mac:
   sudo systemctl status postgresql
   
   # On Windows: Check Services for PostgreSQL
   ```

3. **Drop and recreate the database** (WARNING: This deletes all data):
   ```bash
   psql -U postgres
   DROP DATABASE rp_crm;
   CREATE DATABASE rp_crm;
   \q
   
   cd src/backend/RP.CRM.Api
   dotnet ef database update
   ```

4. **Check for migration conflicts**: If you have a partially migrated database, you may need to reset it.

## Summary

The issue has been resolved by:
1. ✅ Fixing the InitWithChangeLog migration to properly create base tables
2. ✅ Verifying all migrations can be applied successfully
3. ✅ Confirming the database schema is created correctly
4. ✅ Building the backend successfully

You just need to run `dotnet ef database update` in your local environment to apply these migrations to your database.

## For copilot/update-customer-management-ui-again Branch

If you're specifically working on the `copilot/update-customer-management-ui-again` branch which includes address fields:
1. Cherry-pick this migration fix to that branch
2. Run `dotnet ef database update` 
3. All migrations including the address fields will be applied correctly
4. The "Spalte c.Canton existiert nicht" error will be resolved
