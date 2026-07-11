// src/store/useWarehouseStore.ts
import api from "@/lib/api";
import { Warehouse, CreateWarehousePayload, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";

interface WarehouseResponse {
  message: string;
  data: Warehouse[] | { data: Warehouse[]; total: number; page: number; limit: number };
}

interface WarehouseState {
  warehouses: Warehouse[];
  warehouseDropdown: DropdownOption[];
  total: number;
  isLoading: boolean;
  currentWarehouse: Warehouse | null;

  // ── Actions ──
  fetchWarehouses: (params?: { page?: number; limit?: number; addressId?: string; search?: string; status?: string }) => Promise<void>;
  fetchWarehouseById: (id: string) => Promise<void>;
  fetchWarehouseDropdown: (params?: { addressId?: string }) => Promise<void>;
  createWarehouse: (payload: CreateWarehousePayload) => Promise<boolean>;
  updateWarehouse: (id: string | number, payload: Partial<CreateWarehousePayload & { status: string }>) => Promise<boolean>;
  deleteWarehouse: (id: string | number) => Promise<boolean>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  warehouseDropdown: [],
  total: 0,
  isLoading: false,
  currentWarehouse: null,

  fetchWarehouses: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<WarehouseResponse>(`/warehouses`, { params });
      const resData = response.data.data;
      const warehouses = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ warehouses, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch warehouses:', error);
    }
  },

  fetchWarehouseById: async (id: string) => {
    set({ isLoading: true, currentWarehouse: null });
    try {
      const response = await api.get<{ data: Warehouse }>(`/warehouses/${id}`);
      set({ currentWarehouse: response.data?.data || (response.data as any), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch warehouse by id:', error);
    }
  },

  fetchWarehouseDropdown: async (params = {}) => {
    try {
      const response = await api.get(`/warehouses/dropdown`, { params });
      const data = response.data?.data || response.data || [];
      set({ warehouseDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch warehouse dropdown:', error);
    }
  },

  createWarehouse: async (payload: CreateWarehousePayload) => {
    set({ isLoading: true });
    try {
      const finalPayload = {
        code: payload.code,
        name: payload.name,
        description: payload.description,
        addressId: payload.addressId,
      };
      
      await api.post(`/warehouses`, finalPayload);
      await get().fetchWarehouses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create warehouse:', error);
      return false;
    }
  },

  updateWarehouse: async (id: string | number, payload: Partial<CreateWarehousePayload & { status: string }>) => {
    set({ isLoading: true });
    try {
      const finalPayload: any = {};
      if (payload.code !== undefined) finalPayload.code = payload.code;
      if (payload.name !== undefined) finalPayload.name = payload.name;
      if (payload.description !== undefined) finalPayload.description = payload.description;
      if (payload.addressId !== undefined) finalPayload.addressId = payload.addressId;
      if (payload.status !== undefined) finalPayload.status = payload.status;
      
      await api.put(`/warehouses/${id}`, finalPayload);
      await get().fetchWarehouses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update warehouse:', error);
      return false;
    }
  },

  deleteWarehouse: async (id: string | number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/warehouses/${id}`);
      await get().fetchWarehouses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete warehouse:', error);
      return false;
    }
  },
}));
