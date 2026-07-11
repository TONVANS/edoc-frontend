import api from "@/lib/api";
import { Shelf, CreateShelfPayload, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";

interface ShelfResponse {
  message: string;
  data: Shelf[] | { data: Shelf[]; total: number; page: number; limit: number };
}

interface ShelfState {
  shelves: Shelf[];
  shelfDropdown: DropdownOption[];
  total: number;
  isLoading: boolean;
  currentShelf: Shelf | null;

  // ── Actions ──
  fetchShelves: (params?: { page?: number; limit?: number; lockerId?: string; warehouseId?: string; search?: string; status?: string }) => Promise<void>;
  fetchShelfDropdown: (params?: { lockerId?: string; warehouseId?: string }) => Promise<void>;
  fetchShelfById: (id: string) => Promise<void>;
  fetchByLocker: (lockerId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  createShelf: (payload: CreateShelfPayload) => Promise<boolean>;
  updateShelf: (id: string | number, payload: Partial<CreateShelfPayload & { status: string }>) => Promise<boolean>;
  deleteShelf: (id: string | number) => Promise<boolean>;
}

export const useShelfStore = create<ShelfState>((set, get) => ({
  shelves: [],
  shelfDropdown: [],
  total: 0,
  isLoading: false,
  currentShelf: null,

  fetchShelfDropdown: async (params = {}) => {
    try {
      const response = await api.get(`/shelves/dropdown`, { params });
      const data = response.data?.data || response.data || [];
      set({ shelfDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch shelf dropdown:', error);
    }
  },

  fetchShelves: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<ShelfResponse>(`/shelves`, { params });
      const resData = response.data.data;
      const shelves = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ shelves, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch shelves:', error);
    }
  },

  fetchShelfById: async (id: string) => {
    set({ isLoading: true, currentShelf: null });
    try {
      const response = await api.get<{ data: Shelf }>(`/shelves/${id}`);
      set({ currentShelf: response.data?.data || (response.data as any), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch shelf by id:', error);
    }
  },

  fetchByLocker: async (lockerId, params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<ShelfResponse>(`/shelves`, { params: { ...params, lockerId } });
      const resData = response.data.data;
      const shelves = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ shelves, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch shelves by locker:', error);
    }
  },

  createShelf: async (payload: CreateShelfPayload & { status?: string }) => {
    set({ isLoading: true });
    try {
      const { status, ...restPayload } = payload as any;
      const finalPayload = Object.fromEntries(
        Object.entries(restPayload).filter(([_, v]) => v !== undefined)
      );
      await api.post(`/shelves`, finalPayload);
      if (payload.lockerId) {
        await get().fetchByLocker(payload.lockerId);
      } else {
        await get().fetchShelves();
      }
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Failed to create shelf:', error);
      console.error('Error response data:', error.response?.data);
      return false;
    }
  },

  updateShelf: async (id: string | number, payload: Partial<CreateShelfPayload & { status: string }>) => {
    set({ isLoading: true });
    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      await api.put(`/shelves/${id}`, cleanPayload);
      if (payload.lockerId) {
        await get().fetchByLocker(payload.lockerId);
      } else {
        await get().fetchShelves();
      }
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update shelf:', error);
      return false;
    }
  },

  deleteShelf: async (id: string | number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/shelves/${id}`);
      await get().fetchShelves();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete shelf:', error);
      return false;
    }
  },
}));
