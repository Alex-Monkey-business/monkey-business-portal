"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/format";

async function db() {
  return await createClient();
}

export async function addChild(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#fbbf24");
  const weekly = Number(formData.get("weekly_amount") ?? 0);
  if (!name) return;

  const supabase = await db();
  const { error } = await supabase
    .from("children")
    .insert({ name, color, weekly_amount: weekly });
  if (error) throw error;

  revalidatePath("/");
}

export async function deleteChild(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await db();
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  redirect("/");
}

export async function addTask(formData: FormData) {
  const child_id = String(formData.get("child_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const reward = Number(formData.get("reward") ?? 0);
  if (!child_id || !title) return;

  const supabase = await db();
  const { error } = await supabase
    .from("tasks")
    .insert({ child_id, title, reward });
  if (error) throw error;

  revalidatePath(`/barn/${child_id}`);
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const child_id = String(formData.get("child_id") ?? "");
  if (!id) return;

  const supabase = await db();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;

  if (child_id) revalidatePath(`/barn/${child_id}`);
}

export async function toggleTaskCompletion(formData: FormData) {
  const task_id = String(formData.get("task_id") ?? "");
  const child_id = String(formData.get("child_id") ?? "");
  const reward = Number(formData.get("reward") ?? 0);
  const title = String(formData.get("title") ?? "");
  const completed_on = String(formData.get("completed_on") ?? todayIso());
  if (!task_id || !child_id) return;

  const supabase = await db();

  const { data: existing } = await supabase
    .from("task_completions")
    .select("id")
    .eq("task_id", task_id)
    .eq("completed_on", completed_on)
    .maybeSingle();

  if (existing) {
    await supabase.from("task_completions").delete().eq("id", existing.id);
    await supabase
      .from("transactions")
      .delete()
      .eq("task_id", task_id)
      .eq("kind", "task")
      .gte("created_at", `${completed_on}T00:00:00`)
      .lt("created_at", `${completed_on}T23:59:59`);
  } else {
    await supabase
      .from("task_completions")
      .insert({ task_id, completed_on });
    if (reward > 0) {
      await supabase.from("transactions").insert({
        child_id,
        amount: reward,
        kind: "task",
        note: title,
        task_id,
      });
    }
  }

  revalidatePath(`/barn/${child_id}`);
  revalidatePath("/");
  revalidatePath("/historikk");
}

export async function payWeeklyAllowance(formData: FormData) {
  const child_id = String(formData.get("child_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!child_id || amount <= 0) return;

  const supabase = await db();
  const { error } = await supabase.from("transactions").insert({
    child_id,
    amount,
    kind: "weekly",
    note: "Ukelønn",
  });
  if (error) throw error;

  revalidatePath(`/barn/${child_id}`);
  revalidatePath("/");
  revalidatePath("/historikk");
}

export async function recordSpend(formData: FormData) {
  const child_id = String(formData.get("child_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!child_id || amount <= 0) return;

  const supabase = await db();
  const { error } = await supabase.from("transactions").insert({
    child_id,
    amount: -Math.abs(amount),
    kind: "spend",
    note,
  });
  if (error) throw error;

  revalidatePath(`/barn/${child_id}`);
  revalidatePath("/");
  revalidatePath("/historikk");
}

export async function addBonus(formData: FormData) {
  const child_id = String(formData.get("child_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || "Bonus";
  if (!child_id || amount <= 0) return;

  const supabase = await db();
  const { error } = await supabase.from("transactions").insert({
    child_id,
    amount,
    kind: "bonus",
    note,
  });
  if (error) throw error;

  revalidatePath(`/barn/${child_id}`);
  revalidatePath("/");
  revalidatePath("/historikk");
}

export async function addGoal(formData: FormData) {
  const child_id = String(formData.get("child_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const target = Number(formData.get("target_amount") ?? 0);
  if (!child_id || !title || target <= 0) return;

  const supabase = await db();
  const { error } = await supabase
    .from("goals")
    .insert({ child_id, title, target_amount: target });
  if (error) throw error;

  revalidatePath(`/barn/${child_id}`);
}

export async function updateGoalSaved(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const child_id = String(formData.get("child_id") ?? "");
  const saved = Number(formData.get("saved_amount") ?? 0);
  if (!id) return;

  const supabase = await db();
  const { error } = await supabase
    .from("goals")
    .update({ saved_amount: saved })
    .eq("id", id);
  if (error) throw error;

  if (child_id) revalidatePath(`/barn/${child_id}`);
}

export async function deleteGoal(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const child_id = String(formData.get("child_id") ?? "");
  if (!id) return;

  const supabase = await db();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;

  if (child_id) revalidatePath(`/barn/${child_id}`);
}
