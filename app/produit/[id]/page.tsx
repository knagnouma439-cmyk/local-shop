import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatGnf } from "@/lib/format";
import AddToCart from "@/components/addToCart";

async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const { data: p } = await supabase
    .from("products")
    .select("id, name, description, price_gnf, image_url, sizes, colors, stock")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (!p) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Pas de photo
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="mt-2 text-xl">{formatGnf(p.price_gnf)}</p>
        {p.description && (
          <p className="mt-4 whitespace-pre-line text-neutral-700">
            {p.description}
          </p>
        )}
        <AddToCart
          product={{
            id: p.id,
            name: p.name,
            price_gnf: p.price_gnf,
            image_url: p.image_url,
            sizes: p.sizes ?? [],
            colors: p.colors ?? [],
            stock: p.stock,
          }}
        />
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<p>Chargement…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </main>
  );
}