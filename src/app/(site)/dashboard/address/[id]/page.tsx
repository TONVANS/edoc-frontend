'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Plus, Edit2, Trash2, GitBranch, AlignLeft } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useAddressStore } from '@/store/useAddressStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import DetailPageLayout from '@/components/views/shared/DetailPageLayout';
import WarehouseTable from '@/components/views/storage/WarehouseTable';
import WarehouseFormModal from '@/components/views/storage/WarehouseFormModal';
import AddressFormModal from '@/components/views/address/AddressFormModal';
import AddressStatusBadge from '@/components/views/address/AddressStatusBadge';
import { Warehouse, CreateWarehousePayload, Address, CreateAddressPayload } from '@/types/prisma-mapped';

export default function AddressDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Stores
  const { currentAddress, fetchAddressById, deleteAddress, updateAddress, isLoading: isAddressLoading } = useAddressStore();
  const { warehouses, total, fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, isLoading: isWarehouseLoading } = useWarehouseStore();

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const initialWarehouseData = useMemo(() => ({ addressId: id } as unknown as Warehouse), [id]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  // Initial Fetch
  useEffect(() => {
    if (id) {
      fetchAddressById(id);
    }
    return () => {
      useWarehouseStore.setState({ warehouses: [], total: 0 });
    };
  }, [id, fetchAddressById]);

  // Fetch children (Warehouses)
  useEffect(() => {
    if (id) {
      fetchWarehouses({
        page: currentPage,
        limit: 5,
        status: 'A',
        addressId: id,
        search: debouncedSearch || undefined,
      });
    }
  }, [id, currentPage, debouncedSearch, fetchWarehouses]);

  // Handle Warehouse Actions
  const handleOpenCreateWarehouse = () => {
    setEditingWarehouse(null);
    setIsWarehouseModalOpen(true);
  };

  const handleWarehouseSubmit = async (values: CreateWarehousePayload & { status?: string }) => {
    try {
      let success = false;
      const payloadWithAddress = { ...values, addressId: id };
      if (editingWarehouse) {
        success = await updateWarehouse(editingWarehouse.id, payloadWithAddress);
      } else {
        success = await createWarehouse(payloadWithAddress);
      }

      if (success) {
        setIsWarehouseModalOpen(false);
        setEditingWarehouse(null);
        messageApi.success(editingWarehouse ? 'ແກ້ໄຂຂໍ້ມູນສາງສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນສາງໃໝ່ສຳເລັດແລ້ວ!');
        fetchWarehouses({ page: currentPage, limit: 5, status: 'A', addressId: id, search: debouncedSearch || undefined });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteWarehouse = (warehouseId: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສາງນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteWarehouse(warehouseId);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນສາງສຳເລັດແລ້ວ!');
          fetchWarehouses({ page: currentPage, limit: 5, status: 'A', addressId: id, search: debouncedSearch || undefined });
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  // Handle Address Actions
  const handleAddressSubmit = async (values: CreateAddressPayload & { status?: string }) => {
    try {
      const success = await updateAddress(id, values);
      if (success) {
        setIsAddressModalOpen(false);
        messageApi.success('ແກ້ໄຂຂໍ້ມູນສະຖານທີ່ສຳເລັດແລ້ວ!');
        fetchAddressById(id);
      } else {
        messageApi.error('ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteAddress = () => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສະຖານທີ່ນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteAddress(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນສະຖານທີ່ສຳເລັດແລ້ວ!');
          router.replace('/dashboard/address');
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const breadcrumbs = [
    { label: 'ຂໍ້ມູນສະຖານທີ່', href: '/dashboard/address' },
    { label: currentAddress?.name ? String(currentAddress.name) : 'ກຳລັງໂຫຼດ...', icon: <Building2 size={16} /> }
  ];

  const parentInfo = currentAddress ? [
    { label: 'ລະຫັດສະຖານທີ່', value: currentAddress.code, icon: <AlignLeft size={16} /> },
    { label: 'ຝ່າຍ', value: currentAddress.departmentData?.name || '-', icon: <Building2 size={16} /> },
    { label: 'ພະແນກ', value: currentAddress.divisionData?.name || '-', icon: <GitBranch size={16} /> },
    { label: 'ລາຍລະອຽດ', value: currentAddress.details || '-', icon: <AlignLeft size={16} /> },
  ] : [];

  const actionButtons = (
    <>
      <Button
        type="text"
        icon={<Edit2 size={18} className="text-blue-600" />}
        onClick={() => setIsAddressModalOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
      <Button
        type="text"
        danger
        icon={<Trash2 size={18} className="text-rose-500" />}
        onClick={handleDeleteAddress}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
    </>
  );

  const createButton = (
    <Button
      type="primary"
      size="large"
      icon={<Plus size={18} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
      onClick={handleOpenCreateWarehouse}
      className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-6 h-[48px] font-bold text-[15px]"
    >
      ເພີ່ມສາງໃໝ່
    </Button>
  );

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <DetailPageLayout
        breadcrumbs={breadcrumbs}
        icon={<Building2 />}
        title={currentAddress?.name || 'ກຳລັງໂຫຼດ...'}
        subtitle="ຂໍ້ມູນລາຍລະອຽດ ແລະ ສາງພາຍໃຕ້ສະຖານທີ່ນີ້"
        parentInfo={parentInfo}
        statusBadge={currentAddress && <AddressStatusBadge status={currentAddress.status} />}
        actionButtons={actionButtons}
        createButton={createButton}
        isLoading={isAddressLoading}
      >
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
          onDelete={handleDeleteWarehouse}
          onManage={(warehouse) => {
            router.push(`/dashboard/warehouses/${warehouse.id}`);
          }}
          // Hide department/division/address filters since we are already scoped to an address
          filterDepartment="all"
          filterDivision="all"
          filterAddress={id}
          hideFilters={true}
        />
      </DetailPageLayout>

      <WarehouseFormModal
        isOpen={isWarehouseModalOpen}
        onClose={() => { setIsWarehouseModalOpen(false); setEditingWarehouse(null); }}
        onSubmit={handleWarehouseSubmit}
        isLoading={isWarehouseLoading}
        initialData={editingWarehouse || initialWarehouseData}
      />

      {currentAddress && (
        <AddressFormModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSubmit={handleAddressSubmit}
          isLoading={isAddressLoading}
          initialData={currentAddress}
        />
      )}
    </>
  );
}
