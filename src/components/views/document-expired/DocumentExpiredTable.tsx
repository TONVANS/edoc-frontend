'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Pagination, Modal, message, Tabs, Upload, Checkbox, Badge, Drawer, Popconfirm, DatePicker } from 'antd';
import { Eye, Trash2, FileText, FolderOpen, Calendar, Tag, MoreVertical, AlertTriangle, UploadCloud } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dayjs from 'dayjs';
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
  
  // Delete Cart states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [deleteCart, setDeleteCart] = useState<string[]>([]);
  const [deleteFile, setDeleteFile] = useState<File | null>(null);
  const [destroyedDate, setDestroyedDate] = useState<string | null>(null);
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

  const handleDeleteConfirm = async () => {
    if (deleteCart.length === 0) {
      messageApi.error('ກະລຸນາເລືອກເອກະສານທີ່ຕ້ອງການລຶບ');
      return;
    }
    if (!destroyedDate) {
      messageApi.error('ກະລຸນາເລືອກວັນທີທຳລາຍເອກະສານ');
      return;
    }
    if (!deleteFile) {
      messageApi.error('ກະລຸນາແນບເອກະສານອ້າງອີງການທຳລາຍ (PDF)');
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('file', deleteFile);
      formData.append('destroyedDate', destroyedDate);
      
      // Append each selected document ID
      deleteCart.forEach(id => {
        formData.append('ids', id);
      });
      
      await api.delete('/documents/:id', {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      messageApi.success('ລຶບເອກະສານສຳເລັດ');
      setDeleteModalVisible(false);
      setDeleteDrawerOpen(false);
      setDeleteCart([]);
      setDeleteFile(null);
      setDestroyedDate(null);
      
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
    setDeleteCart([]); // Clear cart when switching tabs
    setDeleteDrawerOpen(false);
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
    <section className="flex flex-col gap-6 relative">
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
      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-4xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto relative">
        <div className="min-w-250">
          {/* Custom Header Grid */}
          <div className={`bg-linear-to-r ${activeTab === 'DESTROYABLE_HOLD' || activeTab === 'ACTIVE' ? 'from-emerald-600 to-emerald-400' : 'from-rose-600 to-rose-400'} text-white grid grid-cols-12 gap-4 py-4.5 px-6 rounded-2xl shadow-md mb-5 text-[13px] font-bold tracking-wider uppercase items-center`}>
            {activeTab === 'EXPIRED' && (
              <div className="col-span-1 flex items-center justify-center">
                <Checkbox 
                  checked={dataSource.length > 0 && dataSource.every(d => deleteCart.includes(d.id))}
                  indeterminate={dataSource.some(d => deleteCart.includes(d.id)) && !dataSource.every(d => deleteCart.includes(d.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newIds = dataSource.filter(d => !deleteCart.includes(d.id)).map(d => d.id);
                      setDeleteCart([...deleteCart, ...newIds]);
                    } else {
                      const pageIds = dataSource.map(d => d.id);
                      setDeleteCart(deleteCart.filter(id => !pageIds.includes(id)));
                    }
                  }}
                />
              </div>
            )}
            <div className="col-span-2 flex items-center gap-1.5"><Tag size={14} /> ເລກທີເອກະສານ</div>
            <div className={`flex items-center gap-1.5 ${activeTab === 'EXPIRED' ? 'col-span-3' : 'col-span-4'}`}><FileText size={14} /> ຊື່ເອກະສານ</div>
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
                    {/* Column 0: Checkbox */}
                    {activeTab === 'EXPIRED' && (
                      <div className="col-span-1 flex items-center justify-center">
                        <Checkbox 
                          checked={deleteCart.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDeleteCart([...deleteCart, item.id]);
                            } else {
                              setDeleteCart(deleteCart.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Column 1: Document Number */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/70 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm truncate max-w-full">
                        {item.docNo}
                      </span>
                    </div>
                    
                    {/* Column 2: Title */}
                    <div className={`flex flex-col justify-center min-w-0 pr-4 ${activeTab === 'EXPIRED' ? 'col-span-3' : 'col-span-4'}`}>
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
                            ] : activeTab === 'EXPIRED' ? [
                              { type: 'divider' },
                              {
                                key: 'delete',
                                icon: <Trash2 size={16} className="text-rose-500" />,
                                label: <span className="text-rose-500 font-semibold text-[13px]">ເພີ່ມລົງໃນກະຕ່າລຶບ</span>,
                                onClick: () => {
                                  if (!deleteCart.includes(item.id)) {
                                    setDeleteCart([...deleteCart, item.id]);
                                  }
                                },
                              }
                            ] : []) as any
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

      {/* Delete Cart FAB */}
      <div 
        className={`fixed bottom-[130px] right-8 z-40 transition-all duration-300 ${
          deleteCart.length > 0 ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Badge count={deleteCart.length} offset={[-4, 4]} color="#f43f5e">
          <button
            onClick={() => setDeleteDrawerOpen(true)}
            className="w-16 h-16 bg-linear-to-r from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none outline-none group"
            title="ກະຕ່າລຶບເອກະສານ"
          >
            <Trash2 size={28} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        </Badge>
      </div>

      {/* Delete Cart Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between font-lao py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-xs">
                <Trash2 size={20} className="text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-lg">ກະຕ່າລຶບເອກະສານ</span>
                <span className="text-xs text-slate-500 font-medium">
                  {deleteCart.length > 0
                    ? `ລວມ ${deleteCart.length} ລາຍການ`
                    : 'ບໍ່ມີລາຍການ'}
                </span>
              </div>
            </div>

            {deleteCart.length > 0 && (
              <Popconfirm
                title="ຢືນຢັນການລຶບ"
                description="ທ່ານຕ້ອງການລ້າງກະຕ່າລຶບທັງໝົດບໍ່?"
                onConfirm={() => {
                  setDeleteCart([]);
                  setDeleteDrawerOpen(false);
                }}
                okText="ລ້າງທັງໝົດ"
                cancelText="ຍົກເລີກ"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 size={15} />}
                  className="rounded-xl flex items-center gap-1 font-medium hover:bg-rose-50"
                >
                  ລ້າງທັງໝົດ
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        placement="right"
        styles={{ wrapper: { width: 450, maxWidth: '100vw' } }}
        onClose={() => setDeleteDrawerOpen(false)}
        open={deleteDrawerOpen}
        className="font-lao [&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-slate-100 [&_.ant-drawer-body]:p-4"
        footer={
          deleteCart.length > 0 ? (
            <div className="flex items-center justify-end gap-2 p-2 font-lao bg-slate-50 rounded-2xl border border-slate-200/60">
              <Button
                onClick={() => setDeleteDrawerOpen(false)}
                className="rounded-xl h-11 px-5 border-slate-200 hover:bg-slate-100 font-medium"
              >
                ປິດ
              </Button>
              <Button
                type="primary"
                danger
                icon={<Trash2 size={18} />}
                onClick={() => {
                  setDeleteFile(null);
                  setDestroyedDate(null);
                  setDeleteModalVisible(true);
                }}
                className="rounded-xl h-11 px-6 font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                ດຳເນີນການລຶບ ({deleteCart.length})
              </Button>
            </div>
          ) : null
        }
      >
        {deleteCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center font-lao">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300 border border-slate-200/50">
              <Trash2 size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-1">ຍັງບໍ່ມີເອກະສານໃນກະຕ່າ</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              ທ່ານສາມາດເລືອກເອກະສານທີ່ໝົດອາຍຸ ຈາກຕາຕະລາງເພື່ອລຶບພ້ອມກັນ
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3 font-lao overflow-y-auto pr-1">
            {deleteCart.map((id, idx) => {
              const item = [...expiredDocuments, ...destroyedDocuments, ...documents].find(d => d.id === id);
              if (!item) return null;
              
              const docTypeName = item.documentType?.name || 'ບໍ່ລະບຸ';

              return (
                <div
                  key={id}
                  className="group bg-white border border-slate-200/80 hover:border-rose-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/60">
                          {item.docNo}
                        </span>
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 truncate">
                        <span>{docTypeName}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => {
                      const newCart = deleteCart.filter(cartId => cartId !== id);
                      setDeleteCart(newCart);
                      if (newCart.length === 0) {
                        setDeleteDrawerOpen(false);
                      }
                    }}
                    className="rounded-xl opacity-70 group-hover:opacity-100 hover:bg-rose-50 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Drawer>

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
        okText={`ຢືນຢັນລຶບ ${deleteCart.length} ລາຍການ`}
        cancelText="ຍົກເລີກ"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="py-4 flex flex-col gap-4">
          <p className="text-slate-600 font-medium text-sm">
            ກະລຸນາເລືອກວັນທີ ແລະ ແນບເອກະສານອ້າງອີງການອະນຸມັດທຳລາຍເອກະສານ (PDF) ເພື່ອຢືນຢັນການລຶບ {deleteCart.length} ລາຍການທີ່ເລືອກໄວ້.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700">ວັນທີທຳລາຍເອກະສານ <span className="text-rose-500">*</span></span>
            <DatePicker 
              className="h-11 rounded-xl w-full" 
              placeholder="ເລືອກວັນທີທຳລາຍເອກະສານ"
              value={destroyedDate ? dayjs(destroyedDate) : null}
              onChange={(date) => {
                setDestroyedDate(date ? date.format('YYYY-MM-DD') : null);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700">ເອກະສານອ້າງອີງ (PDF) <span className="text-rose-500">*</span></span>
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
        </div>
      </Modal>
    </section>
  );
}
