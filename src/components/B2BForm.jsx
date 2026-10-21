import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Icon from './Icon';
import { api, STORE, waLink } from '../lib/api';

const QTY = ['10kg - 25kg', '25kg - 100kg', '100kg - 500kg', '500kg+'];
const PRODUCTS = ['Cumin Seeds (Jeera)', 'Turmeric Powder', 'Green Cardamom', 'Black Pepper', 'Red Chilli', 'Cashews', 'Almonds', 'Mixed / Many items'];

export default function B2BForm() {
  const empty = { businessName: '', phone: '', product: PRODUCTS[0], monthlyQty: QTY[0], cityPincode: '' };
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const m = useMutation({
    mutationFn: (body) => api.post('/b2b-inquiries', body).then((r) => r.data),
    onSuccess: () => setF(empty),
  });

  const waText = `Hi S.N Spices, I want wholesale rates for ${f.product}, about ${f.monthlyQty} per month.${f.businessName ? ` Business: ${f.businessName}.` : ''}${f.cityPincode ? ` City: ${f.cityPincode}.` : ''}`;

  return (
    <div className="rounded-3xl bg-surface-container-lowest p-space-lg lg:p-12 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
      <div className="lg:col-span-5 flex flex-col justify-between gap-space-lg">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-secondary text-label-sm mb-3">
            <Icon name="domain" size={16} /> Wholesale
          </span>
          <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-primary mb-space-sm">Wholesale & Bulk Supply</h2>
          <p className="text-body-lg text-on-surface-variant mb-space-md">
            For kirana shops, restaurants, hotels and caterers. Tell us what you need and how much. We call you back with rates.
          </p>
          <ul className="space-y-2">
            {[['scale', 'Steady quality, lot after lot'], ['receipt_long', 'GST bill on every order'], ['local_shipping', 'Delivery to your shop or kitchen']].map(([ic, txt]) => (
              <li key={txt} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-surface-container grid place-items-center text-secondary"><Icon name={ic} size={18} /></span>
                <span className="text-body-md">{txt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between gap-2">
          <div>
            <span className="text-label-sm text-outline uppercase tracking-wider block">Direct contact</span>
            <span className="text-label-lg">{STORE.phoneDisplay}</span>
          </div>
          <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn bg-tertiary-container text-on-tertiary px-4 py-2 hover:bg-tertiary">
            <Icon name="chat" size={18} /> WhatsApp
          </a>
        </div>
      </div>

      <form
        className="lg:col-span-7 bg-surface-container-high/50 p-space-md lg:p-space-lg rounded-2xl space-y-space-md"
        onSubmit={(e) => { e.preventDefault(); m.mutate(f); }}
      >
        <h3 className="text-headline-sm">Ask for Wholesale Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label className="label" htmlFor="b-name">Business name</label>
            <input id="b-name" className="input bg-surface-container-lowest" required value={f.businessName} onChange={set('businessName')} placeholder="e.g. Shree Kirana Store" />
          </div>
          <div>
            <label className="label" htmlFor="b-phone">Mobile number</label>
            <input id="b-phone" className="input bg-surface-container-lowest" required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}"
              value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} placeholder="10 digit number" />
          </div>
          <div>
            <label className="label" htmlFor="b-prod">Product</label>
            <select id="b-prod" className="input bg-surface-container-lowest" value={f.product} onChange={set('product')}>
              {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="b-qty">Monthly quantity</label>
            <select id="b-qty" className="input bg-surface-container-lowest" value={f.monthlyQty} onChange={set('monthlyQty')}>
              {QTY.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="b-city">City & pincode</label>
          <input id="b-city" className="input bg-surface-container-lowest" required value={f.cityPincode} onChange={set('cityPincode')} placeholder="e.g. Anand 388001" />
        </div>

        {m.isError && <p className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{m.error.message}</p>}
        {m.isSuccess && (
          <p className="p-3 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-body-sm font-bold text-center">
            Thank you! We got your request and will call you soon.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-space-sm pt-1">
          <button type="submit" disabled={m.isPending} className="btn-primary flex-1">
            <Icon name="send" size={18} /> {m.isPending ? 'Sending…' : 'Send Request'}
          </button>
          <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn bg-tertiary-container text-on-tertiary px-5 py-3 hover:bg-tertiary">
            <Icon name="chat" size={18} /> Chat on WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
