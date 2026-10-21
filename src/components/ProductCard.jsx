import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import QtyStepper from './QtyStepper';
import { useCart } from '../store/cart';
import { useToast } from '../lib/hooks';
import { rupee } from '../lib/api';

export default function ProductCard({ product, wide = false }) {
  const { t } = useTranslation();
  const variants = product.variants || [];
  const [vid, setVid] = useState(variants[0]?.id);
  const v = variants.find((x) => x.id === vid) || variants[0];
  const qty = useCart((s) => (v ? s.items[v.id]?.qty || 0 : 0));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const toast = useToast((s) => s.show);

  if (!v) return null;
  const off = v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
  const outOfStock = v.stock <= 0;

  return (
    <article className={`card p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-shadow group ${wide ? 'md:col-span-2 md:flex-row md:gap-4' : ''}`}>
      <div className={wide ? 'md:w-1/2' : ''}>
        <Link to={`/product/${product.slug}`} aria-label={product.name} className={`block relative w-full ${wide ? 'aspect-square md:aspect-auto md:h-full md:min-h-[220px]' : 'aspect-square'} rounded-xl overflow-hidden bg-surface-container mb-3`}>
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full grid place-items-center text-outline"><Icon name="image" size={40} /></div>
          )}
          {product.badge && <span className="absolute top-2 left-2 chip bg-secondary text-on-secondary shadow-sm">{product.badge}</span>}
          {off > 0 && <span className="absolute top-2 right-2 chip bg-surface-container-lowest/90 text-tertiary">{off}% OFF</span>}
        </Link>
      </div>

      <div className={`flex flex-col flex-1 ${wide ? 'md:w-1/2 md:py-1' : ''}`}>
        {product.origin && (
          <div className="flex items-center gap-1 text-label-sm text-on-surface-variant mb-1">
            <Icon name="location_on" size={14} className="text-secondary" /> {product.origin}
          </div>
        )}
        <h3 className="text-headline-sm text-on-surface line-clamp-2 leading-snug"><Link to={`/product/${product.slug}`} className="hover:text-primary">{product.name}</Link></h3>
        {product.highlight && <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">{product.highlight}</p>}
        {wide && product.description && <p className="text-body-sm text-on-surface-variant mt-2">{product.description}</p>}

        {variants.length > 1 ? (
          <div className="flex flex-wrap gap-1 mt-2" role="radiogroup" aria-label="Pack size">
            {variants.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === v.id}
                onClick={() => setVid(x.id)}
                className={`text-label-sm px-2 py-1 rounded ${x.id === v.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {x.packSize}
              </button>
            ))}
          </div>
        ) : (
          <span className="mt-2 self-start text-label-sm px-2 py-1 rounded bg-surface-container text-on-surface">{v.packSize}</span>
        )}

        <div className="flex items-end justify-between gap-2 pt-3 mt-auto">
          <div className="flex flex-col">
            {v.mrp > v.price && <span className="text-body-sm line-through text-outline">{rupee(v.mrp)}</span>}
            <span className="text-price-lg text-on-surface">{rupee(v.price)}</span>
          </div>
          {outOfStock ? (
            <span className="text-label-md text-error">Out of stock</span>
          ) : qty > 0 ? (
            <QtyStepper qty={qty} size="sm" onChange={(n) => setQty(v.id, Math.min(n, v.stock))} />
          ) : (
            <button
              type="button"
              onClick={() => { add(product, v); toast(`${product.name} (${v.packSize}) – ${t('added')}`); }}
              className="px-4 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-label-md shadow-sm hover:bg-tertiary hover:text-on-tertiary transition-colors"
            >
              {t('add')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card p-3 animate-pulse">
      <div className="aspect-square rounded-xl bg-surface-container mb-3" />
      <div className="h-4 bg-surface-container rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface-container rounded w-1/2 mb-4" />
      <div className="h-8 bg-surface-container rounded" />
    </div>
  );
}
