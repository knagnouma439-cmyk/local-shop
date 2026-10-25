"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

type Props = {
  product: {
    id: number;
    name: string;
    price_gnf: number;
    image_url: string | null;
    sizes: string[];
    colors: string[];
    stock: number;
  };
};

export default function AddToCart({ product }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (product.sizes.length > 0 && !size) {
      setError("Choisissez une taille.");
      return;
    }
    if (product.colors.length > 0 && !color) {
      setError("Choisissez une couleur.");
      return;
    }
    setError("");
    addItem({
      productId: product.id,
      name: product.name,
      price_gnf: product.price_gnf,
      image_url: product.image_url,
      size,
      color,
      quantity: 1,
    });
    setAdded(true);
  }

  return (
    <div className="mt-6 space-y-5">
      {product.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Taille</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-full border px-4 py-2 text-sm ${size === s ? "bg-neutral-900 text-white" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Couleur</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-full border px-4 py-2 text-sm ${color === c ? "bg-neutral-900 text-white" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white disabled:bg-neutral-300"
      >
        {outOfStock ? "Rupture de stock" : "Ajouter au panier"}
      </button>

      {added && (
        <p className="text-sm text-green-700">
          Ajouté au panier.{" "}
          <Link href="/panier" className="underline">
            Voir le panier
          </Link>
        </p>
      )}
    </div>
  );
}