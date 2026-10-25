"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-server";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function prepareUpload(contentType: string) {
  if (!(await requireAdmin()))
    return { ok: false as const, error: "Non autorisé." };
  const ext = TYPES[contentType];
  if (!ext)
    return { ok: false as const, error: "Format accepté : JPG, PNG ou WebP." };

  const path = `${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabaseAdmin()
    .storage.from("produits")
    .createSignedUploadUrl(path);
  if (error || !data)
    return { ok: false as const, error: "Envoi impossible." };

  return { ok: true as const, path, token: data.token };
}

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.slice(0, 20));
}

function refresh() {
  revalidatePath("/admin/produits");
  revalidatePath("/");
  revalidatePath("/catalogue");
}

export async function createProduct(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  if (!(await requireAdmin())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("category_id"));
  const imageUrl = String(formData.get("image_url") ?? "");

  if (name.length < 2 || name.length > 100) return { error: "Nom invalide." };
  if (description.length > 1000) return { error: "Description trop longue." };
  if (!Number.isInteger(price) || price < 0 || price > 100000000)
    return { error: "Prix invalide." };
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000)
    return { error: "Stock invalide." };
  if (!Number.isInteger(categoryId) || categoryId <= 0)
    return { error: "Catégorie invalide." };

  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produits/`;
  if (imageUrl && !imageUrl.startsWith(prefix))
    return { error: "Photo invalide." };

  const { error } = await supabaseAdmin()
    .from("products")
    .insert({
      name,
      description: description || null,
      price_gnf: price,
      stock,
      category_id: categoryId,
      image_url: imageUrl || null,
      sizes: parseList(formData.get("sizes")),
      colors: parseList(formData.get("colors")),
      active: true,
    });
  if (error) return { error: "Enregistrement impossible." };

  refresh();
  return { ok: true };
}

export async function updateProduct(formData: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const id = Number(formData.get("id"));
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const active = formData.get("active") === "on";

  if (!Number.isInteger(id) || id <= 0) return;
  if (!Number.isInteger(price) || price < 0 || price > 100000000) return;
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) return;

  await supabaseAdmin()
    .from("products")
    .update({ price_gnf: price, stock, active })
    .eq("id", id);

  refresh();
}