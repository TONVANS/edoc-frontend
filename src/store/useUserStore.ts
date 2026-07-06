// src/store/useUserStore.ts
import api from "@/lib/api";
import { create } from "zustand";
import { User } from "@/types/auth";

interface UserListResponse {
  message: string;
  data: User[] | { data: User[]; total: number; page: number; limit: number };
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface UserState {
  users: User[];
  profile: User | null;
  total: number;
  totalPages: number;
  isLoading: boolean;

  // ── Actions ──
  fetchUsers: (params?: FetchUsersParams) => Promise<void>;
  fetchProfile: () => Promise<User | null>;
  approveUser: (id: string, payload: { role: string; addressId?: string; divisionIds?: number[] }) => Promise<boolean>;
  updateRole: (id: string, role: string) => Promise<boolean>;
  updateDivisions: (id: string, divisionIds: number[]) => Promise<boolean>;
  resetPassword: (id: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  profile: null,
  total: 0,
  totalPages: 1,
  isLoading: false,

  fetchUsers: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<UserListResponse>(`/users`, { params });
      const resData = response.data.data;
      const users = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = response.data.meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      const totalPages = response.data.meta?.totalPages ?? 1;
      set({ users, total, totalPages, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch users:', error);
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get(`/users/profile`);
      const profile = response.data?.data || response.data || null;
      set({ profile });
      return profile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  approveUser: async (id: string, payload) => {
    set({ isLoading: true });
    try {
      await api.patch(`/users/${id}/approve`, payload);
      await get().fetchUsers();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to approve user:', error);
      return false;
    }
  },

  updateRole: async (id: string, role: string) => {
    set({ isLoading: true });
    try {
      await api.put(`/users/${id}/role`, { role });
      await get().fetchUsers();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update role:', error);
      return false;
    }
  },

  updateDivisions: async (id: string, divisionIds: number[]) => {
    set({ isLoading: true });
    try {
      await api.put(`/users/${id}/divisions`, { divisionIds });
      await get().fetchUsers();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update divisions:', error);
      return false;
    }
  },

  resetPassword: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.put(`/users/${id}/reset-password`);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to reset password:', error);
      return false;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      await api.put(`/users/change-password`, { oldPassword, newPassword });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to change password:', error);
      return false;
    }
  },
}));
