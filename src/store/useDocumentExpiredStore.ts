import { create } from "zustand";
import api from "@/lib/api";
import { Document } from "@/types/prisma-mapped";

interface DocumentExpiredState {
  documents: Document[];
  isLoading: boolean;
  fetchExpiredDocuments: () => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
}

export const useDocumentExpiredStore = create<DocumentExpiredState>((set, get) => ({
  documents: [],
  isLoading: false,

  fetchExpiredDocuments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/documents/expired`);
      const data = response.data?.data || response.data || [];
      set({
        documents: Array.isArray(data) ? data : [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to fetch expired documents:", error);
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to delete expired document:", error);
      return false;
    }
  },
}));
