'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Inbox, Plus, Edit2, Trash2, MapPin, AlignLeft, QrCode, Layers } from 'lucide-react';
import { Button, message, Modal, Badge } from 'antd';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import DetailPageLayout from '@/components/views/shared/DetailPageLayout';
import DocumentTable from '@/components/views/documents/DocumentTable';
import DocumentFormModal from '@/components/views/documents/DocumentFormModal';
import DocumentDetailModal from '@/components/views/documents/DocumentDetailModal';
import FolderFormModal from '@/components/views/storage/FolderFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import { Document, CreateDocumentPayload, Folder, CreateFolderPayload } from '@/types/prisma-mapped';

export default function FolderDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Stores
  const { currentFolder, fetchFolderById, deleteFolder, updateFolder, isLoading: isFolderLoading } = useFolderStore();
  const { documents, total, fetchDocuments, createDocument, updateDocument, isLoading: isDocumentLoading } = useDocumentStore();

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  
  const [departmentFilter, setDepartmentFilter] = useState<number>();
  const [divisionFilter, setDivisionFilter] = useState<number>();
  
  // Modals
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);

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
      fetchFolderById(id);
    }
    return () => {
      useDocumentStore.setState({ documents: [], total: 0 });
    };
  }, [id, fetchFolderById]);

  // Fetch children (Documents)
  useEffect(() => {
    if (id) {
      fetchDocuments({
        page: currentPage,
        limit: 10,
        folderId: id,
        search: debouncedSearch || undefined,
        documentTypeId: docTypeFilter || undefined,
        retentionStatus: contractFilter || undefined,
        departmentId: departmentFilter,
        divisionId: divisionFilter,
      });
    }
  }, [id, currentPage, debouncedSearch, docTypeFilter, contractFilter, departmentFilter, divisionFilter, fetchDocuments]);

  // Handle Document Actions
  const handleOpenCreateDocument = () => {
    setEditingDocument(null);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSubmit = async (values: CreateDocumentPayload & { status?: string }, files?: File[]) => {
    try {
      let success = false;
      const payloadWithFolder = { ...values, folderId: id, files };
      
      if (editingDocument) {
        success = await updateDocument(editingDocument.id, payloadWithFolder, files);
      } else {
        success = await createDocument(payloadWithFolder);
      }

      if (success) {
        setIsDocumentModalOpen(false);
        setEditingDocument(null);
        messageApi.success(editingDocument ? 'ແກ້ໄຂເອກະສານສຳເລັດແລ້ວ!' : 'ອັບໂຫຼດເອກະສານໃໝ່ສຳເລັດແລ້ວ!');
        fetchDocuments({ page: currentPage, limit: 10, folderId: id, search: debouncedSearch || undefined });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    // In a real scenario, this would call deleteDocument
    messageApi.info('ຟັງຊັນລຶບເອກະສານກຳລັງພັດທະນາ');
  };

  const handleViewDetails = (doc: Document) => {
    setViewingDocument(doc);
    setIsDetailModalOpen(true);
  };

  // Handle Folder Actions
  const handleFolderSubmit = async (values: CreateFolderPayload & { status?: string }) => {
    try {
      const success = await updateFolder(id, values);
      if (success) {
        setIsFolderModalOpen(false);
        messageApi.success('ແກ້ໄຂຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!');
        fetchFolderById(id);
      } else {
        messageApi.error('ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteFolder = () => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນແຟ້ມນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteFolder(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນແຟ້ມສຳເລັດແລ້ວ!');
          if (currentFolder?.shelfId) {
            router.replace(`/dashboard/shelves/${currentFolder.shelfId}`);
          } else {
            router.replace('/dashboard/folder');
          }
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const currentFolderAny = currentFolder as any;
  const breadcrumbs = [
    ...(currentFolder?.shelf ? [
      ...(currentFolderAny.shelf?.locker?.warehouse?.department ? [{ label: currentFolderAny.shelf.locker.warehouse.department.name }] : []),
      ...(currentFolderAny.shelf?.locker?.warehouse ? [{ label: currentFolderAny.shelf.locker.warehouse.name, href: `/dashboard/warehouses/${currentFolderAny.shelf.locker.warehouse.id || currentFolderAny.shelf.locker.warehouseId}` }] : []),
      ...(currentFolderAny.shelf?.locker ? [{ label: currentFolderAny.shelf.locker.name, href: `/dashboard/locker/${currentFolderAny.shelf.locker.id || currentFolderAny.shelf.lockerId}` }] : []),
      { label: currentFolder.shelf.name, href: `/dashboard/shelves/${currentFolder.shelfId}` }
    ] : [{ label: 'ແຟ້ມ', href: '/dashboard/folder' }]),
    { label: currentFolder?.name || currentFolder?.code ? String(currentFolder?.name || currentFolder?.code) : 'ກຳລັງໂຫຼດ...', icon: <Inbox size={16} /> }
  ];

  const parentInfo = currentFolder ? [
    { label: 'ຝ່າຍ', value: currentFolderAny.shelf?.locker?.warehouse?.department?.name || '-', icon: <Layers size={16} /> },
    { label: 'ພະແນກ / ສາຂາ', value: currentFolderAny.shelf?.locker?.warehouse?.division?.name || '-', icon: <Layers size={16} /> },
    { label: 'ສາງ', value: currentFolderAny.shelf?.locker?.warehouse?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ຕູ້', value: currentFolderAny.shelf?.locker?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ຊັ້ນວາງ', value: currentFolder.shelf?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ລະຫັດ Code', value: currentFolder.qrCode || '-', icon: <QrCode size={16} /> },
    { label: 'ຈຳນວນເອກະສານ', value: (currentFolderAny as any).documentCount ? `${(currentFolderAny as any).documentCount} ໄຟລ໌` : '-', icon: <AlignLeft size={16} /> },
  ] : [];

  const statusBadge = currentFolder && (
    <Badge 
      status={currentFolder.status === 'A' ? 'success' : 'error'} 
      text={<span className="text-sm font-medium text-slate-700">{currentFolder.status === 'A' ? 'Active' : 'Inactive'}</span>} 
      className="bg-white/60 px-3 py-1 rounded-xl shadow-sm border border-slate-200/50"
    />
  );

  const actionButtons = (
    <>
      <Button 
        type="text" 
        icon={<Edit2 size={18} className="text-blue-600" />} 
        onClick={() => setIsFolderModalOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all duration-300" 
      />
      <Button 
        type="text" 
        danger 
        icon={<Trash2 size={18} className="text-rose-500" />} 
        onClick={handleDeleteFolder}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md flex items-center justify-center transition-all duration-300" 
      />
    </>
  );

  const createButton = (
    <Button 
      type="primary" 
      size="large" 
      icon={<Plus size={18} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
      onClick={handleOpenCreateDocument}
      className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-6 h-[48px] font-bold text-[15px]"
    >
      ອັບໂຫຼດເອກະສານໃໝ່
    </Button>
  );

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <DetailPageLayout
        breadcrumbs={breadcrumbs}
        icon={<Inbox />}
        title={currentFolder?.name || 'ກຳລັງໂຫຼດ...'}
        entityCode={currentFolder?.code}
        subtitle={currentFolder?.description || "ຂໍ້ມູນລາຍລະອຽດ ແລະ ເອກະສານພາຍໃຕ້ແຟ້ມນີ້"}
        parentInfo={parentInfo}
        statusBadge={statusBadge}
        actionButtons={actionButtons}
        createButton={createButton}
        isLoading={isFolderLoading}
      >
        <DocumentTable 
          data={documents}
          total={total}
          currentPage={currentPage}
          pageSize={10}
          onPageChange={setCurrentPage}
          searchTerm={searchName}
          onSearchChange={setSearchName}
          folderFilter={id}
          onFolderFilterChange={() => {}} // Disabled since we are inside a folder
          docTypeFilter={docTypeFilter}
          onDocTypeFilterChange={setDocTypeFilter}
          contractFilter={contractFilter}
          onContractFilterChange={setContractFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          divisionFilter={divisionFilter}
          onDivisionFilterChange={setDivisionFilter}
          isLoading={isDocumentLoading}
          onEdit={(doc) => {
            setEditingDocument(doc);
            setIsDocumentModalOpen(true);
          }}
          onDelete={handleDeleteDocument}
          onMove={(doc) => {
            setDocumentToMove(doc);
            setIsMoveModalOpen(true);
          }}
          onViewDetails={handleViewDetails}
          hideLocationFilters={true}
        />
      </DetailPageLayout>

      <DocumentFormModal
        isOpen={isDocumentModalOpen}
        onClose={() => { setIsDocumentModalOpen(false); setEditingDocument(null); }}
        onSubmit={handleDocumentSubmit}
        isLoading={isDocumentLoading}
        initialData={editingDocument}
        defaultFolderId={id}
        defaultLocation={currentFolder ? {
          folderId: currentFolder.id,
          shelfId: currentFolder.shelfId,
          lockerId: currentFolderAny?.shelf?.lockerId || currentFolderAny?.shelf?.locker?.id,
          warehouseId: currentFolderAny?.shelf?.locker?.warehouseId || currentFolderAny?.shelf?.locker?.warehouse?.id
        } : undefined}
      />

      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setViewingDocument(null); }}
        document={viewingDocument}
      />
      
      {currentFolder && (
        <FolderFormModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          onSubmit={handleFolderSubmit}
          isLoading={isFolderLoading}
          initialData={currentFolder}
        />
      )}

      <MoveFormModal
        isOpen={isMoveModalOpen}
        onClose={() => { setIsMoveModalOpen(false); setDocumentToMove(null); }}
        onSuccess={() => {
          fetchDocuments({ page: currentPage, limit: 10, folderId: id, search: debouncedSearch || undefined, documentTypeId: docTypeFilter || undefined, retentionStatus: contractFilter || undefined, departmentId: departmentFilter, divisionId: divisionFilter });
        }}
        type="document"
        item={documentToMove}
      />
    </>
  );
}
