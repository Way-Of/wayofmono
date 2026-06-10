---
title: VNC OptiCat - WebSocket Authentication Issue
priority: High
status: Backlog
tags: [authentication, websocket, opticat, security]
related: []
---

## Önskat resultat (Desired Outcome)

Admin och super admin ska kunna logga in i Way of Work och använda OptiCat VNC-gränssnittet utan authentication-fel. 

Nuvarande fel: `WebSocket connection failed: HTTP Authentication failed; no valid credentials available`

VNC-gränssnittet kräver att användaren är inloggad på Way of Work för att autentisera WebSocket-anslutningen till `/ws/opticat/vnc`.

## Nuvarande beteende/problem

När användare förs att ansluta till OptiCat VNC efter inloggning visas felet:
```
WebSocket connection to 'ws://localhost:5173/ws/opticat/vnc' failed: HTTP Authentication failed; no valid credentials available
```

Detta inträffar även när:
- Användaren är inloggad som admin
- JWT-token finns i localStorage
- Sidan har laddats korrekt

## Underskökning

- ✅ VNC WebSocket endpoint har JWT-autentisering implementerad (server/index.ts:170-173)
- ✅ Frontend läser korrekt toket från localStorage
- ✅ Token används i alla API-anrop med `Authorization: Bearer ${token}`
- ⚠️ WebSocket-anslutningar verkar inte inkludera auth-headers vid upgrade

## Möjliga lösningar

1. **Verifiera hur WebSocket upgrade-anrop skickas från VNC**
   - OptiCat kanske inte skickar auth-headers vid WebSocket handshake
   - Server måste potentiellt extrahera token från inkommande request

2. **Add fallback authentication**
   - Acceptera token i WebSocket headers om tillgängligt
   - Om inte, kolla efter token i inkommande request body eller query params

3. **Separate WebSocket endpoint för auth**
   - Endpoint för att hämta temporary token för WebSocket
   - `/api/vnc-token` som returnerar kortlivat token för VNC-sessionen

4. **Verify token vid WebSocket upgrade direkt**
   - Extrahera token från request headers
   - Om header saknas, kolla om client skickar token annars

## Teknikal krav

- JWT-token måste valideras vid WebSocket upgrade
- Session måste ha tillgång till OptiCat WebSocket endpoint
- Auth-check måste inte bryda VNC-funktionaliteten
- Super admin/admin role måste ha tillgång

## Steps för att åtgärda

1. Inspektera hur VNC.html skickar WebSocket-anslutning
2. Logga WebSocket upgrade request för att se om token skickas
3. Uppdatera `/ws/opticat/vnc` endpoint för att acceptera token från request headers
4. Testa med Chrome DevTools Network tab för att se actual request
5. Ensure server extraherar och validerar token vid upgrade

## Notes

OptiCat verkar förvänta sig en ren WebSocket-anslutning utan explicit auth header vid handshake.
Server måste hantera detta genom att antingen:
- Acceptera anslutningen utan token och validera senare via session
- Kräva att klienten skickar token på ett annat sätt

## Checklist

- [ ] Inspektera WebSocket upgrade request
- [ ] Ändra `/ws/opticat/vnc` endpoint för att hantera missing auth header
- [ ] Implementera fallback token-validering
- [ ] Testa med olika role-kombinationer
- [ ] Verify all features still work after auth changes
- [ ] Dokumentera expected behavior i OptiCat integration guide
