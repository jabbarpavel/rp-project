# Database Migration Fix Guide

## Problem
When running the backend and frontend, you encounter this PostgreSQL error:
```
Spalte c.Canton existiert nicht (Column c.Canton does not exist)
```

## Root Cause
The database migrations haven't been applied to your local PostgreSQL database. The `Canton` column (along with `Street`, `PostalCode`, and `Locality`) was added in migration `20251118164012_AddAddressFieldsToCustomer`, but this migration hasn't been executed on your database yet.

Additionally, the initial migration `InitWithChangeLog` had a bug where it was trying to add a column to the `Customers` table without first creating the table. This has been fixed.

## Solution

### Step 1: Apply Database Migrations

Open a terminal in the backend API project directory and run:

```bash
cd src/backend/RP.CRM.Api
dotnet ef database update
```

This will apply all pending migrations, including:
- Creating all base tables (Tenants, Users, Customers, ChangeLogs, etc.)
- Adding all additional columns including Canton, Street, PostalCode, and Locality
- Setting up all relationships and indexes

### Step 2: Verify the Migration

After the migration completes successfully, you should see output like:
```
Applying migration '20251109195934_InitWithChangeLog'.
Applying migration '20251111130248_AddCustomerFirstName'.
...
Applying migration '20251118164012_AddAddressFieldsToCustomer'.
Done.
```

You can verify the Canton column exists by connecting to PostgreSQL:
```bash
psql -U postgres -d rp_crm
\d "Customers"
```

You should see Canton, Street, PostalCode, and Locality columns in the table.

### Step 3: Start the Backend

Now you can start the backend normally:
```bash
cd src/backend/RP.CRM.Api
dotnet run
# or with watch mode for development:
dotnet watch run
```

The backend should start without the "Spalte c.Canton existiert nicht" error.

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

If you're working on `copilot/update-customer-management-ui-again`, you'll need to either:
1. Cherry-pick the fix commit to that branch, or
2. Apply the same fix manually

The address fields (Canton, Street, PostalCode, Locality) are only present on the `copilot/update-customer-management-ui-again` branch.

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
3. ✅ Confirming the Canton and address fields exist in the database schema
4. ✅ Building the backend successfully

You just need to run `dotnet ef database update` in your local environment to apply these migrations to your database.
