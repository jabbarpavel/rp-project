# Tenant Logos

This folder contains tenant/company logos.

## How to Add a Logo

1. Save the logo as a PNG file
2. Name the file using the tenant's **domain** (lowercase), e.g.:
   - `finaro.png` for tenant with domain "finaro"
   - `kynso.png` for tenant with domain "kynso"
3. Recommended logo size: 200x60 pixels (or similar aspect ratio)
4. Place the file in this folder

## File Naming Convention

The logo filename must match the tenant's `domain` field in the database (lowercase).

For example, if your tenant has:
- `name: "Finaro AG"`
- `domain: "finaro"`

Then the logo file should be named: `finaro.png`

## Fallback

If no logo file exists for a tenant, the sidebar will display "Firmen Logo fehlt" (Company logo missing).
