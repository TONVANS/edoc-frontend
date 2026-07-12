"use client";
import React, { useState, useEffect } from 'react';
import { Input, Select, Badge, Button, message, Pagination, Modal } from 'antd';
import { Search, Clock, ArrowRightLeft, Eye, User, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { format } from 'date-fns';
import { DocumentBorrow } from '@/types/prisma-mapped';

export default function TrackingLogView() {
  const { borrows, total, fetchBorrows, returnBorrow, isLoading } = useDocumentBorrowStore();
  const { divisionDropdown, fetchDropdown } = useDivisionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [divisionId, setDivisionId] = useState<number | undefined>(undefined);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [selectedLog, setSelectedLog] = useState<DocumentBorrow | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchBorrows({ page, limit, divisionId });
  }, [fetchBorrows, page, limit, divisionId]);

  useEffect(() => {
    fetchDropdown();
  }, [fetchDropdown]);

  const handleReturn = async (id: string) => {
    try {
      const success = await returnBorrow(id);
      if (success) {
        messageApi.success('ໝາຍວ່າສົ່ງຄືນເອກະສານແລ້ວ.');
        fetchBorrows({ page, limit, divisionId });
      } else {
        messageApi.error('ບໍ່ສາມາດອັບເດດສະຖານະໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const filteredLogs = borrows.filter(log => {
    const matchesSearch = log.borrower?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.document?.docNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.document?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'BORROWED') return matchesSearch && !log.returnedAt;
    if (statusFilter === 'RETURNED') return matchesSearch && !!log.returnedAt;
    return matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {contextHolder}
      {modalContextHolder}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">ຕິດຕາມເອກະສານ & ປະຫວັດ</h1>
          <p className="text-[#737373] text-sm mt-1">ຕິດຕາມການເຄື່ອນໄຫວ, ການຢືມ, ແລະ ການສົ່ງຄືນເອກະສານ.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 sm:p-5 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col sm:flex-row flex-wrap gap-4 items-center">
        <Input 
          placeholder="ຄົ້ນຫາລະຫັດເອກະສານ, ຜູ້ຢືມ..." 
          prefix={<Search size={16} className="text-[#737373]" />}
          className="w-full sm:max-w-xs rounded-xl bg-white/70 hover:bg-white focus:bg-white border-white/80 transition-all duration-300 [&>input]:h-[38px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          placeholder="ພະແນກ" 
          className="w-full sm:w-56 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[42px]! [&_.ant-select-selection-item]:leading-[40px]! [&_.ant-select-selection-search-input]:h-[42px]!"
          value={divisionId}
          onChange={(value) => setDivisionId(value)}
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={divisionDropdown.map(d => ({ value: Number(d.id), label: d.name }))}
        />
        <Select 
          placeholder="ສະຖານະ" 
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full sm:w-40 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[42px]! [&_.ant-select-selection-item]:leading-[40px]!"
          options={[
            { value: 'ALL', label: 'ສະຖານະທັງໝົດ' },
            { value: 'BORROWED', label: 'ກຳລັງຢືມ' },
            { value: 'RETURNED', label: 'ສົ່ງຄືນແລ້ວ' },
          ]}
        />
      </div>

      {/* Layer 1 Glass Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-4 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
        <div>
          {/* Desktop Header */}
          <div className="hidden xl:grid bg-table-header text-white grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-3">ຫົວຂໍ້ / ເລກທີເອກະສານ</div>
            <div className="col-span-2">ຜູ້ຢືມ</div>
            <div className="col-span-2">ພາກສ່ວນນຳໃຊ້</div>
            <div className="col-span-2">ວັນທີຢືມ</div>
            <div className="col-span-1">ສະຖານະ</div>
            <div className="col-span-2 text-right">ຈັດການ</div>
          </div>
          
          {/* Rows Layer 2 Glass */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-[#185C4D]/20 border-t-[#185C4D] animate-spin mb-4"></div>
              <span className="text-slate-500 font-bold tracking-wide">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-slate-500 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນ</span>
              <span className="text-slate-400 text-sm mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ຕົວຕອງຂໍ້ມູນໃໝ່</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredLogs.map(log => {
                const isReturned = !!log.returnedAt;
                const docTitle = log.document?.title || log.folder?.name || 'ບໍ່ຮູ້';
                const docNo = log.document?.docNo || log.folder?.code || '—';
                const dateBorrowed = log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy') : '—';
                const dateReturned = log.returnedAt ? format(new Date(log.returnedAt), 'dd MMM yyyy') : '—';
                
                return (
                  <div 
                    key={log.id} 
                    className="bg-white/70 backdrop-blur-xl border border-white/90 flex flex-col xl:grid xl:grid-cols-12 gap-y-3 xl:gap-4 xl:items-center py-4 px-4 sm:px-6 rounded-2xl shadow-sm transition-all duration-300 hover:bg-white hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group"
                  >
                    {/* Header for mobile: Title & Status */}
                    <div className="xl:col-span-3 flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold xl:font-semibold text-[#1C1C1E] text-base xl:text-sm line-clamp-2 transition-colors group-hover:text-[#185C4D]">{docTitle}</span>
                        <span className="text-xs text-[#737373] mt-0.5">{docNo}</span>
                      </div>
                      <div className="xl:hidden shrink-0 mt-0.5">
                        <StatusBadge status={isReturned ? 'success' : 'warning'}>
                          {isReturned ? 'ສົ່ງຄືນແລ້ວ' : 'ກຳລັງຢືມ'}
                        </StatusBadge>
                      </div>
                    </div>

                    {/* Mobile Only Divider */}
                    <div className="w-full h-px bg-linear-to-r from-gray-200/40 via-gray-200 to-gray-200/40 xl:hidden my-1"></div>

                    {/* Borrower */}
                    <div className="xl:col-span-2 flex flex-col justify-center gap-0.5 text-sm text-[#1C1C1E] font-medium">
                      <div className="xl:hidden text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><User size={12}/> ຜູ້ຢືມ</div>
                      <span>{log.borrower}</span>
                      {log.createdBy && (
                         <span className="text-[11px] text-gray-500 font-normal">ຜູ້ມອບ: {log.createdBy.firstNameLa || log.createdBy.empCode}</span>
                      )}
                    </div>

                    {/* Division/Purpose */}
                    <div className="xl:col-span-2 flex flex-col">
                      <div className="xl:hidden text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1 xl:mt-0 mb-1 flex items-center gap-1"><MapPin size={12}/> ພາກສ່ວນນຳໃຊ້</div>
                      <span className="text-sm text-[#1C1C1E] font-medium xl:font-normal">{log.toDivision?.name || log.toLocation || '—'}</span>
                      <span className="text-xs text-[#737373] truncate" title={log.purpose || ''}>{log.purpose || '—'}</span>
                    </div>

                    {/* Date */}
                    <div className="xl:col-span-2 flex flex-col">
                      <div className="xl:hidden text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1 xl:mt-0 mb-1 flex items-center gap-1"><Calendar size={12}/> ເວລາ</div>
                      <span className="text-sm text-[#1C1C1E] flex items-center gap-1.5"><ArrowRightLeft size={14} className="text-[#185C4D]" /> {dateBorrowed}</span>
                      {isReturned && (
                        <span className="text-xs text-[#1A7A44] flex items-center gap-1.5 mt-1 font-medium bg-[#1A7A44]/5 w-max px-1.5 py-0.5 rounded"><Clock size={12} className="text-[#1A7A44]"/> {dateReturned}</span>
                      )}
                    </div>

                    {/* Status (Desktop only) */}
                    <div className="hidden xl:block xl:col-span-1">
                      <StatusBadge status={isReturned ? 'success' : 'warning'}>
                        {isReturned ? 'ສົ່ງຄືນແລ້ວ' : 'ກຳລັງຢືມ'}
                      </StatusBadge>
                    </div>

                    {/* Actions */}
                    <div className="xl:col-span-2 flex items-center justify-start xl:justify-end gap-3 mt-2 xl:mt-0 pt-4 xl:pt-0 border-t border-gray-100 xl:border-t-0">
                      <Button 
                        size="small" 
                        type="default"
                        icon={<Eye size={14} />}
                        onClick={() => {
                          setSelectedLog(log as any);
                          setIsModalVisible(true);
                        }}
                        className="text-[#1C1C1E] border-gray-300 hover:text-[#185C4D] hover:border-[#185C4D] hover:bg-[#185C4D]/5 text-xs font-semibold rounded-lg shadow-none flex items-center gap-1 px-3 py-1.5 h-auto transition-colors"
                      >
                        ລາຍລະອຽດ
                      </Button>
                      {!isReturned ? (
                        <Button 
                          onClick={() => {
                            modal.confirm({
                              title: 'ຢືນຢັນການສົ່ງຄືນເອກະສານ',
                              content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການໝາຍເອກະສານນີ້ວ່າສົ່ງຄືນແລ້ວ?',
                              okText: 'ຢືນຢັນ',
                              cancelText: 'ຍົກເລີກ',
                              okButtonProps: { className: 'bg-[#185C4D] hover:!bg-[#14493d] border-none text-white shadow-none' },
                              cancelButtonProps: { className: 'hover:!text-[#185C4D] hover:!border-[#185C4D] shadow-none' },
                              onOk: () => handleReturn(log.id),
                              centered: true,
                              mask: { closable: true },
                            });
                          }} 
                          size="small" 
                          type="primary" 
                          ghost 
                          className="border-[#185C4D] text-[#185C4D] hover:bg-[#185C4D] hover:text-white! text-xs font-semibold rounded-lg shadow-none px-3 py-1.5 h-auto transition-all duration-300"
                        >
                          ໝາຍວ່າສົ່ງຄືນ
                        </Button>
                      ) : (
                        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#1A7A44]/10 rounded-lg text-[#1A7A44] text-xs font-semibold">
                          <CheckCircle2 size={14} /> ສຳເລັດ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && total > 0 && (
            <div className="mt-6 flex justify-end">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={(newPage, newLimit) => {
                  setPage(newPage);
                  if (newLimit !== limit) setLimit(newLimit);
                }}
                showSizeChanger
                showTotal={(total) => `ທັງໝົດ ${total} ລາຍການ`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        title="ລາຍລະອຽດການຢືມເອກະສານ"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {selectedLog && (
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <span className="text-gray-500 text-sm">ເລກທີເອກະສານ: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.document?.docNo || selectedLog.folder?.code || '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ຫົວຂໍ້ເອກະສານ: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.document?.title || selectedLog.folder?.name || '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ຜູ້ຢືມ: </span>
              <span className="font-semibold text-[#1C1C1E]">{selectedLog.borrower}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ຜູ້ມອບ: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.createdBy ? (selectedLog.createdBy.firstNameLa || selectedLog.createdBy.empCode) : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ພາກສ່ວນນຳໃຊ້: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.toDivision?.name || selectedLog.toLocation || '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ຈຸດປະສົງ: </span>
              <span className="font-semibold text-[#1C1C1E]">{selectedLog.purpose || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ວັນທີຢືມ: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.createdAt ? format(new Date(selectedLog.createdAt), 'dd MMM yyyy HH:mm') : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">ສະຖານະ: </span>
              <span className="font-semibold text-[#1C1C1E]">
                {selectedLog.returnedAt ? (
                  <span className="text-[#1A7A44]">ສົ່ງຄືນແລ້ວເມື່ອ: {format(new Date(selectedLog.returnedAt), 'dd MMM yyyy HH:mm')}</span>
                ) : (
                  <span className="text-[#D97706]">ກຳລັງຢືມ</span>
                )}
              </span>
            </div>
            {selectedLog.note && (
              <div>
                <span className="text-gray-500 text-sm">ໝາຍເຫດ: </span>
                <span className="font-semibold text-[#1C1C1E]">{selectedLog.note}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
