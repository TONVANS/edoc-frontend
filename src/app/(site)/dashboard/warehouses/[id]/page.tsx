'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Warehouse as WarehouseIcon, Plus, Edit2, Trash2, MapPin, AlignLeft, Layout, Building2, GitBranch } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useLockerStore } from '@/store/useLockerStore';
import DetailPageLayout from '@/components/views/shared/DetailPageLayout';
import LockerTable from '@/components/views/storage/LockerTable';
import LockerFormModal from '@/components/views/storage/LockerFormModal';
import WarehouseFormModal from '@/components/views/storage/WarehouseFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import { Locker, CreateLockerPayload, Warehouse, CreateWarehousePayload } from '@/types/prisma-mapped';
import { Badge } from 'antd';

export default function WarehouseDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Stores
  const { currentWarehouse, fetchWarehouseById, deleteWarehouse, updateWarehouse, isLoading: isWarehouseLoading } = useWarehouseStore();
  const { lockers, total, fetchLockers, createLocker, updateLocker, deleteLocker, isLoading: isLockerLoading } = useLockerStore();

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingLocker, setMovingLocker] = useState<Locker | null>(null);

  const initialLockerData = useMemo(() => ({ warehouseId: id } as unknown as Locker), [id]);

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
      fetchWarehouseById(id);
    }
    return () => {
      useLockerStore.setState({ lockers: [], total: 0 });
    };
  }, [id, fetchWarehouseById]);

  // Fetch children (Lockers)
  useEffect(() => {
    if (id) {
      fetchLockers({
        page: currentPage,
        limit: 5,
        warehouseId: id,
        search: debouncedSearch || undefined,
      });
    }
  }, [id, currentPage, debouncedSearch, fetchLockers]);

  // Handle Locker Actions
  const handleOpenCreateLocker = () => {
    setEditingLocker(null);
    setIsLockerModalOpen(true);
  };

  const handleLockerSubmit = async (values: CreateLockerPayload & { status?: string }) => {
    try {
      let success = false;
      const payloadWithWarehouse = { ...values, warehouseId: id };
      if (editingLocker) {
        success = await updateLocker(editingLocker.id, payloadWithWarehouse);
      } else {
        success = await createLocker(payloadWithWarehouse);
      }

      if (success) {
        setIsLockerModalOpen(false);
        setEditingLocker(null);
        messageApi.success(editingLocker ? 'ແກ້ໄຂຂໍ້ມູນຕູ້ສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນຕູ້ໃໝ່ສຳເລັດແລ້ວ!');
        fetchLockers({ page: currentPage, limit: 5, warehouseId: id, search: debouncedSearch || undefined });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteLocker = (lockerId: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຕູ້ນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteLocker(lockerId);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນຕູ້ສຳເລັດແລ້ວ!');
          fetchLockers({ page: currentPage, limit: 5, warehouseId: id, search: debouncedSearch || undefined });
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const handleOpenMoveModal = (locker: Locker) => {
    setMovingLocker(locker);
    setIsMoveModalOpen(true);
  };

  const handleMoveSuccess = () => {
    fetchLockers({ page: currentPage, limit: 5, warehouseId: id, search: debouncedSearch || undefined });
  };

  // Handle Warehouse Actions
  const handleWarehouseSubmit = async (values: CreateWarehousePayload & { status?: string }) => {
    try {
      const success = await updateWarehouse(id, values);
      if (success) {
        setIsWarehouseModalOpen(false);
        messageApi.success('ແກ້ໄຂຂໍ້ມູນສາງສຳເລັດແລ້ວ!');
        fetchWarehouseById(id);
      } else {
        messageApi.error('ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteWarehouse = () => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສາງນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteWarehouse(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນສາງສຳເລັດແລ້ວ!');
          router.replace('/dashboard/warehouses');
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const breadcrumbs = [
    { label: 'ສາງ', href: '/dashboard/warehouses' },
    { label: currentWarehouse?.name ? String(currentWarehouse.name) : 'ກຳລັງໂຫຼດ...', icon: <WarehouseIcon size={16} /> }
  ];

  const parentInfo = currentWarehouse ? [
    { label: 'ລະຫັດສາງ', value: currentWarehouse.code, icon: <AlignLeft size={16} /> },
    { label: 'ຝ່າຍ', value: currentWarehouse.department?.name || '-', icon: <Building2 size={16} /> },
    { label: 'ພະແນກ', value: currentWarehouse.division?.name || '-', icon: <GitBranch size={16} /> },
    { label: 'ລາຍລະອຽດ', value: currentWarehouse.description || '-', icon: <AlignLeft size={16} /> },
  ] : [];

  const statusBadge = currentWarehouse && (
    <Badge
      status={currentWarehouse.status === 'A' ? 'success' : 'error'}
      text={<span className="text-sm font-medium text-slate-700">{currentWarehouse.status === 'A' ? 'Active' : 'Inactive'}</span>}
      className="bg-white/60 px-3 py-1 rounded-xl shadow-sm border border-slate-200/50"
    />
  );

  const actionButtons = (
    <>
      <Button
        type="text"
        icon={<Edit2 size={18} className="text-blue-600" />}
        onClick={() => setIsWarehouseModalOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
      <Button
        type="text"
        danger
        icon={<Trash2 size={18} className="text-rose-500" />}
        onClick={handleDeleteWarehouse}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
    </>
  );

  const createButton = (
    <Button
      type="primary"
      size="large"
      icon={<Plus size={18} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
      onClick={handleOpenCreateLocker}
      className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-6 h-[48px] font-bold text-[15px]"
    >
      ເພີ່ມຕູ້ໃໝ່
    </Button>
  );

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <DetailPageLayout
        breadcrumbs={breadcrumbs}
        icon={<WarehouseIcon />}
        title={currentWarehouse?.name || 'ກຳລັງໂຫຼດ...'}
        subtitle="ຂໍ້ມູນລາຍລະອຽດ ແລະ ຕູ້ເກັບເອກະສານພາຍໃຕ້ສາງນີ້"
        parentInfo={parentInfo}
        statusBadge={statusBadge}
        actionButtons={actionButtons}
        createButton={createButton}
        isLoading={isWarehouseLoading}
      >
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
          onDelete={handleDeleteLocker}
          onMove={handleOpenMoveModal}
          onManage={(locker) => {
            router.push(`/dashboard/locker/${locker.id}`);
          }}
          warehouseOptions={[]}
          filterWarehouse={id} // Locked to this warehouse
          hideFilters={true}
        />
      </DetailPageLayout>

      <LockerFormModal
        isOpen={isLockerModalOpen}
        onClose={() => { setIsLockerModalOpen(false); setEditingLocker(null); }}
        onSubmit={handleLockerSubmit}
        isLoading={isLockerLoading}
        initialData={editingLocker || initialLockerData}
      />

      {currentWarehouse && (
        <WarehouseFormModal
          isOpen={isWarehouseModalOpen}
          onClose={() => setIsWarehouseModalOpen(false)}
          onSubmit={handleWarehouseSubmit}
          isLoading={isWarehouseLoading}
          initialData={currentWarehouse}
        />
      )}

      {isMoveModalOpen && movingLocker && (
        <MoveFormModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          onSuccess={handleMoveSuccess}
          type="locker"
          item={movingLocker}
        />
      )}
    </>
  );
}
