// src/app/(site)/dashboard/departments/[departmentId]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { ArrowLeft, Building2, Plus } from 'lucide-react';
import { Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useAuthStore } from '@/store/useAuthStore';
import DivisionListView from '@/components/views/divisions/DivisionListView';
import DivisionFormModal from '@/components/views/divisions/DivisionFormModal';
import { Division, CreateDivisionPayload, UpdateDivisionPayload } from '@/types/prisma-mapped';

export default function DepartmentDetailPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const departmentId = parseInt(resolvedParams.departmentId, 10);
  
  const { departments, fetchAll } = useDepartmentStore();
  const { fetchByDepartment, createDivision, updateDivision, deleteDivision, isLoading: divLoading } = useDivisionStore();
  const { user } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const currentDepartment = departments.find((d) => d.id === departmentId);

  const loadData = async () => {
    setLoading(true);
    if (departments.length === 0) {
      await fetchAll();
    }
    const data = await fetchByDepartment(departmentId);
    setDivisions(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isNaN(departmentId)) {
      loadData();
    }
  }, [departmentId, fetchByDepartment, departments.length, fetchAll]);

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
      loadData();
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
      loadData();
    } else {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-350 mx-auto min-h-full animate-in fade-in duration-500">
      {contextHolder}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeft size={20} />} 
            onClick={() => window.location.href = '/dashboard/departments'}
            className="hover:bg-slate-100 -ml-2"
          />
          <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center shrink-0">
            <Building2 className="text-[#185C4D] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {currentDepartment?.name || 'ລາຍລະອຽດຝ່າຍ'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              ລາຍຊື່ພະແນກ/ສາຂາ ທີ່ສັງກັດໃນຝ່າຍນີ້
            </p>
          </div>
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <Button
            type="primary"
            size="large"
            icon={<Plus size={18} strokeWidth={2.5} />}
            onClick={handleAdd}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 border-none shadow-sm hover:shadow-md transition-all px-6 font-medium h-11"
          >
            ເພີ່ມພະແນກ
          </Button>
        )}
      </div>

      <DivisionListView 
        data={divisions} 
        isLoading={loading} 
        onEdit={user?.role === 'SUPER_ADMIN' ? handleEdit : undefined}
        onDelete={user?.role === 'SUPER_ADMIN' ? handleDelete : undefined}
      />

      <DivisionFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingDivision}
        isLoading={divLoading}
      />
    </div>
  );
}
