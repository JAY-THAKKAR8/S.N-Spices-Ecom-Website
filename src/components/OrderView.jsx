import Icon from './Icon';
import { rupee } from '../lib/api';

export const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export const STATUS_LABEL = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderView({ order: o }) {
  const step = STATUS_STEPS.indexOf(o.status);
  return (
    <div className="space-y-space-md">
      {o.status === 'CANCELLED' ? (
        <p className="p-3 rounded-lg bg-error-container text-on-error-container text-label-md">This order was cancelled.</p>
      ) : (
        <ol className="flex items-center justify-between gap-1">
          {STATUS_STEPS.map((s, i) => (
            <li key={s} className="flex-1 flex flex-col items-center text-center gap-1">
              <span className={`w-7 h-7 rounded-full grid place-items-center ${i <= step ? 'bg-tertiary-container text-on-tertiary' : 'bg-surface-container text-outline'}`}>
                <Icon name={i <= step ? 'check' : 'radio_button_unchecked'} size={16} />
              </span>
              <span className={`text-label-sm ${i <= step ? 'text-on-surface' : 'text-outline'}`}>{STATUS_LABEL[s]}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="bg-surface-container-low p-space-md rounded-xl space-y-1.5 text-body-md">
        {o.items.map((i) => (
          <div key={i.id} className="flex justify-between gap-2">
            <span>{i.name} ({i.packSize}) × {i.qty}</span>
            <span className="font-bold">{rupee(i.lineTotal)}</span>
          </div>
        ))}
        <div className="h-px bg-surface-container-high my-1" />
        {o.discount > 0 && <div className="flex justify-between text-tertiary-container"><span>Discount</span><span>-{rupee(o.discount)}</span></div>}
        <div className="flex justify-between"><span>Delivery</span><span>{o.deliveryFee ? rupee(o.deliveryFee) : 'FREE'}</span></div>
        <div className="flex justify-between text-label-lg"><span>Total</span><span className="text-primary">{rupee(o.total)}</span></div>
      </div>

      <div className="text-body-sm text-on-surface-variant">
        <p><strong className="text-on-surface">{o.name}</strong> · {o.phone}</p>
        <p>{o.address}, {o.city} - {o.pincode}</p>
        <p>Payment: {o.paymentMethod === 'COD' ? 'Cash on Delivery' : 'WhatsApp / UPI'} ({o.paymentStatus === 'PAID' ? 'Paid' : 'Not paid yet'})</p>
      </div>
    </div>
  );
}
