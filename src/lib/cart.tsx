"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Edition = "original" | "print";
export type CartItem = { id: string; edition: Edition };

type Cart = {
  items: CartItem[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (id: string, edition?: Edition, reveal?: boolean) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

const Ctx = createContext<Cart | null>(null);
const KEY = "sb-set";

// Front-end only for now: the set lives in localStorage until checkout is built.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = useCallback((id: string, edition: Edition = "original", reveal = true) => {
    setItems((xs) => [...xs.filter((x) => x.id !== id), { id, edition }]);
    if (reveal) setOpen(true);
  }, []);
  const remove = useCallback((id: string) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const has = useCallback((id: string) => items.some((x) => x.id === id), [items]);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, open, setOpen, add, remove, has, clear }), [items, open, add, remove, has, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
