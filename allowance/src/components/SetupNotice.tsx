export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-stone-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-stone-100">
      <h2 className="text-lg font-semibold">Supabase er ikke konfigurert</h2>
      <p className="mt-2 text-sm">
        Du må koble til en Supabase-database før appen fungerer.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
        <li>
          Lag et gratis prosjekt på{" "}
          <a
            href="https://supabase.com"
            className="font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            supabase.com
          </a>
          .
        </li>
        <li>
          Åpne <strong>SQL Editor</strong> og kjør innholdet i{" "}
          <code className="rounded bg-stone-200 px-1 py-0.5 text-xs dark:bg-stone-800">
            supabase/schema.sql
          </code>
          .
        </li>
        <li>
          Hent <strong>Project URL</strong> og <strong>anon public key</strong>{" "}
          fra Project Settings → API.
        </li>
        <li>
          Kopier{" "}
          <code className="rounded bg-stone-200 px-1 py-0.5 text-xs dark:bg-stone-800">
            .env.local.example
          </code>{" "}
          til{" "}
          <code className="rounded bg-stone-200 px-1 py-0.5 text-xs dark:bg-stone-800">
            .env.local
          </code>{" "}
          og fyll inn verdiene.
        </li>
        <li>Restart dev-serveren.</li>
      </ol>
    </div>
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
