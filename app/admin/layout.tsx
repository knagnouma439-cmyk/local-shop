import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Administration | LOCAL SHOP",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Barre supérieure */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-lg font-black text-white">
              LS
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight">
                LOCAL SHOP
              </p>
              <p className="text-xs text-neutral-500">
                Espace administration
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-100"
          >
            ← Voir la boutique
          </Link>
        </div>
      </header>

      {/* Navigation principale */}
      <nav className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="shrink-0 border-b-2 border-transparent px-5 py-4 text-sm font-semibold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            Vue d’ensemble & commandes
          </Link>

          <Link
            href="/admin/produits"
            className="shrink-0 border-b-2 border-transparent px-5 py-4 text-sm font-semibold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            Produits
          </Link>
        </div>
      </nav>

      {/* Contenu de chaque page d'administration */}
      {children}
    </div>
  );
}