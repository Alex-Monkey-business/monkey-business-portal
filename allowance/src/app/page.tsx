import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SetupNotice } from "@/components/SetupNotice";
import { formatNok } from "@/lib/format";
import { addChild } from "./actions";
import type { Child, ChildBalance } from "@/lib/db/types";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const [{ data: children }, { data: balances }] = await Promise.all([
    supabase.from("children").select("*").order("created_at"),
    supabase.from("child_balances").select("*"),
  ]);

  const balanceById = new Map<string, number>(
    (balances ?? []).map((b: ChildBalance) => [b.child_id, Number(b.balance)]),
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Barna</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Oversikt over saldo og aktivitet.
        </p>
      </section>

      {(children ?? []).length === 0 ? (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Ingen barn lagt til ennå. Bruk skjemaet under for å starte.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {(children ?? []).map((c: Child) => (
            <li key={c.id}>
              <Link
                href={`/barn/${c.id}`}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-stone-900"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{c.name}</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    Ukelønn: {formatNok(Number(c.weekly_amount))}
                  </span>
                </span>
                <span className="text-xl font-semibold tabular-nums">
                  {formatNok(balanceById.get(c.id) ?? 0)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-lg font-semibold">Legg til barn</h2>
        <form action={addChild} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            name="name"
            required
            placeholder="Navn"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
          <input
            name="weekly_amount"
            type="number"
            min="0"
            step="1"
            defaultValue="50"
            className="w-28 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            aria-label="Ukelønn (NOK)"
          />
          <input
            name="color"
            type="color"
            defaultValue="#fbbf24"
            className="h-10 w-12 cursor-pointer rounded-lg border border-stone-300 dark:border-stone-700"
            aria-label="Farge"
          />
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-900 dark:hover:bg-amber-300"
          >
            Legg til
          </button>
        </form>
      </section>
    </div>
  );
}
