import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import QtyStepper from '../components/QtyStepper';
import ProductCard from '../components/ProductCard';
import { api, rupee, STORE, waLink } from '../lib/api';
import { useSettings, useToast } from '../lib/hooks';
import { useCart } from '../store/cart';

const per100 = (v) => (v.grams >= 50 ? Math.round((v.price / v.grams) * 100) : null);
const offPct = (v) => (v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0);

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const toast = useToast((s) => s.show);
  const { data: settings } = useSettings();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug, i18n.language],
    queryFn: () => api.get(`/products/${slug}`, { params: { lang: i18n.language } }).then((r) => r.data),
    retry: (n, e) => e?.response?.status !== 404 && n < 1,
  });
  const p = data?.product;

  const [vid, setVid] = useState(null);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [copied, setCopied] = useState(false);

  // reset when moving to another product
  useEffect(() => { setVid(null); setQty(1); setImg(0); }, [slug]);

  const v = useMemo(() => {
    if (!p) return null;
    return p.variants.find((x) => x.id === vid) || p.variants.find((x) => x.stock > 0) || p.variants[0];
  }, [p, vid]);

  const inCart = useCart((s) => (v ? s.items[v.id]?.qty || 0 : 0));
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} | S.N Spices`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', (p.description || p.highlight || p.name).slice(0, 155));
    return () => { document.title = 'S.N Spices | Spices & Dry Fruits, Borsad'; };
  }, [p]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !p) {
    return (
      <div className="container-x py-20 text-center">
        <Icon name="search_off" size={48} className="text-outline" />
        <h1 className="font-serif text-headline-lg text-primary mt-2">{error?.response?.status === 404 ? 'Product not found' : 'Could not load product'}</h1>
        <p className="text-on-surface-variant mt-1">{error?.response?.status === 404 ? 'It may be removed or the link is wrong.' : error?.message}</p>
        <Link to="/shop" className="btn-primary mt-6">Browse all products</Link>
      </div>
    );
  }

  const maxQty = Math.max(0, Math.min(100, (v?.stock ?? 0) - inCart));
  const out = !v || v.stock <= 0;
  const low = v && v.stock > 0 && v.stock <= 10;
  const images = p.images.length ? p.images : [null];

  const addToCart = (go) => {
    if (out) return;
    if (maxQty <= 0) {
      if (go) nav('/cart');
      else toast(`Only ${v.stock} available`);
      return;
    }
    const n = Math.min(qty, maxQty);
    add(p, v, n);
    if (go) nav('/checkout');
    else toast(`${p.name} (${v.packSize}) × ${n} – ${t('added')}`);
    setQty(1);
  };

  const waText = `Hello S.N Spices, I want to ask about ${p.nameEn}${v ? ` (${v.packSize}) × ${qty}` : ''}.\n${location.href}`;

  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, text: `${p.name} at S.N Spices`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch { /* user closed share */ }
  };

  return (
    <div className="pb-28 lg:pb-0">
      {/* breadcrumb */}
      <div className="bg-surface-container-low">
        <nav className="container-x py-3 flex flex-wrap items-center gap-1.5 text-label-sm uppercase tracking-widest text-on-surface-variant" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">{t('home')}</Link>
          <span className="opacity-40">/</span>
          {p.category && <><Link to={`/shop/${p.category.slug}`} className="hover:text-primary">{p.category.name}</Link><span className="opacity-40">/</span></>}
          <span className="text-on-surface normal-case tracking-normal text-label-md truncate max-w-[60vw]">{p.name}</span>
        </nav>
      </div>

      {/* hero */}
      <section className="container-x py-space-xl lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-14 items-start">
        {/* gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-44 space-y-3">
          <div className="relative aspect-[4/5] bg-surface-container overflow-hidden shadow-lg group">
            {images[img] ? (
              <img src={images[img]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full grid place-items-center text-outline"><Icon name="image" size={56} /></div>
            )}
            {p.badge && <span className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-1.5 text-label-sm uppercase tracking-widest text-primary">{p.badge}</span>}
            {p.grade && <span className="absolute bottom-4 right-4 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 text-label-md">{p.grade}</span>}
            {images.length > 1 && (
              <>
                <button aria-label="Previous photo" onClick={() => setImg((img - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/85 grid place-items-center hover:bg-surface"><Icon name="chevron_left" /></button>
                <button aria-label="Next photo" onClick={() => setImg((img + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/85 grid place-items-center hover:bg-surface"><Icon name="chevron_right" /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button key={src} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} aria-current={i === img}
                  className={`w-20 h-20 shrink-0 overflow-hidden bg-surface-container border-2 ${i === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {p.specs.length > 0 && (
            <dl className="grid grid-cols-3 gap-3 bg-surface-container-low p-4">
              {p.specs.slice(0, 3).map((s) => (
                <div key={s.label} className="min-w-0">
                  <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">{s.label}</dt>
                  <dd className="font-serif text-headline-sm text-on-surface mt-1 break-words">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* buy box */}
        <div className="lg:col-span-6 space-y-space-lg">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-label-sm uppercase tracking-widest">
              {p.category && <Link to={`/shop/${p.category.slug}`} className="text-primary hover:underline">{p.category.name}</Link>}
              {p.botanicalName && <><span className="text-outline-variant">•</span><span className="font-serif italic normal-case tracking-normal text-body-md text-on-surface-variant">{p.botanicalName}</span></>}
            </div>
            <h1 className="font-serif text-headline-xl-mobile md:text-headline-xl text-on-surface text-balance">{p.name}</h1>
            {(p.origin || p.highlight) && (
              <p className="text-label-lg text-secondary flex flex-wrap items-center gap-x-2">
                {p.origin && <span className="flex items-center gap-1"><Icon name="location_on" size={16} /> {p.origin}</span>}
                {p.origin && p.highlight && <span className="opacity-40">•</span>}
                {p.highlight && <span>{p.highlight}</span>}
              </p>
            )}
          </div>

          {p.description && <p className="text-body-lg text-on-surface-variant">{p.description}</p>}

          {p.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {p.tags.map((tag, i) => (
                <li key={tag} className={`px-3 py-1.5 bg-surface-container text-label-sm uppercase tracking-wider ${['text-tertiary', 'text-primary', 'text-secondary', 'text-on-surface'][i % 4]}`}>{tag}</li>
              ))}
            </ul>
          )}

          {/* price + pack */}
          <div className="bg-surface-container-lowest shadow-sm p-space-lg space-y-space-md">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-headline-lg text-primary">{v ? rupee(v.price) : '—'}</span>
                  {v && v.mrp > v.price && <span className="text-body-md text-outline line-through">{rupee(v.mrp)}</span>}
                  {v && offPct(v) > 0 && <span className="chip bg-tertiary-fixed text-on-tertiary-fixed">{offPct(v)}% OFF</span>}
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  {v?.packSize}{v && per100(v) ? ` · ${rupee(per100(v))} per 100g` : ''} · Inclusive of all taxes
                </p>
              </div>
              <button onClick={share} className="btn-soft py-2 px-3 shrink-0" aria-label="Share product">
                <Icon name={copied ? 'check' : 'share'} size={18} /> <span className="hidden sm:inline">{copied ? 'Link copied' : 'Share'}</span>
              </button>
            </div>

            {p.variants.length > 0 && (
              <div>
                <span className="label uppercase tracking-wider">Pack size</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Pack size">
                  {p.variants.map((x) => {
                    const on = x.id === v?.id;
                    const empty = x.stock <= 0;
                    return (
                      <button key={x.id} type="button" role="radio" aria-checked={on} disabled={empty}
                        onClick={() => { setVid(x.id); setQty(1); }}
                        className={`text-left p-3 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${on ? 'border-primary bg-primary/5' : 'border-outline-variant/60 hover:border-outline'}`}>
                        <span className="flex items-center justify-between">
                          <span className="text-label-lg">{x.packSize}</span>
                          {on && <Icon name="check_circle" size={18} fill className="text-primary" />}
                        </span>
                        <span className="block text-price-sm mt-1">{rupee(x.price)} {x.mrp > x.price && <span className="text-outline line-through font-normal ml-1">{rupee(x.mrp)}</span>}</span>
                        <span className="block text-label-sm text-on-surface-variant mt-0.5">{empty ? 'Out of stock' : per100(x) ? `${rupee(per100(x))}/100g` : ' '}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {out ? (
              <div className="p-3 bg-error-container text-on-error-container text-label-md flex items-center gap-2">
                <Icon name="inventory" size={18} /> Out of stock. Ask on WhatsApp, we will tell you when it is back.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label mb-0 uppercase tracking-wider">Qty</span>
                  <QtyStepper qty={qty} dark={false} onChange={(n) => setQty(Math.max(1, Math.min(n, Math.max(1, maxQty))))} />
                  {low && <span className="text-label-md text-error">Only {v.stock} left</span>}
                  {inCart > 0 && (
                    <Link to="/cart" className="text-label-md text-tertiary-container flex items-center gap-1">
                      <Icon name="shopping_bag" size={16} /> {inCart} in cart
                    </Link>
                  )}
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-2">
                  <button onClick={() => addToCart(false)} className="btn-green py-3.5"><Icon name="add_shopping_cart" size={20} /> Add to cart · {rupee(v.price * qty)}</button>
                  <button onClick={() => addToCart(true)} className="btn-primary py-3.5"><Icon name="bolt" size={20} /> Buy now</button>
                </div>
              </>
            )}
            <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn-soft w-full">
              <Icon name="chat" size={18} className="text-tertiary-container" /> Ask on WhatsApp
            </a>
          </div>

          {/* delivery info */}
          <ul className="grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 text-body-sm">
            {[
              ['local_shipping', `Free delivery over ₹${settings?.freeDeliveryMin ?? 499}`, `₹${settings?.deliveryFee ?? 40} below that`],
              ['payments', 'Cash on delivery', 'Or order on WhatsApp'],
              ['call', 'Call to confirm', STORE.phoneDisplay],
            ].map(([ic, a, b]) => (
              <li key={a} className="flex items-start gap-2 bg-surface-container-low p-3">
                <Icon name={ic} size={20} className="text-primary shrink-0" />
                <span><span className="block text-label-md text-on-surface">{a}</span><span className="text-on-surface-variant">{b}</span></span>
              </li>
            ))}
          </ul>

          {/* taste notes */}
          {p.tasteNotes.length > 0 && (
            <div className="bg-surface-container-high p-space-lg space-y-4">
              <h2 className="text-label-md uppercase tracking-wider">Taste & Aroma</h2>
              {p.tasteNotes.map((n, i) => (
                <div key={n.label} className="space-y-1.5">
                  <div className="flex justify-between gap-3 text-body-sm">
                    <span><strong className="text-on-surface">{n.label}:</strong> <span className="text-on-surface-variant">{n.text}</span></span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 overflow-hidden" role="meter" aria-label={n.label} aria-valuenow={n.level} aria-valuemin={0} aria-valuemax={100}>
                    <div className={`h-full ${['bg-tertiary', 'bg-primary', 'bg-secondary-container'][i % 3]}`} style={{ width: `${n.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* kitchen uses */}
      {p.uses.length > 0 && (
        <section className="bg-surface-container-low py-space-xl lg:py-16">
          <div className="container-x space-y-space-lg">
            <div>
              <span className="text-label-sm uppercase tracking-widest text-primary">How to use</span>
              <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">In your kitchen</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {p.uses.map((u, i) => (
                <article key={u.title} className="bg-surface p-space-lg flex flex-col justify-between gap-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="space-y-3">
                    <span className={`w-10 h-10 grid place-items-center font-serif text-headline-sm ${['bg-primary/10 text-primary', 'bg-secondary/10 text-secondary', 'bg-tertiary/10 text-tertiary', 'bg-primary-container/10 text-primary-container'][i % 4]}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-headline-md text-on-surface">{u.title}</h3>
                    {u.text && <p className="text-body-sm text-on-surface-variant">{u.text}</p>}
                  </div>
                  {u.tip && (
                    <div className="bg-surface-container-low p-3">
                      <span className="block text-label-sm uppercase text-secondary">Tip</span>
                      <span className="text-body-sm font-medium">{u.tip}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* specs + storage */}
      <section className="container-x py-space-xl lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        <div className="lg:col-span-7 space-y-space-md">
          <h2 className="font-serif text-headline-md text-on-surface">Product details</h2>
          <div className="overflow-x-auto bg-surface-container-lowest shadow-sm">
            <table className="w-full text-left text-body-sm">
              <tbody>
                {[
                  p.category && { label: 'Category', value: p.category.name },
                  p.botanicalName && { label: 'Botanical name', value: p.botanicalName },
                  p.grade && { label: 'Grade', value: p.grade },
                  ...p.specs,
                ].filter(Boolean).map((s, i) => (
                  <tr key={s.label} className={i % 2 ? 'bg-surface-container-low' : ''}>
                    <th scope="row" className="py-3 px-4 font-medium text-on-surface w-2/5 align-top">{s.label}</th>
                    <td className="py-3 px-4 text-on-surface-variant">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-label-md uppercase tracking-wider pt-2">Pack sizes & prices</h3>
          <div className="overflow-x-auto bg-surface-container-lowest shadow-sm">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container-high text-label-md">
                <tr><th className="py-3 px-4">Pack</th><th className="py-3 px-4">Price</th><th className="py-3 px-4">MRP</th><th className="py-3 px-4">Per 100g</th><th className="py-3 px-4">Stock</th></tr>
              </thead>
              <tbody>
                {p.variants.map((x) => (
                  <tr key={x.id} className={x.id === v?.id ? 'bg-primary/5' : ''}>
                    <td className="py-3 px-4 font-medium">{x.packSize}</td>
                    <td className="py-3 px-4 text-primary font-bold">{rupee(x.price)}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{rupee(x.mrp)}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{per100(x) ? rupee(per100(x)) : '—'}</td>
                    <td className={`py-3 px-4 ${x.stock <= 0 ? 'text-error' : x.stock <= 10 ? 'text-secondary' : 'text-tertiary-container'}`}>
                      {x.stock <= 0 ? 'Out of stock' : x.stock <= 10 ? `Only ${x.stock} left` : 'In stock'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-space-md">
          {p.storage && (
            <div className="bg-surface-container p-space-lg space-y-2">
              <h2 className="flex items-center gap-2 text-label-md uppercase tracking-wider"><Icon name="kitchen" size={18} className="text-primary" /> How to store</h2>
              <p className="text-body-md text-on-surface-variant">{p.storage}</p>
            </div>
          )}
          <div className="bg-inverse-surface text-inverse-on-surface p-space-lg space-y-3">
            <span className="text-label-sm uppercase tracking-widest text-secondary-fixed-dim">Bulk & shop orders</span>
            <p className="font-serif text-headline-md">Need {p.nameEn.split('(')[0].trim()} in 5kg or more?</p>
            <p className="text-body-sm opacity-80">Kirana shops, hotels and caterers get wholesale rates. Tell us how much you need.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={waLink(`Hello S.N Spices, I want wholesale rate for ${p.nameEn}.`)} target="_blank" rel="noreferrer" className="btn bg-tertiary-container text-on-tertiary px-4 py-2.5 hover:bg-tertiary">
                <Icon name="chat" size={18} /> WhatsApp
              </a>
              <a href={`tel:+${STORE.whatsapp}`} className="btn bg-surface/10 text-inverse-on-surface px-4 py-2.5 hover:bg-surface/20">
                <Icon name="call" size={18} /> {STORE.phoneDisplay}
              </a>
            </div>
          </div>
        </aside>
      </section>

      {/* related */}
      {data.related.length > 0 && (
        <section className="bg-surface-container-low py-space-xl lg:py-16">
          <div className="container-x space-y-space-lg">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-label-sm uppercase tracking-widest text-primary">Goes well with</span>
                <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">You may also like</h2>
              </div>
              {p.category && <Link to={`/shop/${p.category.slug}`} className="text-label-md text-primary flex items-center gap-1 whitespace-nowrap">See all <Icon name="arrow_forward" size={16} /></Link>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm sm:gap-space-md">
              {data.related.map((r) => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        </section>
      )}

      {/* mobile buy bar */}
      {v && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-container-lowest border-t border-outline-variant/40 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-price-lg">{rupee(v.price * qty)}</div>
              <div className="text-label-sm text-on-surface-variant truncate">{v.packSize} × {qty}{inCart ? ` · ${inCart} in cart` : ''}</div>
            </div>
            {out ? (
              <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn-green py-3"><Icon name="chat" size={18} /> Ask</a>
            ) : (
              <>
                <button onClick={() => addToCart(false)} className="btn-green py-3 px-4"><Icon name="add_shopping_cart" size={18} /> Add</button>
                <button onClick={() => addToCart(true)} className="btn-primary py-3 px-4">Buy now</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-x py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl animate-pulse" aria-busy="true">
      <div className="lg:col-span-6 aspect-[4/5] bg-surface-container" />
      <div className="lg:col-span-6 space-y-4">
        <div className="h-4 w-1/3 bg-surface-container" />
        <div className="h-10 w-3/4 bg-surface-container" />
        <div className="h-20 bg-surface-container" />
        <div className="h-48 bg-surface-container" />
      </div>
    </div>
  );
}
