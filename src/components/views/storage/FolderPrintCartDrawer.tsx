'use client';

import React, { useRef, useState } from 'react';
import { Drawer, Button, Popconfirm, Empty, Tooltip } from 'antd';
import { Printer, Trash2, Folder as FolderIcon, QrCode, FileText, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFolderPrintCartStore } from '@/store/useFolderPrintCartStore';
import FolderTagPrint, { FolderTagPrintData } from '@/components/views/storage/FolderTagPrint';
import { useReactToPrint } from 'react-to-print';

interface FolderPrintCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FolderPrintCartDrawer({ isOpen, onClose }: FolderPrintCartDrawerProps) {
  const { items, removeItem, clearCart } = useFolderPrintCartStore();
  const [activeTab, setActiveTab] = useState<'list' | 'preview'>('list');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintTrigger = useReactToPrint({
    contentRef: printRef,
  });

  const totalTags = items.length;
  const pageCount = Math.ceil(totalTags / 4);

  const printDataList: FolderTagPrintData[] = items.map((item) => ({
    id: item.id,
    departmentName: item.departmentName || 'ຝ່າຍບັນຊີ',
    folderName: item.name,
    qrData: item.qrCode || item.code || String(item.id),
    code: item.code,
    locationRef: item.locationRef || item.shelfInfo || '-',
  }));

  const handlePrint = () => {
    if (totalTags === 0) return;
    handlePrintTrigger();
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between font-lao py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-xs">
                <Printer size={20} className="text-[#185C4D]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-lg">ກະຕ່າພິມ Tag ແຟ້ມ</span>
                <span className="text-xs text-slate-500 font-medium">
                  {totalTags > 0
                    ? `ລວມ ${totalTags} ແຟ້ມ (${pageCount} ໜ້າ A4, 4 Tag/ໜ້າ)`
                    : 'ບໍ່ມີລາຍການແຟ້ມ'}
                </span>
              </div>
            </div>

            {totalTags > 0 && (
              <Popconfirm
                title="ຢືນຢັນການລຶບ"
                description="ທ່ານຕ້ອງການລຶບລາຍການທັງໝົດໃນກະຕ່າພິມ Tag ບໍ່?"
                onConfirm={clearCart}
                okText="ລຶບທັງໝົດ"
                cancelText="ຍົກເລີກ"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 size={15} />}
                  className="rounded-xl flex items-center gap-1 font-medium hover:bg-rose-50"
                >
                  ລຶບທັງໝົດ
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        placement="right"
        styles={{ wrapper: { width: 620, maxWidth: '100vw' } }}
        onClose={onClose}
        open={isOpen}
        className="font-lao [&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-slate-100 [&_.ant-drawer-body]:p-4"
        footer={
          totalTags > 0 ? (
            <div className="flex items-center justify-between gap-4 p-2 font-lao bg-slate-50 rounded-2xl border border-slate-200/60">
              <div className="flex flex-col pl-2">
                <span className="text-xs text-slate-500">ຈຳນວນ A4 layout</span>
                <span className="text-sm font-bold text-[#185C4D]">
                  {pageCount} ໜ້າ (4 Tag/ໜ້າ)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={onClose}
                  className="rounded-xl h-11 px-5 border-slate-200 hover:bg-slate-100 font-medium"
                >
                  ປິດ
                </Button>
                <Button
                  type="primary"
                  icon={<Printer size={18} />}
                  onClick={handlePrint}
                  className="rounded-xl h-11 px-6 bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  ສັ່ງພິມ Tag ທັງໝົດ ({totalTags})
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {totalTags === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center font-lao">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300 border border-slate-200/50">
              <QrCode size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-1">ຍັງບໍ່ມີ Tag ໃນກະຕ່າ</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              ທ່ານສາມາດເລືອກແຟ້ມທີ່ຕ້ອງການພິມ Tag ຈາກຕາຕະລາງແຟ້ມ ເພື່ອສະສົມພິມພ້ອມກັນ 4 Tag ต่อ 1 หน้້າ A4
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4 font-lao">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'list'
                    ? 'bg-white text-[#185C4D] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText size={16} />
                <span>ລາຍການ Tag ({totalTags})</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#185C4D] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles size={16} className="text-amber-500" />
                <span>ຕົວຢ່າງກ່ອນພິມ A4 Layout</span>
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === 'list' ? (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group bg-white border border-slate-200/80 hover:border-[#185C4D]/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#185C4D] font-bold text-xs flex items-center justify-center shrink-0 border border-teal-100">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#185C4D] bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100/60">
                            {item.code}
                          </span>
                          <span className="font-bold text-slate-800 text-sm truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 truncate">
                          <span>{item.departmentName || 'ຝ່າຍບັນຊີ'}</span>
                          {item.locationRef && (
                            <>
                              <span>•</span>
                              <span className="truncate">{item.locationRef}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={16} />}
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl opacity-70 group-hover:opacity-100 hover:bg-rose-50 shrink-0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-200/60 rounded-2xl p-4 border border-slate-300/60 flex flex-col items-center gap-6">
                <div className="w-full text-center bg-white/90 backdrop-blur-md py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
                  ✨ ຕົວຢ່າງ A4 Layout (4 Tagຕໍ່ 1 ໜ້າ Landscape)
                </div>
                <div className="transform scale-[0.55] origin-top mb-[-42%]">
                  <FolderTagPrint items={printDataList} />
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Hidden Print Container for printing */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <FolderTagPrint items={printDataList} />
        </div>
      </div>
    </>
  );
}
