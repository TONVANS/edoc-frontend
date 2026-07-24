'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Pagination, Modal, message, Tabs, Upload } from 'antd';
import { Eye, Trash2, FileText, FolderOpen, Calendar, Tag, MoreVertical, AlertTriangle, UploadCloud } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import DocumentDetailModal from '@/components/views/documents/DocumentDetailModal';
import { Document } from '@/types/prisma-mapped';
import api from '@/lib/api';

export default function DocumentExpiredTable() {
  const router = useRouter();
  const { documents, expiredDocuments, destroyedDocuments, total, isLoading, fetchDocuments, fetchExpiredDocuments, fetchDestroyedDocuments } = useDocumentStore();
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('EXPIRED');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [deleteFile, setDeleteFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeTab === 'EXPIRED') {
      fetchExpiredDocuments();
    } else if (activeTab === 'HISTORY') {
      fetchDestroyedDocuments();
    } else {
      fetchDocuments({ page: currentPage, limit: 10, retentionStatus: activeTab });
    }
  }, [fetchDocuments, fetchExpiredDocuments, fetchDestroyedDocuments, currentPage, activeTab]);

  const showDeleteModal = (id: string) => {
    setDocumentToDelete(id);
    setDeleteFile(null);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    if (!deleteFile) {
      messageApi.error('ກະລຸນາແນບເອກະສານອ້າງອີງການທຳລາຍ (PDF)');
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('file', deleteFile);
      
      await api.delete(`/documents/${documentToDelete}`, {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      messageApi.success('ລຶບເອກະສານສຳເລັດ');
      setDeleteModalVisible(false);
      setDocumentToDelete(null);
      setDeleteFile(null);
      
      if (activeTab === 'EXPIRED') {
        fetchExpiredDocuments();
      } else if (activeTab !== 'HISTORY') {
        fetchDocuments({ page: currentPage, limit: 10, retentionStatus: activeTab });
      }
    } catch (error) {
      messageApi.error('ບໍ່ສາມາດລຶບເອກະສານໄດ້');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabItems = [
    { key: 'EXPIRED', label: 'ເອກະສານໝົດອາຍຸ' },
    { key: 'DESTROYABLE_HOLD', label: 'ເກັບຖາວອນ' },
    { key: 'ACTIVE', label: 'ເກັບກຳເອກະສານ' },
    { key: 'HISTORY', label: 'ປະຫວັດການທຳລາຍ' },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const dataSource = activeTab === 'EXPIRED' 
    ? expiredDocuments.slice((currentPage - 1) * 10, currentPage * 10) 
    : activeTab === 'HISTORY'
    ? destroyedDocuments.slice((currentPage - 1) * 10, currentPage * 10)
    : documents;
  const currentTotal = activeTab === 'EXPIRED' 
    ? expiredDocuments.length 
    : activeTab === 'HISTORY'
    ? destroyedDocuments.length
    : total;

  return (
    <section className="flex flex-col gap-6">
      {contextHolder}
      {messageContextHolder}
      <DocumentDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        document={detailDoc}
      />
      
      {/* ── Header Area ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight" style={{ color: '#185C4D' }}>
            ເອກະສານໝົດອາຍຸ
          </h1>
          <p className="text-slate-500 font-medium text-[14px] mt-1">
            ລາຍການເອກະສານທັງໝົດທີ່ໝົດອາຍຸແລ້ວໃນລະບົບ
          </p>
        </div>

        <div className={`flex items-center gap-2 text-[14px] font-bold px-5 py-2.5 rounded-[16px] border shrink-0 ${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 text-rose-600'}`}>
          <AlertTriangle size={18} className={`${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'} mr-1`} />
          ທັງໝົດ <span className="text-base font-black mx-0.5">{activeTab === 'HISTORY' ? 0 : currentTotal}</span> ລາຍການ
        </div>
      </header>
      
      {/* ── Tabs Area ── */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/60 shadow-sm">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          items={tabItems} 
          size="large"
          className="font-semibold text-slate-700"
        />
      </div>

      {/* ── Table Container ── */}
      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-4xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto">
        <div className="min-w-250">
          {/* Custom Header Grid */}
          <div className={`bg-linear-to-r ${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'from-emerald-600 to-emerald-400' : 'from-rose-600 to-rose-400'} text-white grid grid-cols-12 gap-4 py-4.5 px-6 rounded-2xl shadow-md mb-5 text-[13px] font-bold tracking-wider uppercase items-center`}>
            <div className="col-span-2 flex items-center gap-1.5"><Tag size={14} /> ເລກທີເອກະສານ</div>
            <div className="col-span-4 flex items-center gap-1.5"><FileText size={14} /> ຊື່ເອກະສານ</div>
            <div className="col-span-3 flex items-center gap-1.5"><FolderOpen size={14} /> ແຟ້ມ / ປະເພດ</div>
            <div className="col-span-2 flex items-center gap-1.5"><Calendar size={14} /> ວັນທີໝົດອາຍຸ</div>
            <div className="col-span-1 text-right">ຈັດການ</div>
          </div>
          
          {/* Table Rows or Loader */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 bg-white/20 rounded-2xl border border-white/30">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 border-4 rounded-full animate-spin ${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'border-emerald-500/20 border-t-emerald-500' : 'border-rose-500/20 border-t-rose-500'}`} />
                <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
              </div>
            </div>
          ) : dataSource.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 bg-white/20 rounded-2xl border border-dashed border-white/40">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm">
                <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນເອກະສານ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {dataSource.map(item => {
                const docTypeName = item.documentType?.name || 'ບໍ່ລະບຸ';
                const folderName = item.folder?.name || item.folder?.code || 'ບໍ່ລະບຸ';

                return (
                  <div 
                    key={item.id} 
                    className="group bg-white/50 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4.5 px-6 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Column 1: Document Number */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/70 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm truncate max-w-full">
                        {item.docNo}
                      </span>
                    </div>
                    
                    {/* Column 2: Title */}
                    <div className="col-span-4 flex flex-col justify-center min-w-0 pr-4">
                      <span className="font-bold text-slate-800 text-[15px] truncate leading-normal" title={item.title}>
                        {item.title}
                      </span>
                    </div>

                    {/* Column 3: Folder and Type */}
                    <div className="col-span-3 flex flex-col justify-center min-w-0">
                      <span className="text-slate-700 text-[13px] font-bold truncate">
                        📂 {folderName}
                      </span>
                      <span className="text-slate-400 text-[12px] font-medium truncate mt-0.5">
                        🏷️ {docTypeName}
                      </span>
                    </div>

                    {/* Column 4: Document Expire Date */}
                    <div className="col-span-2 flex flex-col justify-center items-start">
                      <span className={`font-bold text-[13px] px-3 py-1.5 rounded-lg border inline-block w-max ${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
                        {item.docExpire ? format(new Date(item.docExpire), 'dd/MM/yyyy') : '-'}
                      </span>
                    </div>

                    {/* Column 5: Actions */}
                    <div className="col-span-1 flex justify-end">
                      <Dropdown 
                        menu={{ 
                          items: [
                            {
                              key: 'details',
                              icon: <Eye size={16} className="text-emerald-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ເບິ່ງລາຍລະອຽດ</span>,
                              onClick: () => {
                                setDetailDoc(item as Document);
                                setIsDetailModalOpen(true);
                              },
                            },
                            ...(activeTab === 'HISTORY' ? [
                              { type: 'divider' },
                              {
                                key: 'view-approval',
                                icon: <FileText size={16} className="text-blue-500" />,
                                label: <span className="text-blue-500 font-medium text-[13px]">ເບິ່ງເອກະສານອ້າງອີງ</span>,
                                onClick: async () => {
                                  try {
                                    const response = await api.get(`/documents/${item.id}/destruction-approval`, {
                                      responseType: 'blob'
                                    });
                                    const file = new Blob([response.data], {
                                      type: response.headers['content-type'] as string || 'application/pdf',
                                    });
                                    const url = window.URL.createObjectURL(file);
                                    window.open(url, '_blank');
                                    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                  } catch (error) {
                                    messageApi.error('ບໍ່ສາມາດເປີດເອກະສານອ້າງອີງໄດ້');
                                  }
                                }
                              }
                            ] : [
                              { type: 'divider' },
                              {
                                key: 'delete',
                                icon: <Trash2 size={16} className="text-rose-500" />,
                                label: <span className="text-rose-500 font-semibold text-[13px]">ລຶບເອກະສານ</span>,
                                onClick: () => showDeleteModal(item.id),
                              }
                            ]) as any
                          ],
                          className: "min-w-[150px] p-2 rounded-2xl border border-white/60 shadow-lg bg-white/80 backdrop-blur-xl"
                        }} 
                        trigger={['click']} 
                        placement="bottomRight"
                      >
                        <Button 
                          type="text" 
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all duration-300 shadow-sm border border-slate-200/30 bg-white/80 hover:border-rose-500/30 group/btn"
                          icon={<MoreVertical size={18} className="text-slate-400 group-hover/btn:text-rose-500 transition-colors" />}
                        />
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Area */}
          {!isLoading && dataSource.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-slate-500 text-sm font-medium">
                ສະແດງ {dataSource.length} ຈາກທັງໝົດ {currentTotal} ລາຍການ
              </span>
              <Pagination
                current={currentPage}
                onChange={(page) => setCurrentPage(page)}
                pageSize={10}
                total={currentTotal}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Trash2 className="text-rose-500" size={20} />
            <span className="text-rose-500">ຢືນຢັນການລຶບເອກະສານ</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteConfirm}
        confirmLoading={isDeleting}
        okText="ຢືນຢັນລຶບ"
        cancelText="ຍົກເລີກ"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="py-4 flex flex-col gap-3">
          <p className="text-slate-600 font-medium text-sm">
            ກະລຸນາແນບເອກະສານອ້າງອີງການອະນຸມັດທຳລາຍເອກະສານ (PDF) ເພື່ອຢືນຢັນການລຶບ.
          </p>
          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              const isPdf = file.type === 'application/pdf';
              if (!isPdf) {
                messageApi.error('ອະນຸຍາດສະເພາະໄຟລ໌ PDF ເທົ່ານັ້ນ!');
                return Upload.LIST_IGNORE;
              }
              setDeleteFile(file);
              return false;
            }}
            onRemove={() => setDeleteFile(null)}
            accept=".pdf"
          >
            <Button icon={<UploadCloud size={16} />}>ອັບໂຫຼດເອກະສານອ້າງອີງ</Button>
          </Upload>
        </div>
      </Modal>
    </section>
  );
}
