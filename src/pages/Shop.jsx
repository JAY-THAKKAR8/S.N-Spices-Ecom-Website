import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';
import { api, rupee } from '../lib/api';
import { useCategories, useCatName, useSettings } from '../lib/hooks';

const PACKS = ['100g', '200g', '250g', '500g', '1kg', '5kg'];
const MAX = 2500;
const SORTS = [
  ['popular', 'Popular'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
  ['discount', 'Discount %'],
  ['newest', 'Newest'],
];

export default function Shop() {
  const { t, i18n } = useTranslation();
  const { category = 'all' } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: cats = [] } = useCategories();
  const { data: settings } = useSettings();
  const catName = useCatName();
  const [open, setOpen] = useState(false);

  const q = params.get('q') || '';
  const maxPrice = Number(params.get('maxPrice') || MAX);
  const pack = (params.get('pack') || '').split(',').filter(Boolean);
  const sort = params.get('sort') || 'popular';
  const page = Number(params.get('page') || 1);

  // slider moves fast, so keep local value and push to URL on release
  const [price, setPrice] = useState(maxPrice);
  useEffect(() => setPrice(maxPrice), [maxPrice]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v == null || (k === 'maxPrice' && Number(v) >= MAX) || (k === 'sort' && v === 'popular') || (k === 'page' && v === 1)) next.delete(k);
      else next.set(k, String(v));
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['products', category, q, maxPrice, pack.join(','), sort, page, i18n.language],
    queryFn: () =>
      api.get('/products', {
        params: { category, q: q || undefined, maxPrice: maxPrice < MAX ? maxPrice : undefined, pack: pack.join(',') || undefined, sort, page, limit: 12, lang: i18n.language },
      }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const cat = cats.find((c) => c.slug === category);
  const title = q ? `Results for "${q}"` : cat ? catName(cat) : 'All Products';
  const active = [
    q && { label: `"${q}"`, clear: { q: '' } },
    maxPrice < MAX && { label: `Under ${rupee(maxPrice)}`, clear: { maxPrice: '' } },
    ...pack.map((p) => ({ label: p, clear: { pack: pack.filter((x) => x !== p).join(',') } })),
  ].filter(Boolean);

  const togglePack = (p) => update({ pack: (pack.includes(p) ? pack.filter((x) => x !== p) : [...pack, p]).join(',') });

  const filters = (
    <div className="space-y-space-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm flex items-center gap-1.5"><Icon name="tune" className="text-primary" /> {t('filters')}</h2>
        <Link to={`/shop${category !== 'all' ? `/${category}` : ''}`} className="text-label-sm text-primary uppercase tracking-wider">{t('clear_all')}</Link>
      </div>

      <div>
        <h3 className="text-label-md uppercase tracking-wider mb-space-sm">{t('categories')}</h3>
        <div className="space-y-1">
          {[{ slug: 'all', nameEn: t('all'), productCount: null }, ...cats].map((c) => {
            const on = c.slug === category;
            return (
              <Link key={c.slug} to={`/shop${c.slug === 'all' ? '' : `/${c.slug}`}${q ? `?q=${encodeURIComponent(q)}` : ''}`} onClick={() => setOpen(false)}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${on ? 'bg-surface-container-highest text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                <span className="flex items-center gap-2 text-body-md">
                  <Icon name={on ? 'radio_button_checked' : 'radio_button_unchecked'} size={18} className={on ? '' : 'opacity-40'} />
                  {c.slug === 'all' ? c.nameEn : catName(c)}
                </span>
                {c.productCount != null && <span className={`text-label-sm px-1.5 py-0.5 rounded-full ${on ? 'bg-primary text-on-primary' : ''}`}>{c.productCount}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-space-sm">
          <h3 className="text-label-md uppercase tracking-wider">{t('price_range')}</h3>
          <span className="text-price-sm text-primary">{price >= MAX ? 'Any' : `Up to ${rupee(price)}`}</span>
        </div>
        <input type="range" min={50} max={MAX} step={50} value={price} aria-label="Max price"
          onChange={(e) => setPrice(Number(e.target.value))}
          onMouseUp={() => update({ maxPrice: price })} onTouchEnd={() => update({ maxPrice: price })} onKeyUp={() => update({ maxPrice: price })}
          className="w-full accent-primary cursor-pointer" />
        <div className="flex justify-between text-label-sm text-on-surface-variant mt-1"><span>₹50</span><span>₹{MAX}+</span></div>
      </div>

      <div>
        <h3 className="text-label-md uppercase tracking-wider mb-space-sm">{t('pack_weight')}</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {PACKS.map((p) => (
            <button key={p} type="button" onClick={() => togglePack(p)} aria-pressed={pack.includes(p)}
              className={`px-2 py-1.5 rounded-lg text-label-md transition-colors ${pack.includes(p) ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 rounded-xl p-space-md">
        <div className="flex items-center gap-2 text-primary text-label-md mb-1"><Icon name="local_shipping" size={20} /> Free delivery</div>
        <p className="text-body-sm text-on-surface-variant">On orders above ₹{settings?.freeDeliveryMin ?? 499}. Pay cash on delivery.</p>
      </div>
    </div>
  );

  return (
    <div className="container-x py-space-lg pb-24">
      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        {/* sidebar desktop */}
        <aside className="hidden lg:block w-72 shrink-0 bg-surface-container-low rounded-xl p-space-lg shadow-sm sticky top-44">{filters}</aside>

        {/* mobile drawer */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-surface p-space-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button className="absolute right-3 top-3 w-8 h-8 rounded-full bg-surface-container grid place-items-center" onClick={() => setOpen(false)} aria-label="Close filters">
                <Icon name="close" size={18} />
              </button>
              {filters}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 w-full space-y-space-lg">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-primary">{title}</h1>
                {cat?.subtitle && !q && <p className="text-body-sm text-on-surface-variant">{cat.subtitle}</p>}
                {data && <p className="text-body-sm text-on-surface-variant">{t('showing', { n: data.items.length, total: data.total })}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button className="lg:hidden btn-soft py-2" onClick={() => setOpen(true)}><Icon name="tune" size={18} /> {t('filters')}</button>
                <label className="flex items-center gap-2">
                  <span className="text-label-sm text-on-surface-variant whitespace-nowrap hidden sm:inline">{t('sort')}:</span>
                  <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="bg-surface-container-lowest text-label-md px-3 py-2 rounded-lg shadow-sm focus:outline-none cursor-pointer">
                    {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
              </div>
            </div>
            {active.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant uppercase">Active:</span>
                {active.map((a) => (
                  <button key={a.label} onClick={() => update(a.clear)} className="inline-flex items-center gap-1 bg-surface-container-highest px-2.5 py-1 rounded-full text-label-sm hover:text-error">
                    {a.label} <Icon name="close" size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter-mobile sm:gap-gutter transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
            {isLoading ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />) : data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {data && data.items.length === 0 && (
            <div className="card p-10 text-center text-on-surface-variant">
              <Icon name="search_off" size={40} className="text-outline" />
              <p className="mt-2">{t('no_results')}</p>
            </div>
          )}

          {data && data.pages > 1 && (
            <nav className="flex items-center justify-center gap-2 bg-surface-container-low p-space-md rounded-xl" aria-label="Pages">
              <button className="btn-soft py-1.5" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Previous</button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => update({ page: n })} aria-current={n === page ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-label-md ${n === page ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-highest'}`}>{n}</button>
              ))}
              <button className="btn-soft py-1.5" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
