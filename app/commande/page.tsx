"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatGnf } from "@/lib/format";
import { placeOrder } from "./actions";
import WhatsAppButton from "@/components/WhatsappButton";

const OM_NUMBER = process.env.NEXT_PUBLIC_ORANGE_MONEY_NUMBER ?? "";

export default function Commande() {
  const { items, total, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{
    orderId: number;
    total: number;
    advance: number;
  } | null>(null);

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">
          Commande n° {done.orderId} enregistrée
        </h1>
        <div className="mt-6 space-y-2 rounded-xl border p-4">
          <p className="font-semibold">
            Pour valider votre commande, payez l&apos;avance (50 %) par Orange
            Money :
          </p>
          <p>
            Montant de l&apos;avance : <strong>{formatGnf(done.advance)}</strong>
          </p>
          <p>
            Envoyer au numéro : <strong>{OM_NUMBER}</strong>
          </p>
          <p>
            Reste à payer à la livraison :{" "}
            {formatGnf(done.total - done.advance)}
          </p>
          <p className="pt-2 text-sm text-neutral-600">
            Indiquez le numéro de commande {done.orderId} si possible. Nous
            confirmons dès réception de l&apos;avance, puis nous organisons la
            livraison.
          </p>
        </div>
                <div className="mt-6">
          <p className="mb-2 text-sm text-neutral-600">
            Vous souhaitez payer une avance différente ? Discutons-en sur
            WhatsApp, puis réglez le reste avec votre numéro de commande.
          </p>
          <WhatsAppButton
            label="Discuter de l'avance sur WhatsApp"
            message={`Bonjour, commande n° ${done.orderId}. Je voudrais discuter du montant de l'avance.`}
          />
        </div>
        <Link href="/catalogue" className="mt-6 inline-block underline">
          Continuer mes achats
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Commande</h1>
        <p className="mt-4">Votre panier est vide.</p>
        <Link href="/catalogue" className="mt-4 inline-block underline">
          Voir le catalogue
        </Link>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await placeOrder({
      name,
      phone,
      address,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    });
    setLoading(false);
    if (result.ok) {
      clear();
      setDone({
        orderId: result.orderId,
        total: result.total,
        advance: result.advance,
      });
    } else {
      setError(result.error);
    }
  }

  const inputClass = "w-full rounded-lg border px-4 py-3";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Finaliser la commande</h1>

      <ul className="mb-6 divide-y rounded-xl border">
        {items.map((i) => (
          <li
            key={`${i.productId}-${i.size}-${i.color}`}
            className="flex justify-between p-3 text-sm"
          >
            <span>
              {i.quantity} × {i.name}
              {[i.size, i.color].filter(Boolean).length > 0 &&
                ` (${[i.size, i.color].filter(Boolean).join(", ")})`}
            </span>
            <span>{formatGnf(i.quantity * i.price_gnf)}</span>
          </li>
        ))}
        <li className="flex justify-between p-3 font-semibold">
          <span>Total</span>
          <span>{formatGnf(total)}</span>
        </li>
      </ul>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className={inputClass}
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          autoComplete="name"
          required
        />
        <input
          className={inputClass}
          placeholder="Téléphone (ex. 622 00 00 00)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          autoComplete="tel"
          required
        />
        <textarea
          className={inputClass}
          placeholder="Adresse de livraison (quartier, repères)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={300}
          rows={3}
          required
        />
        <p className="text-sm text-neutral-600">
          Une avance de 50 % par Orange Money est demandée pour valider la
          commande. Le reste se paie à la livraison.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white disabled:bg-neutral-400"
        >
          {loading ? "Envoi…" : "Confirmer la commande"}
        </button>
      </form>
    </main>
  );
}