# WOW-083: User Password Management

## Problemställning
Systemet saknar en säker och användarvänlig funktion för lösenordshantering (ändring och återställning).

## Önskat resultat
Användare ska kunna ändra sitt lösenord via sin profil, samt ha tillgång till en säker återställningsprocess via e-post.

## Krav
- [ ] Implementera `POST /api/auth/change-password` med säkra hash-kontroller.
- [ ] Implementera `POST /api/auth/reset-password` (e-postbaserad återställning).
- [ ] Uppdatera UI i `UserProfile.tsx` för lösenordsbyte.

---
## Meta
**Skapad**: 2026-06-06
**Prioritet**: High
**Uppskattad insats**: M
