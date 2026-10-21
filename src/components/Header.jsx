import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import Logo from './Logo';
import { useCartSummary } from '../store/cart';
import { useCategories, useCatName, useSettings } from '../lib/hooks';
import { rupee, STORE, waLink } from '../lib/api';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const { count, subtotal } = useCartSummary();
  const { data: cats = [] } = useCategories();
  const { data: settings } = useSettings();
  const catName = useCatName();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(() => setQ(params.get('q') || ''), [params]);

  const onSearch = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  };

  const pill = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-full whitespace-nowrap text-label-md transition-colors ${
      isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(28,25,23,0.06)]">
      {/* top strip */}
      <div className="bg-primary text-on-primary py-1.5 px-4 text-label-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <span>{t('topbar_free', { min: settings?.freeDeliveryMin ?? 499 })}</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t('topbar_fresh')}</span>
          <span className="opacity-40 hidden md:inline">•</span>
          <a href={waLink()} target="_blank" rel="noreferrer" className="hidden md:inline hover:underline">
            {t('topbar_wa', { phone: STORE.phoneDisplay })}
          </a>
        </div>
      </div>

      {/* main row */}
      <div className="container-x py-3 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-5">
        <Logo />

        <form onSubmit={onSearch} className="order-last md:order-none w-full md:flex-1 md:max-w-2xl relative" role="search">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-surface-container-lowest text-body-md pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/50 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm placeholder:text-outline"
            placeholder={t('search')}
            aria-label="Search products"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/40 px-2 py-1.5 rounded-lg">
            <Icon name="translate" size={18} className="text-secondary" />
            <span className="sr-only">Language</span>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent text-label-md text-on-surface focus:outline-none cursor-pointer"
            >
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>

          <a href={waLink()} target="_blank" rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 bg-tertiary-container text-on-tertiary px-3 py-2 rounded-lg text-label-md hover:bg-tertiary transition-colors">
            <Icon name="chat" size={18} /> {t('wa_enquiry')}
          </a>

          <Link to="/track" className="hidden sm:flex items-center gap-1 text-on-surface-variant hover:text-on-surface px-2 py-1.5 rounded-lg text-label-md">
            <Icon name="local_shipping" size={20} /> <span className="hidden md:inline">{t('track')}</span>
          </Link>

          <Link to="/cart" className="flex items-center gap-2 bg-tertiary text-on-tertiary px-3 py-2 rounded-lg shadow-sm hover:bg-tertiary-container transition-colors">
            <Icon name="shopping_bag" />
            <span className="flex flex-col leading-tight">
              <span className="text-label-sm uppercase tracking-wider opacity-90">{t('my_cart')}</span>
              <span className="text-price-sm">{count ? `${t('items', { count })} • ${rupee(subtotal)}` : '—'}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* category nav */}
      <div className="bg-surface-container-low border-t border-outline-variant/30">
        <nav className="container-x flex items-center gap-1 overflow-x-auto no-scrollbar py-2" aria-label="Categories">
          <NavLink to="/shop" end className={pill}>{t('all')}</NavLink>
          {cats.map((c) => (
            <NavLink key={c.slug} to={`/shop/${c.slug}`} className={pill}>{catName(c)}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
