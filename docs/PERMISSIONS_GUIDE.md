# Permissions Guide - Rollenbasierte Zugriffssteuerung

## Übersicht

Das System verwendet ein **Flags-basiertes Berechtigungssystem**, bei dem jede Berechtigung durch eine Potenz von 2 dargestellt wird. Berechtigungen werden als Integer in der Datenbank gespeichert und können durch bitweise Operationen kombiniert werden.

## Berechtigungen (Permissions)

| Berechtigung | Wert | Beschreibung |
|--------------|------|--------------|
| None | 0 | Keine Berechtigungen |
| ViewCustomers | 1 | Kunden anzeigen |
| CreateCustomers | 2 | Kunden erstellen |
| EditCustomers | 4 | Kunden bearbeiten |
| DeleteCustomers | 8 | Kunden löschen |
| ViewDocuments | 16 | Dokumente anzeigen |
| UploadDocuments | 32 | Dokumente hochladen |
| DeleteDocuments | 64 | Dokumente löschen |
| ViewUsers | 128 | Benutzer anzeigen |
| CreateUsers | 256 | Benutzer erstellen |
| EditUsers | 512 | Benutzer bearbeiten |
| DeleteUsers | 1024 | Benutzer löschen |
| ManagePermissions | 2048 | Berechtigungen verwalten |

## Vordefinierte Rollen

### Standard User (Wert: 55)
Berechnet als: 1 + 2 + 4 + 16 + 32 = 55
- Kunden anzeigen ✓
- Kunden erstellen ✓
- Kunden bearbeiten ✓
- Dokumente anzeigen ✓
- Dokumente hochladen ✓

**Kann NICHT:**
- Kunden löschen ✗
- Dokumente löschen ✗
- Benutzer verwalten ✗

### Administrator (Wert: 4095)
Alle Berechtigungen: 1 + 2 + 4 + 8 + 16 + 32 + 64 + 128 + 256 + 512 + 1024 + 2048 = 4095

## Berechtigungen in der Datenbank setzen

### Aktuelle Berechtigungen anzeigen

```sql
SELECT 
    "Id",
    "Email",
    "Permissions",
    "Role",
    "FirstName",
    "Name",
    "IsActive"
FROM "Users"
ORDER BY "Id";
```

### User zu Admin machen

```sql
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Email" = 'ihre.email@example.com';
```

### User auf Standard-Berechtigung setzen

```sql
UPDATE "Users" 
SET "Permissions" = 55 
WHERE "Email" = 'ihre.email@example.com';
```

### Alle User zu Admins machen

```sql
UPDATE "Users" 
SET "Permissions" = 4095;
```

### Benutzerdefinierte Berechtigungen

#### Beispiel: Kunde kann alles außer löschen
ViewCustomers (1) + CreateCustomers (2) + EditCustomers (4) + ViewDocuments (16) + UploadDocuments (32) = **55**

```sql
UPDATE "Users" 
SET "Permissions" = 55 
WHERE "Email" = 'user@example.com';
```

#### Beispiel: Kunde kann auch löschen (wie Admin für Kunden)
55 + DeleteCustomers (8) + DeleteDocuments (64) = **127**

```sql
UPDATE "Users" 
SET "Permissions" = 127 
WHERE "Email" = 'power-user@example.com';
```

#### Beispiel: Nur Lesezugriff
ViewCustomers (1) + ViewDocuments (16) = **17**

```sql
UPDATE "Users" 
SET "Permissions" = 17 
WHERE "Email" = 'readonly@example.com';
```

#### Beispiel: Dokument-Manager (kein Kundenzugriff)
ViewDocuments (16) + UploadDocuments (32) + DeleteDocuments (64) = **112**

```sql
UPDATE "Users" 
SET "Permissions" = 112 
WHERE "Email" = 'docs@example.com';
```

## Berechtigungen berechnen

### Methode 1: Addition
Addiere die Werte der gewünschten Berechtigungen.

**Beispiel:** User soll Kunden anzeigen, bearbeiten und Dokumente hochladen:
- ViewCustomers = 1
- EditCustomers = 4
- UploadDocuments = 32
- **Total = 37**

```sql
UPDATE "Users" SET "Permissions" = 37 WHERE "Email" = 'example@email.com';
```

### Methode 2: Online-Rechner
Nutze einen Binary Calculator oder Bitwise Calculator online:
1. Markiere die gewünschten Berechtigungen
2. Addiere die Werte
3. Verwende das Ergebnis in SQL

## UI-Auswirkungen

Das Frontend überprüft automatisch die Berechtigungen und zeigt/versteckt UI-Elemente:

| Berechtigung fehlt | UI-Auswirkung |
|-------------------|---------------|
| DeleteCustomers | "Löschen"-Button auf Kundendetailseite versteckt |
| DeleteDocuments | Papierkorb-Symbol bei Dokumenten versteckt |
| EditCustomers | "Bearbeiten"-Button könnte versteckt werden (zukünftig) |

## Nach dem Ändern von Berechtigungen

**Wichtig:** User müssen sich neu einloggen, damit die Änderungen wirksam werden!

1. Berechtigungen in DB ändern
2. User ausloggen
3. User neu einloggen
4. Neue Berechtigungen sind aktiv

Der JWT-Token wird beim Login mit den aktuellen Berechtigungen erstellt.

## Troubleshooting

### "Fehler beim Löschen des Kunden"
**Ursache:** User hat keine DeleteCustomers-Berechtigung (Wert 8)

**Lösung:**
```sql
-- Aktuelle Berechtigung prüfen
SELECT "Permissions" FROM "Users" WHERE "Email" = 'ihre.email@example.com';

-- DeleteCustomers hinzufügen (8 addieren)
-- Wenn aktuell 55, dann: 55 + 8 = 63
UPDATE "Users" 
SET "Permissions" = "Permissions" + 8 
WHERE "Email" = 'ihre.email@example.com';
```

### "Fehler beim Löschen des Dokuments"
**Ursache:** User hat keine DeleteDocuments-Berechtigung (Wert 64)

**Lösung:**
```sql
-- DeleteDocuments hinzufügen (64 addieren)
UPDATE "Users" 
SET "Permissions" = "Permissions" + 64 
WHERE "Email" = 'ihre.email@example.com';
```

### Delete-Button nicht sichtbar
**Das ist gewollt!** Der Button wird nur angezeigt, wenn der User die entsprechende Berechtigung hat.

**Um Button anzuzeigen:**
- Für Kunden-Löschen: Berechtigung 8 (DeleteCustomers) hinzufügen
- Für Dokument-Löschen: Berechtigung 64 (DeleteDocuments) hinzufügen

### Alle Rechte auf einmal vergeben

```sql
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Email" = 'ihre.email@example.com';
```

Danach neu einloggen!

## Berechtigungs-Tabelle für Schnellreferenz

| Rolle | Wert | Berechtigungen |
|-------|------|----------------|
| Kein Zugriff | 0 | Nichts |
| Nur Lesen | 17 | Kunden + Dokumente anzeigen |
| Standard User | 55 | Kunden verwalten (ohne Löschen), Dokumente anzeigen/hochladen |
| Power User | 127 | Wie Standard + Kunden/Dokumente löschen |
| Admin | 4095 | Alle Berechtigungen |

## SQL-Snippets für häufige Szenarien

### Alle User zu Standard-Usern machen
```sql
UPDATE "Users" SET "Permissions" = 55;
```

### Bestimmten User zu Admin machen
```sql
UPDATE "Users" 
SET "Permissions" = 4095 
WHERE "Id" = 1;  -- User-ID anpassen
```

### Alle aktiven User finden ohne Löschrechte
```sql
SELECT "Email", "Permissions"
FROM "Users"
WHERE "IsActive" = true 
  AND ("Permissions" & 8) = 0;  -- Keine DeleteCustomers-Berechtigung
```

### User mit Admin-Rechten finden
```sql
SELECT "Email", "Permissions"
FROM "Users"
WHERE "Permissions" = 4095;
```

## Best Practices

1. **Principle of Least Privilege:** Vergebe nur die Berechtigungen, die wirklich benötigt werden
2. **Dokumentation:** Halte fest, welche User welche Berechtigungen haben und warum
3. **Regelmäßige Reviews:** Überprüfe periodisch, ob alle Berechtigungen noch angemessen sind
4. **Test-Accounts:** Erstelle Test-Accounts mit verschiedenen Berechtigungsstufen zum Testen
5. **Audit-Logs:** Nutze die ChangeLog-Tabelle, um nachzuvollziehen, wer was geändert hat

## Zukünftige Erweiterungen

Das System ist bereit für:
- Admin-UI zur grafischen Berechtigungsverwaltung
- Rollen-Templates (z.B. "Verkäufer", "Manager", "Support")
- Zeitlich begrenzte Berechtigungen
- Berechtigungen auf Abteilungsebene
- Audit-Trail für Berechtigungsänderungen

---

Bei Fragen: Siehe SETUP_GUIDE.md für allgemeine Hilfe oder FEATURE_GUIDE.md für technische Details.
