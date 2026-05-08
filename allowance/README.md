# Ukelønn

Enkel ukelønnsapp for barna. Next.js + Supabase + Tailwind.

## Funksjoner

- Flere barn med egen saldo og avatar-farge
- Daglige oppgaver med belønning som hukes av (én avhuking = én utbetaling per dag)
- Sparemål med fremdrifts-bar
- Ukelønn-knapp (utbetaler det fastsatte beløpet)
- Bonus / "brukt penger" / historikk på tvers av alle barn

## Komme i gang

### 1. Sett opp Supabase

1. Lag et gratis prosjekt på [supabase.com](https://supabase.com).
2. Åpne **SQL Editor** og kjør innholdet i [`supabase/schema.sql`](./supabase/schema.sql).
3. Hent **Project URL** og **anon public key** fra _Project Settings → API_.

### 2. Konfigurer miljøvariabler

```bash
cp .env.local.example .env.local
# Fyll inn NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Deploy

Anbefalt: [Vercel](https://vercel.com). Importer repoet, sett root directory til
`allowance`, og legg inn de samme env-variablene i Vercel-prosjektet.

## Sikkerhet

Skjemaet bruker p.t. åpne RLS-policies — alle med URL og anon-nøkkel kan lese/skrive.
Greit for husholdnings-bruk på en privat lenke. Bytt til Supabase Auth + bedre policies
hvis du vil låse det ned.
