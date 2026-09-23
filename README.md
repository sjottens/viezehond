# Viezehond webshop

Eigen webshop voor hondenverzorging. Next.js 16 + Supabase (database) + Mollie (betalingen).

## Snel starten (demo, zonder accounts)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Zonder `.env.local` draait alles als demo:

- **Nepdata**: producten en bestellingen staan in `.data/db.json`. Opnieuw beginnen: `npm run demo:reset`.
- **Nep-betalingen**: bij afrekenen kom je op een demo-betaalpagina waar je kiest of de betaling lukt, mislukt, wordt geannuleerd of verloopt.
- **Beheer**: http://localhost:3000/admin, wachtwoord `demo`.

Vul je later `SUPABASE_*` of `MOLLIE_API_KEY` in, dan schakelt dat onderdeel vanzelf over naar het echte werk. In productie gaat de demo nooit per ongeluk aan: dan krijg je een foutmelding, tenzij je bewust `DEMO_MODE=true` zet.

## Handige commando's

| Commando | Wat |
|---|---|
| `npm run dev` | Lokaal draaien |
| `npm run build` | Productiebuild |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript-controle |
| `npm test` | Tests (checkout-validatie, sessies, verzendkosten) |
| `npm run demo:reset` | Demo-data wissen |

## Waar zit wat

- `app/(shop)` – de winkel; `app/admin` – het beheer; `app/api` – afrekenen, webhook, winkelwagen
- `lib/store` – alle data: `supabase.ts` (echt) en `local.ts` (demo), zelfde interface
- `lib/payments` – betalingen: `mollie.ts` (echt) en `demo.ts`
- `lib/session.ts` – beheer-login (ondertekend token, 12 uur geldig)
- `components/MudWipe.tsx` – de modderhond op de homepage
- `components/ProductArt.tsx` – illustraties voor producten zonder foto

## Hoe het werkt

1. Klant legt producten in de winkelwagen (bewaard in de browser).
2. Bij afrekenen stuurt de browser alleen product-id's en aantallen naar `/api/checkout`.
3. De server haalt de echte prijzen en voorraad uit de database, maakt de bestelling aan en vraagt Mollie om een betaling.
4. De klant betaalt op de Mollie-pagina (iDEAL, Bancontact, creditcard) en komt terug op `/bedankt`.
5. Mollie meldt de uitkomst aan `/api/webhooks/mollie`. De server checkt de status bij Mollie, zet de bestelling op "betaald" en boekt de voorraad af.
6. Jij ziet de bestelling in `/admin`, pakt in en klikt op "Markeer als verzonden".

## Installeren

### 1. Supabase (database)
1. Maak een gratis project op supabase.com.
2. Ga naar **SQL Editor**, plak de inhoud van `supabase/schema.sql` en klik Run. (Heb je al een database? Draai het bestand gewoon opnieuw: het werkt bestaande tabellen bij.)
3. Wil je testproducten? Doe hetzelfde met `supabase/seed.sql`.
4. Kopieer bij **Project Settings > API** de Project URL en de `service_role` key.

### 2. Mollie (betalingen)
1. Maak een account op mollie.com.
2. Kopieer bij **Developers > API keys** de **test**-key (`test_...`).
3. Zet in het dashboard de betaalmethodes aan die je wilt (iDEAL, Bancontact, creditcard).

### 3. Lokaal draaien
```bash
cp .env.example .env.local   # en vul de waarden in
npm install
npm run dev
```
Open http://localhost:3000 en http://localhost:3000/admin.

Lokaal kan Mollie je webhook niet bereiken. Dat is opgevangen: de bedankpagina vraagt de status zelf op bij Mollie. In testmodus kies je op de Mollie-pagina zelf of de betaling lukt of mislukt.

### 4. Online zetten (Vercel)
1. Zet het project op GitHub en importeer het in Vercel.
2. Voeg alle variabelen uit `.env.example` toe bij **Settings > Environment Variables**.
3. Zet `NEXT_PUBLIC_BASE_URL` op je echte adres, bijvoorbeeld `https://viezehond.nl`.
4. Test een bestelling met de test-key. Werkt alles, vervang dan `MOLLIE_API_KEY` door de `live_...` key (pas beschikbaar nadat Mollie je account heeft goedgekeurd).

## Aanpassen
- **Naam en teksten**: `app/layout.tsx`, `app/page.tsx`, `components/Header.tsx`
- **Kleuren en lettertypes**: bovenaan `app/globals.css`
- **Verzendkosten**: `lib/money.ts`
- **Categorieën**: `lib/catalog.ts`
- **Algemene voorwaarden**: `app/voorwaarden/page.tsx`

## Beveiliging
- `SUPABASE_SERVICE_ROLE_KEY`, `MOLLIE_API_KEY` en `ADMIN_*` zijn geheim. Nooit in git, nooit in code met `NEXT_PUBLIC_`.
- Prijzen worden altijd op de server berekend; een klant kan ze niet aanpassen.
- De database staat dicht voor de browser (Row Level Security zonder policies).
- Het beheer zit achter een wachtwoord, met maximaal 5 inlogpogingen per kwartier. Elke beheerpagina controleert zelf de sessie; proxy.ts is alleen de voordeur.
- Sessies verlopen na 12 uur. Wachtwoord of `ADMIN_SECRET` wijzigen logt iedereen direct uit.
- Kwam een betaling binnen terwijl de voorraad al op was, dan zie je een waarschuwing bij de bestelling.

## Nog te doen voordat je live gaat
- [ ] Algemene voorwaarden, privacyverklaring en bedrijfsgegevens (KvK, btw) op de site
- [ ] Mollie-account laten goedkeuren
- [ ] Een echte bestelling doen en terugbetalen via het Mollie-dashboard
- [ ] Bevestigingsmails naar klanten (volgende stap: Resend)
- [ ] Verzendlabels (volgende stap: Sendcloud)
