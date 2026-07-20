'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layers, Plus, Edit2, Trash2, MapPin, AlignLeft, BarChart3 } from 'lucide-react';
import { Button, message, Modal, Badge } from 'antd';
import { useShelfStore } from '@/store/useShelfStore';
import { useFolderStore } from '@/store/useFolderStore';
import DetailPageLayout from '@/components/views/shared/DetailPageLayout';
import FolderTable from '@/components/views/storage/FolderTable';
import FolderFormModal from '@/components/views/storage/FolderFormModal';
import ShelfFormModal from '@/components/views/storage/ShelfFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import FolderTagPrint from '@/components/views/storage/FolderTagPrint';
import DocumentFormModal from '@/components/views/documents/DocumentFormModal';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Folder, CreateFolderPayload, Shelf, CreateShelfPayload, CreateDocumentPayload } from '@/types/prisma-mapped';
import { useDocumentStore } from '@/store/useDocumentStore';

export default function ShelfDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Stores
  const { currentShelf, fetchShelfById, deleteShelf, updateShelf, isLoading: isShelfLoading } = useShelfStore();
  const { folders, total, fetchFolders, createFolder, updateFolder, deleteFolder, isLoading: isFolderLoading } = useFolderStore();
  const { createDocument, isLoading: isDocumentLoading } = useDocumentStore();

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [folderToMove, setFolderToMove] = useState<Folder | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedFolderForDoc, setSelectedFolderForDoc] = useState<Folder | null>(null);

  // Print states
  const [selectedFolderForPrint, setSelectedFolderForPrint] = useState<Folder | null>(null);
  const printRef = useRef(null);

  const handlePrintTrigger = useReactToPrint({
    contentRef: printRef,
  });

  const handlePrint = (folder: Folder) => {
    setSelectedFolderForPrint(folder);
    setTimeout(() => {
      handlePrintTrigger();
    }, 100);
  };

  const initialFolderData = useMemo(() => ({ shelfId: id } as unknown as Folder), [id]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  // Initial Fetch
  useEffect(() => {
    if (id) {
      fetchShelfById(id);
    }
    return () => {
      useFolderStore.setState({ folders: [], total: 0 });
    };
  }, [id, fetchShelfById]);

  // Fetch children (Folders)
  useEffect(() => {
    if (id) {
      fetchFolders({
        page: currentPage,
        limit: 8,
        shelfId: id,
        search: debouncedSearch || undefined,
      });
    }
  }, [id, currentPage, debouncedSearch, fetchFolders]);

  // Handle Folder Actions
  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setIsFolderModalOpen(true);
  };

  const handleFolderSubmit = async (values: CreateFolderPayload & { status?: string }) => {
    try {
      let success = false;
      const payloadWithShelf = { ...values, shelfId: id };
      if (editingFolder) {
        success = await updateFolder(editingFolder.id, payloadWithShelf);
      } else {
        success = await createFolder(payloadWithShelf);
      }

      if (success) {
        setIsFolderModalOpen(false);
        setEditingFolder(null);
        messageApi.success(editingFolder ? 'ແກ້ໄຂຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນແຟ້ມໃໝ່ສຳເລັດແລ້ວ!');
        fetchFolders({ page: currentPage, limit: 8, shelfId: id, search: debouncedSearch || undefined });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteFolder = (folderId: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນແຟ້ມນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteFolder(folderId);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!');
          fetchFolders({ page: currentPage, limit: 8, shelfId: id, search: debouncedSearch || undefined });
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const handleDocumentSubmit = async (values: CreateDocumentPayload & { status?: string }) => {
    try {
      if (!selectedFolderForDoc) return;
      const payloadWithFolder = { ...values, folderId: selectedFolderForDoc.id };
      const success = await createDocument(payloadWithFolder);

      if (success) {
        setIsDocumentModalOpen(false);
        setSelectedFolderForDoc(null);
        messageApi.success('ອັບໂຫຼດເອກະສານໃໝ່ສຳເລັດແລ້ວ!');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  // Handle Shelf Actions
  const handleShelfSubmit = async (values: CreateShelfPayload & { status?: string }) => {
    try {
      const success = await updateShelf(id, values);
      if (success) {
        setIsShelfModalOpen(false);
        messageApi.success('ແກ້ໄຂຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!');
        fetchShelfById(id);
      } else {
        messageApi.error('ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteShelf = () => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຊັ້ນວາງນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteShelf(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!');
          if (currentShelf?.lockerId) {
            router.replace(`/dashboard/locker/${currentShelf.lockerId}`);
          } else {
            router.replace('/dashboard/shelves');
          }
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const currentShelfAny = currentShelf as any;
  const breadcrumbs = [
    ...(currentShelf?.locker ? [
      ...(currentShelfAny.locker?.warehouse?.address ? [{ label: currentShelfAny.locker.warehouse.address.name }] : []),
      ...(currentShelfAny.locker?.warehouse ? [{ label: currentShelfAny.locker.warehouse.name, href: `/dashboard/warehouses/${currentShelfAny.locker.warehouse.id || currentShelfAny.locker.warehouseId}` }] : []),
      { label: currentShelf.locker.name ? String(currentShelf.locker.name) : 'ກຳລັງໂຫຼດ...', href: `/dashboard/locker/${currentShelf.lockerId}` }
    ] : [{ label: 'ຊັ້ນວາງ', href: '/dashboard/shelves' }]),
    { label: currentShelf?.name ? String(currentShelf.name) : 'ກຳລັງໂຫຼດ...', icon: <Layers size={16} /> }
  ];

  const parentInfo = currentShelf ? [
    { label: 'ສາງທີ່ຕັ້ງຢູ່', value: currentShelfAny.locker?.warehouse?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ຕູ້ທີ່ຕັ້ງຢູ່', value: currentShelf.locker?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ຈຳນວນແຟ້ມ', value: currentShelf.maxQty ? `${folders?.length || 0} / ${currentShelf.maxQty}` : '-', icon: <BarChart3 size={16} /> },
  ] : [];

  const statusBadge = currentShelf && (
    <Badge
      status={currentShelf.status === 'A' ? 'success' : 'error'}
      text={<span className="text-sm font-medium text-slate-700">{currentShelf.status === 'A' ? 'Active' : 'Inactive'}</span>}
      className="bg-white/60 px-3 py-1 rounded-xl shadow-sm border border-slate-200/50"
    />
  );

  const actionButtons = (
    <>
      <Button
        type="text"
        icon={<Edit2 size={18} className="text-blue-600" />}
        onClick={() => setIsShelfModalOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
      <Button
        type="text"
        danger
        icon={<Trash2 size={18} className="text-rose-500" />}
        onClick={handleDeleteShelf}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
    </>
  );

  const createButton = (
    <Button
      type="primary"
      size="large"
      icon={<Plus size={18} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
      onClick={handleOpenCreateFolder}
      className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-6 h-[48px] font-bold text-[15px]"
    >
      ເພີ່ມແຟ້ມໃໝ່
    </Button>
  );

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <DetailPageLayout
        breadcrumbs={breadcrumbs}
        icon={<Layers />}
        title={currentShelf?.name || 'ກຳລັງໂຫຼດ...'}
        entityCode={currentShelf?.code}
        subtitle={currentShelf?.description || "ຂໍ້ມູນລາຍລະອຽດ ແລະ ແຟ້ມເອກະສານພາຍໃຕ້ຊັ້ນວາງນີ້"}
        parentInfo={parentInfo}
        statusBadge={statusBadge}
        actionButtons={actionButtons}
        createButton={createButton}
        isLoading={isShelfLoading}
      >
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
          onDelete={handleDeleteFolder}
          onUploadDocument={(folder) => {
            setSelectedFolderForDoc(folder);
            setIsDocumentModalOpen(true);
          }}
          onMove={(folder) => {
            setFolderToMove(folder);
            setIsMoveModalOpen(true);
          }}
          onPrint={handlePrint}
          onManage={(folder) => {
            router.push(`/dashboard/folder/${folder.id}`);
          }}
          shelves={[]}
          filterShelf={id} // Locked to this shelf
          hideFilters={true}
        />
      </DetailPageLayout>

      <FolderFormModal
        isOpen={isFolderModalOpen}
        onClose={() => { setIsFolderModalOpen(false); setEditingFolder(null); }}
        onSubmit={handleFolderSubmit}
        isLoading={isFolderLoading}
        initialData={editingFolder || initialFolderData}
      />

      {currentShelf && (
        <ShelfFormModal
          isOpen={isShelfModalOpen}
          onClose={() => setIsShelfModalOpen(false)}
          onSubmit={handleShelfSubmit}
          isLoading={isShelfLoading}
          initialData={currentShelf}
        />
      )}

      <DocumentFormModal
        isOpen={isDocumentModalOpen}
        onClose={() => { setIsDocumentModalOpen(false); setSelectedFolderForDoc(null); }}
        onSubmit={handleDocumentSubmit}
        isLoading={isDocumentLoading}
        defaultFolderId={selectedFolderForDoc?.id}
      />

      <MoveFormModal
        isOpen={isMoveModalOpen}
        onClose={() => { setIsMoveModalOpen(false); setFolderToMove(null); }}
        onSuccess={() => {
          fetchFolders({ page: currentPage, limit: 8, shelfId: id, search: debouncedSearch || undefined });
        }}
        type="folder"
        item={folderToMove}
      />

      {/* Hidden Print Container */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {selectedFolderForPrint && (
            <FolderTagPrint
              departmentName={(selectedFolderForPrint as any).shelf?.locker?.warehouse?.department?.name || 'ຝ່າຍບັນຊີ'}
              folderName={selectedFolderForPrint.name}
              qrData={selectedFolderForPrint.qrCode || ''}
            />
          )}
        </div>
      </div>
    </>
  );
}
