// src/store/useUnitStore.ts
import api from "@/lib/api";
import { Unit } from "@/types/prisma-mapped";
import { create } from "zustand";

interface UnitState {
  units: Unit[];
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  sync: () => Promise<boolean>;
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  isLoading: false,
  isSyncing: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/units`);
      const data = response.data?.data || response.data || [];
      set({ units: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch units:', error);
    }
  },

  sync: async () => {
    set({ isSyncing: true });
    try {
      await api.post(`/units/sync`);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Failed to sync units:', error);
      return false;
    }
  },
}));
