# 🔒 HTTP vs HTTPS - Production API Zugriff

## 📋 Übersicht

Dieses Dokument erklärt, warum du HTTPS verwenden musst, wenn du von außen auf die Production-API zugreifst, und was passiert, wenn du HTTP verwendest.

---

## ⚠️ Das Problem: 301 Redirect bei HTTP

### Symptom

Wenn du versuchst, von deinem Computer aus eine POST-Anfrage an die API mit HTTP zu senden, erhältst du eine 301 Redirect-Antwort:

```bash
curl -X POST http://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.ch",
    "password": "123456",
    "tenantId": 1
  }'
```

**Antwort:**
```html
<html>
<head><title>301 Moved Permanently</title></head>
<body>
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
</body>
</html>
```

### Ursache

Der Production-Server verwendet Let's Encrypt SSL-Zertifikate und erzwingt HTTPS für alle externen Zugriffe. Wenn du HTTP verwendest:

1. **Nginx empfängt deine HTTP-Anfrage** auf Port 80
2. **Nginx sendet eine 301-Umleitung** zu HTTPS
3. **Der Browser/curl folgt der Umleitung** zu HTTPS
4. **ABER: Der POST-Body geht verloren!** ❌

Dies ist das standardmäßige HTTP-Verhalten gemäß RFC 7231: Bei einer 301-Umleitung soll der Client den POST-Body **nicht** automatisch zur neuen URL senden.

---

## ✅ Die Lösung: Verwende HTTPS

### Richtig: HTTPS von extern

```bash
# ✅ RICHTIG - Funktioniert von deinem Computer aus
curl -X POST https://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.ch",
    "password": "123456",
    "tenantId": 1
  }'
```

**Warum funktioniert das?**
- Direkter HTTPS-Zugriff ohne Umleitung
- POST-Body wird korrekt übertragen
- SSL-Verschlüsselung schützt deine Daten

### Auch richtig: HTTP auf dem Server

```bash
# ✅ AUCH RICHTIG - Funktioniert auf dem Server (via SSH)
ssh ubuntu@83.228.225.166

curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.ch",
    "password": "123456",
    "tenantId": 1
  }'
```

**Warum funktioniert das?**
- Direkter Zugriff zum Backend-Container
- Umgeht den externen nginx
- Keine Umleitung erforderlich

---

## 🔍 Wann HTTP vs HTTPS verwenden?

| Zugriff von | URL verwenden | Beispiel |
|-------------|---------------|----------|
| **Dein Computer** | `https://` | `https://finaro.kynso.ch/api/...` |
| **VS Code REST Client** | `https://` | `https://finaro.kynso.ch/api/...` |
| **Postman** | `https://` | `https://finaro.kynso.ch/api/...` |
| **Auf dem Server (via SSH)** | `http://localhost:5000` | `http://localhost:5000/api/...` |
| **Innerhalb Docker** | `http://backend:5000` | `http://backend:5000/api/...` |

---

## 🛠️ Praktische Beispiele

### Beispiel 1: User Registration von extern

```bash
# Von deinem Computer
curl -X POST https://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "tenantId": 1
  }'
```

### Beispiel 2: User Registration auf dem Server

```bash
# SSH zum Server
ssh ubuntu@83.228.225.166

# Dann auf dem Server
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "tenantId": 1
  }'
```

### Beispiel 3: VS Code REST Client

```http
### production-users.http

# Base URL - VERWENDE HTTPS!
@baseUrl = https://finaro.kynso.ch/api

### User erstellen
POST {{baseUrl}}/user/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "tenantId": 1
}
```

### Beispiel 4: Postman

**Environment Variables:**
- Variable: `baseUrl`
- Value: `https://finaro.kynso.ch/api` ✅ (nicht `http://...` ❌)

---

## 🔧 Technische Details

### Nginx Konfiguration

Der externe nginx auf dem Production-Server ist so konfiguriert:

```nginx
server {
    listen 80;
    server_name finaro.kynso.ch;
    
    # Umleitung zu HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finaro.kynso.ch;
    
    ssl_certificate /etc/letsencrypt/live/finaro.kynso.ch/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finaro.kynso.ch/privkey.pem;
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        # ... weitere Konfiguration ...
    }
}
```

### Warum verliert HTTP POST den Body?

Gemäß **RFC 7231 Section 6.4.2**:
> For historical reasons, a user agent MAY change the request method from POST to GET for the subsequent request when a 301 status code is received.

In der Praxis:
- **Browser**: Können POST → GET ändern (Body geht verloren)
- **curl**: Ändert die Methode nicht, sendet aber keinen Body bei der Umleitung
- **Postman**: Ähnliches Verhalten wie curl

### Port-Übersicht

| Port | Protokoll | Zugriff | Verwendung |
|------|-----------|---------|------------|
| **80** | HTTP | Extern | Umleitung zu HTTPS |
| **443** | HTTPS | Extern | Production API (über nginx) |
| **5000** | HTTP | Intern | Backend-Container (direkt) |
| **8080** | HTTP | Intern | Frontend-Container |

---

## 🚨 Häufige Fehler

### Fehler 1: HTTP statt HTTPS

```bash
# ❌ FALSCH
curl -X POST http://finaro.kynso.ch/api/user/register ...
# Resultat: 301 Redirect, POST-Body geht verloren

# ✅ RICHTIG
curl -X POST https://finaro.kynso.ch/api/user/register ...
```

### Fehler 2: IP-Adresse mit HTTP

```bash
# ❌ FALSCH (von extern)
curl -X POST http://83.228.225.166:5000/api/user/register ...
# Resultat: Funktioniert nur wenn Firewall Port 5000 offen ist (nicht empfohlen!)

# ✅ RICHTIG
curl -X POST https://finaro.kynso.ch/api/user/register ...
```

### Fehler 3: localhost von extern

```bash
# ❌ FALSCH (von deinem Computer)
curl -X POST http://localhost:5000/api/user/register ...
# Resultat: Connection refused (localhost ist dein Computer, nicht der Server!)

# ✅ RICHTIG
curl -X POST https://finaro.kynso.ch/api/user/register ...
```

---

## ✅ Best Practices

### 1. Immer HTTPS für externe Zugriffe

- ✅ Verwende `https://` von deinem Computer
- ✅ Verwende `https://` in VS Code REST Client
- ✅ Verwende `https://` in Postman
- ✅ Verwende `https://` in deiner Frontend-App

### 2. HTTP nur auf dem Server

- ✅ Verwende `http://localhost:5000` nur wenn du via SSH auf dem Server bist
- ✅ Dies ist schneller und umgeht den nginx-Proxy
- ✅ Nützlich für Debugging und direkte API-Tests

### 3. Dokumentiere klar

- ✅ Dokumentiere immer, ob ein Befehl auf dem Server oder extern ausgeführt wird
- ✅ Verwende Kommentare wie `# Von deinem Computer` oder `# Auf dem Server`

### 4. Environment Variables

- ✅ Verwende verschiedene Environment Variables für Entwicklung und Production
- ✅ Entwicklung: `http://localhost:5015`
- ✅ Production: `https://finaro.kynso.ch`

---

## 📚 Weiterführende Links

- [RFC 7231 - HTTP/1.1 Semantics](https://tools.ietf.org/html/rfc7231#section-6.4.2)
- [Let's Encrypt - SSL/TLS Best Practices](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

## 🎯 Zusammenfassung

| Situation | Verwende | Beispiel |
|-----------|----------|----------|
| 🖥️ Auf dem Server (SSH) | `http://localhost:5000` | Schnell & direkt |
| 💻 Von deinem Computer | `https://finaro.kynso.ch` | Sicher & korrekt |
| 🔒 Production | **Immer HTTPS** | Sicherheit first! |

**Merke:** 
- **HTTP von extern** → ❌ 301 Redirect, POST-Body verloren
- **HTTPS von extern** → ✅ Funktioniert perfekt
- **HTTP auf Server** → ✅ Funktioniert, aber nur von SSH

---

**Status:** ✅ Ready to use  
**Zuletzt aktualisiert:** 2025-11-21
