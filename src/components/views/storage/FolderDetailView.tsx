"use client";
import React from 'react';
import { Button, Divider } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  FolderOpen, 
  MapPin,
  QrCode,
  Info,
  Calendar,
  AlignLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Folder } from '@/types/prisma-mapped';
import { useRouter } from 'next/navigation';

interface FolderDetailViewProps {
  folder: any | null; // Using any to accommodate the nested shelf->locker->warehouse->address structure from backend
}

export default function FolderDetailView({
  folder,
}: FolderDetailViewProps) {
  const router = useRouter();
  
  if (!folder) return null;

  const storageLocation = [
    folder.shelf?.locker?.warehouse?.address?.name,
    folder.shelf?.locker?.warehouse?.name,
    folder.shelf?.locker?.name,
    folder.shelf?.name
  ].filter(Boolean).join(' > ') || 'ບໍ່ລະບຸສະຖານທີ່ຈັດເກັບ';

  const isActive = folder.status === 'A';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/75 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col min-h-[50vh]">
        
        {/* -------------------------------- HEADER --------------------------------- */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66] shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          {/* Close button removed as this is no longer a modal */}

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <FolderOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="inline-flex items-center font-mono font-bold text-[12px] text-emerald-200 bg-white/10 border border-white/15 px-3 py-1 rounded-lg shadow-sm mb-2">
                {folder.code || 'NO-CODE'}
              </span>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight truncate max-w-[450px]" title={folder.name}>
                {folder.name}
              </h2>
            </div>
          </div>
        </header>

        {/* -------------------------------- BODY --------------------------------- */}
        <main className="px-10 py-8 -mt-8 bg-white/85 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Metadata details (2 cols) */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[14px] mb-3 border-b border-slate-100 pb-1.5">
                  <Info size={15} /> ລາຍລະອຽດແຟ້ມເອກະສານ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ລະຫັດແຟ້ມ</span>
                    <span className="text-slate-700 font-bold text-[14px]">{folder.code || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ວັນທີສ້າງ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(folder.createdAt).toLocaleDateString('lo-LA')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ສະຖານະ</span>
                    <span className={cn("inline-block font-bold text-[12px] px-2.5 py-0.5 rounded-full border mt-1.5", 
                        isActive ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-rose-600 bg-rose-500/10 border-rose-500/20"
                    )}>
                      {isActive ? 'ເປີດນຳໃຊ້' : 'ປິດນຳໃຊ້'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ຄຳອະທິບາຍ/ລາຍລະອຽດ</span>
                    <p className="text-slate-600 font-medium text-[13.5px] mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 leading-relaxed whitespace-pre-wrap">
                      {folder.description || 'ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[14px] mb-3 border-b border-slate-100 pb-1.5">
                  <MapPin size={15} /> ບ່ອນຈັດເກັບ
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ສະຖານທີ່ຈັດເກັບ (ສາງ/ຕູ້/ຊັ້ນ)</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <MapPin size={14} className="text-[#185C4D]" /> {storageLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ລະຫັດອ້າງອີງ (Code Ref)</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <AlignLeft size={14} className="text-[#185C4D]" /> {folder.locationRef || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code & Attachments (1 col) */}
            <div className="space-y-6">
              {/* QR Code Container */}
              <div className="bg-white/60 border border-white p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <h4 className="text-[12px] font-bold text-slate-400 flex items-center gap-1 mb-3 uppercase">
                  <QrCode size={13} /> QR Code Reference
                </h4>
                
                <div className="bg-white p-3.5 rounded-2xl shadow-soft border border-slate-100">
                  <QRCodeSVG 
                    value={folder.qrCode || `EDOC-FOLDER-${folder.id}`}
                    size={110} 
                    bgColor="#ffffff"
                    fgColor="#185C4D"
                    level="Q"
                  />
                </div>
                <span className="text-[12px] font-bold font-mono text-slate-500 mt-3 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/30">
                  {folder.qrCode || `REF-${folder.code}`}
                </span>
              </div>
            </div>

          </div>

          <Divider className="my-6 border-slate-100" />

          {/* Action controls */}
          <footer className="flex items-center justify-between pt-2">
            <Button
              type="default"
              onClick={() => {
                  router.push(`/dashboard/folder/${folder.id}`);
              }}
              className="h-11 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:text-[#185C4D] hover:border-[#185C4D] flex items-center gap-2"
            >
              ເຂົ້າເບິ່ງເອກະສານໃນແຟ້ມ <ArrowRight size={16} />
            </Button>
            <Button 
              type="primary" 
              onClick={() => router.push('/dashboard/scan')} 
              className="h-11 px-8 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] border-none font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              ກັບຄືນ
            </Button>
          </footer>

        </main>
      </div>
    </div>
  );
}
