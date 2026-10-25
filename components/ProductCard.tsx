
import Link from "next/link";
import { formatGnf } from "@/lib/format";

export type Product = {
  id: number;
  name: string;
  price_gnf: number;
  image_url: string | null;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <Link
      href={`/produit/${product.id}`}
      className="group block h-full overflow-hidden rounded-xl bg-neutral-950 text-white"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="h-12 w-12"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-xs uppercase tracking-[0.2em]">
              Photo à venir
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-black shadow-lg">
            Découvrir l’article
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-neutral-100 transition-colors group-hover:text-white sm:text-base">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-800 pt-3">
          <p className="text-sm font-semibold tracking-wide text-white sm:text-base">
            {formatGnf(product.price_gnf)}
          </p>

          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black"
            aria-hidden="true"
          >
            ↗
          </span>
        </div>
      </div>
    </Link>
  );
}

