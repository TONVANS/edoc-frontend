// src/app/(site)/layout.tsx
import { Suspense } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import RoleGuard from '@/components/auth/RoleGuard';
import BorrowCartFAB from '@/components/views/borrow/BorrowCartFAB';

function DashboardLayoutFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#185C4D]/40 border-t-[#185C4D] rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm font-lao">ກຳລັງໂຫຼດ...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <RoleGuard>
        <DashboardShell>{children}</DashboardShell>
        <BorrowCartFAB />
      </RoleGuard>
    </Suspense>
  );
}