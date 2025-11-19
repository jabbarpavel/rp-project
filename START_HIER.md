# 🚀 START HIER - Deine nächsten Schritte

## ✅ Was wurde gemacht?

Dein Projekt wurde erfolgreich für einen **3-Umgebungs-Workflow** konfiguriert:

```
DEV (Entwicklung) → TEST (Testing) → MAIN (Production auf kynso.ch)
```

**Wichtigste Änderung:** Das .NET SDK Problem wurde behoben! 🎉

---

## 🎯 Was musst du jetzt tun?

### Schritt 1: Setup ausführen

Wähle das passende Script für dein Betriebssystem:

#### **Windows PowerShell:**
```powershell
cd C:\Users\jabba\Desktop\rp-project
.\setup-environment.ps1
```

#### **Linux/Mac:**
```bash
cd /path/to/rp-project
chmod +x setup-environment.sh
./setup-environment.sh
```

**Das Script wird:**
- ✅ `dev` und `test` Branches erstellen
- ✅ `kynso_dev` und `kynso_test` Datenbanken erstellen
- ✅ Alle Migrationen anwenden

---

### Schritt 2: System testen

#### **DEV (Development) starten:**

**Terminal 1 - Backend:**
```powershell
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Development
```

**Terminal 2 - Frontend:**
```powershell
cd src\frontend
npm install  # Nur beim ersten Mal
npm start
```

Öffne: **http://localhost:4200**

#### **TEST starten:**

**Terminal 1 - Backend:**
```powershell
cd src\backend\RP.CRM.Api
dotnet run --launch-profile Test
```

**Terminal 2 - Frontend:**
```powershell
cd src\frontend
npm run start:test
```

Öffne: **http://localhost:4300**

---

### Schritt 3: Workflow ausprobieren

Probiere den kompletten Workflow einmal durch:

```bash
# 1. In DEV entwickeln
git checkout dev
# ... entwickle etwas ...
git add .
git commit -m "Test-Änderung"

# 2. Zu TEST pushen
git checkout test
git merge dev
git push origin test
# ... starte TEST-Umgebung und teste ...

# 3. Zu PRODUCTION pushen (wenn alles funktioniert)
git checkout main
git merge test
git push origin main
```

---

## 📚 Dokumentation lesen

### Haupt-Dokumentation:

1. **[WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md)** ⭐ **WICHTIGSTE DATEI**
   - Vollständige Anleitung auf Deutsch
   - Schritt-für-Schritt Workflow
   - Alle Befehle erklärt
   - Problemlösungen

2. **[SCHNELLREFERENZ.md](SCHNELLREFERENZ.md)** 
   - Schnelle Befehlsübersicht
   - Tabellen für alle Umgebungen
   - Häufige Befehle

3. **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)**
   - Was wurde implementiert
   - Technische Details
   - Für später zum Nachschlagen

---

## ❓ Häufige Fragen

### **F: Welchen Branch soll ich für Entwicklung verwenden?**
**A:** Immer `dev`! Entwickle in `dev`, teste in `test`, deploye auf `main`.

### **F: Wie wechsle ich die Umgebung?**
**A:** Mit Launch-Profilen:
```bash
dotnet run --launch-profile Development  # DEV
dotnet run --launch-profile Test         # TEST
dotnet run --launch-profile Production   # PROD
```

### **F: Was ist, wenn ich einen Merge-Konflikt habe?**
**A:** Löse ihn normal mit `git`:
```bash
git checkout test
git merge dev
# Bei Konflikt:
# 1. Dateien öffnen und Konflikte manuell lösen
# 2. git add .
# 3. git commit
```

### **F: Wie erstelle ich eine neue Migration?**
**A:**
```bash
cd src\backend\RP.CRM.Api
dotnet ef migrations add MeineMigrationName
```

### **F: Wie wende ich Migrationen an?**
**A:**
```bash
# DEV
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update

# TEST
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

### **F: Kann ich DEV und TEST gleichzeitig laufen lassen?**
**A:** Ja! Sie verwenden unterschiedliche Ports:
- DEV: Backend 5015, Frontend 4200
- TEST: Backend 5016, Frontend 4300

---

## 🐛 Probleme?

### **Problem: `dotnet ef database update` schlägt fehl**
**Lösung:** Das wurde bereits behoben! `global.json` erzwingt jetzt .NET 8.0.
```bash
dotnet --version  # Sollte 8.0.x zeigen
```

### **Problem: Port bereits belegt**
```powershell
# Windows
netstat -ano | findstr :5015
taskkill /PID <PID> /F
```

### **Problem: CORS-Fehler im Browser**
→ Backend muss laufen und richtige Umgebung verwenden
→ Backend-Log prüfen: Sollte "✅ CORS allowed origins" zeigen

### **Weitere Probleme?**
→ Siehe [WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md) - Abschnitt "Häufige Probleme"

---

## ✅ Checkliste

Bevor du loslegst, stelle sicher:

- [ ] PostgreSQL läuft
- [ ] .NET 8.0 SDK installiert
- [ ] Node.js installiert
- [ ] Setup-Script ausgeführt (`setup-environment.ps1` oder `.sh`)
- [ ] `dev` Branch existiert
- [ ] `test` Branch existiert
- [ ] `kynso_dev` Datenbank existiert
- [ ] `kynso_test` Datenbank existiert
- [ ] Backend startet in DEV-Modus
- [ ] Frontend startet in DEV-Modus

---

## 🎯 Zusammenfassung

**Was funktioniert jetzt:**
1. ✅ Automatische Umgebungserkennung
2. ✅ 3 getrennte Umgebungen (DEV/TEST/PROD)
3. ✅ Getrennte Datenbanken
4. ✅ Getrennte Ports
5. ✅ .NET SDK Problem behoben
6. ✅ Vollständige deutsche Dokumentation

**Dein Workflow:**
```
1. Entwickeln in DEV (Branch: dev)
2. Pushen zu TEST (Branch: test) und lokal testen
3. Pushen zu MAIN (Branch: main) für Production
```

**Das Beste:**
- Gleicher Code auf allen Branches
- Umgebung wird automatisch erkannt
- Keine manuellen Config-Änderungen nötig

---

## 🚀 Los geht's!

1. **Führe Setup-Script aus** (siehe oben)
2. **Lies [WORKFLOW_ANLEITUNG.md](WORKFLOW_ANLEITUNG.md)**
3. **Starte DEV-Umgebung**
4. **Fang an zu entwickeln!**

Bei Fragen oder Problemen → Siehe Dokumentation oder frag nach!

**Viel Erfolg! 🎉**
