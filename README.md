# Viezehond webshop

Eigen webshop voor hondenverzorging. Next.js + Supabase (database) + Mollie (betalingen).

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
2. Ga naar **SQL Editor**, plak de inhoud van `supabase/schema.sql` en klik Run.
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
- Het beheer zit achter een wachtwoord. Gebruik een lang, uniek wachtwoord.

## Nog te doen voordat je live gaat
- [ ] Algemene voorwaarden, privacyverklaring en bedrijfsgegevens (KvK, btw) op de site
- [ ] Mollie-account laten goedkeuren
- [ ] Een echte bestelling doen en terugbetalen via het Mollie-dashboard
- [ ] Bevestigingsmails naar klanten (volgende stap: Resend)
- [ ] Verzendlabels (volgende stap: Sendcloud)
