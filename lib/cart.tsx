"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  name: string;
  price_gnf: number;
  image_url: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = "boutique-panier";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const addItem = (item: CartItem) =>
    setItems((prev) => {
      const i = prev.findIndex(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.color === item.color
      );
      if (i === -1) return [...prev, item];
      const copy = [...prev];
      copy[i] = {
        ...copy[i],
        quantity: Math.min(copy[i].quantity + item.quantity, 20),
      };
      return copy;
    });

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const setQuantity = (index: number, quantity: number) =>
    setItems((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, quantity: Math.max(1, Math.min(20, quantity)) } : p
      )
    );

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.price_gnf, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, setQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}