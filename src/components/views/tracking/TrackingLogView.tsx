"use client";
import React, { useState, useEffect } from 'react';
import { Input, Select, Badge, Button, message } from 'antd';
import { Search, Filter, Clock, ArrowRightLeft } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { format } from 'date-fns';
import { DocumentBorrow } from '@/types/prisma-mapped';

export default function TrackingLogView() {
  const { borrows, fetchBorrows, returnBorrow, isLoading } = useDocumentBorrowStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  const handleReturn = async (id: string) => {
    try {
      const success = await returnBorrow(id);
      if (success) {
        messageApi.success('Marked document as returned.');
        fetchBorrows();
      } else {
        messageApi.error('Failed to update status.');
      }
    } catch (error) {
      messageApi.error('System error occurred.');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Tracking & Logs</h1>
          <p className="text-[#737373] text-sm mt-1">Monitor document movements, borrowing, and returns.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-wrap gap-4 items-center">
        <Input 
          placeholder="Search Document ID, Borrower..." 
          prefix={<Search size={16} className="text-[#737373]" />}
          className="max-w-xs rounded-xl bg-white/70 hover:bg-white focus:bg-white border-white/80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          placeholder="Status" 
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-32 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'BORROWED', label: 'Borrowed' },
            { value: 'RETURNED', label: 'Returned' },
          ]}
        />
      </div>

      {/* Layer 1 Glass Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="bg-table-header text-white grid grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-3">Document / Folder</div>
            <div className="col-span-2">Borrower</div>
            <div className="col-span-2">Location / Party</div>
            <div className="col-span-2">Borrow Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {/* Rows Layer 2 Glass */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
              <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
              <span className="text-slate-500 font-bold">ບໍ່ພົບຂໍ້ມູນ</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredLogs.map(log => {
                const isReturned = !!log.returnedAt;
                const docTitle = log.document?.title || log.folder?.name || 'Unknown';
                const docNo = log.document?.docNo || log.folder?.code || '—';
                const dateBorrowed = log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy') : '—';
                const dateReturned = log.returnedAt ? format(new Date(log.returnedAt), 'dd MMM yyyy') : '—';
                
                return (
                  <div 
                    key={log.id} 
                    className="bg-white/60 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4 px-6 rounded-2xl shadow-sm transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-sm"
                  >
                    <div className="col-span-3 flex flex-col">
                      <span className="font-semibold text-[#1C1C1E]">{docTitle}</span>
                      <span className="text-xs text-[#737373]">{docNo}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm text-[#1C1C1E] font-medium">
                      {log.borrower}
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="text-sm text-[#1C1C1E]">{log.toLocation || '—'}</span>
                      <span className="text-xs text-[#737373] truncate" title={log.purpose || ''}>{log.purpose || '—'}</span>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="text-sm text-[#1C1C1E] flex items-center gap-1"><ArrowRightLeft size={12} className="text-[#185C4D]" /> {dateBorrowed}</span>
                      {isReturned && (
                        <span className="text-xs text-[#1A7A44] flex items-center gap-1 mt-0.5 font-medium"><Clock size={12} className="text-[#1A7A44]"/> Returned: {dateReturned}</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <StatusBadge status={isReturned ? 'success' : 'warning'}>
                        {isReturned ? 'RETURNED' : 'BORROWED'}
                      </StatusBadge>
                    </div>
                    <div className="col-span-2 text-right">
                      {!isReturned ? (
                        <Button onClick={() => handleReturn(log.id)} size="small" type="primary" ghost className="border-[#185C4D] text-[#185C4D] hover:bg-[#185C4D]/10 text-xs font-semibold rounded-lg shadow-none">
                          Mark Returned
                        </Button>
                      ) : (
                        <span className="text-xs text-[#737373] font-medium">Done</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
