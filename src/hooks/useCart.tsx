import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  productId: string;
  quantity: number;
  color?: string | null;
  /** Optional metadata used for auto-injected accessories (e.g. longer straps).
   *  `auto: true` items are still real cart lines (count in totals, invoices)
   *  but the UI marks them as automatically added based on user input. */
  meta?: { auto?: boolean; autoFor?: string } | null;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  addItem: (
    productId: string,
    quantity?: number,
    color?: string | null,
    meta?: CartItem["meta"],
  ) => void;
  updateQty: (productId: string, delta: number, color?: string | null) => void;
  removeItem: (productId: string, color?: string | null) => void;
  clear: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const Ctx = createContext<CartCtx | undefined>(undefined);
const KEY = "vapesport_cart_v1";

const keyOf = (id: string, color?: string | null) => `${id}::${color ?? ""}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (productId: string, quantity = 1, color: string | null = null) => {
    setItems((prev) => {
      const k = keyOf(productId, color);
      const exists = prev.find((i) => keyOf(i.productId, i.color) === k);
      if (exists) {
        return prev.map((i) =>
          keyOf(i.productId, i.color) === k ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { productId, quantity, color }];
    });
  };

  const updateQty = (productId: string, delta: number, color: string | null = null) => {
    setItems((prev) =>
      prev
        .map((i) =>
          keyOf(i.productId, i.color) === keyOf(productId, color)
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem = (productId: string, color: string | null = null) => {
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.color) !== keyOf(productId, color)));
  };

  const clear = () => setItems([]);

  const [isOpen, setIsOpen] = useState(false);
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      addItem,
      updateQty,
      removeItem,
      clear,
      isOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, isOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
