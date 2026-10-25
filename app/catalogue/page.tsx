
import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

async function Results({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q =
    (typeof params.q === "string" ? params.q : "")
      .trim()
      .slice(0, 50);
  const slug =
    typeof params.categorie === "string"
      ? params.categorie
      : "";

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id");

  const current = categories?.find((c) => c.slug === slug);

  let query = supabase
    .from("products")
    .select("id, name, price_gnf, image_url")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (current) query = query.eq("category_id", current.id);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/catalogue"
          className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
            !current
              ? "border-white bg-white text-black"
              : "border-neutral-700 text-neutral-300 hover:border-white hover:text-white"
          }`}
        >
          Tous les articles
        </Link>

        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/catalogue?categorie=${c.slug}`}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              current?.id === c.id
                ? "border-white bg-white text-black"
                : "border-neutral-700 text-neutral-300 hover:border-white hover:text-white"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {q && (
        <p className="mb-6 text-sm text-neutral-400">
          Résultats pour{" "}
          <span className="font-medium text-white">« {q} »</span>
        </p>
      )}

      {error ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <p className="font-medium text-white">
            Impossible de charger les articles.
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            Vérifie ta connexion et réessaie.
          </p>
        </div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">
            Aucun article trouvé
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            Essaie une autre recherche ou sélectionne une autre catégorie.
          </p>
          <Link
            href="/catalogue"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Voir tous les articles
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Notre sélection
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                {current?.name ?? "Tous les articles"}
              </h2>
            </div>
            <p className="shrink-0 text-sm text-neutral-400">
              {data.length} article{data.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((p) => (
              <div
                key={p.id}
                className="group min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition duration-300 hover:-translate-y-1 hover:border-neutral-600 hover:shadow-xl hover:shadow-black/30"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function Catalogue({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-neutral-800 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
            Style · Qualité · Élégance
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Le catalogue<span className="text-neutral-500">.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                Découvre notre sélection de vêtements et d’accessoires
                pour affirmer ton style au quotidien.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              ← Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-neutral-800 p-10 text-center text-neutral-400">
              Chargement de la collection…
            </div>
          }
        >
          <Results searchParams={searchParams} />
        </Suspense>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 to-black px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            VOTRE STYLE, VOTRE SIGNATURE
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <h2 className="max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
              Trouve les pièces qui te ressemblent.
            </h2>
            <Link
              href="/catalogue"
              className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Explorer la collection →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

