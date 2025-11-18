# Fix für "Spalte c.Canton existiert nicht" Fehler

## Problem

Die Datenbank hat die Migration `20251118164012_AddAddressFieldsToCustomer` als "angewendet" in der `__EFMigrationsHistory` Tabelle markiert, aber die Spalten (Canton, Street, PostalCode, Locality) existieren nicht wirklich in der Customers Tabelle.

Das passiert wenn:
- Eine frühere Migration fehlgeschlagen ist
- Die Datenbank manuell bearbeitet wurde
- Ein Rollback nur teilweise durchgeführt wurde

## Diagnose

Du kannst überprüfen was in der Datenbank ist:

```sql
-- PostgreSQL einloggen
psql -U postgres -d rp_crm

-- Prüfe welche Migrations angewendet wurden
SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId";

-- Prüfe welche Spalten in Customers existieren
\d "Customers"

-- PostgreSQL beenden
\q
```

## Lösung 1: Datenbank neu erstellen (EMPFOHLEN wenn keine wichtigen Daten vorhanden)

```bash
# PostgreSQL einloggen
psql -U postgres

# Datenbank löschen und neu erstellen
DROP DATABASE rp_crm;
CREATE DATABASE rp_crm;
\q

# Alle Migrations neu anwenden
cd C:\Users\jabba\Desktop\rp-project\src\backend\RP.CRM.Api
dotnet ef database update

# Backend starten
dotnet run
```

## Lösung 2: Nur die fehlenden Spalten manuell hinzufügen

Wenn du Daten in der Datenbank hast die du behalten willst:

```bash
# PostgreSQL einloggen
psql -U postgres -d rp_crm

# Füge die fehlenden Spalten hinzu
ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "Canton" text;
ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "Locality" text;
ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "PostalCode" text;
ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS "Street" text;

# Beenden
\q

# Backend starten sollte jetzt funktionieren
cd C:\Users\jabba\Desktop\rp-project\src\backend\RP.CRM.Api
dotnet run
```

## Lösung 3: Die Migration zurücksetzen und neu anwenden

```bash
# Zum vorletzten Migration zurückgehen
cd C:\Users\jabba\Desktop\rp-project\src\backend\RP.CRM.Api
dotnet ef database update 20251118111957_AddIsPrimaryContactToCustomer

# Jetzt die letzte Migration neu anwenden
dotnet ef database update

# Backend starten
dotnet run
```

## Warum sagt "dotnet ef database update" dass alles up-to-date ist?

Entity Framework prüft die `__EFMigrationsHistory` Tabelle. Diese Tabelle sagt, dass die Migration `20251118164012_AddAddressFieldsToCustomer` bereits angewendet wurde, auch wenn die Spalten fehlen.

Das ist ein bekanntes Problem wenn Migrations fehlschlagen oder manuell rückgängig gemacht werden.

## Nach dem Fix

Nach dem Anwenden einer der Lösungen sollte:
- Der Backend ohne Fehler starten
- Die Customers-Abfrage funktionieren
- Die Canton, Street, PostalCode und Locality Felder verfügbar sein

## Test

Um zu testen ob es funktioniert:

1. Backend starten: `dotnet run`
2. Frontend starten: `npm start` (in anderem Terminal)
3. Im Browser zu http://finaro.localhost:4200 gehen
4. Kunden-Liste öffnen
5. Fehler sollte nicht mehr auftreten
