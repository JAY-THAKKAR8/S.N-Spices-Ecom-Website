import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import BillDetails from '../components/BillDetails';
import { useCart, useCartSummary } from '../store/cart';
import { useQuote } from '../lib/useQuote';
import { api, rupee, waLink } from '../lib/api';
import { orderWhatsAppText } from '../lib/whatsapp';
import type { Order } from '../types';

const SAVED_KEY = 'sn_checkout_info';
type SavedInfo = Partial<Record<'name' | 'phone' | 'address' | 'city' | 'pincode', string>>;

const loadSaved = (): SavedInfo => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || 'null') || {}; } catch { return {}; }
};

interface OrderRequest {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  note: string;
  paymentMethod: string;
  items: { variantId: number; qty: number }[];
  couponCode: string | null;
}


export default function Checkout() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { list, count } = useCartSummary();
  const couponCode = useCart((s) => s.couponCode);
  const clear = useCart((s) => s.clear);
  const quote = useQuote();
  const placed = useRef(false);
  const saved = loadSaved();
  const [f, setF] = useState({
    name: saved.name || '',
    phone: saved.phone || '',
    address: saved.address || '',
    city: saved.city || 'Borsad',
    pincode: saved.pincode || '',
    note: '',
    paymentMethod: 'COD',
  });
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const m = useMutation<Order, Error, OrderRequest>({
    mutationFn: (body) => api.post('/orders', body).then((r) => r.data),
    onSuccess: (order) => {
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify({ name: f.name, phone: f.phone, address: f.address, city: f.city, pincode: f.pincode }));
      } catch { /* ignore */ }
      if (f.paymentMethod === 'WHATSAPP') window.open(waLink(orderWhatsAppText(order)), '_blank');
      placed.current = true;
      nav(`/order/${order.orderNo}`, { state: { order }, replace: true });
      clear();
    },
  });

  if (!count && !placed.current) return <Navigate to="/cart" replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.mutate({ ...f, items: list.map((i) => ({ variantId: i.variantId, qty: i.qty })), couponCode: couponCode || null });
  };

  const q = quote.data;
  const PAY = [
    { id: 'COD', icon: 'payments', title: 'Cash on Delivery', text: 'Pay cash or UPI to the delivery person.' },
    { id: 'WHATSAPP', icon: 'chat', title: 'Confirm on WhatsApp', text: 'We send order on WhatsApp. Pay by UPI after we confirm.' },
  ];

  return (
    <div className="container-x py-space-lg pb-16">
      <nav className="flex items-center gap-1 text-body-sm text-on-surface-variant mb-space-md" aria-label="Breadcrumb">
        <Link to="/cart" className="hover:text-primary">Cart</Link>
        <Icon name="chevron_right" size={14} />
        <span className="font-bold text-on-surface">Checkout</span>
      </nav>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {m.isError && (
            <div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-start gap-2" role="alert">
              <Icon name="report_problem" fill className="text-error" />
              <div>
                <p className="text-label-lg text-error">Order not placed</p>
                <p className="text-body-md">{m.error.message}</p>
              </div>
            </div>
          )}

          <section className="card overflow-hidden">
            <Header n={1} title="Delivery details" sub="We call this number to confirm your order." />
            <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="label" htmlFor="c-name">Full name</label>
                <input id="c-name" className="input" required minLength={2} value={f.name} onChange={set('name')} autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="c-phone">Mobile number</label>
                <div className="flex">
                  <span className="bg-surface-container-high text-on-surface-variant text-label-md flex items-center px-3 rounded-l-lg">+91</span>
                  <input id="c-phone" className="input rounded-l-none" required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10 digit mobile number"
                    value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} autoComplete="tel-national" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="c-addr">House no, street, area, landmark</label>
                <textarea id="c-addr" className="input" rows={2} required minLength={8} value={f.address} onChange={set('address')} autoComplete="street-address" />
              </div>
              <div>
                <label className="label" htmlFor="c-city">City / Village</label>
                <input id="c-city" className="input" required value={f.city} onChange={set('city')} autoComplete="address-level2" />
              </div>
              <div>
                <label className="label" htmlFor="c-pin">Pincode</label>
                <input id="c-pin" className="input" required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" title="6 digit pincode"
                  value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, '') })} autoComplete="postal-code" />
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="c-note">Note (optional)</label>
                <input id="c-note" className="input" maxLength={300} value={f.note} onChange={set('note')} placeholder="e.g. call before coming" />
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <Header n={2} title="Payment" sub="No online payment needed now." />
            <div className="p-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-md" role="radiogroup">
              {PAY.map((p) => {
                const on = f.paymentMethod === p.id;
                return (
                  <label key={p.id} className={`cursor-pointer p-space-md rounded-xl border-2 transition-colors flex gap-3 ${on ? 'border-primary bg-primary/5' : 'border-transparent bg-surface-container-low hover:bg-surface-container'}`}>
                    <input type="radio" name="pay" className="sr-only" checked={on} onChange={() => setF({ ...f, paymentMethod: p.id })} />
                    <Icon name={p.icon} size={28} className={on ? 'text-primary' : 'text-secondary'} />
                    <span>
                      <span className="block text-label-lg">{p.title}</span>
                      <span className="block text-body-sm text-on-surface-variant">{p.text}</span>
                    </span>
                    <Icon name={on ? 'radio_button_checked' : 'radio_button_unchecked'} className={`ml-auto ${on ? 'text-primary' : 'text-outline'}`} />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-44 flex flex-col gap-space-md">
          <div className="card p-space-lg">
            <h3 className="text-headline-sm mb-space-md">Order Summary</h3>
            <div className="flex flex-col gap-space-sm mb-space-lg max-h-72 overflow-y-auto">
              {list.map((i) => (
                <div key={i.variantId} className="flex items-center gap-space-sm">
                  {i.image && <img src={i.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-label-md truncate">{i.name}</h4>
                    <div className="flex justify-between text-body-sm text-on-surface-variant">
                      <span>{i.packSize} × {i.qty}</span>
                      <span className="font-bold text-on-surface">{rupee(i.price * i.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <BillDetails quote={q} />
            <button type="submit" disabled={!q || m.isPending} className="btn-green w-full py-3.5 mt-space-md">
              <Icon name="verified_user" /> {m.isPending ? 'Placing order…' : `${t('place_order')}${q ? ` • ${rupee(q.total)}` : ''}`}
            </button>
          </div>
          <div className="bg-surface-container rounded-xl p-space-md space-y-2 text-label-md">
            <p className="flex items-center gap-2"><Icon name="call" size={18} className="text-primary" /> We call to confirm before dispatch</p>
            <p className="flex items-center gap-2"><Icon name="receipt_long" size={18} className="text-primary" /> Bill given with every order</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Header({ n, title, sub }: { n: number | string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-space-sm bg-surface-container-low p-space-lg">
      <span className="w-8 h-8 rounded-full bg-primary text-on-primary grid place-items-center text-headline-sm">{n}</span>
      <div>
        <h2 className="text-headline-sm">{title}</h2>
        <p className="text-body-sm text-on-surface-variant">{sub}</p>
      </div>
    </div>
  );
}
