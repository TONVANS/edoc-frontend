// src/store/useDepartmentStore.ts
import api from "@/lib/api";
import { Department, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DepartmentState {
  departments: Department[];
  departmentDropdown: DropdownOption[];
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  fetchDropdown: () => Promise<void>;
  sync: () => Promise<boolean>;
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  departmentDropdown: [],
  isLoading: false,
  isSyncing: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/departments`);
      const data = response.data?.data || response.data || [];
      set({ departments: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch departments:', error);
    }
  },

  fetchDropdown: async () => {
    try {
      const response = await api.get(`/departments/dropdown`);
      const data = response.data?.data || response.data || [];
      set({ departmentDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch department dropdown:', error);
    }
  },

  sync: async () => {
    set({ isSyncing: true });
    try {
      await api.post(`/departments/sync`);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      set({ isSyncing: false });
      console.error('Failed to sync departments:', error);
      return false;
    }
  },
}));
