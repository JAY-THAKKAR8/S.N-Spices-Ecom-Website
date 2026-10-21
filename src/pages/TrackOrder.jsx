import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Icon from '../components/Icon';
import OrderView from '../components/OrderView';
import { api } from '../lib/api';

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [orderNo, setOrderNo] = useState(params.get('orderNo') || '');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const m = useMutation({ mutationFn: (p) => api.get('/orders/track', { params: p }).then((r) => r.data) });

  useEffect(() => {
    if (params.get('orderNo') && params.get('phone')) m.mutate({ orderNo: params.get('orderNo'), phone: params.get('phone') });
    // run once on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-x py-space-xl max-w-xl">
      <h1 className="font-serif text-headline-lg text-primary mb-space-md">Track Order</h1>
      <form className="card p-space-lg grid gap-space-md" onSubmit={(e) => { e.preventDefault(); m.mutate({ orderNo, phone }); }}>
        <div>
          <label className="label" htmlFor="t-no">Order number</label>
          <input id="t-no" className="input uppercase" required value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="SN-261016-1234" />
        </div>
        <div>
          <label className="label" htmlFor="t-ph">Mobile number used in order</label>
          <input id="t-ph" className="input" required inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        </div>
        <button className="btn-primary" disabled={m.isPending}><Icon name="search" size={18} /> {m.isPending ? 'Checking…' : 'Check status'}</button>
        {m.isError && <p className="text-body-sm text-error">{m.error.message}</p>}
      </form>
      {m.data && <div className="card p-space-lg mt-space-md"><OrderView order={m.data} /></div>}
    </div>
  );
}
