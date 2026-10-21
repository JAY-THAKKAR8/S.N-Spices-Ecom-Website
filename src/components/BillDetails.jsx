import { useTranslation } from 'react-i18next';
import { rupee } from '../lib/api';

export default function BillDetails({ quote }) {
  const { t } = useTranslation();
  if (!quote) return <div className="h-32 rounded-lg bg-surface-container animate-pulse" />;
  const mrpSave = quote.mrpTotal - quote.subtotal;
  const totalSave = mrpSave + quote.discount;
  return (
    <div className="flex flex-col gap-2 text-body-md">
      <span className="text-label-lg uppercase tracking-wide">{t('bill')}</span>
      <Row label={t('item_total')} value={
        <span className="flex items-center gap-2">
          {mrpSave > 0 && <span className="text-label-sm text-outline line-through">{rupee(quote.mrpTotal)}</span>}
          {rupee(quote.subtotal)}
        </span>
      } />
      {quote.discount > 0 && <Row label={`${t('coupon')} (${quote.coupon?.code})`} value={`-${rupee(quote.discount)}`} green />}
      <Row label={t('delivery')} value={quote.deliveryFee ? rupee(quote.deliveryFee) : <span className="text-tertiary font-bold">{t('free')}</span>} />
      <div className="h-px bg-surface-container-high my-1" />
      <div className="flex items-center justify-between">
        <span className="text-label-lg">{t('to_pay')}</span>
        <span className="font-serif text-headline-md text-primary font-bold">{rupee(quote.total)}</span>
      </div>
      {totalSave > 0 && (
        <div className="bg-surface-container p-2 rounded-lg text-center text-label-md">
          {t('you_save', { amt: '' })} <strong className="text-secondary">{rupee(totalSave)}</strong>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, green }) {
  return (
    <div className={`flex items-center justify-between ${green ? 'text-tertiary-container font-medium' : 'text-on-surface-variant'}`}>
      <span>{label}</span>
      <span className={green ? '' : 'text-on-surface font-medium'}>{value}</span>
    </div>
  );
}
