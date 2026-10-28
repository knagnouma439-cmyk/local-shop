"use client";

import { useState } from "react";
import { prepareUpload } from "@/app/admin/produits/actions";

type Product = {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price_gnf: number;
  stock: number;
  active: boolean;
  image_url: string;
  sizes: string[];
  colors: string[];
};

type Category = {
  id: number;
  name: string;
};

export default function EditProductForm({
  product,
  categories,
  updateAction,
}: {
  product: Product;
  categories: Category[];
  updateAction: (formData: FormData) => void | Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(product.image_url);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Format accepté : JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("La photo ne doit pas dépasser 3 Mo.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const prep = await prepareUpload(file.type);

      if (!prep.ok) {
        setMessage(prep.error);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/produits/${prep.path}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "x-upsert": "false",
          },
          body: file,
        }
      );

      if (!response.ok) {
        setMessage("Échec de l'envoi de la photo.");
        return;
      }

      setImageUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produits/${prep.path}`
      );

      setMessage("Photo envoyée. Enregistre les modifications pour la conserver.");
    } catch {
      setMessage("Une erreur est survenue pendant l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={updateAction} className="space-y-4">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="image_url" value={imageUrl} />

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Nom du produit
        </label>
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={product.name}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          name="description"
          maxLength={1000}
          rows={3}
          defaultValue={product.description}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Catégorie
        </label>
        <select
          name="category_id"
          required
          defaultValue={product.category_id}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Prix (GNF)
          </label>
          <input
            name="price"
            type="number"
            min={0}
            max={100000000}
            step={1}
            required
            defaultValue={product.price_gnf}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Stock
          </label>
          <input
            name="stock"
            type="number"
            min={0}
            max={10000}
            step={1}
            required
            defaultValue={product.stock}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Tailles
        </label>
        <input
          name="sizes"
          defaultValue={product.sizes.join(", ")}
          placeholder="S, M, L, XL"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Couleurs
        </label>
        <input
          name="colors"
          defaultValue={product.colors.join(", ")}
          placeholder="Noir, Blanc, Bleu"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <div className="rounded-xl border border-neutral-200 p-3">
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Photo du produit
        </label>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="mb-3 h-32 w-28 rounded-lg object-cover"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={uploading}
          className="block w-full text-sm"
        />

        {uploading && (
          <p className="mt-2 text-sm text-neutral-500">
            Envoi de la photo en cours…
          </p>
        )}

        {message && (
          <p className="mt-2 text-sm text-neutral-600">{message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          name="active"
          type="checkbox"
          defaultChecked={product.active}
          className="h-4 w-4 accent-emerald-600"
        />
        Afficher le produit dans la boutique
      </label>

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        Enregistrer les modifications
      </button>
    </form>
  );
}