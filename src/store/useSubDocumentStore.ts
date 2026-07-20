import { create } from 'zustand';
import api from '@/lib/api';
import { SubDocument } from '@/types/prisma-mapped';
import { message } from 'antd';

interface SubDocumentState {
  subDocuments: SubDocument[];
  isLoading: boolean;
  
  fetchSubDocuments: (documentId: string) => Promise<void>;
  createSubDocument: (documentId: string, data: { subDocNo: string; subDocDate: string }[]) => Promise<boolean>;
  deleteSubDocument: (documentId: string, subDocumentId: string) => Promise<boolean>;
}

export const useSubDocumentStore = create<SubDocumentState>((set) => ({
  subDocuments: [],
  isLoading: false,

  fetchSubDocuments: async (documentId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/documents/${documentId}/sub-documents`);
      const resData = response.data.data;
      set({ subDocuments: Array.isArray(resData) ? resData : (resData as any)?.data || [] });
    } catch (error) {
      console.error('Error fetching sub-documents:', error);
      message.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເອກະສານຍ່ອຍໄດ້');
    } finally {
      set({ isLoading: false });
    }
  },

  createSubDocument: async (documentId: string, data) => {
    set({ isLoading: true });
    try {
      await api.post(`/documents/${documentId}/sub-documents`, { subDocuments: data });
      return true;
    } catch (error) {
      console.error('Error creating sub-documents:', error);
      message.error('ບໍ່ສາມາດເພີ່ມເອກະສານຍ່ອຍໄດ້');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubDocument: async (documentId: string, subDocumentId: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/documents/${documentId}/sub-documents/${subDocumentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting sub-document:', error);
      message.error('ບໍ່ສາມາດລຶບເອກະສານຍ່ອຍໄດ້');
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
