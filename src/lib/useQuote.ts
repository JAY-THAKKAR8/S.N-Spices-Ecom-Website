import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { useCart } from '../store/cart';
import type { Quote } from '../types';

// Ask server for real prices + totals for the current cart.
export function useQuote() {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const sync = useCart((s) => s.syncFromQuote);
  const body = Object.values(items).map((i) => ({ variantId: i.variantId, qty: i.qty }));

  const q = useQuery<Quote>({
    queryKey: ['quote', body, couponCode],
    queryFn: () => api.post('/cart/quote', { items: body, couponCode: couponCode || null }).then((r) => r.data),
    enabled: body.length > 0,
    retry: false,
    staleTime: 0,
  });

  // coupon no longer valid (cart got smaller): drop it, quote again without it
  useEffect(() => {
    if (q.isError && couponCode) setCoupon('');
  }, [q.isError, couponCode, setCoupon]);

  useEffect(() => {
    if (q.data?.lines) sync(q.data.lines);
  }, [q.data, sync]);

  return q;
}
