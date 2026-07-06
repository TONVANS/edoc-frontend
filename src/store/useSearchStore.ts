// src/store/useSearchStore.ts
import api from "@/lib/api";
import { GlobalSearchResult, QRLookupResult } from "@/types/prisma-mapped";
import { create } from "zustand";

interface SearchParams {
  q: string;
  limit?: number;
  page?: number;
  type?: string;       // comma-separated entity types: 'documents,folders'
  dateFrom?: string;   // ISO 8601 date
  dateTo?: string;     // ISO 8601 date
}

interface SearchState {
  searchResults: GlobalSearchResult | null;
  qrResult: QRLookupResult | null;
  isSearching: boolean;
  isQRSearching: boolean;
  searchQuery: string;

  // ── Actions ──
  globalSearch: (params: SearchParams) => Promise<void>;
  qrLookup: (code: string) => Promise<QRLookupResult | null>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchResults: null,
  qrResult: null,
  isSearching: false,
  isQRSearching: false,
  searchQuery: '',

  globalSearch: async (params: SearchParams) => {
    set({ isSearching: true, searchQuery: params.q });
    try {
      const response = await api.get(`/search`, { params });
      const data = response.data?.data || response.data || {};
      set({ searchResults: data, isSearching: false });
    } catch (error) {
      set({ isSearching: false });
      console.error('Failed to perform global search:', error);
    }
  },

  qrLookup: async (code: string) => {
    set({ isQRSearching: true });
    try {
      const response = await api.get(`/search/qr`, { params: { code } });
      const data = response.data?.data || response.data || null;
      set({ qrResult: data, isQRSearching: false });
      return data;
    } catch (error) {
      set({ qrResult: null, isQRSearching: false });
      console.error('QR code lookup failed:', error);
      return null;
    }
  },

  clearResults: () => {
    set({ searchResults: null, qrResult: null, searchQuery: '' });
  },
}));
