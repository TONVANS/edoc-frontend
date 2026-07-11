// src/store/useAddressStore.ts
import api from "@/lib/api";
import { Address, CreateAddressPayload, DropdownOption } from "@/types/prisma-mapped";
import { create } from "zustand";


interface AddressResponse {
  message: string;
  data: Address[] | { data: Address[]; total: number; page: number; limit: number };
}

interface AddressState {
  addresses: Address[];
  addressDropdown: DropdownOption[];
  total: number;
  isLoading: boolean;
  currentAddress: Address | null;

  // ── Actions ──
  fetchAddresses: (params?: { page?: number; limit?: number; search?: string; status?: string; departmentId?: number | string; divisionId?: number | string }) => Promise<void>;
  fetchAddressById: (id: string) => Promise<void>;
  fetchAddressDropdown: (params?: { departmentId?: number; divisionId?: number }) => Promise<void>;
  createAddress: (payload: CreateAddressPayload) => Promise<boolean>;
  updateAddress: (id: string | number, payload: Partial<CreateAddressPayload & { status: string }>) => Promise<boolean>;
  deleteAddress: (id: string | number) => Promise<boolean>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  addressDropdown: [],
  total: 0,
  isLoading: false,
  currentAddress: null,

  fetchAddresses: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get<AddressResponse>(`/addresses`, { params });
      const resData = response.data.data;
      const addresses = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ addresses, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch addresses:', error);
    }
  },

  fetchAddressById: async (id: string) => {
    set({ isLoading: true, currentAddress: null });
    try {
      const response = await api.get<{ data: Address }>(`/addresses/${id}`);
      set({ currentAddress: response.data?.data || (response.data as any), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch address by id:', error);
    }
  },

  fetchAddressDropdown: async (params = {}) => {
    try {
      const response = await api.get(`/addresses/dropdown`, { params });
      const data = response.data?.data || response.data || [];
      set({ addressDropdown: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Failed to fetch address dropdown:', error);
    }
  },

  createAddress: async (payload: CreateAddressPayload & { status?: string }) => {
    set({ isLoading: true });
    try {
      const finalPayload = {
        code: payload.code,
        name: payload.name,
        details: payload.details,
        departmentId: payload.departmentId,
        divisionId: payload.divisionId,
      };

      await api.post(`/addresses`, finalPayload);
      await get().fetchAddresses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create address:', error);
      return false;
    }
  },

  updateAddress: async (id: string | number, payload: Partial<CreateAddressPayload & { status: string }>) => {
    set({ isLoading: true });
    try {
      const cleanEntries = Object.entries(payload).filter(([_, v]) => v !== undefined);
      const cleanPayload = Object.fromEntries(cleanEntries);

      await api.put(`/addresses/${id}`, cleanPayload);
      await get().fetchAddresses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update address:', error);
      return false;
    }
  },

  deleteAddress: async (id: string | number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/addresses/${id}`);
      await get().fetchAddresses();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete address:', error);
      return false;
    }
  },
}));