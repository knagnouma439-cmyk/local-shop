"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseSession, requireAdmin } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Remplissez les deux champs." };

  const supabase = await supabaseSession();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email ou mot de passe incorrect." };

  const admin = await requireAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Accès refusé." };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await supabaseSession();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveAdvance(formData: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const id = Number(formData.get("orderId"));
  const amount = Math.round(Number(formData.get("amount")));
  if (!Number.isInteger(id) || id <= 0) return;
  if (!Number.isFinite(amount) || amount <= 0) return;

  await supabaseAdmin()
    .from("orders")
    .update({ advance_received_gnf: amount, status: "advance_paid" })
    .eq("id", id)
    .in("status", ["new", "awaiting_advance", "advance_paid"]);
  revalidatePath("/admin");
}

export async function setStatus(formData: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const id = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "");
  const allowedFrom: Record<string, string[]> = {
    shipping: ["advance_paid"],
    delivered: ["shipping"],
  };
  if (!Number.isInteger(id) || id <= 0) return;
  if (!(status in allowedFrom)) return;

  await supabaseAdmin()
    .from("orders")
    .update({ status })
    .eq("id", id)
    .in("status", allowedFrom[status]);
  revalidatePath("/admin");
}

export async function cancelOrder(formData: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const id = Number(formData.get("orderId"));
  if (!Number.isInteger(id) || id <= 0) return;

  await supabaseAdmin().rpc("cancel_order", { p_order_id: id });
  revalidatePath("/admin");
}