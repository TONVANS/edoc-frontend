'use client';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Plus, Layout as LockerIcon } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useLockerStore } from '@/store/useLockerStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import LockerTable from '@/components/views/storage/LockerTable';
import LockerFormModal from '@/components/views/storage/LockerFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import { Locker, CreateLockerPayload } from '@/types/prisma-mapped';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
function LockerPageContent() {
  const { lockers, total, isLoading: isLockerLoading, fetchLockers, createLocker, updateLocker, deleteLocker } = useLockerStore();
  const { warehouseDropdown, fetchWarehouseDropdown } = useWarehouseStore();
  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialWarehouseId = searchParams.get('warehouseId') || 'all';

  const [activeDepartment, setActiveDepartment] = useState('all');
  const [activeDivision, setActiveDivision] = useState('all');
  const [filterWarehouseId, setFilterWarehouseId] = useState<string>(initialWarehouseId);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal states
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);

  // Editing states
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  
  // Move states
  const [movingLocker, setMovingLocker] = useState<Locker | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Debounce searchName input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    fetchDeptDropdown();
  }, [fetchDeptDropdown]);

  useEffect(() => {
    if (activeDepartment !== 'all') {
      fetchDivDropdown({ departmentId: Number(activeDepartment) });
    }
  }, [activeDepartment, fetchDivDropdown]);

  useEffect(() => {
    fetchWarehouseDropdown({
      departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
      divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
    });
  }, [activeDepartment, activeDivision, fetchWarehouseDropdown]);

  useEffect(() => {
    fetchLockers({
      page: currentPage,
      limit: 5,
      departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
      divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
      warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
      search: debouncedSearch || undefined,
    });
  }, [activeDepartment, activeDivision, filterWarehouseId, currentPage, debouncedSearch, fetchLockers]);

  // Sync state if URL param changes
  useEffect(() => {
    const wId = searchParams.get('warehouseId') || 'all';
    setFilterWarehouseId(wId);
    setCurrentPage(1);
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    setEditingLocker(null);
    setIsLockerModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsLockerModalOpen(false);
    setEditingLocker(null);
  };

  const handleOpenMoveModal = (locker: Locker) => {
    setMovingLocker(locker);
    setIsMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setIsMoveModalOpen(false);
    setMovingLocker(null);
  };

  const handleMoveSuccess = () => {
    fetchLockers({
      page: currentPage,
      limit: 5,
      departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
      divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
      warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
      search: debouncedSearch || undefined,
    });
  };

  const handleLockerSubmit = async (values: CreateLockerPayload & { status?: string }) => {
    try {
      let success = false;
      if (editingLocker) {
        success = await updateLocker(editingLocker.id, values);
      } else {
        success = await createLocker(values);
      }

      if (success) {
        handleCloseModals();
        messageApi.success(editingLocker ? 'ແກ້ໄຂຂໍ້ມູນລັອກເກີສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນລັອກເກີໃໝ່ສຳເລັດແລ້ວ!');
        fetchLockers({
          page: currentPage,
          limit: 5,
          departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
          divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
          warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
          search: debouncedSearch || undefined,
        });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDelete = (id: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນລັອກເກີນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteLocker(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນລັອກເກີສຳເລັດແລ້ວ!');
          fetchLockers({
            page: currentPage,
            limit: 5,
            departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
            divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
            warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
            search: debouncedSearch || undefined,
          });
        }
        else messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
      },
    });
  };


  const warehouseOptions = warehouseDropdown.map(w => ({ value: String(w.id), label: w.name }));

  const defaultLockerData = useMemo(() => {
    return filterWarehouseId && filterWarehouseId !== 'all' ? { warehouseId: filterWarehouseId } as Locker : null;
  }, [filterWarehouseId]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {contextHolder}
      {modalContextHolder}
      
      {/* Top Header Section */}
      <div className="flex flex-col mb-10 space-y-6 font-lao">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5 mt-2">
              <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-white/90 to-white/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(24,92,77,0.08)] border border-white flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:rotate-3 duration-500 ease-out relative group">
                <div className="absolute inset-0 bg-[#185C4D]/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <LockerIcon className="text-[#185C4D] w-8 h-8 relative z-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  ການຈັດການຕູ້ (Locker)
                </h1>
                <p className="text-slate-500 font-medium text-base mt-0.5 tracking-wide">
                  ຈັດການຂໍ້ມູນຕູ້ເກັບເອກະສານຂອງແຕ່ລະສາງ
                </p>
              </div>
            </div>
          </div>
          
          {/* Primary CTA */}
          <Button 
            type="primary" 
            size="large" 
            icon={<Plus size={20} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
            onClick={handleOpenCreateModal}
            className="group rounded-[18px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-8 h-[56px] font-bold text-base flex items-center gap-2 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">
              ເພີ່ມຕູ້ໃໝ່
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        <LockerTable 
          data={lockers} 
          total={total}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchName={searchName}
          onSearchChange={setSearchName}
          isLoading={isLockerLoading} 
          onEdit={(locker) => {
            setEditingLocker(locker);
            setIsLockerModalOpen(true);
          }}
          onDelete={handleDelete}
          onMove={handleOpenMoveModal}
          onManage={(locker) => {
            router.push(`/dashboard/locker/${locker.id}`);
          }}
          departmentOptions={departmentDropdown.map(dept => ({ value: dept.id.toString(), label: dept.name }))}
          filterDepartment={activeDepartment}
          onFilterDepartmentChange={(id) => {
            setActiveDepartment(id);
            setActiveDivision('all');
            setFilterWarehouseId('all');
            setCurrentPage(1);
          }}
          divisionOptions={divisionDropdown.map(div => ({ value: div.id.toString(), label: div.name }))}
          filterDivision={activeDivision}
          onFilterDivisionChange={(id) => {
            setActiveDivision(id);
            setFilterWarehouseId('all');
            setCurrentPage(1);
          }}
          warehouseOptions={warehouseOptions}
          filterWarehouse={filterWarehouseId}
          onFilterWarehouseChange={(id) => {
            setFilterWarehouseId(id);
            setCurrentPage(1);
            router.replace(`/dashboard/locker?warehouseId=${id}`);
          }}
        />
      </div>

      <LockerFormModal
        isOpen={isLockerModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleLockerSubmit}
        isLoading={isLockerLoading}
        initialData={editingLocker || defaultLockerData}
      />

      {isMoveModalOpen && movingLocker && (
        <MoveFormModal
          isOpen={isMoveModalOpen}
          onClose={handleCloseMoveModal}
          onSuccess={handleMoveSuccess}
          type="locker"
          item={movingLocker}
        />
      )}
    </div>
  );
}

export default function LockerPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
      </div>
    }>
      <LockerPageContent />
    </Suspense>
  );
}
