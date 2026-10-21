import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, QuoteLine, Variant } from '../types';

interface CartProduct {
  id: number;
  slug: string;
  name: string;
  image?: string | null;
}

interface CartState {
  items: Record<number, CartItem>; // keyed by variantId
  couponCode: string;
  add: (product: CartProduct, variant: Variant, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  setCoupon: (couponCode: string) => void;
  clear: () => void;
  syncFromQuote: (lines: QuoteLine[]) => void;
  list: () => CartItem[];
}

// Cart lives in the browser (guest checkout). Server re-checks prices at checkout.
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      couponCode: '',

      add: (product, variant, qty = 1) =>
        set((s) => {
          const cur = s.items[variant.id];
          return {
            items: {
              ...s.items,
              [variant.id]: {
                variantId: variant.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                packSize: variant.packSize,
                price: variant.price,
                mrp: variant.mrp,
                image: product.image,
                qty: Math.min((cur?.qty || 0) + qty, 100),
              },
            },
          };
        }),

      setQty: (variantId, qty) =>
        set((s) => {
          const items = { ...s.items };
          if (qty <= 0) delete items[variantId];
          else if (items[variantId]) items[variantId] = { ...items[variantId], qty: Math.min(qty, 100) };
          return { items };
        }),

      remove: (variantId) =>
        set((s) => {
          const items = { ...s.items };
          delete items[variantId];
          return { items };
        }),

      setCoupon: (couponCode) => set({ couponCode }),
      clear: () => set({ items: {}, couponCode: '' }),

      // keep local prices in sync with server quote
      syncFromQuote: (lines) =>
        set((s) => {
          const items = { ...s.items };
          for (const l of lines) if (items[l.variantId]) items[l.variantId] = { ...items[l.variantId], price: l.price, mrp: l.mrp };
          return { items };
        }),

      list: () => Object.values(get().items),
    }),
    { name: 'sn_cart' },
  ),
);

// derived values hook
export function useCartSummary() {
  const items = useCart((s) => s.items);
  const list = Object.values(items);
  const count = list.reduce((n, i) => n + i.qty, 0);
  const subtotal = list.reduce((n, i) => n + i.price * i.qty, 0);
  const mrpTotal = list.reduce((n, i) => n + i.mrp * i.qty, 0);
  return { list, count, subtotal, mrpTotal };
}
