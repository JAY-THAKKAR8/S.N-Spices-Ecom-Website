import { Link } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import { useCategories, useCatName } from '../lib/hooks';
import { STORE, waLink } from '../lib/api';

export default function Footer() {
  const { data: cats = [] } = useCategories();
  const catName = useCatName();
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant/30 pt-space-xl pb-24 md:pb-space-lg mt-space-xl">
      <div className="container-x grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-xl">
        <div>
          <div className="mb-space-md"><Logo small /></div>
          <p className="text-body-sm text-on-surface-variant">
            Whole spices, masalas and dry fruits for homes, shops and kitchens. Retail and wholesale from Borsad.
          </p>
        </div>
        <div>
          <h3 className="text-label-lg uppercase tracking-wider mb-space-md">Categories</h3>
          <ul className="space-y-2 text-body-sm text-on-surface-variant">
            {cats.map((c) => (
              <li key={c.slug}><Link className="hover:text-primary" to={`/shop/${c.slug}`}>{catName(c)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-label-lg uppercase tracking-wider mb-space-md">Contact</h3>
          <ul className="space-y-3 text-body-sm text-on-surface-variant">
            <li><a href={waLink()} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary"><Icon name="call" size={18} className="text-primary" /> WhatsApp / Call: {STORE.phoneDisplay}</a></li>
            <li className="flex items-center gap-1.5"><Icon name="schedule" size={18} className="text-primary" /> 8:00 AM – 10:00 PM</li>
            <li className="flex items-center gap-1.5"><Icon name="location_on" size={18} className="text-primary" /> {STORE.city}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-label-lg uppercase tracking-wider mb-space-md">Help</h3>
          <ul className="space-y-2 text-body-sm text-on-surface-variant">
            <li><Link className="hover:text-primary" to="/track">Track your order</Link></li>
            <li><Link className="hover:text-primary" to="/#wholesale">Wholesale enquiry</Link></li>
            <li><Link className="hover:text-primary" to="/cart">Your cart</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-x border-t border-outline-variant/40 pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-label-md text-on-surface-variant">
        <span>© {new Date().getFullYear()} S.N Spices. All rights reserved.</span>
        <span>Payment: Cash on Delivery · WhatsApp order</span>
      </div>
    </footer>
  );
}
