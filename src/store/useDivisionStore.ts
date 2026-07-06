// src/store/useDivisionStore.ts
import api from "@/lib/api";
import { Division, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DivisionState {
  divisions: Division[];
  divisionDropdown: DropdownOption[];
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  fetchDropdown: (params?: { departmentId?: number }) => Promise<void>;
  fetchByDepartment: (departmentId: number) => Promise<Division[]>;
  sync: () => Promise<boolean>;
}

export const useDivisionStore = create<DivisionState>((set) => ({
  divisions: [],
  divisionDropdown: [],
  isLoading: false,
  isSyncing: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/divisions`);
      const data = response.data?.data || response.data || [];
      set({ divisions: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch divisions:', error);
    }
  },

  fetchDropdown: async (params = {}) => {
    try {
      const response = await api.get(`/divisions/dropdown`, { params });
      const data = response.data?.data || response.data || [];
      set({ divisionDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch division dropdown:', error);
    }
  },

  fetchByDepartment: async (departmentId: number) => {
    try {
      const response = await api.get(`/divisions/department/${departmentId}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch divisions by department:', error);
      return [];
    }
  },

  sync: async () => {
    set({ isSyncing: true });
    try {
      await api.post(`/divisions/sync`);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Failed to sync divisions:', error);
      return false;
    }
  },
}));
