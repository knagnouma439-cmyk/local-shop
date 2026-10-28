"use client";

import { useState } from "react";

export default function DeleteProductButton({ name }: { name: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          🗑️ Supprimer ce produit
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Veux-tu vraiment supprimer « {name} » ?
          </p>

          <p className="text-xs text-red-700">
            Cette opération peut être définitive. Si ce produit est lié à des
            commandes, la suppression peut être refusée par la base de données.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Oui, supprimer
            </button>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}