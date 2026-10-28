
"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  createProduct,
  prepareUpload,
} from "@/app/admin/produits/actions";

type Category = {
  id: number;
  name: string;
};

export default function AddProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(createProduct, null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setName("");
      setDescription("");
      setCategoryId("");
      setPrice("");
      setStock("");
      setSizes("");
      setColors("");
      setImageUrl("");
      setUploadError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [state]);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError("");
    setImageUrl("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Choisis une image au format JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError("La photo est trop lourde. Maximum autorisé : 3 Mo.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const prep = await prepareUpload(file.type);

      if (!prep.ok) {
        setUploadError(prep.error);
        return;
      }

      const { error } = await supabase.storage
        .from("produits")
        .uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: file.type,
        });

      if (error) {
        setUploadError("L'envoi de la photo a échoué. Réessaie.");
        return;
      }

      setImageUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produits/${prep.path}`
      );
    } catch {
      setUploadError(
        "Une erreur est survenue pendant l'envoi de la photo."
      );
    } finally {
      setUploading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  const labelClass =
    "block text-sm font-semibold text-neutral-700";

  const formattedPrice = price
    ? `${Number(price).toLocaleString("fr-FR")} GNF`
    : "Prix non renseigné";

  const selectedCategory =
    categories.find((category) => String(category.id) === categoryId)?.name ??
    "Catégorie à sélectionner";

  const sizeList = sizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);

  const colorList = colors
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="space-y-8">
      {/* Aperçu du produit */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Aperçu en direct
            </p>
            <h3 className="mt-1 text-lg font-bold">
              Présentation du produit
            </h3>
          </div>

          <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-300">
            LOCAL SHOP
          </span>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr] sm:p-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-800 sm:aspect-[3/4]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name || "Aperçu du produit"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-40 flex-col items-center justify-center px-4 text-center">
                <span className="text-5xl text-neutral-500">◇</span>
                <p className="mt-3 text-xs text-neutral-400">
                  La photo du vêtement apparaîtra ici
                </p>
              </div>
            )}

            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900">
              Collection
            </span>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {selectedCategory}
            </p>

            <h3 className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl">
              {name.trim() || "Nom de ton produit"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
              {description.trim() ||
                "La description de ton vêtement apparaîtra ici."}
            </p>

            <p className="mt-5 text-2xl font-black text-emerald-400">
              {formattedPrice}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {sizeList.length > 0 ? (
                sizeList.map((size, index) => (
                  <span
                    key={`${size}-${index}`}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold"
                  >
                    {size}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">
                  Tailles non renseignées
                </span>
              )}
            </div>

            {colorList.length > 0 && (
              <p className="mt-3 text-xs text-neutral-300">
                Couleurs : {colorList.join(", ")}
              </p>
            )}

            <p className="mt-4 text-xs text-neutral-400">
              Stock : {stock !== "" ? stock : "Non renseigné"} unité(s)
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-3 text-xs text-neutral-400 sm:px-6">
          Cet aperçu se met à jour pendant que tu remplis le formulaire.
        </div>
      </section>

      {/* Informations générales */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
            ◇
          </span>
          <div>
            <h3 className="font-bold text-neutral-900">
              Informations générales
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Donne à ton produit une présentation claire.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <label className={labelClass}>
            Nom du produit <span className="text-red-500">*</span>
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. : Veste élégante pour homme"
              maxLength={100}
              required
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Description du produit
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Matière, coupe, style et autres caractéristiques..."
              maxLength={1000}
              rows={4}
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-xs font-normal text-neutral-400">
              Facultatif · 1 000 caractères maximum.
            </span>
          </label>

          <label className={labelClass}>
            Catégorie <span className="text-red-500">*</span>
            <select
              name="category_id"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Sélectionner une catégorie
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
              <span className="mt-2 block text-xs font-medium text-amber-600">
                Aucune catégorie disponible. Ajoute d'abord une catégorie.
              </span>
            )}
          </label>
        </div>
      </section>

      {/* Prix et stock */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
            GNF
          </span>
          <div>
            <h3 className="font-bold text-neutral-900">
              Prix et disponibilité
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Définis le prix et les quantités disponibles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Prix de vente (GNF) <span className="text-red-500">*</span>
            <input
              name="price"
              type="number"
              min={0}
              max={100000000}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Ex. : 150000"
              required
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Quantité en stock <span className="text-red-500">*</span>
            <input
              name="stock"
              type="number"
              min={0}
              max={10000}
              step={1}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="Ex. : 20"
              required
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* Tailles et couleurs */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
            ◈
          </span>
          <div>
            <h3 className="font-bold text-neutral-900">
              Tailles et couleurs
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Précise les variantes disponibles pour tes clients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Tailles disponibles
            <input
              name="sizes"
              value={sizes}
              onChange={(event) => setSizes(event.target.value)}
              placeholder="S, M, L, XL"
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-neutral-400">
              Sépare les tailles par des virgules.
            </span>
          </label>

          <label className={labelClass}>
            Couleurs disponibles
            <input
              name="colors"
              value={colors}
              onChange={(event) => setColors(event.target.value)}
              placeholder="Noir, Blanc, Bleu"
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-neutral-400">
              Sépare les couleurs par des virgules.
            </span>
          </label>
        </div>
      </section>

      {/* Photo */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
            ▧
          </span>
          <div>
            <h3 className="font-bold text-neutral-900">
              Photo du produit
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Choisis une photo nette qui met le vêtement en valeur.
            </p>
          </div>
        </div>

        <input type="hidden" name="image_url" value={imageUrl} />

        <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5 sm:p-7">
          {imageUrl ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-44 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name || "Aperçu du produit"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Photo envoyée
                </span>
                <p className="mt-3 font-semibold text-neutral-900">
                  Ta photo est prête.
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Elle apparaîtra sur l'aperçu et sera associée au produit.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Changer la photo
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center rounded-xl px-3 py-6 text-center transition hover:bg-white">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-emerald-700 shadow-sm">
                ↑
              </span>

              <span className="mt-4 text-sm font-bold text-neutral-900">
                {uploading ? "Envoi de la photo…" : "Choisir une photo"}
              </span>

              <span className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
                Clique ici pour choisir une image depuis ton ordinateur ou ton téléphone.
              </span>

              <span className="mt-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700">
                JPG, PNG ou WebP · 3 Mo maximum
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFile}
                disabled={uploading || pending}
                className="sr-only"
              />
            </label>
          )}

          {uploading && (
            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-label="Envoi de la photo en cours"
            >
              <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
            </div>
          )}
        </div>

        {uploadError && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {uploadError}
          </p>
        )}
      </section>

      {/* Résultat de l'enregistrement */}
      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          Produit ajouté avec succès !
        </p>
      )}

      {/* Bouton d'action */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-neutral-900">
              Prêt à ajouter ce produit ?
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Vérifie les informations et l'aperçu avant d'enregistrer.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending || uploading || categories.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto sm:min-w-56"
          >
            {pending || uploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {uploading ? "Envoi de la photo…" : "Enregistrement…"}
              </>
            ) : (
              <>
                <span className="text-lg">＋</span>
                Ajouter le produit
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-neutral-400">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>
    </form>
  );
}

