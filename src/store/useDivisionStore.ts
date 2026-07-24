// src/store/useDivisionStore.ts
import api from "@/lib/api";
import { Division, DropdownOption, CreateDivisionPayload, UpdateDivisionPayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DivisionState {
  divisions: Division[];
  divisionDropdown: DropdownOption[];
  currentDivision: Division | null;
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  fetchById: (id: number | string) => Promise<void>;
  fetchDropdown: (params?: { departmentId?: number }) => Promise<void>;
  fetchByDepartment: (departmentId: number) => Promise<Division[]>;
  createDivision: (payload: CreateDivisionPayload) => Promise<boolean>;
  updateDivision: (id: number | string, payload: UpdateDivisionPayload) => Promise<boolean>;
  deleteDivision: (id: number | string) => Promise<boolean>;
  sync: () => Promise<boolean>;
}

export const useDivisionStore = create<DivisionState>((set) => ({
  divisions: [],
  divisionDropdown: [],
  currentDivision: null,
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

  fetchById: async (id) => {
    set({ isLoading: true, currentDivision: null });
    try {
      const response = await api.get(`/divisions/${id}`);
      set({ currentDivision: response.data?.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch division by id:', error);
    }
  },

  createDivision: async (payload) => {
    set({ isLoading: true });
    try {
      await api.post(`/divisions`, payload);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create division:', error);
      return false;
    }
  },

  updateDivision: async (id, payload) => {
    set({ isLoading: true });
    try {
      await api.put(`/divisions/${id}`, payload);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update division:', error);
      return false;
    }
  },

  deleteDivision: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/divisions/${id}`);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete division:', error);
      return false;
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
