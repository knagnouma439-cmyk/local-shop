import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import CartLink from "@/components/CartLink";
import WhatsAppButton from "@/components/WhatsappButton";
export const metadata: Metadata = {
  title: "Ma boutique",
  description: "Vêtements et accessoires en Guinée",
};

function SearchBox({ className }: { className?: string }) {
  return (
    <form action="/catalogue" className={className}>
      <input
        name="q"
        maxLength={50}
        placeholder="Rechercher un article…"
        className="w-full rounded-full border px-4 py-2 text-sm"
      />
    </form>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <CartProvider>
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="text-xl font-bold tracking-tight">
                MA BOUTIQUE
              </Link>
              <SearchBox className="hidden flex-1 sm:block" />
              <div className="flex items-center gap-4">
                <Link href="/catalogue" className="text-sm font-medium">
                  Catalogue
                </Link>
                <CartLink />
              </div>
            </div>
            <SearchBox className="px-4 pb-3 sm:hidden" />
          </header>
          {children}
          <footer className="mt-16 border-t py-8 text-center text-sm text-neutral-500">
            © Ma boutique
          </footer>
                    <WhatsAppButton floating />
        </CartProvider>
      </body>
    </html>
  );
}