
import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((category, index) => (
        <Link
          key={category.id}
          href={`/catalogue?categorie=${category.slug}`}
          className="group flex min-h-24 items-end justify-between border border-neutral-200 bg-white p-4 transition duration-300 hover:border-black hover:bg-black hover:text-white sm:min-h-28 sm:p-5"
        >
          <span className="text-base font-medium sm:text-lg">
            {category.name}
          </span>
          <span className="text-sm text-neutral-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
            ↗
          </span>
        </Link>
      ))}
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
        Impossible de charger les articles pour le moment.
      </p>
    );
  }

  if (!data?.length) {
    return (
      <div className="border border-neutral-200 px-6 py-12 text-center">
        <p className="text-lg font-medium">Votre prochaine pièce préférée.</p>
        <p className="mt-2 text-sm text-neutral-500">
          Les nouveaux articles apparaîtront ici dès leur ajout à la boutique.
        </p>
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

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
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
      <section className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="relative isolate overflow-hidden bg-neutral-950 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72"
          />

          <div className="relative grid min-h-[430px] items-center gap-8 px-6 py-12 sm:px-10 sm:py-16 md:min-h-[500px] md:grid-cols-[1.15fr_0.85fr] md:px-14 lg:px-20 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-3 border border-white/20 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-300 sm:text-xs">
                  La mode, autrement
                </span>
              </div>

              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-400 sm:text-sm">
                Nouvelle collection
              </p>

              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Le style qui
                <br />
                vous ressemble<span className="text-neutral-500">.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-neutral-300 sm:text-base">
                Découvrez une sélection de vêtements pensée pour affirmer
                votre personnalité. Des pièces à choisir, des looks à créer,
                votre style à vous.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/catalogue"
                  className="inline-flex min-h-12 items-center justify-center gap-4 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
                >
                  Découvrir la collection
                  <span aria-hidden="true">↗</span>
                </Link>

                <Link
                  href="/catalogue"
                  className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
                >
                  Explorer la boutique
                </Link>
              </div>

              <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Mode · Sélection · Style
              </p>
            </div>

            {/* VISUEL ÉDITORIAL SANS PHOTO EXTERNE */}
            <div className="relative hidden min-h-[330px] items-center justify-center md:flex lg:min-h-[370px]">
              <div className="absolute right-4 top-2 h-[88%] w-[78%] border border-white/15" />
              <div className="relative flex h-[310px] w-[78%] flex-col justify-between bg-neutral-900 p-6 lg:h-[350px] lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  Votre univers
                </p>

                <div>
                  <p className="text-5xl font-semibold leading-none tracking-[-0.06em] lg:text-7xl">
                    STYLE
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-neutral-400">
                    Sans compromis.
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-white/15 pt-4">
                  <span className="text-xs text-neutral-400">
                    Trouvez votre signature
                  </span>
                  <span className="text-2xl">↗</span>
                </div>
              </div>

              <div className="absolute bottom-5 left-0 border border-white/20 bg-neutral-950 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  Votre prochain look
                </p>
                <p className="mt-1 text-sm font-medium">Commence ici.</p>
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-3 border-t border-white/15">
            {[
              "Style affirmé",
              "Sélection mode",
              "Nouveaux looks",
            ].map((item) => (
              <div
                key={item}
                className="border-r border-white/10 px-2 py-4 text-center last:border-r-0 sm:py-5"
              >
                <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-300 sm:text-xs sm:tracking-[0.18em]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <SectionTitle
          eyebrow="Explorez notre univers"
          title="Trouvez votre style."
          description="Parcourez les catégories et découvrez les pièces qui vous correspondent."
        />

        <Suspense
          fallback={
            <p className="py-6 text-sm text-neutral-500">
              Chargement des catégories…
            </p>
          }
        >
          <Categories />
        </Suspense>
      </section>

      {/* DERNIERS ARTICLES */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="À découvrir"
              title="Les dernières pièces."
              description="Les nouveautés de la boutique, réunies au même endroit."
            />

            <Link
              href="/catalogue"
              className="mb-6 inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-sm font-semibold transition hover:gap-5 sm:mb-8"
            >
              Voir tout le catalogue
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Suspense
            fallback={
              <p className="py-8 text-sm text-neutral-500">
                Chargement des articles…
              </p>
            }
          >
            <LatestProducts />
          </Suspense>
        </div>
      </section>

      {/* SIGNATURE DE MARQUE */}
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="flex flex-col justify-between gap-8 border-b border-neutral-200 pb-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Votre style, vos choix
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              La bonne pièce.
              <br />
              La bonne attitude.
            </h2>
          </div>

          <Link
            href="/catalogue"
            className="inline-flex min-h-12 w-fit items-center gap-4 bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Entrer dans la boutique
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em]">
            Votre boutique de mode
          </p>
          <p className="text-xs text-neutral-500">
            Une sélection à découvrir, un style à composer.
          </p>
        </div>
      </section>
    </main>
  );
}