"use client";

import React, { useState, useEffect } from 'react';
import { Input, Select, Button, message, Pagination, Modal, DatePicker } from 'antd';
import { Search, Clock, ArrowRightLeft, Eye, User, MapPin, Calendar, CheckCircle2, Phone, FileText, X, BookOpen } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { format } from 'date-fns';
import { DocumentBorrow } from '@/types/prisma-mapped';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

export default function TrackingLogView() {
  const { borrows, total, fetchBorrows, returnBorrow, isLoading } = useDocumentBorrowStore();
  const { divisionDropdown, fetchDropdown } = useDivisionStore();
  
  // Local UI filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // API Query parameters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [divisionId, setDivisionId] = useState<number | undefined>(undefined);
  const [borrowedRange, setBorrowedRange] = useState<any>(null);
  const [returnedRange, setReturnedRange] = useState<any>(null);

  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [selectedLog, setSelectedLog] = useState<DocumentBorrow | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Reset pagination page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [divisionId, statusFilter, borrowedRange, returnedRange]);

  // Fetch borrows from API on filter changes
  useEffect(() => {
    const params: any = {
      page,
      limit,
      divisionId,
    };

    if (borrowedRange && borrowedRange[0] && borrowedRange[1]) {
      params.borrowedAt = borrowedRange[0].format('YYYY-MM-DD');
    }

    if (returnedRange && returnedRange[0] && returnedRange[1]) {
      params.returnedAt = returnedRange[0].format('YYYY-MM-DD');
    }

    fetchBorrows(params);
  }, [fetchBorrows, page, limit, divisionId, statusFilter, borrowedRange, returnedRange]);

  useEffect(() => {
    fetchDropdown();
  }, [fetchDropdown]);

  const handleReturn = async (id: string) => {
    try {
      const success = await returnBorrow(id);
      if (success) {
        messageApi.success('ໝາຍວ່າສົ່ງຄືນເອກະສານແລ້ວ.');
        
        // Refresh with active params
        const params: any = {
          page,
          limit,
          divisionId,
        };
        if (borrowedRange && borrowedRange[0] && borrowedRange[1]) params.borrowedAt = borrowedRange[0].format('YYYY-MM-DD');
        if (returnedRange && returnedRange[0] && returnedRange[1]) params.returnedAt = returnedRange[0].format('YYYY-MM-DD');
        fetchBorrows(params);
      } else {
        messageApi.error('ບໍ່ສາມາດອັບເດດສະຖານະໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const filteredLogs = borrows.filter(log => {
    // Soft local fallback search
    const matchesSearch = !searchTerm || 
                          log.borrower?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.document?.docNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.document?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status fallback checking
    const isReturned = log.status === 'RETURNED' || !!log.returnedAt;
    const isOverdue = !isReturned && !!log.dueDate && new Date(log.dueDate) < new Date();

    let matchesStatus = true;
    if (statusFilter === 'BORROWED') matchesStatus = !isReturned;
    else if (statusFilter === 'RETURNED') matchesStatus = isReturned;
    else if (statusFilter === 'OVERDUE') matchesStatus = isOverdue;

    // Date range fallback filter
    const borrowedDateObj = log.borrowedAt || log.createdAt;
    const matchesBorrowedRange = !borrowedRange || !borrowedRange[0] || !borrowedRange[1] || (
      borrowedDateObj &&
      dayjs(borrowedDateObj).isAfter(borrowedRange[0].startOf('day')) &&
      dayjs(borrowedDateObj).isBefore(borrowedRange[1].endOf('day'))
    );

    const matchesReturnedRange = !returnedRange || !returnedRange[0] || !returnedRange[1] || (
      log.returnedAt &&
      dayjs(log.returnedAt).isAfter(returnedRange[0].startOf('day')) &&
      dayjs(log.returnedAt).isBefore(returnedRange[1].endOf('day'))
    );

    return matchesSearch && matchesStatus && matchesBorrowedRange && matchesReturnedRange;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {contextHolder}
      {modalContextHolder}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">ຕິດຕາມປະຫວັດການຢືມເອກະສານ</h1>
          <p className="text-[#737373] text-sm mt-1">ຕິດຕາມ, ຈັດການການເຄື່ອນໄຫວ, ການຢືມ, ແລະ ການສົ່ງຄືນເອກະສານ.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 sm:p-5 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center w-full">
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
              { value: 'OVERDUE', label: 'ກາຍກຳນົດສົ່ງ' },
            ]}
          />
          <DatePicker.RangePicker
            placeholder={['ເລີ່ມວັນທີຢືມ', 'ຫາວັນທີຢືມ']}
            className="w-full sm:w-64 [&_.ant-picker-input_input]:text-slate-800 [&_.ant-picker-input_input]:font-medium h-[42px] rounded-xl bg-white/70 border-white/80"
            value={borrowedRange}
            onChange={(dates) => setBorrowedRange(dates)}
            allowClear
          />
          <DatePicker.RangePicker
            placeholder={['ເລີ່ມວັນທີສົ່ງຄືນ', 'ຫາວັນທີສົ່ງຄືນ']}
            className="w-full sm:w-64 [&_.ant-picker-input_input]:text-slate-800 [&_.ant-picker-input_input]:font-medium h-[42px] rounded-xl bg-white/70 border-white/80"
            value={returnedRange}
            onChange={(dates) => setReturnedRange(dates)}
            allowClear
          />
        </div>
      </div>

      {/* Layer 1 Glass Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-4 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
        <div>
          {/* Desktop Header */}
          <div className="hidden xl:grid bg-table-header text-white grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-3">ຫົວຂໍ້ / ເລກທີເອກະສານ</div>
            <div className="col-span-2">ຜູ້ຢືມ</div>
            <div className="col-span-2">ພາກສ່ວນນຳໃຊ້</div>
            <div className="col-span-2">ວັນທີຢືມ & ກຳນົດສົ່ງ</div>
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
                const isReturned = log.status === 'RETURNED' || !!log.returnedAt;
                const isOverdue = !isReturned && !!log.dueDate && new Date(log.dueDate) < new Date();
                const docTitle = log.document?.title || log.folder?.name || 'ບໍ່ຮູ້';
                const docNo = log.document?.docNo || log.folder?.code || '—';
                
                const borrowedDateObj = log.borrowedAt || log.createdAt;
                const dateBorrowed = borrowedDateObj ? format(new Date(borrowedDateObj), 'dd MMM yyyy') : '—';
                const dateReturned = log.returnedAt ? format(new Date(log.returnedAt), 'dd MMM yyyy') : '—';
                const dueDateFormatted = log.dueDate ? format(new Date(log.dueDate), 'dd MMM yyyy') : '—';
                
                return (
                  <div 
                    key={log.id} 
                    className={cn(
                      "bg-white/70 backdrop-blur-xl border flex flex-col xl:grid xl:grid-cols-12 gap-y-3 xl:gap-4 xl:items-center py-4 px-4 sm:px-6 rounded-2xl shadow-sm transition-all duration-300 hover:bg-white hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group",
                      isOverdue ? "border-rose-200 bg-rose-50/10 hover:border-rose-300" : "border-white/90"
                    )}
                  >
                    {/* Header for mobile: Title & Status */}
                    <div className="xl:col-span-3 flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold xl:font-semibold text-[#1C1C1E] text-base xl:text-sm line-clamp-2 transition-colors group-hover:text-[#185C4D]">{docTitle}</span>
                        <span className="text-xs text-[#737373] mt-0.5">{docNo}</span>
                      </div>
                      <div className="xl:hidden shrink-0 mt-0.5">
                        <StatusBadge status={isReturned ? 'success' : isOverdue ? 'danger' : 'warning'}>
                          {isReturned ? 'ສົ່ງຄືນແລ້ວ' : isOverdue ? 'ກາຍກຳນົດສົ່ງ' : 'ກຳລັງຢືມ'}
                        </StatusBadge>
                      </div>
                    </div>

                    {/* Mobile Only Divider */}
                    <div className="w-full h-px bg-linear-to-r from-gray-200/40 via-gray-200 to-gray-200/40 xl:hidden my-1"></div>

                    {/* Borrower */}
                    <div className="xl:col-span-2 flex flex-col justify-center gap-0.5 text-sm text-[#1C1C1E] font-medium">
                      <div className="xl:hidden text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><User size={12}/> ຜູ້ຢືມ</div>
                      <span className="font-semibold text-slate-800">{log.borrower}</span>
                      {log.phone && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} className="text-slate-400" /> {log.phone}
                        </span>
                      )}
                      {log.createdBy && (
                         <span className="text-[11px] text-gray-400 font-normal">ຜູ້ມອບ: {log.createdBy.firstNameLa || log.createdBy.empCode}</span>
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
                      {log.dueDate && (
                        <span className={cn(
                          "text-xs flex items-center gap-1 mt-1 font-semibold px-2 py-0.5 rounded w-max",
                          isReturned
                            ? "bg-slate-100 text-slate-500"
                            : isOverdue
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}>
                          <Calendar size={12} />
                          {isReturned ? "ກຳນົດ: " : isOverdue ? "ກາຍກຳນົດ: " : "ກຳນົດສົ່ງ: "} {dueDateFormatted}
                        </span>
                      )}
                      {isReturned && (
                        <span className="text-xs text-[#1A7A44] flex items-center gap-1.5 mt-1 font-medium bg-[#1A7A44]/5 w-max px-2 py-0.5 rounded"><Clock size={12} className="text-[#1A7A44]"/> ສົ່ງຄືນ: {dateReturned}</span>
                      )}
                    </div>

                    {/* Status (Desktop only) */}
                    <div className="hidden xl:block xl:col-span-1">
                      <StatusBadge status={isReturned ? 'success' : isOverdue ? 'danger' : 'warning'}>
                        {isReturned ? 'ສົ່ງຄືນແລ້ວ' : isOverdue ? 'ກາຍກຳນົດສົ່ງ' : 'ກຳລັງຢືມ'}
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={600}
        centered
        title={null}
        closable={false}
        className={cn(
          '[&_.ant-modal-content]:p-0',
          '[&_.ant-modal-content]:bg-transparent',
          '[&_.ant-modal-content]:shadow-none',
          '[&_.ant-modal-content]:rounded-[32px]'
        )}
        wrapClassName="backdrop-blur-md"
      >
        {selectedLog && (() => {
          const isReturned = selectedLog.status === 'RETURNED' || !!selectedLog.returnedAt;
          const isOverdue = !isReturned && !!selectedLog.dueDate && new Date(selectedLog.dueDate) < new Date();
          
          const borrowedDateObj = selectedLog.borrowedAt || selectedLog.createdAt;

          return (
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
                
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 border-none bg-transparent cursor-pointer"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
                    <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl tracking-tight leading-tight">
                      ລາຍລະອຽດການຢືມເອກະສານ
                    </h2>
                    <div className="mt-2">
                      <StatusBadge status={isReturned ? 'success' : isOverdue ? 'danger' : 'warning'}>
                        {isReturned ? 'ສົ່ງຄືນແລ້ວ' : isOverdue ? 'ກາຍກຳນົດສົ່ງ' : 'ກຳລັງຢືມ'}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              </header>

              {/* Body */}
              <main className="px-10 py-8 -mt-8 bg-white/80 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10 space-y-6">
                
                {/* Document Section */}
                <div className="bg-white/60 border border-white/80 rounded-2xl p-4 shadow-xs">
                  <h3 className="text-[10px] text-[#185C4D] font-black uppercase tracking-wider mb-2">ຂໍ້ມູນເອກະສານ</h3>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-700 text-sm">{selectedLog.document?.title || selectedLog.folder?.name || '—'}</div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">ເລກທີ: {selectedLog.document?.docNo || selectedLog.folder?.code || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Borrower Section */}
                <div className="bg-white/60 border border-white/80 rounded-2xl p-4 shadow-xs space-y-3">
                  <h3 className="text-[10px] text-[#185C4D] font-black uppercase tracking-wider">ຂໍ້ມູນຜູ້ຢືມ & ພາກສ່ວນ</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">ຜູ້ຢືມ:</span>
                      <span className="font-bold text-slate-700 text-sm">{selectedLog.borrower}</span>
                    </div>
                    {selectedLog.phone && (
                      <div>
                        <span className="text-slate-400 block mb-0.5">ເບີໂທລະສັບ:</span>
                        <span className="font-bold text-slate-700 text-sm flex items-center gap-1"><Phone size={12}/> {selectedLog.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block mb-0.5">ພາກສ່ວນ/ພະແນກ:</span>
                      <span className="font-bold text-slate-700">{selectedLog.toDivision?.name || selectedLog.toLocation || '—'}</span>
                    </div>
                    {selectedLog.createdBy && (
                      <div>
                        <span className="text-slate-400 block mb-0.5">ຜູ້ມອບ/ຜູ້ບັນທຶກ:</span>
                        <span className="font-bold text-slate-700">{selectedLog.createdBy.firstNameLa || selectedLog.createdBy.empCode}</span>
                      </div>
                    )}
                  </div>
                  {selectedLog.purpose && (
                    <div className="border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-400 block mb-1">ຈຸດປະສົງ:</span>
                      <p className="text-slate-600 bg-slate-50/50 rounded-lg p-2.5 font-medium leading-relaxed">{selectedLog.purpose}</p>
                    </div>
                  )}
                  {selectedLog.note && (
                    <div className="border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-400 block mb-1">ໝາຍເຫດ:</span>
                      <p className="text-slate-500 bg-slate-50/50 rounded-lg p-2.5 italic leading-relaxed">{selectedLog.note}</p>
                    </div>
                  )}
                </div>

                {/* Timeline Section */}
                <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-[10px] text-[#185C4D] font-black uppercase tracking-wider mb-4">ຕິດຕາມສະຖານະການຢືມ</h3>
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
                    {selectedLog.dueDate && (
                      <div className="relative flex gap-3">
                        <div className={cn(
                          "absolute left-[-21px] mt-1.5 w-[12px] h-[12px] rounded-full border-2 border-white shadow-xs",
                          isReturned ? "bg-slate-400" : isOverdue ? "bg-rose-500" : "bg-amber-500"
                        )}></div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ກຳນົດສົ່ງຄືນ</div>
                          <div className={cn("text-xs font-bold mt-0.5", isOverdue && !isReturned ? "text-rose-600 animate-pulse" : "text-slate-700")}>
                            {format(new Date(selectedLog.dueDate), 'dd MMM yyyy')}
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
                          {selectedLog.returnedAt ? (
                            <span className="text-emerald-600">
                              {format(new Date(selectedLog.returnedAt), 'dd MMM yyyy HH:mm')}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">ຍັງບໍ່ທັນສົ່ງຄືນ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <footer className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button
                    onClick={() => setIsModalVisible(false)}
                    className="h-11 px-6 rounded-xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all cursor-pointer"
                  >
                    ປິດ
                  </Button>
                  {!isReturned && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setIsModalVisible(false);
                        modal.confirm({
                          title: 'ຢືນຢັນການສົ່ງຄືນເອກະສານ',
                          content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການໝາຍເອກະສານນີ້ວ່າສົ່ງຄືນແລ້ວ?',
                          okText: 'ຢືນຢັນ',
                          cancelText: 'ຍົກເລີກ',
                          okButtonProps: { className: 'bg-[#185C4D] hover:!bg-[#14493d] border-none text-white shadow-none' },
                          cancelButtonProps: { className: 'hover:!text-[#185C4D] hover:!border-[#185C4D] shadow-none' },
                          onOk: () => handleReturn(selectedLog.id),
                          centered: true,
                          mask: { closable: true },
                        });
                      }}
                      className="h-11 px-6 rounded-xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-md hover:shadow-lg transition-all border-none text-white flex items-center gap-2 cursor-pointer"
                    >
                      ໝາຍວ່າສົ່ງຄືນແລ້ວ <CheckCircle2 size={16} />
                    </Button>
                  )}
                </footer>
              </main>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
