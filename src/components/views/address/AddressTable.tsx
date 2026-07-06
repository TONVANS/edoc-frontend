// src/components/views/address/AddressTable.tsx
'use client';
import React from 'react';
import { MapPin, Edit2, Trash2, Search, Building2, GitBranch, SlidersHorizontal } from 'lucide-react';
import { Button, Input, Select, Tooltip, Pagination } from 'antd';
import AddressStatusBadge from './AddressStatusBadge';
import { Address } from '@/types/prisma-mapped';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AddressTableProps {
  data: Address[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (address: Address) => void;
  onDelete?: (id: string | number) => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AddressTable({
  data = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
}: AddressTableProps) {

  return (
    <section className="w-full flex flex-col gap-5 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນທີ່ຢູ່">

      {/* ══ FILTER BAR ══════════════════════════════════════ */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-[20px] shadow-soft border border-white/70">

        {/* Left: search + branch filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <Input
            prefix={<Search size={16} className="text-slate-400 mr-0.5" />}
            placeholder="ຄົ້ນຫາຊື່ທີ່ຢູ່..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            aria-label="ຄົ້ນຫາຊື່ທີ່ຢູ່"
            className="flex-1 min-w-[200px] max-w-[300px] rounded-[14px] bg-white/60 border-white/70 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] focus-within:shadow-[0_0_0_3px_rgba(24,92,77,0.08)]"
          />
        </div>

        {/* Right: result count */}
        <div
          className="flex items-center gap-1.5 text-sm font-semibold bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-[14px] border border-white/70 shadow-sm text-slate-600 shrink-0"
          aria-live="polite"
          aria-label={`ພົບ ${total} ລາຍການ`}
        >
          ພົບ
          <span className="text-[#185C4D] font-extrabold text-base tabular-nums mx-0.5">
            {total}
          </span>
          ລາຍການ
        </div>
      </header>

      {/* ══ TABLE ═══════════════════════════════════════════ */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto">
        <div className="min-w-[900px]">
          {/* CUSTOM HEADER: Pill-shaped gradient */}
          <div className="bg-table-header text-white grid grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-2">ລະຫັດ</div>
            <div className="col-span-4">ຊື່ທີ່ຢູ່</div>
            <div className="col-span-3">ລາຍລະອຽດ</div>
            <div className="col-span-2 text-center">ສະຖານະ</div>
            <div className="col-span-1 text-right">ຈັດການ</div>
          </div>
          
          {/* CUSTOM ROWS (LEVEL 2 GLASS) */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-slate-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100/80 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-medium text-sm">ບໍ່ພົບຂໍ້ມູນທີ່ຢູ່</p>
              {searchName && (
                <p className="text-slate-400 text-xs">
                  ລອງຄົ້ນຫາດ້ວຍຄຳອື່ນ
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {data.map(item => {
                return (
                  <div 
                    key={item.id?.toString() ?? Math.random().toString()} 
                    className="bg-white/60 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4 px-6 rounded-2xl shadow-sm transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] cursor-pointer group"
                  >
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-semibold text-[13px] text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg tracking-wide">
                        {item.code}
                      </span>
                    </div>
                    
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center shrink-0 border border-emerald-200/40 shadow-sm">
                        <MapPin className="text-emerald-600 w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-slate-800 text-[14px] truncate" title={item.name}>{item.name}</span>
                    </div>

                    <div className="col-span-3">
                      {item.details ? (
                        <span className="text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed" title={item.details}>
                          {item.details}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm italic select-none">ບໍ່ມີລາຍລະອຽດ</span>
                      )}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <AddressStatusBadge status={item.status} />
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <Tooltip title="ແກ້ໄຂຂໍ້ມູນ" placement="top">
                        <Button
                          type="text"
                          shape="circle"
                          aria-label={`ແກ້ໄຂ ${item.name}`}
                          icon={<Edit2 size={16} className="text-[#185C4D]" />}
                          onClick={() => onEdit(item)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#185C4D]/50 border border-transparent hover:border-emerald-200"
                        />
                      </Tooltip>
                      <Tooltip title="ລຶບຂໍ້ມູນ" placement="top">
                        <Button
                          type="text"
                          danger
                          shape="circle"
                          aria-label={`ລຶບ ${item.name}`}
                          icon={<Trash2 size={16} />}
                          onClick={() => onDelete?.(item.id)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-rose-500/50 border border-transparent hover:border-rose-200"
                        />
                      </Tooltip>
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
