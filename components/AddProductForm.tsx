
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createProduct, prepareUpload } from "@/app/admin/produits/actions";

type Category = { id: number; name: string };

export default function AddProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(createProduct, null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setImageUrl("");
      setUploadError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setImageUrl("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Choisis une image au format JPG, PNG ou WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError("La photo est trop lourde. Maximum autorisé : 3 Mo.");
      e.target.value = "";
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
      setUploadError("Une erreur est survenue pendant l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  const labelClass = "block text-sm font-semibold text-neutral-700";

  return (
    <form action={formAction} className="space-y-7">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            ◇
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Informations générales</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Présente ton produit aux clients.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <label className={labelClass}>
            Nom du produit <span className="text-red-500">*</span>
            <input
              name="name"
              placeholder="Ex. : T-shirt oversize"
              maxLength={100}
              required
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Description du produit
            <textarea
              name="description"
              placeholder="Décris la matière, le style ou les caractéristiques du produit…"
              maxLength={1000}
              rows={4}
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-xs font-normal text-neutral-400">
              Facultatif — 1 000 caractères maximum.
            </span>
          </label>

          <label className={labelClass}>
            Catégorie <span className="text-red-500">*</span>
            <select
              name="category_id"
              required
              defaultValue=""
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
                Aucune catégorie disponible. Ajoute d'abord une catégorie dans ta base de données.
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            GNF
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Prix et disponibilité</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Définis le prix de vente et la quantité disponible.
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
              placeholder="Ex. : 20"
              required
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            ◈
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Variantes du produit</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Précise les tailles et les couleurs disponibles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Tailles disponibles
            <input
              name="sizes"
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
              placeholder="Noir, Blanc, Bleu"
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-neutral-400">
              Sépare les couleurs par des virgules.
            </span>
          </label>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            ▧
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Photo du produit</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Une belle photo aide les clients à choisir.
            </p>
          </div>
        </div>

        <input type="hidden" name="image_url" value={imageUrl} />

        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 sm:p-7">
          {imageUrl ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-36 w-32 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Aperçu du produit"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-emerald-700">
                  Photo envoyée avec succès
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Cette photo sera associée à ton produit.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Changer la photo
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-emerald-700 shadow-sm">
                ↑
              </span>
              <span className="mt-4 text-sm font-bold text-neutral-800">
                {uploading ? "Envoi de la photo…" : "Choisir une photo"}
              </span>
              <span className="mt-2 text-xs leading-5 text-neutral-500">
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
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-200">
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
      </div>

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
          className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          Produit ajouté avec succès !
        </p>
      )}

      <div className="border-t border-neutral-100 pt-6">
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

        <p className="mt-3 text-xs leading-5 text-neutral-400">
          Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>
    </form>
  );
}
