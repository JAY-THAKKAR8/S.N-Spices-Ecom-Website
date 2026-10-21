import Icon from './Icon';

export default function QtyStepper({ qty, onChange, size = 'md', dark = true }) {
  const box = dark ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-lowest text-primary shadow-sm';
  const hov = dark ? 'hover:bg-tertiary-container' : 'hover:bg-surface-container';
  const pad = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <div className={`inline-flex items-center rounded-lg ${box}`}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(qty - 1)} className={`${pad} grid place-items-center rounded-l-lg ${hov}`}>
        <Icon name="remove" size={16} />
      </button>
      <span className="min-w-[2rem] text-center text-price-sm" aria-live="polite">{qty}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(qty + 1)} className={`${pad} grid place-items-center rounded-r-lg ${hov}`}>
        <Icon name="add" size={16} />
      </button>
    </div>
  );
}
