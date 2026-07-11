import React, { useMemo } from 'react';
import { Folder as FolderIcon, Edit2, Trash2, Search, SlidersHorizontal, QrCode, FileUp, MoreVertical, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { Button, Input, Select, Tooltip, Dropdown, Pagination } from 'antd';
import AddressStatusBadge from '../address/AddressStatusBadge';
import { Folder } from '@/types/prisma-mapped';

interface FolderTableProps {
  data: Folder[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (folder: Folder) => void;
  onDelete?: (id: string | number) => void;
  onUploadDocument?: (folder: Folder) => void;
  onMove?: (folder: Folder) => void;
  addressOptions?: { value: string; label: string }[];
  filterAddress?: string;
  onFilterAddressChange?: (addressId: string) => void;
  warehouseOptions?: { value: string; label: string }[];
  filterWarehouse?: string;
  onFilterWarehouseChange?: (warehouseId: string) => void;
  lockerOptions?: { value: string; label: string }[];
  filterLocker?: string;
  onFilterLockerChange?: (lockerId: string) => void;
  shelves?: { id: string; name: string; code: string }[];
  filterShelf?: string;
  onFilterShelfChange?: (shelfId: string) => void;
  onManage?: (folder: Folder) => void;
  hideFilters?: boolean;
}

export default function FolderTable({
  data = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
  onUploadDocument,
  onMove,
  addressOptions = [],
  filterAddress,
  onFilterAddressChange,
  warehouseOptions = [],
  filterWarehouse,
  onFilterWarehouseChange,
  lockerOptions = [],
  filterLocker,
  onFilterLockerChange,
  shelves = [],
  filterShelf,
  onFilterShelfChange,
  onManage,
  hideFilters = false,
}: FolderTableProps) {

  const shelfOptions = useMemo(() => [
    { value: 'all', label: 'ທັງໝົດ (ຊັ້ນ)' },
    ...shelves.map(s => ({ value: s.id, label: s.name || s.code }))
  ], [shelves]);

  return (
    <section className="w-full flex flex-col gap-6 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນແຟ້ມ">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 rounded-[24px] shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດແຟ້ມ..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="flex-1 min-w-[240px] max-w-[320px] rounded-[16px] bg-white/60 border-white/80 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] h-[48px]"
          />

          {!hideFilters && (
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <SlidersHorizontal size={16} className="text-slate-400 mr-1" />

              <Select
                value={filterAddress || 'all'}
                onChange={onFilterAddressChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ສະຖານທີ່)' }, ...addressOptions]}
                size="large"
                className="min-w-[150px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
              />

              <Select
                value={filterWarehouse || 'all'}
                onChange={onFilterWarehouseChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ສາງ)' }, ...warehouseOptions]}
                size="large"
                className="min-w-[150px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
                disabled={warehouseOptions.length === 0 && !!filterAddress && filterAddress !== 'all'}
              />

              <Select
                value={filterLocker || 'all'}
                onChange={onFilterLockerChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ຕູ້)' }, ...lockerOptions]}
                size="large"
                className="min-w-[150px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
                disabled={lockerOptions.length === 0 && !!filterWarehouse && filterWarehouse !== 'all'}
              />

              <Select
                value={filterShelf || 'all'}
                onChange={onFilterShelfChange}
                options={shelfOptions}
                size="large"
                className="min-w-[150px] [&_.ant-select-selector]:rounded-[16px]! shadow-sm [&_.ant-select-selector]:h-[48px]! [&_.ant-select-selection-item]:leading-[46px]!"
                disabled={shelves.length === 0 && !!filterLocker && filterLocker !== 'all'}
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
            <div className="col-span-2">ລະຫັດແຟ້ມ</div>
            <div className="col-span-3">ຊື່ແຟ້ມເກັບເອກະສານ</div>
            <div className="col-span-2 text-center">QR Code</div>
            <div className="col-span-4">ບ່ອນອ້າງອີງ / ສະຖານທີ່</div>
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
                <FolderIcon className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນແຟ້ມໃນລະບົບ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map(item => {
                return (
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
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500/10 to-amber-600/10 flex items-center justify-center shrink-0 border border-orange-200/30 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <FolderIcon className="text-orange-600 w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-bold text-slate-800 text-[15px] truncate">{item.name}</span>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-inner">
                        <QrCode className="w-4 h-4 text-[#185C4D]" strokeWidth={2.5} />
                        <span className="text-slate-700 text-[13px] font-mono font-bold">{item.qrCode}</span>
                      </div>
                    </div>

                    <div className="col-span-4 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 text-[14px] font-medium line-clamp-1 leading-relaxed italic">
                          {item.locationRef || '—'}
                        </span>
                        {(item as any).shelf && (
                          <div className="flex items-center flex-wrap text-xs text-slate-400 gap-1 mt-0.5">
                            {(item as any).shelf?.locker?.warehouse?.address?.name && <span>{(item as any).shelf.locker.warehouse.address.name} <ChevronRight size={10} className="inline" /></span>}
                            {(item as any).shelf?.locker?.warehouse?.name && <span>{(item as any).shelf.locker.warehouse.name} <ChevronRight size={10} className="inline" /></span>}
                            {(item as any).shelf?.locker?.name && <span>ຕູ້ {(item as any).shelf.locker.name} <ChevronRight size={10} className="inline" /></span>}
                            {(item as any).shelf?.name && <span className="text-slate-600 font-semibold">ຊັ້ນ {(item as any).shelf.name}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'manage',
                              icon: <ChevronRight size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ຈັດການເອກະສານ</span>,
                              onClick: () => onManage?.(item),
                            },
                            {
                              key: 'upload',
                              icon: <FileUp size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ອັບໂຫຼດເອກະສານ</span>,
                              onClick: () => onUploadDocument?.(item),
                            },
                            {
                              key: 'move',
                              icon: <ArrowRightLeft size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ຍ້າຍຊັ້ນວາງ</span>,
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
                );
              })}
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

