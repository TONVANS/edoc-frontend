'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import WarehouseTable from '@/components/views/storage/WarehouseTable';
import WarehouseFormModal from '@/components/views/storage/WarehouseFormModal';
import { Warehouse, CreateWarehousePayload } from '@/types/prisma-mapped';
import { useRouter } from 'next/navigation';

export default function WarehousesPage() {
  const { warehouses, total, isLoading: isWarehouseLoading, fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouseStore();
  const { addressDropdown, fetchAddressDropdown } = useAddressStore();
  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();

  const [activeDepartment, setActiveDepartment] = useState('all');
  const [activeDivision, setActiveDivision] = useState('all');
  const [activeAddress, setActiveAddress] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal states
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  // Editing states
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const router = useRouter();

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
    fetchAddressDropdown({
      departmentId: activeDepartment === 'all' ? undefined : Number(activeDepartment),
      divisionId: activeDivision === 'all' ? undefined : Number(activeDivision),
    });
  }, [activeDepartment, activeDivision, fetchAddressDropdown]);

  useEffect(() => {
    fetchWarehouses({
      page: currentPage,
      limit: 5,
      status: 'A',
      addressId: activeAddress === 'all' ? undefined : activeAddress,
      search: debouncedSearch || undefined,
    });
  }, [activeAddress, currentPage, debouncedSearch, fetchWarehouses]);

  const handleOpenCreateModal = () => {
    setEditingWarehouse(null);
    setIsWarehouseModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsWarehouseModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleWarehouseSubmit = async (values: CreateWarehousePayload & { status?: string }) => {
    try {
      let success = false;
      if (editingWarehouse) {
        success = await updateWarehouse(editingWarehouse.id, values);
      } else {
        success = await createWarehouse(values);
      }

      if (success) {
        handleCloseModals();
        messageApi.success(editingWarehouse ? 'ແກ້ໄຂຂໍ້ມູນສາງສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນສາງໃໝ່ສຳເລັດແລ້ວ!');
        fetchWarehouses({
          page: currentPage,
          limit: 5,
          status: 'A',
          addressId: activeAddress === 'all' ? undefined : activeAddress,
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
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສາງນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteWarehouse(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນສາງສຳເລັດແລ້ວ!');
          fetchWarehouses({
            page: currentPage,
            limit: 5,
            status: 'A',
            addressId: activeAddress === 'all' ? undefined : activeAddress,
            search: debouncedSearch || undefined,
          });
        }
        else messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
      },
    });
  };

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
                <WarehouseIcon className="text-[#185C4D] w-8 h-8 relative z-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  ການຈັດການສາງ
                </h1>
                <p className="text-slate-500 font-medium text-base mt-0.5 tracking-wide">
                  ຈັດການໂຄງສ້າງການເກັບມ້ຽນເອກະສານໃຫ້ເປັນລະບົບ
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
              ເພີ່ມສາງໃໝ່
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        <WarehouseTable 
          data={warehouses} 
          total={total}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchName={searchName}
          onSearchChange={setSearchName}
          isLoading={isWarehouseLoading} 
          onEdit={(warehouse) => {
            setEditingWarehouse(warehouse);
            setIsWarehouseModalOpen(true);
          }}
          onDelete={handleDelete}
          onManage={(warehouse) => {
            router.push(`/dashboard/warehouses/${warehouse.id}`);
          }}
          filterAddress={activeAddress}
          onFilterAddressChange={(addressId) => {
            setActiveAddress(addressId);
            setCurrentPage(1);
          }}
          addressOptions={addressDropdown.map(addr => ({ value: addr.id.toString(), label: addr.name }))}
          filterDepartment={activeDepartment}
          onFilterDepartmentChange={(deptId) => {
            setActiveDepartment(deptId);
            setActiveDivision('all');
            setActiveAddress('all');
            setCurrentPage(1);
          }}
          departmentOptions={departmentDropdown.map(dept => ({ value: dept.id.toString(), label: dept.name }))}
          filterDivision={activeDivision}
          onFilterDivisionChange={(divId) => {
            setActiveDivision(divId);
            setActiveAddress('all');
            setCurrentPage(1);
          }}
          divisionOptions={divisionDropdown.map(div => ({ value: div.id.toString(), label: div.name }))}
        />
      </div>

      <WarehouseFormModal
        isOpen={isWarehouseModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleWarehouseSubmit}
        isLoading={isWarehouseLoading}
        initialData={editingWarehouse}
      />
    </div>
  );
}
