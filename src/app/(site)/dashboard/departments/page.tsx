// src/app/(site)/dashboard/departments/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { RefreshCw, Building2, Plus } from 'lucide-react';
import { Button, message } from 'antd';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import DepartmentListView from '@/components/views/departments/DepartmentListView';
import DepartmentFormModal from '@/components/views/departments/DepartmentFormModal';
import RoleGuard from '@/components/auth/RoleGuard';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/prisma-mapped';

export default function DepartmentsPage() {
  const { departments, isLoading, isSyncing, fetchAll, sync, createDepartment, updateDepartment, deleteDepartment } = useDepartmentStore();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

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
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (department: Department) => {
    const success = await deleteDepartment(department.id);
    if (success) {
      messageApi.success('ລຶບຂໍ້ມູນສຳເລັດແລ້ວ!');
      fetchAll();
    } else {
      messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
    }
  };

  const handleSubmit = async (payload: CreateDepartmentPayload | UpdateDepartmentPayload) => {
    let success = false;
    if (editingDepartment) {
      success = await updateDepartment(editingDepartment.id, payload as UpdateDepartmentPayload);
    } else {
      success = await createDepartment(payload as CreateDepartmentPayload);
    }
    
    if (success) {
      messageApi.success(editingDepartment ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນສຳເລັດແລ້ວ!');
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
              <Building2 className="text-[#185C4D] w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ຂໍ້ມູນຝ່າຍ (HRM)</h1>
              <p className="text-slate-500 text-sm mt-0.5">ລາຍຊື່ຝ່າຍທີ່ດຶງຂໍ້ມູນມາຈາກລະບົບ HRM</p>
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

        <DepartmentListView 
          data={departments} 
          isLoading={isLoading} 
          onEdit={user?.role === 'SUPER_ADMIN' ? handleEdit : undefined}
          onDelete={user?.role === 'SUPER_ADMIN' ? handleDelete : undefined}
        />

        <DepartmentFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={editingDepartment}
          isLoading={isLoading}
        />
      </div>
    </RoleGuard>
  );
}
