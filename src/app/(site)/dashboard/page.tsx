// src/app/(site)/dashboard/page.tsx
import DashboardOverviewView from '@/components/views/dashboard/DashboardOverviewView';
import RoleGuard from '@/components/auth/RoleGuard';

export const metadata = {
  title: 'Dashboard Overview | E-Document Management',
  description: 'System metrics, storage capacity, and document tracking statistics.',
};

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN']}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
        <DashboardOverviewView />
      </div>
    </RoleGuard>
  );
}