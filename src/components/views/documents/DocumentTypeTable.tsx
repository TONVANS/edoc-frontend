import React from 'react';
import { FileText, Edit2, Trash2, Search, SlidersHorizontal, MoreVertical } from 'lucide-react';
import { Button, Input, Select, Dropdown, Pagination } from 'antd';
import { DocumentType } from '@/types/prisma-mapped';
import { cn } from '@/lib/utils';

interface DocumentTypeTableProps {
  data: DocumentType[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (docType: DocumentType) => void;
  onDelete?: (id: string) => void;
}

export default function DocumentTypeTable({
  data = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
}: DocumentTypeTableProps) {

  return (
    <section className="w-full flex flex-col gap-6" aria-label="ຕາຕະລາງຂໍ້ມູນປະເພດເອກະສານ">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 rounded-[24px] shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດປະເພດເອກະສານ..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="flex-1 min-w-[240px] max-w-[320px] rounded-[16px] bg-white/60 border-white/80 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] h-[48px]"
          />
        </div>

        <div className="flex items-center gap-2 text-[15px] font-bold bg-[#185C4D]/5 px-5 py-3 rounded-[16px] border border-[#185C4D]/10 text-[#185C4D] shrink-0">
          ທັງໝົດ <span className="text-lg font-black mx-0.5">{total}</span> ລາຍການ
        </div>
      </header>

      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-[32px] shadow-glass overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="bg-[#185C4D] text-white grid grid-cols-12 gap-4 py-5 px-8 rounded-2xl shadow-md mb-5 text-[14px] font-bold tracking-wider uppercase">
            <div className="col-span-2">ລະຫັດ</div>
            <div className="col-span-3">ຊື່ປະເພດເອກະສານ</div>
            <div className="col-span-4">ລາຍລະອຽດ</div>
            <div className="col-span-2">ວັນທີສ້າງ</div>
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
                <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນປະເພດເອກະສານ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map(item => {
                return (
                  <div 
                    key={item.id} 
                    className="group bg-white/50 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-5 px-8 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-glass"
                  >
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/60 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm">
                        {item.code}
                      </span>
                    </div>
                    
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#185C4D]/10 to-[#25705a]/10 flex items-center justify-center shrink-0 border border-[#185C4D]/10 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <FileText className="text-[#185C4D] w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-bold text-slate-800 text-[15px] truncate">{item.name}</span>
                    </div>

                    <div className="col-span-4 pr-4">
                      <span className="text-slate-500 text-[14px] font-medium line-clamp-1 leading-relaxed">{item.description || 'ບໍ່ມີລາຍລະອຽດ'}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-500 text-[13px] font-bold">
                        {new Date(item.createdAt).toLocaleDateString('lo-LA')}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <Dropdown 
                        menu={{ 
                          items: [
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
                          className: "min-w-[160px] p-2 rounded-2xl border border-white/60 shadow-glass bg-white/80 backdrop-blur-xl"
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

