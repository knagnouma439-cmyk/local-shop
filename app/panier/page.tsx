
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatGnf } from "@/lib/format";

export default function Panier() {
  const { items, total, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-[75vh] bg-white px-4 py-12 text-neutral-950 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Votre sélection
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Votre panier<span className="text-neutral-400">.</span>
          </h1>

          <div className="mt-10 border-y border-neutral-200 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 text-3xl">
              ♡
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Votre panier est encore vide.
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
              Découvrez notre sélection et trouvez les pièces qui correspondent
              à votre style.
            </p>

            <Link
              href="/catalogue"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Découvrir la boutique
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            La mode, selon votre style
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-neutral-950 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* EN-TÊTE */}
        <div className="border-b border-neutral-200 pb-7 sm:pb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Votre sélection personnelle
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Votre panier<span className="text-neutral-400">.</span>
              </h1>

              <p className="mt-3 text-sm text-neutral-500">
                {items.length} {items.length > 1 ? "articles sélectionnés" : "article sélectionné"}
              </p>
            </div>

            <Link
              href="/catalogue"
              className="mb-1 inline-flex items-center gap-2 border-b border-neutral-300 pb-2 text-sm font-medium transition hover:border-black"
            >
              Continuer mes achats
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* CONTENU DU PANIER */}
        <div className="grid grid-cols-1 gap-10 py-8 lg:grid-cols-[1fr_340px] lg:gap-14 lg:py-10">
          <section>
            <div className="mb-5 hidden grid-cols-[1fr_auto] border-b border-neutral-200 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 sm:grid">
              <span>Article</span>
              <span>Quantité et prix</span>
            </div>

            <ul className="divide-y divide-neutral-200">
              {items.map((item, index) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 py-6 sm:gap-6"
                >
                  {/* PHOTO DE L'ARTICLE */}
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-neutral-100 sm:h-40 sm:w-32">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-300">
                        ♡
                      </div>
                    )}
                  </div>

                  {/* INFORMATIONS DE L'ARTICLE */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:gap-6">
                    <div className="min-w-0">
                      <h2 className="break-words text-base font-semibold leading-snug sm:text-lg">
                        {item.name}
                      </h2>

                      {(item.size || item.color) && (
                        <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-medium">
                        {formatGnf(item.price_gnf)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-4 w-fit border-b border-neutral-300 pb-1 text-xs text-neutral-500 transition hover:border-black hover:text-black"
                      >
                        Retirer l’article
                      </button>
                    </div>

                    {/* QUANTITÉ ET SOUS-TOTAL */}
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                      <div className="flex h-10 items-center border border-neutral-200">
                        <button
                          type="button"
                          aria-label={`Diminuer la quantité de ${item.name}`}
                          onClick={() =>
                            setQuantity(index, item.quantity - 1)
                          }
                          className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-neutral-100"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Augmenter la quantité de ${item.name}`}
                          onClick={() =>
                            setQuantity(index, item.quantity + 1)
                          }
                          className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-neutral-100"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-semibold sm:text-right">
                        {formatGnf(item.price_gnf * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* RÉCAPITULATIF */}
          <aside className="h-fit border border-neutral-200 bg-neutral-50 p-5 sm:p-7 lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Récapitulatif
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Votre commande
            </h2>

            <div className="mt-7 space-y-4 border-b border-neutral-200 pb-5">
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-neutral-500">
                  Articles ({items.reduce((sum, item) => sum + item.quantity, 0)})
                </span>

                <span className="text-right font-medium">
                  {formatGnf(total)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-neutral-500">Livraison</span>
                <span className="text-right text-xs text-neutral-500">
                  À confirmer
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 py-5">
              <span className="text-sm font-semibold">Total des articles</span>

              <span className="text-right text-lg font-semibold tracking-tight">
                {formatGnf(total)}
              </span>
            </div>

            <p className="mb-5 text-xs leading-5 text-neutral-500">
              Les frais éventuels de livraison seront à confirmer avant la
              validation finale de votre commande.
            </p>

            <Link
              href="/commande"
              className="flex min-h-14 w-full items-center justify-center gap-3 bg-black px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Passer la commande
              <span aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/catalogue"
              className="mt-4 flex min-h-12 w-full items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-medium transition hover:border-black hover:bg-white"
            >
              Continuer mes achats
            </Link>

            <div className="mt-7 border-t border-neutral-200 pt-5">
              <p className="text-center text-[10px] uppercase leading-5 tracking-[0.15em] text-neutral-500">
                Votre style commence ici.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
