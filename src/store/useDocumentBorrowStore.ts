// src/store/useDocumentBorrowStore.ts
import api from "@/lib/api";
import { DocumentBorrow, CreateDocumentBorrowPayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface BorrowResponse {
  message: string;
  data: DocumentBorrow[] | { data: DocumentBorrow[]; total: number; page: number; limit: number };
  total?: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FetchBorrowsParams {
  page?: number;
  limit?: number;
  documentId?: string;
  borrowerId?: string;
  divisionId?: number;
  activeOnly?: boolean;
  borrowedAt?: string;
  returnedAt?: string;
  type?: string;
}

interface DocumentBorrowState {
  borrows: DocumentBorrow[];
  activeBorrows: DocumentBorrow[];
  total: number;
  totalPages: number;
  isLoading: boolean;

  // ── Actions ──
  fetchBorrows: (params?: FetchBorrowsParams) => Promise<void>;
  fetchActiveBorrows: () => Promise<void>;
  fetchBorrowById: (id: string) => Promise<DocumentBorrow | null>;
  fetchBorrowsByDocument: (documentId: string) => Promise<DocumentBorrow[]>;
  fetchBorrowsByFolder: (folderId: string) => Promise<DocumentBorrow[]>;
  fetchBorrowsByDivision: (divisionId: number, activeOnly?: boolean) => Promise<DocumentBorrow[]>;
  createBorrow: (payload: CreateDocumentBorrowPayload) => Promise<boolean>;
  returnBorrow: (id: string) => Promise<boolean>;
}

export const useDocumentBorrowStore = create<DocumentBorrowState>((set, get) => ({
  borrows: [],
  activeBorrows: [],
  total: 0,
  totalPages: 1,
  isLoading: false,

  fetchBorrows: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<BorrowResponse>(`/document-borrows`, { params });
      const resData = response.data?.data;
      const borrows = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = response.data?.total ?? response.data?.meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      const limit = params?.limit || 10;
      const totalPages = response.data?.meta?.totalPages ?? Math.ceil(total / limit) ?? 1;
      set({ borrows, total, totalPages, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch borrows:', error);
    }
  },

  fetchActiveBorrows: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/document-borrows/active`);
      const data = response.data?.data || response.data || [];
      set({ activeBorrows: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch active borrows:', error);
    }
  },

  fetchBorrowById: async (id: string) => {
    try {
      const response = await api.get(`/document-borrows/${id}`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error('Failed to fetch borrow by ID:', error);
      return null;
    }
  },

  fetchBorrowsByDocument: async (documentId: string) => {
    try {
      const response = await api.get(`/document-borrows/document/${documentId}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch borrows by document:', error);
      return [];
    }
  },

  fetchBorrowsByFolder: async (folderId: string) => {
    try {
      const response = await api.get(`/document-borrows/folder/${folderId}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch borrows by folder:', error);
      return [];
    }
  },

  fetchBorrowsByDivision: async (divisionId: number, activeOnly?: boolean) => {
    try {
      const params: any = {};
      if (activeOnly !== undefined) params.activeOnly = activeOnly;
      const response = await api.get(`/document-borrows/division/${divisionId}`, { params });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch borrows by division:', error);
      return [];
    }
  },

  createBorrow: async (payload: CreateDocumentBorrowPayload) => {
    set({ isLoading: true });
    try {
      await api.post(`/document-borrows`, payload);
      await get().fetchBorrows();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to create borrow:', error);
      return false;
    }
  },

  returnBorrow: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.put(`/document-borrows/${id}/return`);
      await get().fetchBorrows();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to return borrow:', error);
      return false;
    }
  },
}));
