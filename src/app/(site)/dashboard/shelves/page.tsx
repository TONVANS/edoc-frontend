'use client';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useRouter, useSearchParams } from 'next/navigation';

import { useShelfStore } from '@/store/useShelfStore';
import { useLockerStore } from '@/store/useLockerStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import ShelfTable from '@/components/views/storage/ShelfTable';
import ShelfFormModal from '@/components/views/storage/ShelfFormModal';
import { Shelf, CreateShelfPayload } from '@/types/prisma-mapped';

function ShelvesPageContent() {
  const { shelves, total, isLoading: isShelfLoading, fetchShelves, createShelf, updateShelf, deleteShelf } = useShelfStore();
  const { lockerDropdown, fetchLockerDropdown } = useLockerStore();
  const { warehouseDropdown, fetchWarehouseDropdown } = useWarehouseStore();
  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLockerId = searchParams.get('lockerId') || 'all';
  const initialWarehouseId = searchParams.get('warehouseId') || 'all';
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [activeDivision, setActiveDivision] = useState('all');
  const [filterWarehouseId, setFilterWarehouseId] = useState<string>(initialWarehouseId);
  const [filterLockerId, setFilterLockerId] = useState<string>(initialLockerId);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal states
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);

  // Editing states
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null);
  
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
    fetchLockerDropdown({ warehouseId: filterWarehouseId !== 'all' ? filterWarehouseId : undefined });
  }, [filterWarehouseId, fetchLockerDropdown]);

  useEffect(() => {
    fetchShelves({
      page: currentPage,
      limit: 8,
      departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
      divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
      lockerId: filterLockerId === 'all' ? undefined : filterLockerId,
      warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
      search: debouncedSearch || undefined,
    });
  }, [activeDepartment, activeDivision, filterLockerId, filterWarehouseId, currentPage, debouncedSearch, fetchShelves]);

  // Sync state if URL param changes
  useEffect(() => {
    const lockerParam = searchParams.get('lockerId') || 'all';
    const warehouseParam = searchParams.get('warehouseId') || 'all';
    setFilterLockerId(lockerParam);
    setFilterWarehouseId(warehouseParam);
    setCurrentPage(1);
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    setEditingShelf(null);
    setIsShelfModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsShelfModalOpen(false);
    setEditingShelf(null);
  };

  const handleShelfSubmit = async (values: CreateShelfPayload & { status?: string }) => {
    try {
      let success = false;
      if (editingShelf) {
        success = await updateShelf(editingShelf.id, values);
      } else {
        success = await createShelf(values);
      }

      if (success) {
        handleCloseModals();
        messageApi.success(editingShelf ? 'ແກ້ໄຂຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນຊັ້ນວາງໃໝ່ສຳເລັດແລ້ວ!');
        fetchShelves({
          page: currentPage,
          limit: 8,
          departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
          divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
          lockerId: filterLockerId === 'all' ? undefined : filterLockerId,
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
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຊັ້ນວາງນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteShelf(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!');
          fetchShelves({
            page: currentPage,
            limit: 8,
            departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
            divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
            lockerId: filterLockerId === 'all' ? undefined : filterLockerId,
            warehouseId: filterWarehouseId === 'all' ? undefined : filterWarehouseId,
            search: debouncedSearch || undefined,
          });
        }
        else messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
      },
    });
  };

  const defaultShelfData = useMemo(() => {
    return filterLockerId && filterLockerId !== 'all' ? { lockerId: filterLockerId } as Shelf : null;
  }, [filterLockerId]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out font-lao">
      {contextHolder}
      {modalContextHolder}
      
      {/* Top Header Section */}
      <div className="flex flex-col mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5 mt-2">
              <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-white/90 to-white/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(24,92,77,0.08)] border border-white flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:rotate-3 duration-500 ease-out relative group">
                <div className="absolute inset-0 bg-[#185C4D]/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Layers className="text-[#185C4D] w-8 h-8 relative z-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  ການຈັດການຊັ້ນວາງ
                </h1>
                <p className="text-slate-500 font-medium text-base mt-0.5 tracking-wide">
                  ຈັດການຂໍ້ມູນຊັ້ນວາງເອກະສານຂອງແຕ່ລະຕູ້ (Locker)
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
              ເພີ່ມຊັ້ນວາງໃໝ່
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        <ShelfTable 
          data={shelves} 
          total={total}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchName={searchName}
          onSearchChange={setSearchName}
          isLoading={isShelfLoading} 
          onEdit={(shelf) => {
            setEditingShelf(shelf);
            setIsShelfModalOpen(true);
          }}
          onDelete={handleDelete}
          onManage={(shelf) => {
            router.push(`/dashboard/shelves/${shelf.id}`);
          }}
          departmentOptions={departmentDropdown.map(dept => ({ value: dept.id.toString(), label: dept.name }))}
          filterDepartment={activeDepartment}
          onFilterDepartmentChange={(id) => {
            setActiveDepartment(id);
            setActiveDivision('all');
            setFilterWarehouseId('all');
            setFilterLockerId('all');
            setCurrentPage(1);
          }}
          divisionOptions={divisionDropdown.map(div => ({ value: div.id.toString(), label: div.name }))}
          filterDivision={activeDivision}
          onFilterDivisionChange={(id) => {
            setActiveDivision(id);
            setFilterWarehouseId('all');
            setFilterLockerId('all');
            setCurrentPage(1);
          }}
          warehouses={warehouseDropdown}
          filterWarehouse={filterWarehouseId}
          onFilterWarehouseChange={(id) => {
            setFilterWarehouseId(id);
            setFilterLockerId('all'); // Reset locker filter when warehouse changes
            setCurrentPage(1);
            router.replace(`/dashboard/shelves?warehouseId=${id}`);
          }}
          lockers={lockerDropdown}
          filterLocker={filterLockerId}
          onFilterLockerChange={(id) => {
            setFilterLockerId(id);
            setCurrentPage(1);
            const warehouseParam = filterWarehouseId !== 'all' ? `warehouseId=${filterWarehouseId}&` : '';
            router.replace(`/dashboard/shelves?${warehouseParam}lockerId=${id}`);
          }}
        />
      </div>

      <ShelfFormModal
        isOpen={isShelfModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleShelfSubmit}
        isLoading={isShelfLoading}
        initialData={editingShelf || defaultShelfData}
      />
    </div>
  );
}

export default function ShelvesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
      </div>
    }>
      <ShelvesPageContent />
    </Suspense>
  );
}
