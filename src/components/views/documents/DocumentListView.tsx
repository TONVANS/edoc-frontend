"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Tabs, Modal, message } from 'antd';
import { FileText, Plus, Settings, QrCode, X, Download } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

// Components
import DocumentTypeTable from './DocumentTypeTable';
import DocumentTypeFormModal from './DocumentTypeFormModal';
import DocumentTable from './DocumentTable';
import DocumentFormModal from './DocumentFormModal';
import DocumentDetailModal from './DocumentDetailModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import BorrowDocumentModal from './BorrowDocumentModal';

// Stores & Types
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { DocumentType, CreateDocumentTypePayload, Document } from '@/types/prisma-mapped';

export default function DocumentListView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFolderId = searchParams.get('folderId') || '';

  const [activeTab, setActiveTab] = useState('documents');
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // ── DocumentType States & Actions ──
  const { 
    documentTypes, 
    total: docTypeTotal, 
    isLoading: isDocTypeLoading, 
    fetchDocumentTypes, 
    createDocumentType, 
    updateDocumentType, 
    deleteDocumentType 
  } = useDocumentTypeStore();

  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<DocumentType | null>(null);
  const [docTypePage, setDocTypePage] = useState(1);
  const [docTypeSearch, setDocTypeSearch] = useState('');
  const [debouncedDocTypeSearch, setDebouncedDocTypeSearch] = useState('');

  // Debounce docTypeSearch input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDocTypeSearch(docTypeSearch);
      setDocTypePage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [docTypeSearch]);

  useEffect(() => {
    if (activeTab === 'doc-types') {
      fetchDocumentTypes({
        page: docTypePage,
        limit: 10,
        search: debouncedDocTypeSearch || undefined,
      });
    }
  }, [activeTab, fetchDocumentTypes, docTypePage, debouncedDocTypeSearch]);

  // ── Document States & Actions ──
  const { 
    documents, 
    total: docTotal, 
    isLoading: isDocLoading, 
    fetchDocuments, 
    createDocument, 
    updateDocument, 
    uploadAttachments
  } = useDocumentStore();

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Document | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDoc, setQrDoc] = useState<Document | null>(null);

  // Move states
  const [movingDoc, setMovingDoc] = useState<Document | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Borrow states
  const [borrowDoc, setBorrowDoc] = useState<Document | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const [docPage, setDocPage] = useState(1);
  const [docSearch, setDocSearch] = useState('');
  const [debouncedDocSearch, setDebouncedDocSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState(initialFolderId);
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [divisionFilter, setDivisionFilter] = useState<number | undefined>(undefined);

  // Sync state if URL param changes
  useEffect(() => {
    const paramId = searchParams.get('folderId') || '';
    setFolderFilter(paramId);
    setDocPage(1);
  }, [searchParams]);

  const handleFolderFilterChange = (id: string) => {
    setFolderFilter(id);
    setDocPage(1);
    if (id) {
      router.replace(`/dashboard/documents?folderId=${id}`);
    } else {
      router.replace(`/dashboard/documents`);
    }
  };

  // Debounce docSearch input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDocSearch(docSearch);
      setDocPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [docSearch]);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments({
        page: docPage,
        limit: 10,
        search: debouncedDocSearch || undefined,
        folderId: folderFilter || undefined,
        documentTypeId: docTypeFilter || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        departmentId: departmentFilter,
        divisionId: divisionFilter,
        retentionStatus: contractFilter || undefined,
      });
    }
  }, [
    activeTab, fetchDocuments, docPage, debouncedDocSearch, 
    folderFilter, docTypeFilter, contractFilter, 
    startDateFilter, endDateFilter, departmentFilter, divisionFilter
  ]);

  // ── DocumentType CRUD Handlers ──
  const handleCreateDocType = () => {
    setEditingDocType(null);
    setIsDocTypeModalOpen(true);
  };

  const handleEditDocType = (docType: DocumentType) => {
    setEditingDocType(docType);
    setIsDocTypeModalOpen(true);
  };

  const handleDocTypeSubmit = async (values: CreateDocumentTypePayload & { isActive?: boolean }) => {
    let success = false;
    if (editingDocType) {
      success = await updateDocumentType(editingDocType.id, values);
    } else {
      success = await createDocumentType(values);
    }

    if (success) {
      setIsDocTypeModalOpen(false);
      messageApi.success(editingDocType ? 'ແກ້ໄຂປະເພດເອກະສານສຳເລັດ' : 'ເພີ່ມປະເພດເອກະສານສຳເລັດ');
      fetchDocumentTypes({
        page: docTypePage,
        limit: 10,
        search: debouncedDocTypeSearch || undefined,
      });
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleDeleteDocType = (id: string) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບປະເພດເອກະສານນີ້?',
      okText: 'ລຶບ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteDocumentType(id);
        if (success) {
          messageApi.success('ລຶບສຳເລັດ');
          fetchDocumentTypes({
            page: docTypePage,
            limit: 10,
            search: debouncedDocTypeSearch || undefined,
          });
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບໄດ້');
        }
      },
    });
  };

  // ── Document CRUD Handlers ──
  const handleCreateDoc = () => {
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  const handleEditDoc = (doc: Document) => {
    setEditingDoc(doc);
    setIsDocModalOpen(true);
  };

  const handleViewDetails = (doc: Document) => {
    setDetailDoc(doc);
    setIsDetailModalOpen(true);
  };

  const handleViewQrCode = (doc: Document) => {
    setQrDoc(doc);
    setIsQrModalOpen(true);
  };

  const handleOpenMoveModal = (doc: Document) => {
    setMovingDoc(doc);
    setIsMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setIsMoveModalOpen(false);
    setMovingDoc(null);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${qrDoc?.docNo || qrDoc?.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleBorrowDoc = (doc: Document) => {
    setBorrowDoc(doc);
    setIsBorrowModalOpen(true);
  };

  const handleMoveSuccess = () => {
    fetchDocuments({
      page: docPage,
      limit: 10,
      search: debouncedDocSearch || undefined,
      folderId: folderFilter || undefined,
      documentTypeId: docTypeFilter || undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
      departmentId: departmentFilter,
      divisionId: divisionFilter,
      retentionStatus: contractFilter || undefined,
    });
  };

  const handleDocSubmit = async (values: any, newFiles: File[]) => {
    let success = false;
    
    if (editingDoc) {
      // Edit mode
      success = await updateDocument(editingDoc.id, values);
      
      // If text fields update successfully and new files were attached, upload them
      if (success && newFiles.length > 0) {
        const uploadSuccess = await uploadAttachments(editingDoc.id, newFiles);
        if (!uploadSuccess) {
          messageApi.warning('ບັນທຶກຂໍ້ມູນສຳເລັດ ແຕ່ມີຂໍ້ຜິດພາດໃນການອັບໂຫຼດໄຟລ໌ໃໝ່');
        }
      }
    } else {
      // Create mode
      const payload = {
        ...values,
        files: newFiles,
      };
      success = await createDocument(payload);
    }

    if (success) {
      setIsDocModalOpen(false);
      messageApi.success(editingDoc ? 'ແກ້ໄຂຂໍ້ມູນເອກະສານສຳເລັດ' : 'ເພີ່ມເອກະສານສຳເລັດ');
      
      // Refresh documents
      fetchDocuments({
        page: docPage,
        limit: 10,
        search: debouncedDocSearch || undefined,
        folderId: folderFilter || undefined,
        documentTypeId: docTypeFilter || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        departmentId: departmentFilter,
        divisionId: divisionFilter,
        retentionStatus: contractFilter || undefined,
      });
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກເອກະສານ');
    }
  };

  const handleDeleteDoc = (id: string) => {
    // Direct document deletion is prohibited per system design.
    // Only expired documents can be bulk-deleted via /documents/expired endpoint.
    modal.warning({
      title: 'ບໍ່ສາມາດລຶບໄດ້',
      content: 'ການລຶບເອກະສານໂດຍກົງບໍ່ໄດ້ຮັບອະນຸຍາດ. ເອກະສານທີ່ໝົດອາຍຸສາມາດລຶບໄດ້ຜ່ານໜ້າ "ເອກະສານໝົດອາຍຸ".',
      okText: 'ຕົກລົງ',
      centered: true,
    });
  };

  const items = [
    {
      key: 'documents',
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} />
          ເອກະສານທັງໝົດ
        </span>
      ),
      children: (
        <DocumentTable 
          data={documents}
          total={docTotal}
          currentPage={docPage}
          pageSize={10}
          onPageChange={setDocPage}
          searchTerm={docSearch}
          onSearchChange={setDocSearch}
          folderFilter={folderFilter}
          onFolderFilterChange={handleFolderFilterChange}
          docTypeFilter={docTypeFilter}
          onDocTypeFilterChange={(val) => { setDocTypeFilter(val); setDocPage(1); }}
          contractFilter={contractFilter}
          onContractFilterChange={(val) => { setContractFilter(val); setDocPage(1); }}
          startDateFilter={startDateFilter}
          onStartDateFilterChange={(val) => { setStartDateFilter(val); setDocPage(1); }}
          endDateFilter={endDateFilter}
          onEndDateFilterChange={(val) => { setEndDateFilter(val); setDocPage(1); }}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={(val) => { setDepartmentFilter(val); setDocPage(1); }}
          divisionFilter={divisionFilter}
          onDivisionFilterChange={(val) => { setDivisionFilter(val); setDocPage(1); }}
          isLoading={isDocLoading}
          onEdit={handleEditDoc}
          onDelete={handleDeleteDoc}
          onViewDetails={handleViewDetails}
          onViewQrCode={handleViewQrCode}
          onMove={handleOpenMoveModal}
          onBorrow={handleBorrowDoc}
        />
      ),
    },
    {
      key: 'doc-types',
      label: (
        <span className="flex items-center gap-2">
          <Settings size={16} />
          ການຈັດການປະເພດເອກະສານ
        </span>
      ),
      children: (
        <DocumentTypeTable 
          data={documentTypes}
          total={docTypeTotal}
          currentPage={docTypePage}
          onPageChange={setDocTypePage}
          searchName={docTypeSearch}
          onSearchChange={setDocTypeSearch}
          isLoading={isDocTypeLoading}
          onEdit={handleEditDocType}
          onDelete={handleDeleteDocType}
        />
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {contextHolder}
      {modalContextHolder}

      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">
            {activeTab === 'documents' ? 'ເອກະສານທັງໝົດ' : 'ຈັດການປະເພດເອກະສານ'}
          </h1>
          <p className="text-[#737373] text-sm mt-1">
            {activeTab === 'documents' 
              ? 'ຈັດການ, ຄົ້ນຫາ ແລະ ຕິດຕາມເອກະສານທັງໝົດໃນລະບົບ' 
              : 'ຈັດການໝວດໝູ່ ແລະ ປະເພດຂອງເອກະສານ'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'documents' ? (
            <Button 
              type="primary" 
              icon={<Plus size={16} />} 
              onClick={handleCreateDoc}
              className="bg-[#185C4D] border-none shadow-soft hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              ເພີ່ມເອກະສານ
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<Plus size={16} />} 
              onClick={handleCreateDocType}
              className="bg-[#185C4D] border-none shadow-soft hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              ເພີ່ມປະເພດເອກະສານ
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-glass relative overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items}
          className="[&_.ant-tabs-nav]:mb-8 [&_.ant-tabs-nav]:before:border-b-slate-200/50 [&_.ant-tabs-tab]:text-slate-400 [&_.ant-tabs-tab]:font-bold [&_.ant-tabs-tab]:text-base [&_.ant-tabs-tab]:px-6 [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab]:transition-all [&_.ant-tabs-tab]:duration-300 [&_.ant-tabs-tab:hover]:text-slate-600 [&_.ant-tabs-tab-active]:text-[#185C4D]! [&_.ant-tabs-ink-bar]:bg-[#185C4D] [&_.ant-tabs-ink-bar]:h-[3px] [&_.ant-tabs-ink-bar]:rounded-t-full"
        />
      </div>

      {/* ── Modals ── */}
      {isDocModalOpen && (
        <DocumentFormModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          onSubmit={handleDocSubmit}
          isLoading={isDocLoading}
          initialData={editingDoc}
        />
      )}

      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        document={detailDoc}
      />

      {isMoveModalOpen && movingDoc && (
        <MoveFormModal
          isOpen={isMoveModalOpen}
          onClose={handleCloseMoveModal}
          onSuccess={handleMoveSuccess}
          type="document"
          item={movingDoc}
        />
      )}

      {isBorrowModalOpen && borrowDoc && (
        <BorrowDocumentModal
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          onSuccess={() => setIsBorrowModalOpen(false)}
          document={borrowDoc}
        />
      )}

      {isDocTypeModalOpen && (
        <DocumentTypeFormModal
          isOpen={isDocTypeModalOpen}
          onClose={() => setIsDocTypeModalOpen(false)}
          onSubmit={handleDocTypeSubmit}
          isLoading={isDocTypeLoading}
          initialData={editingDocType}
        />
      )}

      {/* Simple QR Code Viewer Modal */}
      <Modal
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        footer={null}
        width={350}
        centered
        title={null}
        closable={false}
        wrapClassName="backdrop-blur-md"
        className="[&_.ant-modal-content]:p-0 [&_.ant-modal-content]:bg-transparent [&_.ant-modal-content]:shadow-none"
      >
        <div className="bg-white/80 backdrop-blur-3xl rounded-[32px] p-8 border border-white/60 shadow-glass flex flex-col items-center justify-center text-center">
          <div className="flex justify-between items-center w-full mb-4">
            <span className="text-slate-700 font-bold text-base flex items-center gap-1.5">
              <QrCode size={18} className="text-[#185C4D]" /> QR Code
            </span>
            <button 
              onClick={() => setIsQrModalOpen(false)} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border-none"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 mb-4">
            {qrDoc && (
              <QRCodeCanvas 
                id="qr-code-canvas"
                value={qrDoc.qrCode || `EDOC-DOC-${qrDoc.id}`} 
                size={180} 
                bgColor="#ffffff"
                fgColor="#185C4D"
                level="Q"
              />
            )}
          </div>
          
          <span className="text-sm font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
            {qrDoc?.qrCode || `REF-${qrDoc?.docNo}`}
          </span>
          <p className="text-slate-400 text-xs mt-3 font-semibold truncate max-w-full">
            {qrDoc?.title}
          </p>

          <Button 
            type="primary" 
            icon={<Download size={16} />} 
            onClick={downloadQRCode}
            className="mt-5 bg-[#185C4D] border-none shadow-soft hover:-translate-y-0.5 transition-transform cursor-pointer w-full rounded-xl h-11 font-bold"
          >
            ດາວໂຫຼດ QR Code
          </Button>
        </div>
      </Modal>
    </div>
  );
}
