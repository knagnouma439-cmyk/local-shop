"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/panier" className="text-sm font-medium">
      Panier
      {count > 0 && (
        <span className="ml-1 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}