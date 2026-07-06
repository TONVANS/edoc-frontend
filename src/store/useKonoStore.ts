import { create } from 'zustand';
import { Kono } from '@/types/prisma-mapped';

interface KonoState {
  currentKono: Kono | null;
  breadcrumb: { id: string; name: string; level: string }[];
  setCurrentKono: (kono: Kono | null) => void;
  setBreadcrumb: (breadcrumb: { id: string; name: string; level: string }[]) => void;
}

export const useKonoStore = create<KonoState>((set) => ({
  currentKono: null,
  breadcrumb: [],
  setCurrentKono: (kono) => set({ currentKono: kono }),
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
}));
