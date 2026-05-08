import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SetupNotice } from "@/components/SetupNotice";
import { formatDate, formatNok, todayIso } from "@/lib/format";
import {
  addBonus,
  addGoal,
  addTask,
  deleteChild,
  deleteGoal,
  deleteTask,
  payWeeklyAllowance,
  recordSpend,
  toggleTaskCompletion,
  updateGoalSaved,
} from "@/app/actions";
import type {
  Child,
  Goal,
  Task,
  TaskCompletion,
  Transaction,
} from "@/lib/db/types";

export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", id)
    .maybeSingle<Child>();

  if (!child) notFound();

  const today = todayIso();

  const [
    { data: tasks },
    { data: completions },
    { data: goals },
    { data: balanceRow },
    { data: recent },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("child_id", id)
      .eq("active", true)
      .order("created_at"),
    supabase
      .from("task_completions")
      .select("*")
      .eq("completed_on", today),
    supabase
      .from("goals")
      .select("*")
      .eq("child_id", id)
      .order("created_at"),
    supabase
      .from("child_balances")
      .select("balance")
      .eq("child_id", id)
      .maybeSingle<{ balance: number }>(),
    supabase
      .from("transactions")
      .select("*")
      .eq("child_id", id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const completedToday = new Set(
    (completions ?? []).map((c: TaskCompletion) => c.task_id),
  );
  const balance = Number(balanceRow?.balance ?? 0);

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-block text-sm text-stone-500 hover:underline dark:text-stone-400"
      >
        ← Tilbake
      </Link>

      <section className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-stone-900"
          style={{ backgroundColor: child.color }}
        >
          {child.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{child.name}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Ukelønn: {formatNok(Number(child.weekly_amount))}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Saldo
          </div>
          <div className="text-3xl font-bold tabular-nums">
            {formatNok(balance)}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <form action={payWeeklyAllowance}>
          <input type="hidden" name="child_id" value={child.id} />
          <input
            type="hidden"
            name="amount"
            value={String(Number(child.weekly_amount))}
          />
          <button
            type="submit"
            disabled={Number(child.weekly_amount) <= 0}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Utbetal ukelønn
          </button>
        </form>

        <details className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
            + Bonus
          </summary>
          <form action={addBonus} className="grid gap-2 p-3">
            <input type="hidden" name="child_id" value={child.id} />
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Beløp"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <input
              name="note"
              placeholder="Hva for? (valgfritt)"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white dark:bg-amber-400 dark:text-stone-900"
            >
              Legg til bonus
            </button>
          </form>
        </details>

        <details className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
            – Brukt penger
          </summary>
          <form action={recordSpend} className="grid gap-2 p-3">
            <input type="hidden" name="child_id" value={child.id} />
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Beløp"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <input
              name="note"
              placeholder="Hva ble kjøpt?"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500"
            >
              Registrer
            </button>
          </form>
        </details>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Oppgaver i dag</h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Huk av når oppgaven er gjort. Belønning legges automatisk til saldo.
        </p>
        <ul className="mt-3 space-y-2">
          {(tasks ?? []).length === 0 && (
            <li className="text-sm text-stone-500 dark:text-stone-400">
              Ingen oppgaver ennå.
            </li>
          )}
          {(tasks ?? []).map((t: Task) => {
            const done = completedToday.has(t.id);
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
              >
                <form action={toggleTaskCompletion} className="flex-1">
                  <input type="hidden" name="task_id" value={t.id} />
                  <input type="hidden" name="child_id" value={child.id} />
                  <input
                    type="hidden"
                    name="reward"
                    value={String(Number(t.reward))}
                  />
                  <input type="hidden" name="title" value={t.title} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                        done
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-stone-300 dark:border-stone-600"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span
                      className={`flex-1 ${
                        done ? "line-through text-stone-400" : ""
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      +{formatNok(Number(t.reward))}
                    </span>
                  </button>
                </form>
                <form action={deleteTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="child_id" value={child.id} />
                  <button
                    type="submit"
                    aria-label="Slett oppgave"
                    className="rounded-lg p-1 text-stone-400 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </form>
              </li>
            );
          })}
        </ul>

        <form
          action={addTask}
          className="mt-3 flex gap-2 rounded-xl border border-dashed border-stone-300 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
        >
          <input type="hidden" name="child_id" value={child.id} />
          <input
            name="title"
            required
            placeholder="Ny oppgave"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
          <input
            name="reward"
            type="number"
            min="0"
            step="1"
            defaultValue="10"
            className="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            aria-label="Belønning (NOK)"
          />
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-400 dark:text-stone-900"
          >
            +
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sparemål</h2>
        <ul className="mt-3 space-y-3">
          {(goals ?? []).length === 0 && (
            <li className="text-sm text-stone-500 dark:text-stone-400">
              Ingen sparemål ennå.
            </li>
          )}
          {(goals ?? []).map((g: Goal) => {
            const target = Number(g.target_amount);
            const saved = Number(g.saved_amount);
            const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
            return (
              <li
                key={g.id}
                className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{g.title}</span>
                  <span className="text-sm tabular-nums text-stone-500 dark:text-stone-400">
                    {formatNok(saved)} / {formatNok(target)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <form action={updateGoalSaved} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="child_id" value={child.id} />
                    <input
                      name="saved_amount"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={String(saved)}
                      className="w-32 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-stone-300 px-3 py-1 text-xs font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
                    >
                      Oppdater spart
                    </button>
                  </form>
                  <form action={deleteGoal}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="child_id" value={child.id} />
                    <button
                      type="submit"
                      aria-label="Slett sparemål"
                      className="rounded-lg p-1 text-stone-400 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          action={addGoal}
          className="mt-3 flex gap-2 rounded-xl border border-dashed border-stone-300 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
        >
          <input type="hidden" name="child_id" value={child.id} />
          <input
            name="title"
            required
            placeholder="Nytt sparemål (f.eks. Lego)"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
          <input
            name="target_amount"
            type="number"
            min="1"
            step="1"
            placeholder="Mål"
            required
            className="w-28 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-400 dark:text-stone-900"
          >
            +
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Siste hendelser</h2>
          <Link
            href="/historikk"
            className="text-sm text-stone-500 hover:underline dark:text-stone-400"
          >
            Se alt →
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {(recent ?? []).length === 0 && (
            <li className="p-3 text-sm text-stone-500 dark:text-stone-400">
              Ingen aktivitet ennå.
            </li>
          )}
          {(recent ?? []).map((t: Transaction) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span>
                <span className="block">{t.note ?? kindLabel(t.kind)}</span>
                <span className="block text-xs text-stone-500 dark:text-stone-400">
                  {formatDate(t.created_at)}
                </span>
              </span>
              <span
                className={`tabular-nums font-medium ${
                  Number(t.amount) >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {Number(t.amount) >= 0 ? "+" : ""}
                {formatNok(Number(t.amount))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-stone-200 pt-6 dark:border-stone-800">
        <details>
          <summary className="cursor-pointer text-sm text-rose-600 hover:underline">
            Slett {child.name}
          </summary>
          <form action={deleteChild} className="mt-3">
            <input type="hidden" name="id" value={child.id} />
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500"
            >
              Bekreft sletting (kan ikke angres)
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "weekly":
      return "Ukelønn";
    case "task":
      return "Oppgave";
    case "bonus":
      return "Bonus";
    case "spend":
      return "Bruk";
    case "adjust":
      return "Justering";
    default:
      return kind;
  }
}
