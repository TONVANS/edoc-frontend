// src/app/(site)/dashboard/divisions/page.tsx
'use client';
import React, { useEffect } from 'react';
import { RefreshCw, GitBranch } from 'lucide-react';
import { Button, message } from 'antd';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useAuthStore } from '@/store/useAuthStore';
import DivisionListView from '@/components/views/divisions/DivisionListView';
import RoleGuard from '@/components/auth/RoleGuard';

export default function DivisionsPage() {
  const { divisions, isLoading, isSyncing, fetchAll, sync } = useDivisionStore();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSync = async () => {
    try {
      const success = await sync();
      if (success) {
        messageApi.success('ດຶງຂໍ້ມູນຈາກ HRM ສຳເລັດແລ້ວ!');
        fetchAll(); // Refresh list after sync
      } else {
        messageApi.error('ບໍ່ສາມາດດຶງຂໍ້ມູນຈາກ HRM ໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-full animate-in fade-in duration-500">
        {contextHolder}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center shrink-0">
              <GitBranch className="text-[#185C4D] w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ຂໍ້ມູນພະແນກຍ່ອຍ/ສາຂາ (HRM)</h1>
              <p className="text-slate-500 text-sm mt-0.5">ລາຍຊື່ພະແນກຍ່ອຍ/ສາຂາທີ່ດຶງຂໍ້ມູນມາຈາກລະບົບ HRM</p>
            </div>
          </div>

          {user?.role === 'SUPER_ADMIN' && (
            <Button
              type="primary"
              size="large"
              icon={<RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} strokeWidth={2.5} />}
              onClick={handleSync}
              loading={isSyncing}
              className="rounded-xl bg-[#185C4D] hover:bg-[#0f3d31] border-none shadow-sm hover:shadow-md transition-all px-6 font-medium h-[44px]"
            >
              ດຶງຂໍ້ມູນຫຼ້າສຸດ (Sync)
            </Button>
          )}
        </div>

        <DivisionListView data={divisions} isLoading={isLoading} />
      </div>
    </RoleGuard>
  );
}
