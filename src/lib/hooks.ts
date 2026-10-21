import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { api } from './api';
import type { Category, Settings } from '../types';

export const useSettings = () =>
  useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    placeholderData: { freeDeliveryMin: 499, deliveryFee: 40, whatsapp: '919601901832' },
    staleTime: Infinity,
  });

export const useCategories = () =>
  useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => api.get('/categories').then((r) => r.data), staleTime: 5 * 60_000 });

// name in the current language
export function useCatName() {
  const { i18n } = useTranslation();
  return (c: Category) => (i18n.language === 'gu' && c.nameGu) || (i18n.language === 'hi' && c.nameHi) || c.nameEn;
}

// tiny toast store
interface ToastState {
  msg: string | null;
  show: (msg: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ msg: null }), 2200);
  },
}));
