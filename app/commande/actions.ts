"use server";

import { supabaseAdmin } from "@/lib/supabase-server";

type Line = {
  productId: number;
  size: string | null;
  color: string | null;
  quantity: number;
};

export type OrderResult =
  | { ok: true; orderId: number; total: number; advance: number }
  | { ok: false; error: string };

export async function placeOrder(input: {
  name: string;
  phone: string;
  address: string;
  items: Line[];
}): Promise<OrderResult> {
  const name = String(input?.name ?? "").trim();
  const phone = String(input?.phone ?? "").trim();
  const address = String(input?.address ?? "").trim();

  if (name.length < 2 || name.length > 80)
    return { ok: false, error: "Nom invalide." };
  if (!/^[0-9+\s]{8,20}$/.test(phone))
    return { ok: false, error: "Numéro de téléphone invalide." };
  if (address.length < 5 || address.length > 300)
    return { ok: false, error: "Adresse invalide." };
  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 30
  )
    return { ok: false, error: "Panier invalide." };

  const items = [];
  for (const it of input.items) {
    const productId = Number(it.productId);
    const quantity = Number(it.quantity);
    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    )
      return { ok: false, error: "Panier invalide." };
    items.push({
      product_id: productId,
      size: it.size ? String(it.size).slice(0, 20) : null,
      color: it.color ? String(it.color).slice(0, 30) : null,
      quantity,
    });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.rpc("place_order", {
    p_name: name,
    p_phone: phone,
    p_address: address,
    p_items: items,
  });

  if (error) {
    const known = [
      "Stock insuffisant",
      "Article indisponible",
      "Taille invalide",
      "Couleur invalide",
      "Quantité invalide",
      "Panier invalide",
    ];
    const message = known.some((k) => error.message.includes(k))
      ? error.message
      : "Impossible d'enregistrer la commande. Réessayez.";
    return { ok: false, error: message };
  }

  const orderId = data as number;

  const { data: order } = await admin
    .from("orders")
    .select("total_gnf")
    .eq("id", orderId)
    .single();

  const total = Number(order?.total_gnf ?? 0);
  const advance = Math.ceil(total / 2);

  await admin
    .from("orders")
    .update({
      advance_gnf: advance,
      status: "awaiting_advance",
      payment_method: "orange_money_advance",
    })
    .eq("id", orderId);

  return { ok: true, orderId, total, advance };
}