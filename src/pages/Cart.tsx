import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import QtyStepper from '../components/QtyStepper';
import BillDetails from '../components/BillDetails';
import ProductCard from '../components/ProductCard';
import { useCart, useCartSummary } from '../store/cart';
import { useQuote } from '../lib/useQuote';
import { useSettings } from '../lib/hooks';
import { api, errMsg, rupee, waLink } from '../lib/api';
import { cartWhatsAppText } from '../lib/whatsapp';
import type { Product } from '../types';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { list, count } = useCartSummary();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const { data: settings } = useSettings();
  const quote = useQuote();
  const [code, setCode] = useState('');
  const [couponErr, setCouponErr] = useState('');
  const [checking, setChecking] = useState(false);

  const { data: suggestions = [] } = useQuery<Product[]>({
    queryKey: ['suggest', list.map((i) => i.productId).join(','), i18n.language],
    queryFn: () => api.get('/suggestions', { params: { exclude: list.map((i) => i.productId).join(','), lang: i18n.language } }).then((r) => r.data),
    enabled: count > 0,
    staleTime: 5 * 60_000,
  });

  const applyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    setCouponErr('');
    if (!code.trim()) return;
    setChecking(true);
    try {
      await api.post('/cart/quote', { items: list.map((i) => ({ variantId: i.variantId, qty: i.qty })), couponCode: code.trim() });
      setCoupon(code.trim().toUpperCase());
      setCode('');
    } catch (err) {
      setCouponErr(errMsg(err));
    } finally {
      setChecking(false);
    }
  };

  if (!count) {
    return (
      <div className="container-x py-16 text-center">
        <Icon name="shopping_basket" size={56} className="text-outline" />
        <h1 className="font-serif text-headline-lg text-primary mt-3">{t('empty_cart')}</h1>
        <Link to="/shop" className="btn-primary mt-6">{t('start_shopping')} <Icon name="arrow_forward" size={18} /></Link>
      </div>
    );
  }

  const q = quote.data;
  const freeMin = settings?.freeDeliveryMin ?? 499;
  const sub = q?.subtotal ?? list.reduce((n, i) => n + i.price * i.qty, 0);
  const left = Math.max(0, freeMin - sub);

  return (
    <div className="container-x py-space-lg pb-16">
      <div className="mb-space-lg">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-primary">{t('cart_title')}</h1>
        <p className="text-body-md text-on-surface-variant">{t('items', { count })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="card p-space-md sm:p-space-lg">
            <div className="flex flex-col gap-space-md">
              {list.map((it) => {
                const line = q?.lines.find((l) => l.variantId === it.variantId);
                const save = (it.mrp - it.price) * it.qty;
                return (
                  <div key={it.variantId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container-low">
                    <div className="flex items-center gap-space-md min-w-0">
                      {it.image ? <img src={it.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 bg-surface-container" /> : <div className="w-20 h-20 rounded-lg bg-surface-container shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="text-headline-sm truncate"><Link to={`/product/${it.slug}`} className="hover:text-primary">{it.name}</Link></h3>
                        <span className="text-body-sm text-on-surface-variant">{it.packSize} • {rupee(it.price)} each</span>
                        {save > 0 && <span className="block text-label-sm text-tertiary-container mt-1">{t('you_save', { amt: rupee(save) })}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-space-lg">
                      <div className="flex flex-col items-end">
                        <span className="text-price-lg">{rupee(line?.lineTotal ?? it.price * it.qty)}</span>
                        {it.mrp > it.price && <span className="text-label-sm text-outline line-through">{rupee(it.mrp * it.qty)}</span>}
                      </div>
                      <QtyStepper qty={it.qty} dark={false} size="sm" onChange={(n) => setQty(it.variantId, n)} />
                      <button onClick={() => remove(it.variantId)} className="text-outline hover:text-error p-1" aria-label={`${t('remove')} ${it.name}`}>
                        <Icon name="delete" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-space-md p-space-md rounded-xl bg-surface-container">
              <div className="flex items-center gap-2 text-body-md font-medium">
                <Icon name="local_shipping" className="text-secondary" />
                {left > 0 ? t('add_more_free', { amt: rupee(left) }) : t('free_unlocked')}
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-tertiary-container h-full transition-all" style={{ width: `${Math.min(100, (sub / freeMin) * 100)}%` }} />
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h2 className="font-serif text-headline-md mb-space-md">{t('pairs_well')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-md">
                {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-44 card p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <div>
            <span className="text-label-sm uppercase tracking-wider text-outline">{t('coupon')}</span>
            {couponCode ? (
              <div className="flex items-center justify-between bg-surface-container-low p-2 px-3 rounded-lg mt-1">
                <span className="flex items-center gap-1.5 text-tertiary-container text-label-md"><Icon name="check_circle" size={16} /> {couponCode}</span>
                <button onClick={() => setCoupon('')} className="text-label-sm text-primary">{t('remove')}</button>
              </div>
            ) : (
              <form onSubmit={applyCoupon} className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Icon name="sell" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code" className="input pl-9 py-2 uppercase" />
                </div>
                <button disabled={checking} className="btn bg-secondary text-on-secondary px-4 py-2 hover:bg-on-secondary-container">{t('apply')}</button>
              </form>
            )}
            {couponErr && <p className="text-body-sm text-error mt-1">{couponErr}</p>}
          </div>

          <div className="h-px bg-surface-container-high" />
          {quote.isError && !couponCode ? (
            <p className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{quote.error.message}</p>
          ) : (
            <BillDetails quote={q} />
          )}

          <button onClick={() => nav('/checkout')} disabled={!q} className="btn-green w-full py-3.5">
            {t('checkout')} {q && `• ${rupee(q.total)}`} <Icon name="arrow_forward" />
          </button>
          <a href={waLink(cartWhatsAppText(list, q))} target="_blank" rel="noreferrer" className="btn-soft w-full">
            <Icon name="chat" size={18} className="text-tertiary-container" /> {t('order_wa')}
          </a>
        </aside>
      </div>
    </div>
  );
}
