'use client';

import { useEffect, useState } from 'react';
import { Menu, Tooltip } from 'antd';
import {
  Folder, Inbox, LayoutDashboard, Search,
  ChevronLeft, ChevronRight, FileText, Shield, Settings, LogOut,
  Warehouse, Package, MapPin, Building2, QrCode, History, Users, GitBranch, Network, Layers, Briefcase, UserCircle, Key, FileWarning
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

const BASE_MENU_ITEMS = [
  {
    type: 'group' as const,
    label: 'ເມນູຫຼັກ',
    children: [
      { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'ພາບລວມລະບົບ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
      { key: '/dashboard/warehouses', icon: <Warehouse size={18} />, label: 'ຈັດການສາງ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
      { key: '/dashboard/locker', icon: <Package size={18} />, label: 'ຈັດການຕູ້ເກັບ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
      { key: '/dashboard/shelves', icon: <Layers size={18} />, label: 'ຈັດການຊັ້ນວາງ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
      { key: '/dashboard/folder', icon: <Inbox size={18} />, label: 'ຈັດການແຟ້ມ (Kono)' },
    ],
  },
  {
    type: 'group' as const,
    label: 'ການດຳເນີນງານ',
    children: [
      { key: '/dashboard/scan', icon: <QrCode size={18} />, label: 'ສະແກນ QR Code' },
      { key: '/dashboard/documents', icon: <FileText size={18} />, label: 'ຈັດການເອກະສານທັງໝົດ' },
      { key: '/dashboard/document-expired', icon: <FileWarning size={18} />, label: 'ເອກະສານໝົດອາຍຸ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
      { key: '/dashboard/tracking', icon: <History size={18} />, label: 'ຕິດຕາມ - ປະຫວັດການຢືມ' },
    ],
  },
  {
    type: 'group' as const,
    label: 'ການບໍລິຫານລະບົບ',
    children: [
      { key: '/dashboard/document-types', icon: <FileText size={18} />, label: 'ປະເພດເອກະສານ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
      { key: '/dashboard/users', icon: <Users size={18} />, label: 'ຈັດການຜູ້ໃຊ້ງານ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
    ],
  },
  {
    type: 'group' as const,
    label: 'ໂຄງຮ່າງການຈັດຕັ້ງ',
    children: [
      { key: '/dashboard/departments', icon: <Building2 size={18} />, label: 'ຝ່າຍ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
      { key: '/dashboard/divisions', icon: <GitBranch size={18} />, label: 'ພະແນກ/ສາຂາ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
      { key: '/dashboard/offices', icon: <MapPin size={18} />, label: 'ຫ້ອງການໄຟຟ້າ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
      { key: '/dashboard/units', icon: <Users size={18} />, label: 'ໜ່ວຍງານ', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
    ],
  },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [isMounted, setIsMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const menuItems = BASE_MENU_ITEMS.map((group) => {
    // Filter children based on user role
    const filteredChildren = group.children.filter((item) => {
      if (!(item as any).allowedRoles) return true;
      if (!user?.role) return false;
      return (item as any).allowedRoles.includes(user.role);
    });

    if (filteredChildren.length === 0) return null;

    return {
      type: 'group' as const,
      label: group.label,
      children: filteredChildren.map((item) => ({
        key: item.key,
        label: collapsed && !isMobile ? null : (
          <Link href={item.key} onClick={() => isMobile && onClose?.()} className="w-full flex items-center">
            {item.label}
          </Link>
        ),
        icon: collapsed && !isMobile ? (
          <Tooltip title={item.label} placement="right" key={`tooltip-${item.key}`}>
            <Link href={item.key} className="flex items-center justify-center w-full">
              {item.icon}
            </Link>
          </Tooltip>
        ) : item.icon,
      })),
    };
  }).filter(Boolean);

  // FIX: เอา url() ไว้เป็น Layer แรกสุด (Top Layer) เพื่อไม่ให้ Gradient บัง 
  // และปรับจุดให้ใหญ่ขึ้นเล็กน้อย (r='1.5') พร้อมความเข้ม 8% (0.08) ให้พอมองเห็นลางๆ หรูหรา
  const sidebarBackground = `
    url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"),
    linear-gradient(160deg, #185C4D 0%, #114236 100%)
  `;

  const isCurrentlyCollapsed = isMounted ? collapsed : false;
  const sidebarWidth = isMobile ? '100%' : (isCurrentlyCollapsed ? 80 : 280);

  return (
    <aside
      style={{
        width: sidebarWidth,
        background: sidebarBackground,
        borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: isMobile ? 'none' : '4px 0 32px rgba(0, 0, 0, 0.15)',
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={
        isMobile
          ? 'flex flex-col h-full overflow-hidden shrink-0'
          : 'hidden md:flex flex-col h-screen sticky top-0 overflow-hidden shrink-0 z-40'
      }
    >
      {/* ── Logo Area ── */}
      <div
        className="flex items-center gap-3.5 h-20 px-5 shrink-0 relative z-10"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div
          className="flex items-center justify-center shrink-0 text-[#185C4D] font-black text-[15px] rounded-[12px] bg-white shadow-sm"
          style={{ width: 40, height: 40 }}
        >
          ED
        </div>
        {(!isCurrentlyCollapsed || isMobile) && (
          <div className="overflow-hidden transition-opacity duration-300">
            <p className="text-[16px] font-bold leading-tight truncate text-white tracking-wide">
              E-Document
            </p>
            <p className="text-[11px] font-medium leading-tight truncate text-white/60 tracking-wider uppercase mt-0.5">
              Management System
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation Menu ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar relative z-10">
        <Menu
          className="sidebar-menu"
          style={{ background: 'transparent', border: 'none' }}
          mode="inline"
          inlineCollapsed={isCurrentlyCollapsed && !isMobile}
          selectedKeys={[
            (() => {
              const allKeys = BASE_MENU_ITEMS.flatMap(g => g.children).map(c => c.key);
              // เรียงลำดับ key ตามความยาวจากมากไปน้อย เพื่อให้ match path ที่ยาวและเฉพาะเจาะจงที่สุดก่อน
              const sortedKeys = [...allKeys].sort((a, b) => b.length - a.length);
              return sortedKeys.find(key => pathname === key || pathname.startsWith(key + '/')) || pathname;
            })()
          ]}
          items={menuItems}
        />
      </nav>

      {/* ── User Card ── */}
      {(!isCurrentlyCollapsed || isMobile) && (
        <div className="px-4 pb-4 relative z-10" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-[16px] mt-4 group backdrop-blur-md"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[#185C4D] text-[13px] font-bold bg-white"
            >
              {user ? `${user.firstNameLa.charAt(0)}${user.lastNameLa.charAt(0)}`.toUpperCase() : 'AU'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate text-white">
                {user ? `${user.firstNameLa} ${user.lastNameLa}` : 'Admin User'}
              </p>
              <p className="text-[11.5px] truncate text-white/70">{user?.empCode ?? 'admin'}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 ml-1">
              <Tooltip title="Profile" placement="right">
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90"
                  aria-label="Profile"
                >
                  <UserCircle size={15} className="text-white/50 group-hover:text-white/80 transition-colors" />
                </button>
              </Tooltip>
              <Tooltip title="Logout" placement="right">
                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-red-500/20 active:scale-90"
                  aria-label="Logout"
                >
                  <LogOut size={14} className="text-white/50 group-hover:text-red-400 transition-colors" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapse Trigger ── */}
      {!isMobile && (
        <button
          onClick={handleToggle}
          className="flex items-center justify-center gap-2 h-12 w-full shrink-0 text-[13px] font-medium tracking-wide transition-colors duration-300 relative z-10"
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'; }}
        >
          {isCurrentlyCollapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /><span>Collapse</span></>
          }
        </button>
      )}
    </aside>
  );
}