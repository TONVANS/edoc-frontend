import React, { useMemo } from 'react';
import { Inbox, Edit2, Trash2, Search, SlidersHorizontal, Layers, ChevronRight, MoreVertical } from 'lucide-react';
import { Button, Input, Select, Dropdown, Badge, Pagination } from 'antd';
import { Shelf } from '@/types/prisma-mapped';

interface ShelfTableProps {
  data: Shelf[];
  total: number;
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (shelf: Shelf) => void;
  onDelete?: (id: string | number) => void;
  onManage?: (shelf: Shelf) => void;
  departmentOptions?: { value: string; label: string }[];
  filterDepartment?: string;
  onFilterDepartmentChange?: (departmentId: string) => void;
  divisionOptions?: { value: string; label: string }[];
  filterDivision?: string;
  onFilterDivisionChange?: (divisionId: string) => void;
  warehouses?: { id: string | number; name: string }[];
  filterWarehouse?: string;
  onFilterWarehouseChange?: (warehouseId: string) => void;
  lockers?: { id: string | number; name: string | null; code?: string }[];
  filterLocker?: string;
  onFilterLockerChange?: (lockerId: string) => void;
  hideFilters?: boolean;
}

export default function ShelfTable({
  data = [],
  total = 0,
  currentPage = 1,
  pageSize = 8,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
  onManage,
  departmentOptions = [],
  filterDepartment,
  onFilterDepartmentChange,
  divisionOptions = [],
  filterDivision,
  onFilterDivisionChange,
  warehouses = [],
  filterWarehouse,
  onFilterWarehouseChange,
  lockers = [],
  filterLocker,
  onFilterLockerChange,
  hideFilters = false,
}: ShelfTableProps) {

  const lockerOptions = useMemo(() => [
    { value: 'all', label: 'ທັງໝົດ (ຕູ້)' },
    ...lockers.map(l => ({ value: String(l.id), label: l.name || l.code }))
  ], [lockers]);

  const warehouseOptions = useMemo(() => [
    { value: 'all', label: 'ທັງໝົດ (ສາງ)' },
    ...warehouses.map(w => ({ value: String(w.id), label: w.name }))
  ], [warehouses]);

  return (
    <div className="w-full flex flex-col gap-6 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນຊັ້ນວາງ">
      {/* Filter / Search Bar - Level 1 Glass */}
      <div className="flex flex-col gap-5 bg-white/40 backdrop-blur-xl p-5 rounded-3xl shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາຊື່ຊັ້ນວາງ..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="flex-1 min-w-70 max-w-125 rounded-3xl bg-white/70 border-white hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D]/30 focus-within:shadow-md h-12"
          />

          <div className="flex items-center gap-3 text-[14px] font-medium bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white shadow-sm shrink-0 hover:bg-white transition-colors duration-300">
            <div className="flex items-center gap-2 text-slate-500">
              <Layers size={16} className="text-[#185C4D]" />
              <span>ລາຍການຊັ້ນວາງທັງໝົດ</span>
            </div>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#185C4D] leading-none">{total}</span>
              <span className="text-slate-500 text-[13px]">ຊັ້ນ</span>
            </div>
          </div>
        </div>

        {!hideFilters && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#185C4D]/10 to-[#185C4D]/5 flex items-center justify-center shrink-0 border border-[#185C4D]/10">
                <SlidersHorizontal size={14} className="text-[#185C4D]" />
              </div>
              <span className="text-[14px] font-bold text-slate-700">ຕົວກອງຂໍ້ມູນ</span>
              <div className="h-px flex-1 bg-linear-to-r from-slate-200/80 via-slate-200/40 to-transparent ml-2"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                value={filterDepartment || 'all'}
                onChange={onFilterDepartmentChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ຝ່າຍ)' }, ...departmentOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
              />
              <Select
                value={filterDivision || 'all'}
                onChange={onFilterDivisionChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ພະແນກ)' }, ...divisionOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                disabled={divisionOptions.length === 0 && !!filterDepartment && filterDepartment !== 'all'}
              />
              {warehouses.length > 0 && (
                <Select
                  value={filterWarehouse || 'all'}
                  onChange={onFilterWarehouseChange}
                  options={warehouseOptions}
                  size="large"
                  className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                  disabled={warehouseOptions.length === 1 && !!filterDivision && filterDivision !== 'all'}
                />
              )}
              <Select
                value={filterLocker || 'all'}
                onChange={onFilterLockerChange}
                options={lockerOptions}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                disabled={lockerOptions.length === 1 && !!filterWarehouse && filterWarehouse !== 'all'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-4xl shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
            <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-4xl shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
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

              const itemAny = item as any;
              const lockerName = itemAny.locker?.name || itemAny.locker?.code || lockers.find(l => l.id === item.lockerId)?.name || lockers.find(l => l.id === item.lockerId)?.code || 'Locker ບໍ່ລະບຸ';
              const warehouseName = itemAny.locker?.warehouse?.name;

              return (
                <div
                  key={item.id}
                  className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => onManage?.(item)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/60 rounded-xl text-[#185C4D] shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Layers size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1C1C1E]">{item.name}</h3>
                        <p className="text-xs text-[#737373] truncate w-40" title={warehouseName ? `${warehouseName} > ${lockerName}` : lockerName}>
                          {warehouseName ? `${warehouseName} > ` : ''}{lockerName}
                        </p>
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

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] gap-4 transition-all duration-300 hover:shadow-glass">
            <div className="flex items-center gap-2 text-[14px] font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-2xl border border-white/80">
              ສະແດງ
              <span className="font-bold text-slate-700">
                {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>
              ຫາ
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * pageSize, total)}
              </span>
              ຈາກທັງໝົດ
              <span className="font-black text-[#185C4D] text-base">{total}</span>
              ລາຍການ
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={onPageChange}
              showSizeChanger={false}
              className="[&_.ant-pagination-item]:rounded-xl [&_.ant-pagination-item-active]:bg-[#185C4D] [&_.ant-pagination-item-active]:border-[#185C4D] [&_.ant-pagination-item-active]:shadow-md [&_.ant-pagination-item-active_a]:text-white [&_.ant-pagination-item]:border-white/60 [&_.ant-pagination-item]:bg-white/60 [&_.ant-pagination-item]:backdrop-blur-md [&_.ant-pagination-item]:shadow-xs hover:[&_.ant-pagination-item:not(.ant-pagination-item-active)]:bg-white hover:[&_.ant-pagination-item:not(.ant-pagination-item-active)]:border-white [&_.ant-pagination-prev_.ant-pagination-item-link]:rounded-xl [&_.ant-pagination-next_.ant-pagination-item-link]:rounded-xl [&_.ant-pagination-prev_.ant-pagination-item-link]:bg-white/60 [&_.ant-pagination-next_.ant-pagination-item-link]:bg-white/60 [&_.ant-pagination-prev_.ant-pagination-item-link]:border-white/60 [&_.ant-pagination-next_.ant-pagination-item-link]:border-white/60 [&_.ant-pagination-prev_.ant-pagination-item-link]:shadow-xs [&_.ant-pagination-next_.ant-pagination-item-link]:shadow-xs hover:[&_.ant-pagination-prev_.ant-pagination-item-link]:bg-white hover:[&_.ant-pagination-next_.ant-pagination-item-link]:bg-white [&_.ant-pagination-disabled_.ant-pagination-item-link]:opacity-50 [&_.ant-pagination-disabled_.ant-pagination-item-link]:shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

