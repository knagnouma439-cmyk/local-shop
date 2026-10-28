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

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.slice(0, 20));
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/produits");
  revalidatePath("/admin/statistiques");
  revalidatePath("/");
  revalidatePath("/catalogue");
}

function validImageUrl(imageUrl: string) {
  if (!imageUrl) return true;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) return false;

  const prefix = `${baseUrl}/storage/v1/object/public/produits/`;

  return imageUrl.startsWith(prefix);
}

export async function prepareUpload(contentType: string) {
  if (!(await requireAdmin())) {
    return { ok: false as const, error: "Non autorisé." };
  }

  const ext = TYPES[contentType];

  if (!ext) {
    return {
      ok: false as const,
      error: "Format accepté : JPG, PNG ou WebP.",
    };
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabaseAdmin()
    .storage.from("produits")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false as const, error: "Envoi impossible." };
  }

  return {
    ok: true as const,
    path,
    token: data.token,
  };
}

export async function createProduct(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("category_id"));
  const imageUrl = String(formData.get("image_url") ?? "");

  if (name.length < 2 || name.length > 100) {
    return { error: "Le nom doit contenir entre 2 et 100 caractères." };
  }

  if (description.length > 1000) {
    return { error: "La description est trop longue." };
  }

  if (!Number.isInteger(price) || price < 0 || price > 100000000) {
    return { error: "Prix invalide." };
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) {
    return { error: "Stock invalide." };
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "Catégorie invalide." };
  }

  if (!validImageUrl(imageUrl)) {
    return { error: "Photo invalide." };
  }

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

  if (error) {
    console.error("Erreur création produit :", error.message);
    return { error: "Enregistrement impossible." };
  }

  refresh();

  return { ok: true };
}

export async function updateProduct(formData: FormData) {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("category_id"));
  const imageUrl = String(formData.get("image_url") ?? "");
  const active = formData.get("active") === "on";

  if (!Number.isInteger(id) || id <= 0) return;

  if (name.length < 2 || name.length > 100) return;

  if (description.length > 1000) return;

  if (!Number.isInteger(price) || price < 0 || price > 100000000) {
    return;
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) {
    return;
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) return;

  if (!validImageUrl(imageUrl)) return;

  const { error } = await supabaseAdmin()
    .from("products")
    .update({
      name,
      description: description || null,
      price_gnf: price,
      stock,
      category_id: categoryId,
      image_url: imageUrl || null,
      sizes: parseList(formData.get("sizes")),
      colors: parseList(formData.get("colors")),
      active,
    })
    .eq("id", id);

  if (error) {
    console.error("Erreur modification produit :", error.message);
    return;
  }

  refresh();
}

export async function deleteProduct(formData: FormData) {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  const { error } = await supabaseAdmin()
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur suppression produit :", error.message);
    return;
  }

  refresh();
}