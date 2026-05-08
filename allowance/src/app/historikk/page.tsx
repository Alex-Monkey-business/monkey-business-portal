import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SetupNotice } from "@/components/SetupNotice";
import { formatDate, formatNok } from "@/lib/format";
import type { Child, Transaction, TransactionKind } from "@/lib/db/types";

const KIND_LABEL: Record<TransactionKind, string> = {
  weekly: "Ukelønn",
  task: "Oppgave",
  bonus: "Bonus",
  spend: "Bruk",
  adjust: "Justering",
};

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const [{ data: txns }, { data: children }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("children").select("*"),
  ]);

  const childById = new Map<string, Child>(
    (children ?? []).map((c: Child) => [c.id, c]),
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Historikk</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Siste 100 hendelser på tvers av alle barn.
        </p>
      </section>

      {(txns ?? []).length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Ingen hendelser registrert ennå.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {(txns ?? []).map((t: Transaction) => {
            const child = childById.get(t.child_id);
            const positive = Number(t.amount) >= 0;
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-semibold text-stone-900"
                  style={{ backgroundColor: child?.color ?? "#e7e5e4" }}
                >
                  {child?.name.charAt(0).toUpperCase() ?? "?"}
                </span>
                <span className="flex-1">
                  <span className="block">
                    <span className="font-medium">
                      {child?.name ?? "Ukjent"}
                    </span>{" "}
                    <span className="text-stone-500 dark:text-stone-400">
                      · {KIND_LABEL[t.kind] ?? t.kind}
                    </span>
                  </span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    {t.note ? `${t.note} · ` : ""}
                    {formatDate(t.created_at)}
                  </span>
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    positive
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {positive ? "+" : ""}
                  {formatNok(Number(t.amount))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
