// src/components/auth/BrandPanel.tsx
'use client';
import Image from 'next/image';
import { BarChart2, CalendarDays, FileText, ShieldCheck, Receipt } from 'lucide-react';

const features = [
  { icon: BarChart2,    label: 'Data Analytics' },
  { icon: CalendarDays, label: 'Online Scheduling' },
  { icon: FileText,     label: 'Resulting' },
  { icon: ShieldCheck,  label: 'Document Surveillance' },
  { icon: Receipt,      label: 'Invoicing' },
];

export default function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center md:justify-between items-center md:items-start text-center md:text-left bg-linear-to-br from-primary to-[#30836B] p-8 md:p-10 min-h-[220px] md:min-h-[520px] overflow-hidden">
      {/* Dot-grid decoration */}
      <div
        className="absolute top-6 left-8 opacity-20 hidden md:block"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          width: 160,
          height: 120,
        }}
      />

      {/* Logo Section */}
      <div className="relative z-10 flex items-center gap-3 md:gap-4">
        {/* Logo Container: ใช้ Layer Glass ครอบไว้ และปรับขนาดให้ Responsive */}
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:bg-white/30">
          <Image
            src="/images/logo/logo.png"
            alt="E-Document Portal Logo"
            fill
            priority // สำคัญมาก: ช่วยเรื่อง LCP (Largest Contentful Paint) ให้โหลดรูปนี้ก่อนสิ่งอื่น
            className="object-contain p-1.5 md:p-2" // p-1.5 เพื่อไม่ให้โลโก้ชิดขอบกระจกจนเกินไป
            sizes="(max-width: 768px) 40px, 56px" // บอกขนาดให้ Browser รู้ล่วงหน้าเพื่อโหลดภาพไซส์ที่เหมาะสม
          />
        </div>
        <span className="text-white font-bold text-lg md:text-xl tracking-widest uppercase drop-shadow-sm">
          E-Document
        </span>
      </div>

      {/* Hero text + feature list */}
      <div className="relative z-10 mt-4 md:mt-10">
        <h1 className="text-white font-bold text-2xl md:text-4xl leading-tight tracking-tight drop-shadow-sm">
          Document<span className="hidden md:inline"><br /></span><span className="inline md:hidden"> </span>
          Management<span className="hidden md:inline"><br /></span><span className="inline md:hidden"> </span>
          Portal
        </h1>

        {/* ซ่อน Feature list บนมือถือ เพื่อประหยัดพื้นที่ */}
        <ul className="hidden md:flex flex-col gap-4 mt-10">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 group cursor-default">
              <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25 group-hover:shadow-lg">
                <Icon size={17} className="text-white/90" />
              </span>
              <span className="text-white/90 text-[15px] font-medium tracking-wide transition-colors group-hover:text-white">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Circle decorations */}
      <div className="absolute bottom-[-40px] right-[-40px] w-40 h-40 md:w-56 md:h-56 rounded-full border-20 md:border-32 border-white/10" />
      <div className="absolute bottom-[-80px] right-[-80px] w-56 h-56 md:w-72 md:h-72 rounded-full border-16 md:border-24 border-white/5" />
    </div>
  );
}