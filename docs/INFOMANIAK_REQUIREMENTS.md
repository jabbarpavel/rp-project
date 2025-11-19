# Infomaniak Hosting Anforderungen für RP-CRM Projekt

## 📋 Übersicht

Dieses Dokument erklärt, welche Produkte und Services du von Infomaniak benötigst, um dein RP-CRM Projekt produktiv zu hosten.

## 🎯 Was du bei Infomaniak benötigst

### 1. Web Hosting / Cloud Server

**Empfehlung: Managed Cloud Server (Swiss Backup - Virtual Machine)**

#### Option A: Managed Cloud Server (EMPFOHLEN)
- **Was**: Virtual Private Server (VPS) mit Root-Zugriff
- **Warum**: 
  - Volle Kontrolle über die Installation
  - Kann .NET, Node.js und PostgreSQL installieren
  - Skalierbar je nach Bedarf
- **Mindestanforderungen**:
  - 2 vCPU
  - 4 GB RAM
  - 40 GB SSD Speicher
  - Ubuntu 22.04 LTS oder Debian 12
- **Preis**: ca. CHF 15-30/Monat (je nach Konfiguration)
- **Link**: https://www.infomaniak.com/de/hosting/public-cloud

#### Option B: Web Hosting mit Docker Support
- **Was**: Shared Hosting mit Docker-Unterstützung
- **Warum**: Einfacher zu verwalten
- **Limitierung**: Eventuell eingeschränkte Ressourcen
- **Preis**: ca. CHF 7-15/Monat
- **Hinweis**: Prüfe ob .NET 10 und Node.js unterstützt werden

### 2. PostgreSQL Datenbank

**Empfehlung: Separate PostgreSQL Datenbank**

- **Was**: Managed PostgreSQL Datenbank
- **Warum**: 
  - Automatische Backups
  - Bessere Performance
  - Professionelle Verwaltung
- **Mindestanforderungen**:
  - PostgreSQL 14 oder höher
  - 2 GB RAM minimum
  - 10 GB Speicher (für Start ausreichend)
- **Preis**: ca. CHF 10-20/Monat
- **Alternative**: PostgreSQL auf dem gleichen Cloud Server installieren (günstiger aber mehr Verwaltungsaufwand)

### 3. Domain Name

**Benötigt: Domain(s) für deine Tenants**

- **Was**: Domain-Namen für deine Mandanten
- **Beispiele**:
  - `finaro.ch` für Tenant "Finaro"
  - `democorp.ch` für Tenant "DemoCorp"
  - Oder Subdomains: `finaro.meine-crm.ch`, `democorp.meine-crm.ch`
- **Preis**: ca. CHF 15-25/Jahr pro Domain
- **Link**: https://www.infomaniak.com/de/domains

### 4. SSL/TLS Zertifikate

**Benötigt: HTTPS für sichere Verbindungen**

- **Was**: SSL-Zertifikate für verschlüsselte Verbindungen
- **Warum**: Pflicht für Produktionsumgebungen (Sicherheit)
- **Preis**: KOSTENLOS (Let's Encrypt)
- **Hinweis**: Bei Infomaniak Cloud Server automatisch verfügbar

### 5. Storage für Dokumente

**Benötigt: Speicherplatz für hochgeladene Dateien**

- **Was**: Datei-Speicher für Kunden-Dokumente
- **Optionen**:
  - **Option A**: Auf dem Cloud Server (inkludiert im Server-Preis)
  - **Option B**: Infomaniak kDrive oder Swiss Backup Storage (separate Lösung)
- **Empfehlung**: Starte mit Server-Storage, später zu kDrive wechseln wenn nötig
- **Schätzung**: 50-100 GB für Start
- **Preis**: Im Server-Preis enthalten oder ca. CHF 5/100GB bei kDrive

### 6. Backup Lösung

**Dringend empfohlen: Automatische Backups**

- **Was**: Tägliche automatische Backups
- **Umfang**:
  - Datenbank (PostgreSQL Dumps)
  - Hochgeladene Dokumente
  - Konfigurationsdateien
- **Bei Infomaniak Cloud**: Oft bereits inkludiert
- **Preis**: ca. CHF 5-10/Monat (falls nicht inkludiert)

### 7. E-Mail Service (Optional aber empfohlen)

**Für System-Notifications und Account-Management**

- **Was**: E-Mail Hosting für:
  - Passwort-Resets
  - System-Benachrichtigungen
  - Admin-Alerts
- **Beispiel**: `noreply@meine-crm.ch`, `admin@meine-crm.ch`
- **Preis**: ca. CHF 5/Monat (oder im Hosting-Paket enthalten)

## 💰 Gesamtkosten Übersicht

### Setup A: Managed Cloud Server (Empfohlen)
```
Managed Cloud Server (4GB RAM, 2 vCPU):    CHF 25/Monat
Domain (2x):                                CHF 40/Jahr (≈ CHF 3.33/Monat)
SSL Zertifikate:                            CHF 0 (Let's Encrypt)
PostgreSQL:                                 CHF 0 (auf Server installiert)
Backup:                                     CHF 0 (im Server enthalten)
E-Mail:                                     CHF 5/Monat (optional)
-----------------------------------------------------------------
TOTAL:                                      CHF 30-33/Monat
                                           ≈ CHF 360-396/Jahr
```

### Setup B: Budget Option
```
Web Hosting mit Docker:                     CHF 10/Monat
Domain (2x):                                CHF 40/Jahr (≈ CHF 3.33/Monat)
PostgreSQL:                                 CHF 0 (auf Hosting inkludiert)
SSL Zertifikate:                            CHF 0 (Let's Encrypt)
-----------------------------------------------------------------
TOTAL:                                      CHF 13-15/Monat
                                           ≈ CHF 156-180/Jahr
```

### Setup C: Premium (Skalierbar)
```
Managed Cloud Server (8GB RAM, 4 vCPU):    CHF 50/Monat
Managed PostgreSQL Datenbank:              CHF 15/Monat
Domain (2x):                                CHF 40/Jahr (≈ CHF 3.33/Monat)
SSL Zertifikate:                            CHF 0 (Let's Encrypt)
kDrive Storage (500 GB):                    CHF 10/Monat
Professional Backup:                        CHF 10/Monat
E-Mail Professional:                        CHF 10/Monat
-----------------------------------------------------------------
TOTAL:                                      CHF 98/Monat
                                           ≈ CHF 1,176/Jahr
```

## 🎯 Empfehlung für den Start

**Starte mit Setup A (Managed Cloud Server)**

### Warum?
1. ✅ Beste Balance zwischen Kosten und Flexibilität
2. ✅ Volle Kontrolle über die Installation
3. ✅ Einfach skalierbar wenn die App wächst
4. ✅ Alle benötigten Services auf einem Server
5. ✅ Professionelle Backups inkludiert

### Was bestellen?
1. **Managed Cloud Server**: Ubuntu 22.04 LTS, 2-4 vCPU, 4-8 GB RAM
2. **Domain(s)**: Mindestens eine Domain für deine Hauptanwendung
3. **SSL**: Automatisch mit Let's Encrypt (kostenlos)

## 📝 Checkliste für Infomaniak Bestellung

### Vor der Bestellung:
- [ ] Entscheide dich für Domain-Namen
- [ ] Wähle Server-Größe basierend auf erwarteten Nutzern
  - 1-10 Nutzer: 2 vCPU, 4 GB RAM
  - 10-50 Nutzer: 4 vCPU, 8 GB RAM
  - 50+ Nutzer: 8 vCPU, 16 GB RAM
- [ ] Budget festlegen

### Bei Infomaniak bestellen:
- [ ] Cloud Server / VPS Account erstellen
- [ ] Ubuntu 22.04 LTS als Betriebssystem wählen
- [ ] SSH-Zugang einrichten
- [ ] Domain(s) registrieren oder transferieren
- [ ] DNS auf Cloud Server umleiten
- [ ] Backup-Option aktivieren (falls nicht standard)

### Nach der Bestellung:
- [ ] SSH-Zugang testen
- [ ] Server Software installieren (siehe PRODUCTION_DEPLOYMENT.md)
- [ ] Domain DNS konfigurieren
- [ ] SSL Zertifikate einrichten
- [ ] Datenbank erstellen und migrieren
- [ ] Anwendung deployen
- [ ] Monitoring einrichten

## 🔗 Wichtige Infomaniak Links

- **Cloud Server**: https://www.infomaniak.com/de/hosting/public-cloud
- **Web Hosting**: https://www.infomaniak.com/de/hosting/web-hosting
- **Domains**: https://www.infomaniak.com/de/domains
- **kDrive Storage**: https://www.infomaniak.com/de/kdrive
- **Support**: https://www.infomaniak.com/de/support

## ❓ Häufige Fragen

### Kann ich mit einem kleineren Server starten?
Ja, du kannst mit 2 vCPU und 4 GB RAM starten. Infomaniak erlaubt später ein Upgrade.

### Brauche ich technisches Wissen?
Ja, für Setup A benötigst du grundlegende Linux- und Server-Kenntnisse. Alternativ kannst du einen DevOps-Experten für das initiale Setup beauftragen.

### Was ist mit Monitoring?
Infomaniak bietet Basis-Monitoring. Für detailliertes Application-Monitoring siehe PRODUCTION_DEPLOYMENT.md.

### Wie mache ich Backups?
Siehe PRODUCTION_DEPLOYMENT.md für Backup-Strategien und Automatisierung.

### Kann ich mehrere Tenants hosten?
Ja! Die Anwendung ist Multi-Tenant-fähig. Du kannst beliebig viele Tenants auf einem Server hosten.

## 📞 Nächste Schritte

1. ✅ Diese Anforderungen durchlesen
2. ✅ Budget und Server-Größe festlegen
3. ✅ Bei Infomaniak Account erstellen und Server bestellen
4. ✅ Weiter zu **PRODUCTION_DEPLOYMENT.md** für Installation
5. ✅ Optional: CI/CD mit GitHub Actions einrichten

---

**Tipp**: Infomaniak ist ein Schweizer Hosting-Provider mit exzellentem Support. Bei Fragen kannst du deren Support kontaktieren - sie helfen gerne bei der richtigen Auswahl!
