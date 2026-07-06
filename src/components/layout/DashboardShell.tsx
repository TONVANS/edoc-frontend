'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const cleanup = () => {
      document.querySelectorAll('.ant-drawer-mask').forEach(el => el.remove());
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setMobileOpen(false);
        cleanup();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
  }, [pathname]);

  return (
    <div className="flex min-h-screen selection:bg-[#185C4D] selection:text-white font-lao">
      <Sidebar />

      {mounted && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          destroyOnClose
          size="default"
          styles={{
            body: { padding: 0, overflow: 'hidden' }, // ซ่อน Scrollbar ของ Drawer หลัก
            header: { display: 'none' },
          }}
          className="md:hidden"
        >
          <Sidebar isMobile onClose={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
        {/* เลเยอร์นี้ให้ใช้ Layer 0 แบบ Glassmorphism */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}