'use client';
import { Breadcrumb, Dropdown, MenuProps, Tooltip } from 'antd';
import { Bell, User, LogOut, Settings, Search, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  branches: 'Branches & Storage',
  konos: 'Konos (Boxes)',
  scan: 'Scan QR',
  documents: 'All Documents',
  restricted: 'Restricted',
};

export default function Topbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = segments.map((seg, i) => {
    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    const href = '/' + segments.slice(0, i + 1).join('/');

    return {
      title: isLast ? (
        <span className="font-bold text-[#1C1C1E] tracking-tight">{label}</span>
      ) : (
        <Link href={href} className="text-[#737373] hover:text-[#185C4D] transition-colors font-medium">
          {label}
        </Link>
      ),
    };
  });

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      router.push('/login');
    }
  };

  const userMenu: MenuProps['items'] = [
    { key: 'profile', icon: <User size={15} />, label: 'My Profile' },
    { key: 'settings', icon: <Settings size={15} />, label: 'Settings' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={15} className="text-[#B83131]" />,
      label: <span className="text-[#B83131] font-medium">Logout</span>,
    },
  ];

  const currentLabel = ROUTE_LABELS[segments.at(-1) ?? ''] ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-4 md:px-8 bg-white/40 backdrop-blur-2xl border-b border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.04)]">

      {/* ── Left Section ── */}
      <div className={`flex items-center gap-4 transition-all duration-300 ${searchOpen ? 'opacity-0 w-0 md:opacity-100 md:w-auto overflow-hidden' : 'w-full md:w-auto'}`}>
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-[14px] bg-white/60 border border-white/80 text-[#737373] hover:text-[#185C4D] hover:bg-white/80 transition-all shrink-0 active:scale-95 shadow-sm"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="md:hidden text-[18px] font-bold text-[#1C1C1E] truncate tracking-tight">
            {currentLabel}
          </p>
          <div className="hidden md:block">
            <Breadcrumb
              items={breadcrumbItems}
              separator={<span className="text-[#C0B8AC] font-medium px-1">/</span>}
              className="text-[14px]"
            />
          </div>
        </div>
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">

        {/* Search Wrapper - Glass Morphism Effect */}
        <div
          ref={searchRef}
          className={`flex items-center absolute md:relative right-4 md:right-0 bg-white/60 border border-white/80 backdrop-blur-lg transition-all duration-400 ease-out rounded-[14px] z-10
            ${searchOpen ? 'w-[calc(100vw-32px)] md:w-64 shadow-[0_8px_24px_rgba(0,0,0,0.08)]' : 'w-10 h-10 md:w-56 shadow-sm cursor-text hover:bg-white/80 hover:-translate-y-0.5'}
          `}
          onClick={() => !searchOpen && setSearchOpen(true)}
          style={{ height: searchOpen ? '42px' : undefined, padding: '0 14px' }}
        >
          <Search size={16} className={`shrink-0 transition-colors ${searchOpen ? 'text-[#185C4D]' : 'text-[#9CA3AF] m-auto md:m-0'}`} />

          <input
            ref={searchInputRef}
            placeholder="Search documents..."
            className={`bg-transparent outline-none text-[14px] text-[#1C1C1E] placeholder:text-[#9CA3AF] font-medium h-full w-full transition-all duration-300 
              ${searchOpen ? 'opacity-100 ml-2.5' : 'opacity-0 md:opacity-100 md:ml-2.5 w-0 md:w-full'}
            `}
          />

          {searchOpen && (
            <button
              className="md:hidden ml-2 text-[#9CA3AF] hover:text-[#737373] p-1 bg-gray-100/50 rounded-full"
              onClick={(e) => { e.stopPropagation(); setSearchOpen(false); }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Icons */}
        <div className={`flex items-center gap-2 transition-opacity duration-300 ${searchOpen ? 'hidden md:flex' : 'flex'}`}>
          <Tooltip title="Notifications" placement="bottom">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-white/60 border border-white/80 text-[#737373] hover:text-[#185C4D] hover:bg-white/80 hover:-translate-y-0.5 transition-all shadow-sm active:scale-95">
              <Bell size={18} />
              <span className="absolute rounded-full bg-[#B83131] border-2 border-white" style={{ width: 10, height: 10, top: 8, right: 8 }}></span>
            </button>
          </Tooltip>

          <div className="hidden md:block w-px h-6 mx-2 bg-linear-to-b from-transparent via-[#C0B8AC]/50 to-transparent" />

          {/* User Dropdown */}
          <Dropdown menu={{ items: userMenu, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
            <div className="flex items-center gap-3 p-1.5 pr-3 rounded-[16px] cursor-pointer bg-white/40 border border-white/50 hover:bg-white/70 hover:border-white/80 shadow-sm transition-all">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #185C4D 0%, #30836B 100%)' }}
              >
                AU
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-[13px] font-bold text-[#1C1C1E]">
                  {user ? `${user.firstNameLa} ${user.lastNameLa}` : 'Admin User'}
                </span>
                <span className="text-[11px] font-medium text-[#737373]">{user?.empCode ?? 'admin'}</span>
              </div>
            </div>
          </Dropdown>
        </div>

      </div>
    </header>
  );
}