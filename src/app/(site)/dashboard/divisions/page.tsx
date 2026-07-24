// src/app/(site)/dashboard/divisions/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, GitBranch, Plus } from 'lucide-react';
import { Button, message } from 'antd';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useAuthStore } from '@/store/useAuthStore';
import DivisionListView from '@/components/views/divisions/DivisionListView';
import DivisionFormModal from '@/components/views/divisions/DivisionFormModal';
import RoleGuard from '@/components/auth/RoleGuard';
import { Division, CreateDivisionPayload, UpdateDivisionPayload } from '@/types/prisma-mapped';

export default function DivisionsPage() {
  const { divisions, isLoading, isSyncing, fetchAll, sync, createDivision, updateDivision, deleteDivision } = useDivisionStore();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

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

  const handleAdd = () => {
    setEditingDivision(null);
    setIsModalOpen(true);
  };

  const handleEdit = (division: Division) => {
    setEditingDivision(division);
    setIsModalOpen(true);
  };

  const handleDelete = async (division: Division) => {
    const success = await deleteDivision(division.id);
    if (success) {
      messageApi.success('ລຶບຂໍ້ມູນສຳເລັດແລ້ວ!');
      fetchAll();
    } else {
      messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
    }
  };

  const handleSubmit = async (payload: CreateDivisionPayload | UpdateDivisionPayload) => {
    let success = false;
    if (editingDivision) {
      success = await updateDivision(editingDivision.id, payload as UpdateDivisionPayload);
    } else {
      success = await createDivision(payload as CreateDivisionPayload);
    }
    
    if (success) {
      messageApi.success(editingDivision ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນສຳເລັດແລ້ວ!');
      setIsModalOpen(false);
      fetchAll();
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ.');
    }
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-350 mx-auto min-h-full animate-in fade-in duration-500">
        {contextHolder}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center shrink-0">
              <GitBranch className="text-[#185C4D] w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ຂໍ້ມູນພະແນກ/ສາຂາ (HRM)</h1>
              <p className="text-slate-500 text-sm mt-0.5">ລາຍຊື່ພະແນກ/ສາຂາທີ່ດຶງຂໍ້ມູນມາຈາກລະບົບ HRM</p>
            </div>
          </div>

          {user?.role === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                size="large"
                icon={<Plus size={18} strokeWidth={2.5} />}
                onClick={handleAdd}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 border-none shadow-sm hover:shadow-md transition-all px-6 font-medium h-11"
              >
                ເພີ່ມຂໍ້ມູນ
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} strokeWidth={2.5} />}
                onClick={handleSync}
                loading={isSyncing}
                className="rounded-xl bg-[#185C4D] hover:bg-[#0f3d31] border-none shadow-sm hover:shadow-md transition-all px-6 font-medium h-11"
              >
                ດຶງຂໍ້ມູນຫຼ້າສຸດ (Sync)
              </Button>
            </div>
          )}
        </div>

        <DivisionListView 
          data={divisions} 
          isLoading={isLoading} 
          onEdit={user?.role === 'SUPER_ADMIN' ? handleEdit : undefined}
          onDelete={user?.role === 'SUPER_ADMIN' ? handleDelete : undefined}
        />

        <DivisionFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={editingDivision}
          isLoading={isLoading}
        />
      </div>
    </RoleGuard>
  );
}
