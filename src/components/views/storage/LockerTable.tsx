import React from 'react';
import { Layout as LockerIcon, Edit2, Trash2, Search, SlidersHorizontal, ChevronRight, MoreVertical, ArrowRightLeft } from 'lucide-react';
import { Button, Input, Select, Tooltip, Dropdown, Pagination } from 'antd';
import { Locker } from '@/types/prisma-mapped';

interface LockerTableProps {
  data: Locker[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (locker: Locker) => void;
  onDelete?: (id: string | number) => void;
  onManage?: (locker: Locker) => void;
  onMove?: (locker: Locker) => void;
  departmentOptions?: { value: string; label: string }[];
  filterDepartment?: string;
  onFilterDepartmentChange?: (departmentId: string) => void;
  divisionOptions?: { value: string; label: string }[];
  filterDivision?: string;
  onFilterDivisionChange?: (divisionId: string) => void;
  warehouseOptions?: { value: string; label: string }[];
  filterWarehouse?: string;
  onFilterWarehouseChange?: (warehouseId: string) => void;
  hideFilters?: boolean;
}

export default function LockerTable({
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
  onMove,
  departmentOptions = [],
  filterDepartment,
  onFilterDepartmentChange,
  divisionOptions = [],
  filterDivision,
  onFilterDivisionChange,
  warehouseOptions = [],
  filterWarehouse,
  onFilterWarehouseChange,
  hideFilters = false,
}: LockerTableProps) {

  return (
    <section className="w-full flex flex-col gap-6 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນລັອກເກີ">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 rounded-[24px] shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດລັອກເກີ..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="w-full md:flex-1 min-w-[240px] md:max-w-[320px] rounded-[16px] bg-white/60 border-white/80 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] h-[48px]"
          />

          {!hideFilters && (
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <SlidersHorizontal size={16} className="text-slate-400 mr-1 hidden sm:block" />
              <Select
                value={filterDepartment || 'all'}
                onChange={onFilterDepartmentChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ຝ່າຍ)' }, ...departmentOptions]}
                size="large"
                className="w-full sm:min-w-[170px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
              />
              <Select
                value={filterDivision || 'all'}
                onChange={onFilterDivisionChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ພະແນກ)' }, ...divisionOptions]}
                size="large"
                className="w-full sm:min-w-[170px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
                disabled={divisionOptions.length === 0 && !!filterDepartment && filterDepartment !== 'all'}
              />
              <Select
                value={filterWarehouse || 'all'}
                onChange={onFilterWarehouseChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ສາງ)' }, ...warehouseOptions]}
                size="large"
                className="w-full sm:min-w-[170px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
                disabled={warehouseOptions.length === 0 && !!filterDepartment && filterDepartment !== 'all'}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[15px] font-bold bg-[#185C4D]/5 px-5 py-3 rounded-[16px] border border-[#185C4D]/10 text-[#185C4D] shrink-0">
          ທັງໝົດ <span className="text-lg font-black mx-0.5">{total}</span> ລາຍການ
        </div>
      </header>

      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-[32px] shadow-glass overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="bg-table-header text-white grid grid-cols-12 gap-4 py-5 px-8 rounded-2xl shadow-md mb-5 text-[14px] font-bold tracking-wider uppercase">
            <div className="col-span-2">ລະຫັດລັອກເກີ</div>
            <div className="col-span-3">ຊື່ລັອກເກີ</div>
            <div className="col-span-2">ສາງທີ່ຕັ້ງຢູ່</div>
            <div className="col-span-4">ລາຍລະອຽດ</div>
            <div className="col-span-1 text-center">ຈັດການ</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white/20 rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
                <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/20 rounded-2xl border border-dashed border-white/40">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shadow-soft">
                <LockerIcon className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນລັອກເກີໃນລະບົບ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map(item => (
                <div
                  key={item.id}
                  className="group bg-white/50 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-5 px-8 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-glass cursor-pointer"
                  onClick={() => onManage?.(item)}
                >
                  <div className="col-span-2">
                    <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/60 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm">
                      {item.code}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500/10 to-emerald-600/10 flex items-center justify-center shrink-0 border border-teal-200/30 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <LockerIcon className="text-teal-600 w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-slate-800 text-[15px] truncate">{item.name || 'ບໍ່ມີຊື່'}</span>
                  </div>

                  <div className="col-span-2 flex flex-col items-start gap-1">
                    <span className="text-slate-600 text-[14px] font-bold bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100/50 shadow-sm inline-block">
                      {(item as any).warehouse?.name || warehouseOptions.find(w => w.value === item.warehouseId)?.label || '—'}
                    </span>

                  </div>

                  <div className="col-span-4 pr-4">
                    <span className="text-slate-500 text-[14px] font-medium line-clamp-2 leading-relaxed">{item.description || 'ບໍ່ມີລາຍລະອຽດ'}</span>
                  </div>

                  <div className="col-span-1 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'manage',
                            icon: <ChevronRight size={18} className="text-[#185C4D]" />,
                            label: <span className="text-[#185C4D] font-bold text-[15px]">ຈັດການຊັ້ນວາງ</span>,
                            onClick: () => onManage?.(item),
                          },
                          {
                            key: 'move',
                            icon: <ArrowRightLeft size={18} className="text-[#185C4D]" />,
                            label: <span className="text-[#185C4D] font-bold text-[15px]">ຍ້າຍສາງ</span>,
                            onClick: () => onMove?.(item),
                          },
                          {
                            type: 'divider',
                            className: 'my-1.5 border-slate-100',
                          },
                          {
                            key: 'edit',
                            icon: <Edit2 size={18} className="text-blue-500" />,
                            label: <span className="text-slate-700 font-medium text-[14px]">ແກ້ໄຂຂໍ້ມູນ</span>,
                            onClick: () => onEdit(item),
                          },
                          {
                            key: 'delete',
                            icon: <Trash2 size={18} className="text-rose-500" />,
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#185C4D]/5 transition-all duration-300 shadow-sm border border-slate-200/30 bg-white/80 hover:border-[#185C4D]/30 group/btn"
                        icon={<MoreVertical size={20} className="text-slate-400 group-hover/btn:text-[#185C4D] transition-colors" />}
                      />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && data.length > 0 && (
            <div className="flex justify-end mt-6">
              <Pagination
                current={currentPage}
                pageSize={5}
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

