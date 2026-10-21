import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';
import B2BForm from '../components/B2BForm';
import { api } from '../lib/api';
import { useCategories, useCatName, useSettings } from '../lib/hooks';
import { HERO } from '../lib/images';
import type { ProductList } from '../types';

const TRUST = [
  { icon: 'cleaning_services', title: 'Cleaned & Sorted', text: 'Machine cleaned, no dust or stones.' },
  { icon: 'inventory_2', title: 'Packed on Order', text: 'Sealed packs, packed when you order.' },
  { icon: 'storefront', title: 'Retail & Wholesale', text: 'Small home packs to 5kg bulk bags.' },
  { icon: 'payments', title: 'Pay on Delivery', text: 'Cash on delivery or order on WhatsApp.' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const { data: cats = [] } = useCategories();
  const catName = useCatName();
  const { data: settings } = useSettings();
  const [tab, setTab] = useState('all');

  const { data, isLoading } = useQuery<ProductList>({
    queryKey: ['featured', tab, i18n.language],
    queryFn: () =>
      api.get('/products', { params: { featured: tab === 'all' ? 'true' : undefined, category: tab === 'all' ? undefined : tab, limit: 8, lang: i18n.language } }).then((r) => r.data),
  });

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const tabs = [{ slug: 'all', label: t('all') }, ...cats.filter((c) => (c.productCount ?? 0) > 0).slice(0, 4).map((c) => ({ slug: c.slug, label: catName(c) }))];
  const items = data?.items || [];

  return (
    <div>
      {/* info strip */}
      <section className="bg-surface-container-high py-2">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary-container" /> Orders open · Borsad & nearby</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Icon name="local_shipping" size={16} className="text-secondary" /> Free delivery over ₹{settings?.freeDeliveryMin ?? 499}</span>
            <span className="hidden sm:flex items-center gap-1"><Icon name="payments" size={16} className="text-secondary" /> Cash on delivery</span>
          </span>
        </div>
      </section>

      {/* hero */}
      <section className="relative overflow-hidden bg-surface-container-low py-space-xl lg:py-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="container-x relative grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-space-md">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-secondary text-label-sm uppercase tracking-widest shadow-sm">
              <Icon name="agriculture" size={16} /> {t('hero_kicker')}
            </span>
            <h1 className="font-serif text-headline-xl-mobile md:text-headline-xl text-primary text-balance">{t('hero_title')}</h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">{t('hero_sub')}</p>
            <div className="flex flex-wrap gap-space-md pt-2">
              <Link to="/shop" className="btn-primary">{t('shop_now')} <Icon name="arrow_forward" size={18} /></Link>
              <a href="#categories" className="btn bg-surface-container-lowest text-on-surface px-5 py-3 shadow-sm hover:bg-surface-container">
                {t('explore')} <Icon name="grid_view" size={18} />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-space-md w-full max-w-lg">
              {[['verified', 'Clean stock', 'No dust, no stones', 'text-secondary'], ['inventory_2', 'Fresh packs', 'Packed on order', 'text-primary'], ['storefront', 'Wholesale', 'Bulk rates', 'text-tertiary-container']].map(([ic, a, b, c]) => (
                <div key={a} className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-lg shadow-sm">
                  <Icon name={ic} size={22} className={c} />
                  <div className="flex flex-col"><span className="text-label-md">{a}</span><span className="text-label-sm text-on-surface-variant font-normal">{b}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-space-md">
            <HeroTile img={HERO.cardamom} kicker="Whole Spices" title="Green Cardamom" to="/shop/whole-spices" tall />
            <div className="flex flex-col gap-space-md">
              <HeroTile img={HERO.turmeric} kicker="Ground Masalas" title="Turmeric" to="/shop/ground-masalas" />
              <HeroTile img={HERO.saffron} kicker="Premium" title="Kashmiri Saffron" to="/shop?q=saffron" />
            </div>
          </div>
        </div>
      </section>

      {/* categories */}
      <section id="categories" className="py-space-lg bg-surface scroll-mt-40">
        <div className="container-x">
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="font-serif text-headline-md flex items-center gap-2"><Icon name="category" className="text-primary" size={24} /> {t('browse_cats')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
            {cats.map((c) => (
              <Link key={c.slug} to={`/shop/${c.slug}`} className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all text-center group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container mb-2 p-1">
                  {c.image && <img src={c.image} alt="" loading="lazy" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform" />}
                </div>
                <span className="text-label-md group-hover:text-primary">{catName(c)}</span>
                <span className="text-body-sm text-outline truncate w-full">{c.subtitle}</span>
                {c.tag && <span className="mt-2 chip bg-secondary-fixed text-on-secondary-fixed">{c.tag}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* best sellers */}
      <section className="py-space-xl bg-surface-container-low">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-space-lg">
            <div>
              <div className="flex items-center gap-1 text-label-sm text-secondary uppercase tracking-widest"><Icon name="bolt" size={16} /> Fast moving</div>
              <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-primary">{t('best_sellers')}</h2>
              <p className="text-body-md text-on-surface-variant">{t('best_sub')}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((x) => (
                <button key={x.slug} onClick={() => setTab(x.slug)}
                  className={`px-4 py-1.5 rounded-full text-label-md shadow-sm whitespace-nowrap ${tab === x.slug ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'}`}>
                  {x.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm sm:gap-space-md">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : items.map((p) => <ProductCard key={p.id} product={p} wide={p.slug === 'biryani-spice-kit' && tab === 'all'} />)}
          </div>
          <div className="text-center mt-space-lg">
            <Link to={tab === 'all' ? '/shop' : `/shop/${tab}`} className="btn-soft">See all products <Icon name="arrow_forward" size={18} /></Link>
          </div>
        </div>
      </section>

      {/* banners */}
      <section className="py-space-lg bg-surface">
        <div className="container-x grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <div className="relative rounded-3xl overflow-hidden bg-primary p-space-lg lg:p-10 text-on-primary shadow-lg">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-container rounded-full blur-2xl opacity-60" />
            <div className="relative max-w-sm">
              <span className="chip bg-secondary-fixed text-on-secondary-fixed uppercase mb-space-sm">Gifting & Festivals</span>
              <h3 className="font-serif text-headline-lg-mobile md:text-headline-lg mb-space-sm">Dry Fruit & Spice Gift Boxes</h3>
              <p className="text-body-md opacity-90 mb-space-md">Almonds, cashews and saffron packed for festivals and family gifts.</p>
              <Link to="/shop/premium-dry-fruits" className="btn bg-surface-container-lowest text-primary px-5 py-2.5 hover:bg-surface-container-high">
                Shop Dry Fruits <Icon name="card_giftcard" size={18} />
              </Link>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-surface-container-highest p-space-lg lg:p-10 shadow-lg">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-secondary-container/20 rounded-full blur-2xl" />
            <div className="relative max-w-sm">
              <span className="chip bg-secondary text-on-secondary uppercase mb-space-sm">Shops, Hotels & Caterers</span>
              <h3 className="font-serif text-headline-lg-mobile md:text-headline-lg text-primary mb-space-sm">Wholesale Packs at Bulk Rates</h3>
              <p className="text-body-md text-on-surface-variant mb-space-md">1kg, 5kg and bigger bags for kirana shops, restaurants and caterers.</p>
              <a href="#wholesale" className="btn-primary py-2.5">Get Wholesale Rates <Icon name="inventory_2" size={18} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section id="wholesale" className="py-space-xl bg-surface-container-low scroll-mt-40">
        <div className="container-x">
          <B2BForm />
        </div>
      </section>

      {/* trust */}
      <section className="py-space-xl bg-surface">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <h2 className="font-serif text-headline-md text-primary">Why order from S.N Spices</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
            {TRUST.map((x) => (
              <div key={x.title} className="card p-space-md text-center flex flex-col items-center">
                <span className="w-12 h-12 rounded-full bg-secondary-fixed grid place-items-center text-on-secondary-fixed mb-3"><Icon name={x.icon} size={24} /></span>
                <h3 className="text-headline-sm mb-1">{x.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroTile({ img, kicker, title, to, tall = false }: { img: string; kicker: string; title: string; to: string; tall?: boolean }) {
  return (
    <Link to={to} className={`relative rounded-2xl overflow-hidden shadow-lg bg-surface-container group ${tall ? 'aspect-[4/5]' : 'flex-1 min-h-[120px]'}`}>
      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent flex flex-col justify-end p-3 sm:p-4 text-white">
        <span className="text-label-sm uppercase tracking-wider text-secondary-fixed">{kicker}</span>
        <span className={tall ? 'text-headline-sm' : 'text-label-lg'}>{title}</span>
      </div>
    </Link>
  );
}
