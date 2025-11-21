# 🚀 Quick Fix: 301 Redirect Problem

## Das Problem

Wenn du versuchst, von deinem Computer aus einen User zu erstellen:

```bash
curl -X POST http://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finaro.ch","password":"123456","tenantId":1}'
```

**Bekommst du:**
```html
<html>
<head><title>301 Moved Permanently</title></head>
...
```

---

## ✅ Die Lösung

### Von deinem Computer:

```bash
# Verwende HTTPS (mit 's')!
curl -X POST https://finaro.kynso.ch/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.ch",
    "password": "SecurePass123!",
    "tenantId": 1
  }'
```

### Auf dem Server (via SSH):

```bash
# Zuerst SSH verbinden
ssh ubuntu@<your-server-ip>

# Dann HTTP über localhost verwenden
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finaro.ch",
    "password": "SecurePass123!",
    "tenantId": 1
  }'
```

---

## 📝 Warum?

- **HTTP von extern** → Nginx leitet auf HTTPS um → POST-Body geht verloren ❌
- **HTTPS von extern** → Direkte Verbindung → Funktioniert perfekt ✅
- **HTTP auf Server** → Direkter Zugriff zu Backend → Funktioniert auch ✅

---

## 🔗 Mehr Information

Siehe: `docs/HTTP_VS_HTTPS_GUIDE.md`
