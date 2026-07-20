// src/store/useLockerStore.ts
import api from "@/lib/api";
import { Locker, CreateLockerPayload, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";

interface LockerResponse {
  message: string;
  data: Locker[] | { data: Locker[]; total: number; page: number; limit: number };
}

interface LockerState {
  lockers: Locker[];
  lockerDropdown: DropdownOption[];
  total: number;
  isLoading: boolean;
  currentLocker: Locker | null;

  // ── Actions ──
  fetchLockers: (params?: { page?: number; limit?: number; departmentId?: number; divisionId?: number; warehouseId?: string; search?: string; status?: string }) => Promise<void>;
  fetchLockerById: (id: string) => Promise<void>;
  fetchLockerDropdown: (params?: { warehouseId?: string; status?: string }) => Promise<void>;
  fetchByWarehouse: (warehouseId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  createLocker: (payload: CreateLockerPayload) => Promise<boolean>;
  updateLocker: (id: string | number, payload: Partial<CreateLockerPayload & { status: string }>) => Promise<boolean>;
  deleteLocker: (id: string | number) => Promise<boolean>;
}

export const useLockerStore = create<LockerState>((set, get) => ({
  lockers: [],
  lockerDropdown: [],
  total: 0,
  isLoading: false,
  currentLocker: null,

  fetchLockers: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<LockerResponse>(`/lockers`, { params });
      const resData = response.data.data;
      const lockers = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ lockers, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch lockers:', error);
    }
  },

  fetchLockerById: async (id: string) => {
    set({ isLoading: true, currentLocker: null });
    try {
      const response = await api.get<{ data: Locker }>(`/lockers/${id}`);
      set({ currentLocker: response.data?.data || (response.data as any), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch locker by id:', error);
    }
  },

  fetchLockerDropdown: async (params = {}) => {
    try {
      const response = await api.get(`/lockers/dropdown`, { params });
      const data = response.data?.data || response.data || [];
      set({ lockerDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch locker dropdown:', error);
    }
  },

  fetchByWarehouse: async (warehouseId: string, params?: { page?: number; limit?: number }) => {
    set({ isLoading: true });
    try {
      const response = await api.get<LockerResponse>(`/lockers`, { params: { ...params, warehouseId } });
      const resData = response.data.data;
      const lockers = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ lockers, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch lockers by warehouse:', error);
    }
  },

  createLocker: async (payload: CreateLockerPayload & { status?: string }) => {
    set({ isLoading: true });
    try {
      const { status, ...finalPayload } = payload as any;
      await api.post(`/lockers`, finalPayload);
      if (payload.warehouseId) {
        await get().fetchByWarehouse(payload.warehouseId);
      } else {
        await get().fetchLockers();
      }
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create locker:', error);
      return false;
    }
  },

  updateLocker: async (id: string | number, payload: Partial<CreateLockerPayload & { status: string }>) => {
    set({ isLoading: true });
    try {
      // Remove undefined fields for a cleaner partial update
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      await api.put(`/lockers/${id}`, cleanPayload);
      if (payload.warehouseId) {
        await get().fetchByWarehouse(payload.warehouseId);
      } else {
        await get().fetchLockers();
      }
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update locker:', error);
      return false;
    }
  },

  deleteLocker: async (id: string | number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/lockers/${id}`);
      await get().fetchLockers();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete locker:', error);
      return false;
    }
  },
}));
