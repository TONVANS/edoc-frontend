import api from "@/lib/api";
import { DocumentType, CreateDocumentTypePayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DocumentTypeResponse {
  message: string;
  data: DocumentType[] | { data: DocumentType[]; total: number; page: number; limit: number };
}

interface DocumentTypeState {
  documentTypes: DocumentType[];
  total: number;
  isLoading: boolean;

  // ── Actions ──
  fetchDocumentTypes: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>;
  createDocumentType: (payload: CreateDocumentTypePayload) => Promise<boolean>;
  updateDocumentType: (id: string, payload: Partial<CreateDocumentTypePayload & { isActive: boolean }>) => Promise<boolean>;
  deleteDocumentType: (id: string) => Promise<boolean>;
}

export const useDocumentTypeStore = create<DocumentTypeState>((set, get) => ({
  documentTypes: [],
  total: 0,
  isLoading: false,

  fetchDocumentTypes: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get<DocumentTypeResponse>(`/document-types`, { params });
      const resData = response.data.data;
      const documentTypes = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = (response.data as any).meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      set({ documentTypes, total, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch document types:', error);
    }
  },

  createDocumentType: async (payload: CreateDocumentTypePayload) => {
    set({ isLoading: true });
    try {
      await api.post(`/document-types`, payload);
      await get().fetchDocumentTypes();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create document type:', error);
      return false;
    }
  },

  updateDocumentType: async (id: string, payload: Partial<CreateDocumentTypePayload & { isActive: boolean }>) => {
    set({ isLoading: true });
    try {
      await api.put(`/document-types/${id}`, payload);
      await get().fetchDocumentTypes();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to update document type:', error);
      return false;
    }
  },

  deleteDocumentType: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/document-types/${id}`);
      await get().fetchDocumentTypes();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete document type:', error);
      return false;
    }
  },
}));
