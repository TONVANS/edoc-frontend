'use client';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Plus, Folder as FolderIcon } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useFolderStore } from '@/store/useFolderStore';
import { useShelfStore } from '@/store/useShelfStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import FolderTable from '@/components/views/storage/FolderTable';
import FolderFormModal from '@/components/views/storage/FolderFormModal';
import DocumentFormModal from '@/components/views/documents/DocumentFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import { Folder, CreateFolderPayload } from '@/types/prisma-mapped';
import { useRouter, useSearchParams } from 'next/navigation';

function FolderPageContent() {
  const { folders, total, isLoading: isFolderLoading, fetchFolders, createFolder, updateFolder, deleteFolder } = useFolderStore();
  const { shelves, fetchShelves } = useShelfStore();
  const { isLoading: isDocLoading, createDocument, uploadAttachments } = useDocumentStore();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialShelfId = searchParams.get('shelfId') || 'all';

  const [filterShelfId, setFilterShelfId] = useState<string>(initialShelfId);
  const [activeStatus, setActiveStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Editing states
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  
  // Move states
  const [movingFolder, setMovingFolder] = useState<Folder | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Document upload modal states
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState<string | undefined>(undefined);

  // Debounce searchName input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    if (shelves.length === 0) fetchShelves();
  }, [shelves.length, fetchShelves]);

  useEffect(() => {
    fetchFolders({
      page: currentPage,
      limit: 5,
      shelfId: filterShelfId === 'all' ? undefined : filterShelfId,
      status: activeStatus === 'all' ? undefined : activeStatus,
      search: debouncedSearch || undefined,
    });
  }, [filterShelfId, activeStatus, currentPage, debouncedSearch, fetchFolders]);

  // Sync state if URL param changes
  useEffect(() => {
    const paramId = searchParams.get('shelfId') || 'all';
    setFilterShelfId(paramId);
    setCurrentPage(1);
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    setEditingFolder(null);
    setIsFolderModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleOpenMoveModal = (folder: Folder) => {
    setMovingFolder(folder);
    setIsMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setIsMoveModalOpen(false);
    setMovingFolder(null);
  };

  const handleMoveSuccess = () => {
    fetchFolders({
      page: currentPage,
      limit: 5,
      shelfId: filterShelfId === 'all' ? undefined : filterShelfId,
      status: activeStatus === 'all' ? undefined : activeStatus,
      search: debouncedSearch || undefined,
    });
  };

  const handleFolderSubmit = async (values: CreateFolderPayload & { status?: string }) => {
    try {
      let success = false;
      if (editingFolder) {
        success = await updateFolder(editingFolder.id, values);
      } else {
        success = await createFolder(values);
      }

      if (success) {
        handleCloseModals();
        messageApi.success(editingFolder ? 'ແກ້ໄຂຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນແຟ້ມໃໝ່ສຳເລັດແລ້ວ!');
        fetchFolders({
          page: currentPage,
          limit: 5,
          shelfId: filterShelfId === 'all' ? undefined : filterShelfId,
          status: activeStatus === 'all' ? undefined : activeStatus,
          search: debouncedSearch || undefined,
        });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDelete = (id: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນແຟ້ມນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteFolder(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!');
          fetchFolders({
            page: currentPage,
            limit: 5,
            shelfId: filterShelfId === 'all' ? undefined : filterShelfId,
            status: activeStatus === 'all' ? undefined : activeStatus,
            search: debouncedSearch || undefined,
          });
        }
        else messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
      },
    });
  };

  const defaultFolderData = useMemo(() => {
    return filterShelfId && filterShelfId !== 'all' ? { shelfId: filterShelfId } as Folder : null;
  }, [filterShelfId]);

  // ── Document Upload from Folder ──
  const handleUploadDocument = (folder: Folder) => {
    setUploadFolderId(String(folder.id));
    setIsDocUploadModalOpen(true);
  };

  const handleDocUploadSubmit = async (values: any, newFiles: File[]) => {
    const payload = {
      ...values,
      files: newFiles,
    };
    const success = await createDocument(payload);

    if (success) {
      setIsDocUploadModalOpen(false);
      setUploadFolderId(undefined);
      messageApi.success('ອັບໂຫຼດເອກະສານເຂົ້າແຟ້ມສຳເລັດແລ້ວ!');
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດເອກະສານ');
    }
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out font-lao">
      {contextHolder}
      {modalContextHolder}
      
      {/* Top Header Section */}
      <div className="flex flex-col mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5 mt-2">
              <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-white/90 to-white/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(24,92,77,0.08)] border border-white flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:rotate-3 duration-500 ease-out relative group">
                <div className="absolute inset-0 bg-[#185C4D]/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <FolderIcon className="text-[#185C4D] w-8 h-8 relative z-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  ການຈັດການແຟ້ມ (Kono)
                </h1>
                <p className="text-slate-500 font-medium text-base mt-0.5 tracking-wide">
                  ຈັດການຂໍ້ມູນແຟ້ມເອກະສານຂອງແຕ່ລະຊັ້ນວາງ
                </p>
              </div>
            </div>
          </div>
          
          {/* Primary CTA */}
          <Button 
            type="primary" 
            size="large" 
            icon={<Plus size={20} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
            onClick={handleOpenCreateModal}
            className="group rounded-[18px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-8 h-[56px] font-bold text-base flex items-center gap-2 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">
              ເພີ່ມແຟ້ມໃໝ່
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        <FolderTable 
          data={folders} 
          total={total}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchName={searchName}
          onSearchChange={setSearchName}
          isLoading={isFolderLoading} 
          onEdit={(folder) => {
            setEditingFolder(folder);
            setIsFolderModalOpen(true);
          }}
          onDelete={handleDelete}
          onUploadDocument={handleUploadDocument}
          onMove={handleOpenMoveModal}
          onManage={(folder) => {
            router.push(`/dashboard/documents?folderId=${folder.id}`);
          }}
          shelves={shelves}
          filterShelf={filterShelfId}
          onFilterShelfChange={(id) => {
            setFilterShelfId(id);
            setCurrentPage(1);
            router.replace(`/dashboard/folder?shelfId=${id}`);
          }}
          filterStatus={activeStatus}
          onFilterStatusChange={(status) => {
            setActiveStatus(status);
            setCurrentPage(1);
          }}
        />
      </div>

      <FolderFormModal
        isOpen={isFolderModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleFolderSubmit}
        isLoading={isFolderLoading}
        initialData={editingFolder || defaultFolderData}
      />

      {isMoveModalOpen && movingFolder && (
        <MoveFormModal
          isOpen={isMoveModalOpen}
          onClose={handleCloseMoveModal}
          onSuccess={handleMoveSuccess}
          type="folder"
          item={movingFolder}
        />
      )}

      {isDocUploadModalOpen && (
        <DocumentFormModal
          isOpen={isDocUploadModalOpen}
          onClose={() => {
            setIsDocUploadModalOpen(false);
            setUploadFolderId(undefined);
          }}
          onSubmit={handleDocUploadSubmit}
          isLoading={isDocLoading}
          defaultFolderId={uploadFolderId}
        />
      )}
    </div>
  );
}

export default function FolderPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
      </div>
    }>
      <FolderPageContent />
    </Suspense>
  );
}
