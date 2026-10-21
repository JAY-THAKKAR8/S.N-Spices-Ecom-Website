import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { api } from './api';

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    placeholderData: { freeDeliveryMin: 499, deliveryFee: 40, whatsapp: '919601901832' },
    staleTime: Infinity,
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories').then((r) => r.data), staleTime: 5 * 60_000 });

// name in the current language
export function useCatName() {
  const { i18n } = useTranslation();
  return (c) => (i18n.language === 'gu' && c.nameGu) || (i18n.language === 'hi' && c.nameHi) || c.nameEn;
}

// tiny toast store
export const useToast = create((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    clearTimeout(useToast._t);
    useToast._t = setTimeout(() => set({ msg: null }), 2200);
  },
}));
