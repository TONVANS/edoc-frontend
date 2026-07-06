// src/components/views/documents/DocumentTypeListView.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import { Plus, FileText, Sparkles } from 'lucide-react';
import DocumentTypeTable from './DocumentTypeTable';
import DocumentTypeFormModal from './DocumentTypeFormModal';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import { DocumentType, CreateDocumentTypePayload } from '@/types/prisma-mapped';

export default function DocumentTypeListView() {
  const { documentTypes, total, isLoading, fetchDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } = useDocumentTypeStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<DocumentType | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce searchName input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    fetchDocumentTypes({
      page: currentPage,
      limit: 5,
      search: debouncedSearch || undefined,
    });
  }, [fetchDocumentTypes, currentPage, debouncedSearch]);

  const handleCreate = () => {
    setEditingDocType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (docType: DocumentType) => {
    setEditingDocType(docType);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreateDocumentTypePayload) => {
    let success = false;
    if (editingDocType) {
      success = await updateDocumentType(editingDocType.id, values);
    } else {
      success = await createDocumentType(values);
    }

    if (success) {
      setIsModalOpen(false);
      messageApi.success(editingDocType ? 'ແກ້ໄຂປະເພດເອກະສານສຳເລັດແລ້ວ!' : 'ເພີ່ມປະເພດເອກະສານໃໝ່ສຳເລັດແລ້ວ!');
      // Refresh
      fetchDocumentTypes({
        page: currentPage,
        limit: 5,
        search: debouncedSearch || undefined,
      });
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນການດຳເນີນການ.');
    }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບປະເພດເອກະສານນີ້? ຂໍ້ມູນນີ້ອາດຈະສົ່ງຜົນກະທົບຕໍ່ເອກະສານທີ່ກ່ຽວຂ້ອງ.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteDocumentType(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນປະເພດເອກະສານສຳເລັດແລ້ວ!');
          // Refresh
          fetchDocumentTypes({
            page: currentPage,
            limit: 5,
            search: debouncedSearch || undefined,
          });
        }
        else messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
      },
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {contextHolder}
      {modalContextHolder}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#185C4D] to-[#25705a] flex items-center justify-center shadow-lg shadow-[#185C4D]/20 shrink-0 relative group">
            <FileText className="text-white w-7 h-7" strokeWidth={2.5} />
            <Sparkles className="w-4 h-4 text-emerald-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              ຈັດການປະເພດເອກະສານ
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 tracking-wide">
              ຈັດການໝວດໝູ່ ແລະ ກໍານົດປະເພດຂອງເອກະສານໃນລະບົບ
            </p>
          </div>
        </div>

        <Button 
          type="primary" 
          size="large"
          icon={<Plus size={20} strokeWidth={3} />}
          onClick={handleCreate}
          className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.2)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.3)] hover:-translate-y-1 transition-all duration-300 px-8 h-[52px] font-bold text-base flex items-center gap-2"
        >
          ເພີ່ມປະເພດເອກະສານ
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[32px] p-2 border border-white/60 shadow-glass overflow-hidden">
        <DocumentTypeTable 
          data={documentTypes}
          total={total}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchName={searchName}
          onSearchChange={setSearchName}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <DocumentTypeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={editingDocType}
      />
    </div>
  );
}
