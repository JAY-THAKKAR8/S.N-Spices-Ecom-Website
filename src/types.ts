export interface Settings {
  freeDeliveryMin: number;
  deliveryFee: number;
  whatsapp: string;
}

export interface Category {
  id?: number;
  slug: string;
  nameEn: string;
  nameGu?: string | null;
  nameHi?: string | null;
  productCount?: number | null;
  image?: string | null;
  subtitle?: string | null;
  tag?: string | null;
}

export interface ProductList {
  items: Product[];
  total: number;
  pages: number;
}

export interface Variant {
  id: number;
  packSize: string;
  price: number;
  mrp: number;
  stock: number;
  grams?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  image?: string | null;
  badge?: string | null;
  origin?: string | null;
  highlight?: string | null;
  description?: string | null;
  variants?: Variant[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface TasteNote {
  label: string;
  text?: string;
  level: number;
}

export interface KitchenUse {
  title: string;
  text?: string;
  tip?: string;
}

export interface ProductDetailData extends Product {
  nameEn: string;
  variants: Variant[];
  images: string[];
  category?: { slug: string; name: string } | null;
  grade?: string | null;
  botanicalName?: string | null;
  storage?: string | null;
  specs: ProductSpec[];
  tags: string[];
  tasteNotes: TasteNote[];
  uses: KitchenUse[];
}

export interface ProductDetailResponse {
  product: ProductDetailData;
  related: Product[];
}

export interface CartItem {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  packSize: string;
  price: number;
  mrp: number;
  image?: string | null;
  qty: number;
}

export interface QuoteLine {
  variantId: number;
  price: number;
  mrp: number;
  qty?: number;
  lineTotal?: number;
  name?: string;
  packSize?: string;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  mrpTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  coupon?: { code: string } | null;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  name: string;
  packSize: string;
  qty: number;
  lineTotal: number;
}

export interface Order {
  orderNo: string;
  status: OrderStatus;
  items: OrderItem[];
  discount: number;
  deliveryFee: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: 'COD' | 'WHATSAPP' | string;
  paymentStatus: 'PAID' | 'UNPAID' | string;
}
