import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  packageId: string;
  label: string;
  amount: number;
  costPrice: number;
  phone: string;
}

interface CartState {
  items: CartItem[];
  add: (i: CartItem) => void;
  remove: (idx: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (i) => set((s) => ({ items: [...s.items, i] })),
      remove: (idx) => set((s) => ({ items: s.items.filter((_, n) => n !== idx) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "dm-cart",
      skipHydration: true,
    },
  ),
);
