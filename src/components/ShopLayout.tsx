import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import Icon from './Icon';
import { useCartSummary } from '../store/cart';
import { useToast } from '../lib/hooks';
import { rupee } from '../lib/api';

function FloatingCart() {
  const { t } = useTranslation();
  const { count, subtotal, mrpTotal } = useCartSummary();
  const { pathname } = useLocation();
  if (!count || ['/cart', '/checkout'].includes(pathname) || pathname.startsWith('/order/') || pathname.startsWith('/product/')) return null;
  const saved = mrpTotal - subtotal;
  return (
    <div className="fixed bottom-4 inset-x-0 z-30 px-4">
      <div className="max-w-lg mx-auto bg-tertiary text-on-tertiary rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pl-1">
          <span className="w-10 h-10 rounded-xl bg-tertiary-container grid place-items-center"><Icon name="shopping_basket" /></span>
          <div>
            <div className="text-label-md">{t('items_added', { count })} • <span className="text-price-lg">{rupee(subtotal)}</span></div>
            {saved > 0 && <div className="text-label-sm text-tertiary-fixed">{t('you_save', { amt: rupee(saved) })}</div>}
          </div>
        </div>
        <Link to="/cart" className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2.5 rounded-xl text-label-md flex items-center gap-1 hover:bg-white">
          {t('view_cart')} <Icon name="chevron_right" size={18} />
        </Link>
      </div>
    </div>
  );
}

function Toast() {
  const msg = useToast((s) => s.msg);
  if (!msg) return null;
  return (
    <div role="status" className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-body-sm">
      <Icon name="check_circle" size={18} className="text-tertiary-fixed" /> {msg}
    </div>
  );
}

export default function ShopLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <FloatingCart />
      <Toast />
    </div>
  );
}
