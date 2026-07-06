// src/store/useOfficeStore.ts
import api from "@/lib/api";
import { Office } from "@/types/prisma-mapped";
import { create } from "zustand";

interface OfficeState {
  offices: Office[];
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  sync: () => Promise<boolean>;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  offices: [],
  isLoading: false,
  isSyncing: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/offices`);
      const data = response.data?.data || response.data || [];
      set({ offices: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch offices:', error);
    }
  },

  sync: async () => {
    set({ isSyncing: true });
    try {
      await api.post(`/offices/sync`);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Failed to sync offices:', error);
      return false;
    }
  },
}));
