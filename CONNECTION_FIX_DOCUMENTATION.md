# Connection Configuration Fix

## Problem
Die Anwendung hatte Connection-Fehler in verschiedenen Umgebungen:
- **DEV**: `Failed to load resource: net::ERR_CONNECTION_REFUSED :5020/user/login:1`
- **TEST**: `POST http://finaro.localhost:5021/user/login net::ERR_CONNECTION_REFUSED`

## Ursache
1. **Statischer Import in AuthService**: `auth.service.ts` importierte `tenants.json` statisch, wodurch Angular's file replacement nicht funktionierte
2. **Duplikation der Logik**: `AuthService` und `ApiService` hatten jeweils eigene baseURL-Initialisierung
3. **Komplexe tenant.json Logik**: Die Domain-Matching-Logik war fehleranfällig

## Lösung
### Neuer `ConfigService`
Ein zentraler Service wurde implementiert, der die Backend-URL automatisch basierend auf der Umgebung erkennt:

```typescript
// src/app/core/services/config.service.ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  getBaseUrl(): string
  getEnvironment(): 'Development' | 'Test' | 'Production'
  isLocal(): boolean
}
```

### Umgebungserkennung
Die Umgebung wird automatisch basierend auf dem Frontend-Port erkannt:

| Frontend-Port | Umgebung    | Backend-Port | Backend-URL               |
|---------------|-------------|--------------|---------------------------|
| 4200          | Development | 5020         | http://localhost:5020     |
| 4300          | Test        | 5021         | http://localhost:5021     |
| andere        | Production  | -            | https://{same-domain}     |

### Refactorings
1. **AuthService**: Nutzt jetzt `ConfigService` statt statischem import
2. **ApiService**: Nutzt jetzt `ConfigService` statt eigener Logik
3. **Keine Duplikation**: Eine einzige Source of Truth für die baseURL

## Testing
### Manueller Test
1. Öffne `test-config.html` im Browser
2. Überprüfe die erkannte Konfiguration

### Integration Test
#### Development Environment
```bash
# Terminal 1: Backend starten
cd src/backend/RP.CRM.Api
dotnet run --launch-profile Development

# Terminal 2: Frontend starten  
cd src/frontend
npm start

# Browser öffnen: http://localhost:4200
# Login versuchen - sollte auf http://localhost:5020/user/login verbinden
```

#### Test Environment
```bash
# Terminal 1: Backend starten
cd src/backend/RP.CRM.Api
ASPNETCORE_ENVIRONMENT=Test dotnet run

# Terminal 2: Frontend starten
cd src/frontend
npm run start:test

# Browser öffnen: http://localhost:4300
# Login versuchen - sollte auf http://localhost:5021/user/login verbinden
```

#### Production Environment
Die Production-Umgebung läuft in Docker mit einem Reverse Proxy:
```bash
docker-compose up
# Frontend und Backend laufen auf derselben Domain
# Nginx routet API-Requests zum Backend
```

## Vorteile der neuen Lösung
✅ **Keine statischen Imports**: Funktioniert mit allen Build-Konfigurationen  
✅ **Zentrale Konfiguration**: Eine Source of Truth  
✅ **Automatische Erkennung**: Keine manuelle Konfiguration nötig  
✅ **Einfacher zu warten**: Weniger Code-Duplikation  
✅ **Robuster**: Weniger fehleranfällig  

## Breakpoint für Debugging
Falls Verbindungsprobleme auftreten, füge einen Breakpoint in `config.service.ts` hinzu:

```typescript
constructor() {
  this.initializeBaseUrl();
  console.log('🔍 ConfigService initialized:', {
    hostname: window.location.hostname,
    port: window.location.port,
    baseUrl: this.baseUrl,
    environment: this.getEnvironment()
  });
}
```

## Weitere Hinweise
- Die `tenants.json` Files im Frontend werden nicht mehr verwendet, sind aber für mögliche zukünftige Features beibehalten
- Backend-tenant.json Files werden weiterhin für CORS und Tenant-Seeding verwendet
- Die ConfigService-Logik ist unabhängig von den tenant.json Files
