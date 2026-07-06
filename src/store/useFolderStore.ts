import api from "@/lib/api";
import { Folder, CreateFolderPayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface FolderResponse {
  message: string;
  data: Folder[] | { data: Folder[]; total: number; page: number; limit: number };
}

interface FolderState {
  folders: Folder[];
  total: number;
  isLoading: boolean;

  // ── Actions ──
  fetchFolders: (params?: { page?: number; limit?: number; shelfId?: string; search?: string; status?: string }) => Promise<void>;
  createFolder: (payload: CreateFolderPayload) => Promise<boolean>;
  updateFolder: (id: string | number, payload: Partial<CreateFolderPayload & { status: string }>) => Promise<boolean>;
  deleteFolder: (id: string | number) => Promise<boolean>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  total: 0,
  isLoading: false,

  fetchFolders: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<FolderResponse>(`/folders`, { params });
      const resData = response.data.data;
      const folders = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ folders, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch folders:', error);
    }
  },

  createFolder: async (payload: CreateFolderPayload & { status?: string }) => {
    set({ isLoading: true });
    try {
      const { status, ...finalPayload } = payload as any;
      await api.post(`/folders`, finalPayload);
      await get().fetchFolders(payload.shelfId ? { shelfId: payload.shelfId } : undefined);
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Failed to create folder:', error);
      console.error('Error response data:', error.response?.data);
      return false;
    }
  },

  updateFolder: async (id: string | number, payload: Partial<CreateFolderPayload & { status: string }>) => {
    set({ isLoading: true });
    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      await api.put(`/folders/${id}`, cleanPayload);
      await get().fetchFolders(payload.shelfId ? { shelfId: payload.shelfId } : undefined);
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update folder:', error);
      return false;
    }
  },

  deleteFolder: async (id: string | number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/folders/${id}`);
      await get().fetchFolders();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete folder:', error);
      return false;
    }
  },
}));
