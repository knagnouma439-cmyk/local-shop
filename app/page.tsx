import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

const heroImage =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85";

const categoryImages: Record<string, string> = {
  "t-shirt":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",

  "t-shirts":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",

  tshirt:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",

  tshirts:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",

  pantalons:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",

  pantalon:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",

  jeans:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",

  vestes:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",

  veste:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",

  robes:
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=85",

  robe:
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=85",

  chaussures:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",

  chaussure:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",

  baskets:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",

  accessoires:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",

  sacs:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",

  montres:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",

  sport:
    "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=85",

  sweats:
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",

  "sweat-shirts":
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",

  chemises:
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",

  chemise:
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",

  mode_femme:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85",

  mode_homme:
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=85",
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function Categories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id");

  if (error) {
    return (
      <p className="text-sm text-neutral-500">
        Les catégories ne sont pas disponibles pour le moment.
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-neutral-500">
        Les catégories seront bientôt disponibles.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {data.map((category) => {
        const slug = normalizeSlug(category.slug || category.name);

        const image =
          categoryImages[slug] ||
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85";

        return (
          <Link
            key={category.id}
            href={`/catalogue?categorie=${encodeURIComponent(category.slug)}`}
            className="group relative isolate flex h-52 items-end overflow-hidden bg-neutral-200 sm:h-64"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-cover bg-center transition duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url("${image}")` }}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
            />

            <div className="flex w-full items-end justify-between gap-2 p-4 text-white sm:p-5">
              <span className="text-base font-semibold sm:text-lg">
                {category.name}
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 transition duration-300 group-hover:bg-white group-hover:text-black">
                ↗
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function LatestProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_gnf, image_url")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    return (
      <p className="py-8 text-sm text-neutral-500">
        Impossible de charger les produits pour le moment.
      </p>
    );
  }

  if (!data?.length) {
    return (
      <div className="border border-neutral-200 bg-white px-6 py-14 text-center">
        <p className="text-xl font-semibold">
          Nos prochaines nouveautés arrivent.
        </p>

        <p className="mt-3 text-sm text-neutral-500">
          Les produits ajoutés à la boutique apparaîtront ici.
        </p>

        <Link
          href="/catalogue"
          className="mt-6 inline-flex bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Explorer la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
        {label}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      {/* GRANDE BANNIÈRE */}
      <section className="mx-auto max-w-[1600px] px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="relative isolate min-h-[520px] overflow-hidden bg-neutral-900 sm:min-h-[600px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10"
          />

          <div className="flex min-h-[520px] items-center px-6 py-16 sm:min-h-[600px] sm:px-12 md:px-20 lg:px-24">
            <div className="max-w-3xl text-white">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/30 bg-black/20 px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  Style · Qualité · Élégance
                </span>
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300 sm:text-base">
                Nouvelle collection
              </p>

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Découvre ton
                <br />
                nouveau style.
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-200 sm:text-lg">
                Des vêtements tendance pour affirmer ta personnalité.
                Trouve les pièces qui te ressemblent et compose ton propre look.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/catalogue"
                  className="inline-flex min-h-12 items-center justify-center gap-4 rounded-sm bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  Découvrir la collection
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/catalogue"
                  className="inline-flex min-h-12 items-center justify-center border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Explorer la boutique
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-neutral-300 sm:text-sm">
                <span>✦ Style moderne</span>
                <span>✦ Nouvelles collections</span>
                <span>✦ Pour tous les goûts</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 border-t border-white/20 bg-black/20 backdrop-blur-sm">
            {[
              "Nouveaux looks",
              "Style affirmé",
              "Collection tendance",
            ].map((item) => (
              <div
                key={item}
                className="px-2 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-white sm:py-5 sm:text-xs"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            label="Explore notre univers"
            title="Trouve ton style."
            description="Des pièces sélectionnées pour créer des looks qui te ressemblent."
          />

          <Link
            href="/catalogue"
            className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:gap-3 sm:inline-flex"
          >
            Tout voir →
          </Link>
        </div>

        <Suspense
          fallback={
            <p className="py-8 text-sm text-neutral-500">
              Chargement des catégories…
            </p>
          }
        >
          <Categories />
        </Suspense>
      </section>

      {/* NOUVEAUTÉS */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              label="Fraîchement arrivés"
              title="Les nouveautés."
              description="Découvre les dernières pièces ajoutées à notre collection."
            />

            <Link
              href="/catalogue"
              className="inline-flex w-fit items-center gap-3 border-b border-emerald-700 pb-2 text-sm font-semibold text-emerald-800 transition hover:gap-5"
            >
              Voir tous les produits
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Suspense
            fallback={
              <p className="py-8 text-sm text-neutral-500">
                Chargement des produits…
              </p>
            }
          >
            <LatestProducts />
          </Suspense>
        </div>
      </section>

      {/* BANNIÈRE DE MARQUE */}
      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="relative isolate overflow-hidden bg-emerald-950 px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80")',
            }}
          />

          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              LOCAL SHOP
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              La mode, c’est aussi une façon de s’exprimer.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-200 sm:text-base">
              Explore nos collections, découvre tes prochains coups de cœur
              et crée un style qui ne ressemble qu’à toi.
            </p>

            <Link
              href="/catalogue"
              className="mt-8 inline-flex min-h-12 items-center gap-4 bg-white px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-100"
            >
              Trouver mon prochain look
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}