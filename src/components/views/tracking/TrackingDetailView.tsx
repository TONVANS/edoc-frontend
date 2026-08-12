"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { DocumentBorrow } from '@/types/prisma-mapped';
import { Button, Spin, Tag, Card, Divider, Modal } from 'antd';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, FileText, MapPin, Phone, User, QrCode, Eye } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function TrackingDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { fetchBorrowById, isLoading, returnBorrow } = useDocumentBorrowStore();
  const { departmentDropdown, fetchDropdown: fetchDepartmentDropdown } = useDepartmentStore();
  const { viewAttachment } = useDocumentStore();
  const [log, setLog] = useState<DocumentBorrow | null>(null);

  const [folderDocs, setFolderDocs] = useState<any[]>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [loadingFolderDocs, setLoadingFolderDocs] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [loadingViewId, setLoadingViewId] = useState<string | null>(null);

  const handleViewFile = async (id: string) => {
    setLoadingViewId(id);
    await viewAttachment(id);
    setLoadingViewId(null);
  };

  const handleViewFolderDocuments = async (folderId: string | number, folderName: string) => {
    setSelectedFolderName(folderName);
    setIsFolderModalOpen(true);
    setLoadingFolderDocs(true);
    try {
      const res = await api.get(`/documents?folderId=${folderId}`);
      let docs = [];
      if (res.data?.data) {
        if (Array.isArray(res.data.data)) {
          docs = res.data.data;
        } else if (Array.isArray(res.data.data.data)) {
          docs = res.data.data.data;
        }
      } else if (Array.isArray(res.data)) {
         docs = res.data;
      }
      setFolderDocs(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFolderDocs(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    fetchDepartmentDropdown();
  }, [fetchDepartmentDropdown]);

  const loadData = async () => {
    const data = await fetchBorrowById(id);
    if (data) {
      setLog(data as DocumentBorrow);
    }
  };

  const handleReturn = async () => {
    if (!log) return;
    const success = await returnBorrow(log.id);
    if (success) {
      loadData();
    }
  };

  if (isLoading || !log) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
        <Spin size="large" />
        <span className="text-slate-500 font-bold tracking-wide mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
      </div>
    );
  }

  const isReturned = log.status === 'RETURNED';
  const firstItemDueDate = log.items?.[0]?.dueDate || log.dueDate;
  const isOverdue = !isReturned && !!firstItemDueDate && new Date(firstItemDueDate) < new Date();
  const borrowedDateObj = log.borrowedAt || log.createdAt;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          icon={<ArrowLeft size={18} />}
          className="border-none shadow-sm bg-white/70 hover:bg-white text-slate-600 font-semibold rounded-xl h-10 px-4 transition-all"
        >
          ກັບຄືນ
        </Button>
      </div>

      <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col">
        {/* Header */}
        <header className={cn(
          "relative px-10 pt-10 pb-14 overflow-hidden text-white bg-linear-to-br",
          isReturned
            ? "from-emerald-700 via-emerald-600 to-teal-700"
            : isOverdue
              ? "from-rose-700 via-rose-600 to-red-700 animate-pulse"
              : "from-[#185C4D] via-[#1c6958] to-[#257c66]"
        )}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                ລາຍລະອຽດການຢືມ
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={isReturned ? 'success' : isOverdue ? 'danger' : 'warning'}>
                  {isReturned ? 'ສົ່ງຄືນແລ້ວ' : isOverdue ? 'ກາຍກຳນົດສົ່ງ' : 'ກຳລັງຢືມ'}
                </StatusBadge>
                <span className="text-white/80 font-mono text-sm">{log.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="px-10 py-8 -mt-8 bg-white/80 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Borrower Section */}
              <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-[11px] text-[#185C4D] font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-50 pb-2">
                  <User size={14} /> ຂໍ້ມູນຜູ້ຢືມ & ພາກສ່ວນ
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-xs">ຜູ້ຢືມ:</span>
                    <span className="font-bold text-slate-700">{log.borrower}</span>
                  </div>
                  {log.phone && (
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-xs">ເບີໂທລະສັບ:</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1"><Phone size={14} /> {log.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-xs">ພາກສ່ວນ/ພະແນກ:</span>
                    <span className="font-bold text-slate-700">
                      {departmentDropdown.find(d => d.id === log.toDivision?.departmentId)?.name
                        ? `${departmentDropdown.find(d => d.id === log.toDivision?.departmentId)?.name} - `
                        : ''}
                      {log.toDivision?.name || log.toLocation || '—'}
                    </span>
                  </div>
                  {log.createdBy && (
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-xs">ຜູ້ມອບ/ຜູ້ບັນທຶກ:</span>
                      <span className="font-bold text-slate-700">
                        {log.createdBy.firstNameLa || log.createdBy.lastNameLa
                          ? `${log.createdBy.firstNameLa || ''} ${log.createdBy.lastNameLa || ''}`.trim()
                          : log.createdBy.empCode || '—'}
                        {log.createdBy.empCode && ` (${log.createdBy.empCode})`}
                      </span>
                    </div>
                  )}
                </div>
                {log.purpose && (
                  <div className="border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-400 block mb-1 text-xs">ຈຸດປະສົງ:</span>
                    <p className="text-slate-600 bg-slate-50/50 rounded-lg p-3 font-medium leading-relaxed">{log.purpose}</p>
                  </div>
                )}
                {log.note && (
                  <div className="border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-400 block mb-1 text-xs">ໝາຍເຫດ:</span>
                    <p className="text-slate-500 bg-slate-50/50 rounded-lg p-3 italic leading-relaxed">{log.note}</p>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-[11px] text-[#185C4D] font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-50 pb-2">
                  <FileText size={14} /> ລາຍການເອກະສານ/ແຟ້ມ
                </h3>
                <div className="flex flex-col gap-3">
                  {log.items && log.items.length > 0 ? (
                    log.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex flex-col gap-2 p-4 bg-white/50 rounded-xl border border-slate-100 shadow-sm transition-hover hover:border-[#185C4D]/30">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg text-[#185C4D] shrink-0">
                            {item.documentId ? <FileText size={18} /> : <BookOpen size={18} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-700 text-sm">{item.document?.title || item.folder?.name || '—'}</div>
                            <div className="text-xs text-slate-500 mt-1 font-mono flex items-center justify-between">
                              <span>ເລກທີ: {item.document?.docNo || item.folder?.code || '—'}</span>
                              {item.status && (
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold ml-2", item.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200')}>
                                  {item.status === 'RETURNED' ? 'ສົ່ງຄືນແລ້ວ' : 'ກຳລັງຢືມ'}
                                </span>
                              )}
                            </div>
                            {item.folderId && (
                                <div className="mt-3 border-t border-slate-100 pt-3">
                                  <Button 
                                    size="small" 
                                    type="dashed" 
                                    icon={<Eye size={14} />} 
                                    onClick={() => handleViewFolderDocuments(item.folderId as string, item.folder?.name as string)}
                                    className="text-xs text-[#185C4D] border-[#185C4D]/30 hover:border-[#185C4D] hover:text-[#185C4D]"
                                  >
                                    ເບິ່ງເອກະສານໃນແຟ້ມນີ້
                                  </Button>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 font-semibold text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      ບໍ່ມີລາຍການ
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              {/* QR Code */}
              <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm flex flex-col items-center text-center">
                <h4 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-4 uppercase tracking-wider">
                  <QrCode size={14} /> QR Code ສຳລັບການແຈ້ງຕິດຕາມ
                </h4>
                <div className="bg-white p-3.5 rounded-2xl shadow-soft border border-slate-100">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/dashboard/tracking/${log.id}` : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/dashboard/tracking/${log.id}`}
                    size={130}
                    bgColor="#ffffff"
                    fgColor="#185C4D"
                    level="Q"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-4 max-w-[200px] leading-relaxed">
                  ສະແກນ QR Code ເພື່ອເຂົ້າເບິ່ງລາຍລະອຽດການຢືມນີ້ໄດ້ທັນທີ.
                </p>
              </div>

              {/* Timeline Section */}
              <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] text-[#185C4D] font-black uppercase tracking-wider mb-4 border-b border-emerald-50 pb-2 flex items-center gap-1.5">
                  <Calendar size={14} /> ຕິດຕາມສະຖານະການຢືມ
                </h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Borrowed */}
                  <div className="relative flex gap-3">
                    <div className="absolute left-[-21px] mt-1.5 w-[12px] h-[12px] rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ວັນທີຢືມ</div>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">
                        {borrowedDateObj ? format(new Date(borrowedDateObj), 'dd MMM yyyy HH:mm') : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Due Date */}
                  {firstItemDueDate && (
                    <div className="relative flex gap-3">
                      <div className={cn(
                        "absolute left-[-21px] mt-1.5 w-[12px] h-[12px] rounded-full border-2 border-white shadow-xs",
                        isReturned ? "bg-slate-400" : isOverdue ? "bg-rose-500" : "bg-amber-500"
                      )}></div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ກຳນົດສົ່ງຄືນ</div>
                        <div className={cn("text-xs font-bold mt-0.5", isOverdue && !isReturned ? "text-rose-600 animate-pulse" : "text-slate-700")}>
                          {format(new Date(firstItemDueDate), 'dd MMM yyyy')}
                          {isOverdue && !isReturned && <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">ກາຍກຳນົດ</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Returned */}
                  <div className="relative flex gap-3">
                    <div className={cn(
                      "absolute left-[-21px] mt-1.5 w-[12px] h-[12px] rounded-full border-2 border-white shadow-xs",
                      isReturned ? "bg-emerald-500" : "bg-slate-300"
                    )}></div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ວັນທີສົ່ງຄືນ</div>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">
                        {isReturned ? (
                          <span className="text-emerald-600">
                            {(() => {
                              const ret = log.items?.find(i => i.returnedAt)?.returnedAt || log.returnedAt;
                              return ret ? format(new Date(ret), 'dd MMM yyyy HH:mm') : '—';
                            })()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ຍັງບໍ່ທັນສົ່ງຄືນ</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOpen className="text-[#185C4D]" size={20} />
            <span className="text-[#185C4D] font-bold">ເອກະສານໃນແຟ້ມ: {selectedFolderName}</span>
          </div>
        }
        open={isFolderModalOpen}
        onCancel={() => setIsFolderModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsFolderModalOpen(false)} className="rounded-lg font-medium">
            ປິດ
          </Button>
        ]}
        width={700}
        centered
        className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-slate-100 [&_.ant-modal-header]:pb-3 [&_.ant-modal-header]:mb-0 [&_.ant-modal-body]:p-4"
      >
        {loadingFolderDocs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spin size="large" />
            <span className="text-slate-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
          </div>
        ) : folderDocs.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
            {folderDocs.map((doc: any, index: number) => (
              <div key={doc.id || index} className="flex items-start gap-3 border border-slate-100 bg-white hover:border-[#185C4D]/30 transition-colors rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-[#185C4D] shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-700 text-sm line-clamp-2 block">{doc.title}</span>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    <span className="text-xs text-slate-600 font-mono bg-slate-50 w-max px-2 py-0.5 rounded-md border border-slate-100">
                      ເລກທີ: {doc.docNo || '—'}
                    </span>
                  </div>
                  {doc.attachments && doc.attachments.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                      {doc.attachments.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs text-slate-600 border border-slate-100 hover:border-[#185C4D]/30 transition-colors">
                          <span className="truncate flex-1 max-w-[200px] font-medium" title={att.fileName}>{att.fileName}</span>
                          <Button 
                            size="small" 
                            type="primary" 
                            ghost 
                            loading={loadingViewId === att.id}
                            onClick={() => handleViewFile(att.id)}
                            className="text-[10px] h-6 px-2.5 rounded-md border-[#185C4D]/50 text-[#185C4D] hover:bg-[#185C4D] hover:text-white cursor-pointer"
                          >
                            ເບິ່ງໄຟລ໌
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText size={48} className="text-slate-200 mb-3" />
            <span className="font-medium text-slate-500">ບໍ່ພົບເອກະສານໃນແຟ້ມນີ້</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
