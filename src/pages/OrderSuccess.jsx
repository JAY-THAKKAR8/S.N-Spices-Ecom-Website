import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import OrderView from '../components/OrderView';
import { waLink } from '../lib/api';
import { orderWhatsAppText } from '../lib/whatsapp';

export default function OrderSuccess() {
  const { orderNo } = useParams();
  const order = useLocation().state?.order;

  return (
    <div className="container-x py-space-xl max-w-xl">
      <div className="card p-space-lg sm:p-space-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-tertiary-container" />
        <div className="text-center mb-space-lg">
          <span className="w-16 h-16 bg-surface-container-low text-tertiary-container rounded-full mx-auto grid place-items-center mb-space-sm">
            <Icon name="check_circle" fill size={36} />
          </span>
          <h1 className="font-serif text-headline-xl-mobile text-on-surface">Order Placed!</h1>
          <p className="text-body-md text-on-surface-variant">Order no: <strong className="text-on-surface">{orderNo}</strong></p>
          <p className="text-body-sm text-on-surface-variant mt-1">We will call you soon to confirm. Save this order number to track it.</p>
        </div>

        {order && <OrderView order={order} />}

        <div className="flex flex-col gap-space-sm mt-space-lg">
          <a href={waLink(order ? orderWhatsAppText(order) : `Hello S.N Spices, about my order ${orderNo}`)} target="_blank" rel="noreferrer" className="btn-green">
            <Icon name="chat" size={18} /> {order?.paymentMethod === 'WHATSAPP' ? 'Send order on WhatsApp' : 'Message us on WhatsApp'}
          </a>
          <Link to={`/track?orderNo=${orderNo}${order ? `&phone=${order.phone}` : ''}`} className="btn-soft">Track this order</Link>
          <Link to="/" className="btn-soft">Back to shop</Link>
        </div>
      </div>
    </div>
  );
}
