"use client";
import React, { useEffect } from 'react';
import { 
  FileText, 
  Edit2, 
  Trash2, 
  Search, 
  Eye, 
  Paperclip,
  Calendar,
  Lock,
  MoreVertical,
  QrCode,
  Tag,
  FolderOpen,
  Scale,
  ArrowRightLeft
} from 'lucide-react';
import { Button, Input, Select, Dropdown, Pagination } from 'antd';
import { Document } from '@/types/prisma-mapped';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import StatusBadge from '@/components/dashboard/StatusBadge';

interface DocumentTableProps {
  data: Document[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  folderFilter: string;
  onFolderFilterChange: (folderId: string) => void;
  docTypeFilter: string;
  onDocTypeFilterChange: (docTypeId: string) => void;
  contractFilter: string;
  onContractFilterChange: (value: string) => void;
  isLoading: boolean;
  onEdit: (doc: Document) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (doc: Document) => void;
  onViewQrCode?: (doc: Document) => void;
  onMove?: (doc: Document) => void;
}

export default function DocumentTable({
  data = [],
  total = 0,
  currentPage = 1,
  pageSize = 5,
  onPageChange,
  searchTerm = '',
  onSearchChange,
  folderFilter = '',
  onFolderFilterChange,
  docTypeFilter = '',
  onDocTypeFilterChange,
  contractFilter = '',
  onContractFilterChange,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onViewQrCode,
  onMove,
}: DocumentTableProps) {
  const { folders, fetchFolders } = useFolderStore();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypeStore();

  // Load folders and document types for display/filter mappings
  useEffect(() => {
    if (folders.length === 0) {
      fetchFolders({ limit: 100 });
    }
    if (documentTypes.length === 0) {
      fetchDocumentTypes({ limit: 100 });
    }
  }, [folders.length, documentTypes.length, fetchFolders, fetchDocumentTypes]);

  // Status mapping functions
  const getRetentionBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusBadge status="success">ເອກະສານທົ່ວໄປ</StatusBadge>;
      case 'DESTROYABLE':
        return <StatusBadge status="warning">10ປີ ທຳລາຍບໍ່ໄດ້</StatusBadge>;
      case 'DESTROYABLE_HOLD':
        return <StatusBadge status="danger">ຕິດສັນຍາ ຫ້າມທຳລາຍ</StatusBadge>;
      case 'EXPIRED':
        return <StatusBadge status="danger">ໝົດອາຍຸ ເຖິງກຳນົດທຳລາຍ</StatusBadge>;
      default:
        return <StatusBadge status="warning">{status}</StatusBadge>;
    }
  };

  const getContractBadge = (isBound: boolean) => {
    return isBound ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <Scale size={10} /> ຜູກພັນສັນຍາ
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/10">
        ທົ່ວໄປ
      </span>
    );
  };

  return (
    <section className="w-full flex flex-col gap-6" aria-label="ຕາຕະລາງຂໍ້ມູນເອກະສານ">
      {/* ── Filter / Search Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 rounded-[24px] shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          {/* Search */}
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາ ເລກທີ, ຊື່ ຫຼື ລາຍລະອຽດ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="w-full sm:w-[260px] rounded-[16px] bg-white/60 border-white/80 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] h-[44px]"
          />

          {/* Document Type Filter */}
          <Select
            placeholder="ປະເພດເອກະສານ"
            value={docTypeFilter || undefined}
            onChange={(val) => onDocTypeFilterChange(val || '')}
            allowClear
            className="w-full sm:w-[180px] h-[44px]"
            classNames={{ popup: { root: "rounded-xl border border-white/60 shadow-glass" } }}
          >
            {documentTypes.map(t => (
              <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
            ))}
          </Select>

          {/* Folder Filter */}
          <Select
            placeholder="ແຟ້ມເອກະສານ"
            value={folderFilter || undefined}
            onChange={(val) => onFolderFilterChange(val || '')}
            allowClear
            className="w-full sm:w-[180px] h-[44px]"
            classNames={{ popup: { root: "rounded-xl border border-white/60 shadow-glass" } }}
          >
            {folders.map(f => (
              <Select.Option key={f.id} value={f.id}>{f.name || f.code}</Select.Option>
            ))}
          </Select>

          {/* Contract Bound Filter */}
          <Select
            placeholder="ປະເພດສັນຍາ"
            value={contractFilter || undefined}
            onChange={(val) => onContractFilterChange(val || '')}
            allowClear
            className="w-full sm:w-[150px] h-[44px]"
            classNames={{ popup: { root: "rounded-xl border border-white/60 shadow-glass" } }}
          >
            <Select.Option value="true">ຜູກພັນສັນຍາ</Select.Option>
            <Select.Option value="false">ທົ່ວໄປ</Select.Option>
          </Select>
        </div>

        {/* Total Items count badge */}
        <div className="flex items-center gap-2 text-[14px] font-bold bg-[#185C4D]/5 px-5 py-2.5 rounded-[16px] border border-[#185C4D]/10 text-[#185C4D] shrink-0">
          ທັງໝົດ <span className="text-base font-black mx-0.5">{total}</span> ລາຍການ
        </div>
      </header>

      {/* ── Table Container ── */}
      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-[32px] shadow-glass overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Custom Header Grid */}
          <div className="bg-[#185C4D] text-white grid grid-cols-12 gap-4 py-4.5 px-6 rounded-2xl shadow-md mb-5 text-[13px] font-bold tracking-wider uppercase items-center">
            <div className="col-span-2 flex items-center gap-1.5"><Tag size={14} /> ເລກທີເອກະສານ</div>
            <div className="col-span-4">ຫົວຂໍ້ & ລາຍລະອຽດ</div>
            <div className="col-span-2 flex items-center gap-1.5"><FolderOpen size={14} /> ບ່ອນເກັບ / ປະເພດ</div>
            <div className="col-span-2">ສະຖານະ / ສັນຍາ</div>
            <div className="col-span-1.5 flex items-center gap-1.5"><Calendar size={14} /> ວັນທີເອກະສານ</div>
            <div className="col-span-0.5 text-right">ຈັດການ</div>
          </div>
          
          {/* Table Rows or Loader */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 bg-white/20 rounded-2xl border border-white/30">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
                <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນເອກະສານ...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 bg-white/20 rounded-2xl border border-dashed border-white/40">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shadow-soft">
                <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນເອກະສານ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map(item => {
                const docTypeName = item.documentType?.name || documentTypes.find(t => t.id === item.documentTypeId)?.name || 'ບໍ່ລະບຸ';
                const folderName = item.folder?.name || folders.find(f => f.id === item.folderId)?.name || folders.find(f => f.id === item.folderId)?.code || 'ບໍ່ລະບຸ';

                return (
                  <div 
                    key={item.id} 
                    className="group bg-white/50 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4.5 px-6 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-glass"
                  >
                    {/* Column 1: Document Number */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/70 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm truncate max-w-full">
                        {item.docNo}
                      </span>
                    </div>
                    
                    {/* Column 2: Title and Description */}
                    <div className="col-span-4 flex flex-col justify-center min-w-0 pr-4">
                      <span className="font-bold text-slate-800 text-[15px] truncate leading-normal" title={item.title}>
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-slate-400 text-[12px] font-medium truncate mt-0.5" title={item.description}>
                          {item.description}
                        </span>
                      )}
                    </div>

                    {/* Column 3: Folder and Type */}
                    <div className="col-span-2 flex flex-col justify-center min-w-0">
                      <span className="text-slate-700 text-[13px] font-bold truncate">
                        📂 {folderName}
                      </span>
                      <span className="text-slate-400 text-[12px] font-medium truncate mt-0.5">
                        🏷️ {docTypeName}
                      </span>
                    </div>

                    {/* Column 4: Retention and Contract Status */}
                    <div className="col-span-2 flex flex-col gap-1 items-start">
                      {getRetentionBadge(item.retentionStatus)}
                      {getContractBadge(item.isContractBound)}
                    </div>

                    {/* Column 5: Document Date */}
                    <div className="col-span-1.5 flex flex-col justify-center">
                      <span className="text-slate-600 text-[13px] font-bold">
                        {new Date(item.docDate).toLocaleDateString('lo-LA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {item.docExpire && (
                        <span className="text-rose-500/80 text-[11px] font-semibold mt-0.5">
                          ໝົດອາຍຸ: {new Date(item.docExpire).toLocaleDateString('lo-LA')}
                        </span>
                      )}
                    </div>


                    {/* Column 7: Actions */}
                    <div className="col-span-0.5 flex justify-end">
                      <Dropdown 
                        menu={{ 
                          items: [
                            {
                              key: 'details',
                              icon: <Eye size={16} className="text-emerald-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ເບິ່ງລາຍລະອຽດ</span>,
                              onClick: () => onViewDetails(item),
                            },
                            {
                              key: 'edit',
                              icon: <Edit2 size={16} className="text-blue-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ແກ້ໄຂຂໍ້ມູນ</span>,
                              onClick: () => onEdit(item),
                            },
                            {
                              key: 'move',
                              icon: <ArrowRightLeft size={16} className="text-[#185C4D]" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ຍ້າຍແຟ້ມ</span>,
                              onClick: () => onMove?.(item),
                            },
                            onViewQrCode ? {
                              key: 'qrcode',
                              icon: <QrCode size={16} className="text-amber-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ເບິ່ງ QR Code</span>,
                              onClick: () => onViewQrCode(item),
                            } : null,
                            {
                              type: 'divider',
                            },
                            {
                              key: 'delete',
                              icon: <Trash2 size={16} className="text-rose-500" />,
                              label: <span className="text-rose-500 font-semibold text-[13px]">ລຶບເອກະສານ</span>,
                              onClick: () => onDelete?.(item.id),
                            }
                          ].filter(Boolean) as any,
                          className: "min-w-[170px] p-2 rounded-2xl border border-white/60 shadow-glass bg-white/80 backdrop-blur-xl"
                        }} 
                        trigger={['click']} 
                        placement="bottomRight"
                      >
                        <Button 
                          type="text" 
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#185C4D]/5 transition-all duration-300 shadow-sm border border-slate-200/30 bg-white/80 hover:border-[#185C4D]/30 group/btn"
                          icon={<MoreVertical size={18} className="text-slate-400 group-hover/btn:text-[#185C4D] transition-colors" />}
                        />
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && data.length > 0 && (
            <div className="flex justify-end mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
