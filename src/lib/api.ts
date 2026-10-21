import axios, { type AxiosError } from 'axios';

// Dev: Vite proxies /api to Express. Prod: set VITE_API_URL if API is on another domain.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });


api.interceptors.response.use(
  (r) => r,
  (err: ApiError) => {
    err.message = err.response?.data?.message || 'Network error. Please try again.';
    return Promise.reject(err);
  },
);

export type ApiError = AxiosError<{ message?: string }>;

export const errMsg = (e: unknown): string => (e instanceof Error ? e.message : 'Something went wrong');

export const rupee = (n: number | string | null | undefined): string =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: Number(n) % 1 ? 2 : 0 });

export const STORE = {
  name: 'S.N Spices',
  phoneDisplay: '+91 96019 01832',
  whatsapp: '919601901832',
  city: 'Borsad, Gujarat',
};

export const waLink = (text?: string): string => `https://wa.me/${STORE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
