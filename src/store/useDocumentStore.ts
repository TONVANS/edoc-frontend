// src/store/useDocumentStore.ts
import api from "@/lib/api";
import { Document, CreateDocumentPayload, UpdateDocumentPayload } from "@/types/prisma-mapped";
import { create } from "zustand";

interface DocumentResponse {
  message: string;
  data: Document[] | { data: Document[]; total: number; page: number; limit: number };
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FetchDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  folderId?: string;
  documentTypeId?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  divisionId?: number;
  isContractBound?: boolean;
}

interface DocumentState {
  documents: Document[];
  expiredDocuments: Document[];
  total: number;
  totalPages: number;
  isLoading: boolean;

  fetchDocuments: (params?: FetchDocumentsParams) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  createDocument: (payload: CreateDocumentPayload) => Promise<boolean>;
  updateDocument: (id: string, payload: UpdateDocumentPayload, files?: File[]) => Promise<boolean>;
  uploadAttachments: (id: string, files: File[]) => Promise<boolean>;
  downloadAttachment: (attachmentId: string) => Promise<void>;
  fetchExpiredDocuments: () => Promise<void>;
  deleteExpiredDocuments: () => Promise<boolean>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  expiredDocuments: [],
  total: 0,
  totalPages: 1,
  isLoading: false,

  fetchDocuments: async (params) => {
    set({ isLoading: true });
    try {
      const response = await api.get<DocumentResponse>(`/documents`, { params });
      const resData = response.data.data;
      
      const documents = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      const total = response.data.meta?.total ?? (Array.isArray(resData) ? resData.length : (resData as any)?.total || 0);
      const totalPages = response.data.meta?.totalPages ?? 1;
      
      set({ documents, total, totalPages, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to fetch documents:", error);
    }
  },

  fetchDocumentById: async (id: string) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error("Failed to fetch document by ID:", error);
      return null;
    }
  },

  createDocument: async (payload: CreateDocumentPayload) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      
      formData.append("docNo", payload.docNo);
      if (payload.shortName) formData.append("shortName", payload.shortName);
      formData.append("docDate", payload.docDate);
      if (payload.subDocNo) formData.append("subDocNo", payload.subDocNo);
      if (payload.subDocDate) formData.append("subDocDate", payload.subDocDate);
      formData.append("title", payload.title);
      if (payload.description) formData.append("description", payload.description);
      if (payload.docExpire) formData.append("docExpire", payload.docExpire);
      if (payload.qrCode) formData.append("qrCode", payload.qrCode);
      formData.append("folderId", payload.folderId);
      formData.append("documentTypeId", payload.documentTypeId);
      formData.append("isContractBound", payload.isContractBound ? "true" : "false");
      if (payload.departmentId) formData.append("departmentId", String(payload.departmentId));
      if (payload.divisionId) formData.append("divisionId", String(payload.divisionId));

      if (payload.files && payload.files.length > 0) {
        payload.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      await api.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return true;
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Failed to create document:", error.response?.data || error);
      return false;
    }
  },

  updateDocument: async (id: string, payload: UpdateDocumentPayload, files?: File[]) => {
    set({ isLoading: true });
    try {
      // If files are included, use multipart/form-data
      if (files && files.length > 0) {
        const formData = new FormData();
        
        const allowedKeys = [
          'docNo', 'docDate', 'subDocNo', 'subDocDate', 'title', 'description',
          'docExpire', 'qrCode', 'folderId', 'documentTypeId', 'isContractBound',
          'departmentId', 'divisionId'
        ];

        Object.entries(payload).forEach(([key, value]) => {
          if (allowedKeys.includes(key) && value !== undefined) {
            formData.append(key, typeof value === 'boolean' ? String(value) : String(value));
          }
        });

        files.forEach((file) => {
          formData.append("files", file);
        });

        await api.put(`/documents/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // JSON payload (no files)
        const allowedKeys = [
          'docNo', 'docDate', 'subDocNo', 'subDocDate', 'title', 'description',
          'docExpire', 'qrCode', 'folderId', 'documentTypeId', 'isContractBound',
          'departmentId', 'divisionId'
        ];

        const cleanPayload = Object.fromEntries(
          Object.entries(payload).filter(([key, v]) => allowedKeys.includes(key) && v !== undefined)
        );

        await api.put(`/documents/${id}`, cleanPayload);
      }

      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to update document:", error);
      return false;
    }
  },

  uploadAttachments: async (id: string, files: File[]) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/documents/${id}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to upload attachments:", error);
      return false;
    }
  },

  downloadAttachment: async (attachmentId: string) => {
    try {
      const response = await api.get(`/documents/attachments/${attachmentId}`, {
        responseType: 'blob',
      });
      
      // Extract filename from Content-Disposition header or use fallback
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'attachment';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download attachment:", error);
    }
  },

  fetchExpiredDocuments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/documents/expired`);
      const data = response.data?.data || response.data || [];
      set({ expiredDocuments: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to fetch expired documents:", error);
    }
  },

  deleteExpiredDocuments: async () => {
    set({ isLoading: true });
    try {
      await api.delete(`/documents/expired`);
      await get().fetchExpiredDocuments();
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to delete expired documents:", error);
      return false;
    }
  },
}));
