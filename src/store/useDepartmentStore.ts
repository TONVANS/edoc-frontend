// src/store/useDepartmentStore.ts
import api from "@/lib/api";
import { Department, DropdownOption, CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DepartmentState {
  departments: Department[];
  departmentDropdown: DropdownOption[];
  currentDepartment: Department | null;
  isLoading: boolean;
  isSyncing: boolean;

  fetchAll: () => Promise<void>;
  fetchById: (id: number | string) => Promise<void>;
  fetchDropdown: () => Promise<void>;
  createDepartment: (payload: CreateDepartmentPayload) => Promise<boolean>;
  updateDepartment: (id: number | string, payload: UpdateDepartmentPayload) => Promise<boolean>;
  deleteDepartment: (id: number | string) => Promise<boolean>;
  sync: () => Promise<boolean>;
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  departmentDropdown: [],
  currentDepartment: null,
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

  fetchById: async (id) => {
    set({ isLoading: true, currentDepartment: null });
    try {
      const response = await api.get(`/departments/${id}`);
      set({ currentDepartment: response.data?.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch department by id:', error);
    }
  },

  createDepartment: async (payload) => {
    set({ isLoading: true });
    try {
      await api.post(`/departments`, payload);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create department:', error);
      return false;
    }
  },

  updateDepartment: async (id, payload) => {
    set({ isLoading: true });
    try {
      await api.put(`/departments/${id}`, payload);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update department:', error);
      return false;
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/departments/${id}`);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete department:', error);
      return false;
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
