'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, QrCode, Folder, Menu } from 'lucide-react';

interface MobileNavProps {
  onMenuClick: () => void;
}

export default function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'ໜ້າຫຼັກ',
      icon: Home,
      href: '/dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      label: 'ເອກະສານ',
      icon: FileText,
      href: '/dashboard/documents',
      isActive: pathname.startsWith('/dashboard/documents'),
    },
    {
      label: 'ສະແກນ',
      icon: QrCode,
      href: '/dashboard/scan',
      isActive: pathname.startsWith('/dashboard/scan'),
      isCenter: true,
    },
    {
      label: 'ແຟ້ມ',
      icon: Folder,
      href: '/dashboard/folder',
      isActive: pathname.startsWith('/dashboard/folder'),
    },
    {
      label: 'ເມນູ',
      icon: Menu,
      onClick: onMenuClick,
      isActive: false,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none font-lao">
      <div className="mx-auto max-w-md bg-white/70 backdrop-blur-[16px] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.15)] rounded-[20px] px-2 py-2 flex items-center justify-between relative pointer-events-auto">
        
        {/* Nav Items */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <div key="center-scan" className="relative -top-6 px-2">
                <Link
                  href={item.href || '#'}
                  className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-linear-to-tr from-[#185C4D] to-[#398270] !text-white shadow-xl shadow-[#185C4D]/30 border-4 border-white hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Icon size={28} strokeWidth={2.5} />
                </Link>
              </div>
            );
          }

          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${
                  item.isActive ? '!text-[#185C4D]' : '!text-[#737373] hover:!text-[#1C1C1E]'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${item.isActive ? 'bg-[#185C4D]/10' : ''}`}>
                  <Icon size={22} strokeWidth={item.isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${item.isActive ? '!text-[#185C4D]' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href || '#'}
              className={`flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${
                item.isActive ? '!text-[#185C4D]' : '!text-[#737373] hover:!text-[#1C1C1E]'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${item.isActive ? 'bg-[#185C4D]/10' : ''}`}>
                <Icon size={22} strokeWidth={item.isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${item.isActive ? 'text-[#185C4D]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
