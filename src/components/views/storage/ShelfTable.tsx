import React, { useMemo } from 'react';
import { Inbox, Edit2, Trash2, Search, SlidersHorizontal, Layers, ChevronRight, MoreVertical } from 'lucide-react';
import { Button, Input, Select, Dropdown, Badge, Pagination } from 'antd';
import { Shelf } from '@/types/prisma-mapped';

const STATUS_OPTIONS = [
  { value: 'all', label: 'ທັງໝົດ (ສະຖານະ)' },
  { value: 'A', label: 'Active' },
  { value: 'I', label: 'Inactive' },
];

interface ShelfTableProps {
  data: Shelf[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (shelf: Shelf) => void;
  onDelete?: (id: string | number) => void;
  onManage?: (shelf: Shelf) => void;
  filterLocker?: string;
  onFilterLockerChange?: (lockerId: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (status: string) => void;
  lockers?: { id: string; name: string | null; code: string }[];
  warehouses?: { id: string; name: string }[];
  filterWarehouse?: string;
  onFilterWarehouseChange?: (warehouseId: string) => void;
}

export default function ShelfTable({
  data = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
  onManage,
  filterLocker,
  onFilterLockerChange,
  filterStatus = 'all',
  onFilterStatusChange,
  lockers = [],
  warehouses = [],
  filterWarehouse,
  onFilterWarehouseChange,
}: ShelfTableProps) {

  const lockerOptions = useMemo(() => [
    { value: 'all', label: 'ທັງໝົດ (ຕູ້)' },
    ...lockers.map(l => ({ value: l.id, label: l.name || l.code }))
  ], [lockers]);

  const warehouseOptions = useMemo(() => [
    { value: 'all', label: 'ທັງໝົດ (ສາງ)' },
    ...warehouses.map(w => ({ value: w.id, label: w.name }))
  ], [warehouses]);

  return (
    <div className="w-full flex flex-col gap-6 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນຊັ້ນວາງ">
      {/* Filter / Search Bar - Level 1 Glass */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-[24px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-wrap gap-4 items-center">
        <Input 
          placeholder="ຄົ້ນຫາຊື່ຊັ້ນວາງ..." 
          prefix={<Search size={16} className="text-[#737373] mr-1" />}
          className="flex-1 min-w-[240px] max-w-xs rounded-xl bg-white/70 hover:bg-white focus-within:bg-white border-white/80 h-[40px]"
          value={searchName}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
        <div className="flex items-center gap-3 shrink-0">
          <SlidersHorizontal size={16} className="text-slate-400" />
          {warehouses.length > 0 && (
            <Select 
              value={filterWarehouse || 'all'}
              onChange={onFilterWarehouseChange}
              options={warehouseOptions}
              className="min-w-[160px] h-[40px] [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
            />
          )}
          <Select 
            value={filterLocker || 'all'}
            onChange={onFilterLockerChange}
            options={lockerOptions}
            className="min-w-[160px] h-[40px] [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          />
          <Select 
            value={filterStatus}
            onChange={onFilterStatusChange}
            options={STATUS_OPTIONS}
            className="min-w-[160px] h-[40px] [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          />
        </div>
        
        <div className="ml-auto flex items-center gap-2 text-[14px] font-bold bg-white/60 px-4 py-2 rounded-xl border border-white/80 text-[#1C1C1E]">
          ທັງໝົດ <span className="text-[#185C4D] text-base">{total}</span> ລາຍການ
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
            <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center text-slate-300 shadow-soft">
            <Inbox size={32} strokeWidth={1.5} />
          </div>
          <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນຊັ້ນວາງໃນລະບົບ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map(item => {
              // @ts-ignore - Handle remainingQty dynamically in case type is not fully mapped
              const maxQty = item.maxQty || 0;
              // @ts-ignore
              const remainingQty = item.remainingQty ?? maxQty;
              const docCount = maxQty - remainingQty;
              const percentFull = maxQty > 0 ? (docCount / maxQty) * 100 : 0;
              const isFull = percentFull >= 100;

              const lockerName = lockers.find(l => l.id === item.lockerId)?.name || lockers.find(l => l.id === item.lockerId)?.code || 'Locker ບໍ່ລະບຸ';

              return (
                <div 
                  key={item.id} 
                  className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-[24px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => onManage?.(item)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/60 rounded-xl text-[#185C4D] shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Layers size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1C1C1E]">{item.name}</h3>
                        <p className="text-xs text-[#737373] truncate w-32" title={lockerName}>{lockerName}</p>
                      </div>
                    </div>
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown 
                        menu={{ 
                          items: [
                            {
                              key: 'manage',
                              icon: <ChevronRight size={16} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[14px]">ຈັດການແຟ້ມ</span>,
                              onClick: () => onManage?.(item),
                            },
                            { type: 'divider', className: 'my-1.5 border-slate-100' },
                            {
                              key: 'edit',
                              icon: <Edit2 size={16} className="text-blue-500" />,
                              label: <span className="text-slate-700 font-medium text-[14px]">ແກ້ໄຂຂໍ້ມູນ</span>,
                              onClick: () => onEdit(item),
                            },
                            {
                              key: 'delete',
                              icon: <Trash2 size={16} className="text-rose-500" />,
                              label: <span className="text-rose-500 font-medium text-[14px]">ລຶບຂໍ້ມູນ</span>,
                              onClick: () => onDelete?.(item.id),
                            }
                          ],
                          className: "min-w-[180px] p-2 rounded-2xl border border-white/60 shadow-glass bg-white/80 backdrop-blur-xl"
                        }} 
                        trigger={['click']} 
                        placement="bottomRight"
                      >
                        <Button 
                          type="text" 
                          size="small" 
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/80 shadow-sm border border-transparent hover:border-slate-200/30 transition-all" 
                          icon={<MoreVertical size={16} className="text-[#737373]" />} 
                        />
                      </Dropdown>
                    </div>
                  </div>
                  
                  {/* Inner Details - Level 2 Glass */}
                  <div className="bg-white/60 backdrop-blur-lg border border-white/80 p-3 rounded-2xl shadow-sm mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-[#737373]">ຄວາມຈຸສູງສຸດ</span>
                      <span className="text-xs font-bold text-[#1C1C1E]">{docCount} / {maxQty} ແຟ້ມ</span>
                    </div>
                    <div className="w-full bg-[#E2D3B8]/30 rounded-full h-1.5 mb-3">
                      <div 
                        className={`h-1.5 rounded-full ${isFull ? 'bg-[#B83131]' : 'bg-[#185C4D]'}`} 
                        style={{ width: `${Math.min(percentFull, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge 
                        status={item.status === 'A' ? 'success' : 'error'} 
                        text={<span className="text-xs font-medium text-[#1C1C1E]">{item.status === 'A' ? 'Active' : 'Inactive'}</span>} 
                      />
                      <Button type="link" size="small" icon={<ChevronRight size={14} />} className="text-[#185C4D] p-0 font-medium text-xs">ເປີດຊັ້ນວາງ</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-4">
            <Pagination
              current={currentPage}
              pageSize={5}
              total={total}
              onChange={onPageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

