import { rupee } from './api';
import type { CartItem, Order, Quote } from '../types';

export function cartWhatsAppText(lines: CartItem[], quote?: Quote | null) {
  let s = 'Hello S.N Spices, I want to order:\n';
  for (const l of lines) s += `- ${l.name} (${l.packSize}) x ${l.qty} = ${rupee(l.price * l.qty)}\n`;
  if (quote) s += `\nTotal: ${rupee(quote.total)}`;
  return s;
}

export function orderWhatsAppText(o: Order) {
  let s = `Hello S.N Spices, I placed order ${o.orderNo}:\n`;
  for (const i of o.items) s += `- ${i.name} (${i.packSize}) x ${i.qty} = ${rupee(i.lineTotal)}\n`;
  s += `\nTotal: ${rupee(o.total)}\nName: ${o.name}\nPhone: ${o.phone}\nAddress: ${o.address}, ${o.city} - ${o.pincode}`;
  return s;
}
