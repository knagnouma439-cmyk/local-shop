import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-server";
import AddProductForm from "@/components/AddProductForm";
import EditProductForm from "@/components/EditProductForm";
import DeleteProductButton from "@/components/DeleteProductButton";
import { updateProduct, deleteProduct } from "./actions";

async function Products() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const admin = supabaseAdmin();

  const [{ data: categories }, { data: products, error }] = await Promise.all([
    admin.from("categories").select("id, name").order("id"),
    admin
      .from("products")
      .select(
        "id, name, description, category_id, price_gnf, stock, active, image_url, sizes, colors"
      )
      .order("id", { ascending: false }),
  ]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Impossible de charger les produits. Vérifie la connexion à la base de données.
      </div>
    );
  }

  const articles = products ?? [];
  const categoryList = categories ?? [];
  const visibleCount = articles.filter((p) => p.active).length;
  const stockCount = articles.reduce(
    (total, p) => total + (Number(p.stock) || 0),
    0
  );

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Total des articles</p>
          <p className="mt-3 text-3xl font-black text-neutral-900">{articles.length}</p>
          <p className="mt-1 text-xs text-neutral-400">Articles enregistrés</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Articles visibles</p>
          <p className="mt-3 text-3xl font-black text-emerald-600">{visibleCount}</p>
          <p className="mt-1 text-xs text-neutral-400">Activés dans la boutique</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Stock disponible</p>
          <p className="mt-3 text-3xl font-black text-neutral-900">{stockCount}</p>
          <p className="mt-1 text-xs text-neutral-400">Unités en stock au total</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Catalogue
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-900">Ajouter un article</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Renseigne les informations et la photo de ton produit.
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <AddProductForm categories={categoryList} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Gestion du catalogue
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-900">Mes articles</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Modifie toutes les informations de tes produits.
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-600">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-2xl">
              ◇
            </div>
            <h3 className="mt-4 font-semibold text-neutral-900">Aucun article pour le moment</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Ajoute ton premier produit avec le formulaire ci-dessus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {articles.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-4 p-4 sm:p-5">
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-neutral-300">
                        ◇
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="break-words font-bold text-neutral-900">{p.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {p.active ? "Visible" : "Masqué"}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-black text-neutral-900">
                      {Number(p.price_gnf || 0).toLocaleString("fr-FR")} GNF
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Stock : <span className="font-semibold text-neutral-700">{p.stock ?? 0} unité(s)</span>
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Catégorie : {categoryList.find((c) => c.id === p.category_id)?.name ?? "Non définie"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 p-4 sm:p-5">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-semibold text-neutral-800 transition hover:border-emerald-500 hover:text-emerald-700">
                      <span>✏️ Modifier ce produit</span>
                      <span className="transition group-open:rotate-180">▾</span>
                    </summary>
                    <div className="pt-4">
                      <EditProductForm
                        product={{
                          ...p,
                          description: p.description ?? "",
                          sizes: p.sizes ?? [],
                          colors: p.colors ?? [],
                          image_url: p.image_url ?? "",
                        }}
                        categories={categoryList}
                        updateAction={updateProduct}
                      />
                    </div>
                  </details>

                  <form action={deleteProduct} className="mt-3">
                    <input type="hidden" name="id" value={p.id} />
                    <DeleteProductButton name={p.name} />
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          LOCAL SHOP · ADMINISTRATION
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
          Gestion des produits
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
          Gère ton catalogue, ajoute des articles et garde un œil sur tes stocks.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Chargement des produits…
          </div>
        }
      >
        <Products />
      </Suspense>
    </main>
  );
}