'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout as LockerIcon, Plus, Edit2, Trash2, MapPin, AlignLeft, Layers } from 'lucide-react';
import { Button, message, Modal, Badge } from 'antd';
import { useLockerStore } from '@/store/useLockerStore';
import { useShelfStore } from '@/store/useShelfStore';
import DetailPageLayout from '@/components/views/shared/DetailPageLayout';
import ShelfTable from '@/components/views/storage/ShelfTable';
import ShelfFormModal from '@/components/views/storage/ShelfFormModal';
import LockerFormModal from '@/components/views/storage/LockerFormModal';
import MoveFormModal from '@/components/views/storage/MoveFormModal';
import { Shelf, CreateShelfPayload, Locker, CreateLockerPayload } from '@/types/prisma-mapped';

export default function LockerDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Stores
  const { currentLocker, fetchLockerById, deleteLocker, updateLocker, isLoading: isLockerLoading } = useLockerStore();
  const { shelves, total, fetchShelves, createShelf, updateShelf, deleteShelf, isLoading: isShelfLoading } = useShelfStore();

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null);
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);

  const initialShelfData = useMemo(() => {
    if (currentLocker) {
      return { lockerId: id, locker: currentLocker } as unknown as Shelf;
    }
    return { lockerId: id } as unknown as Shelf;
  }, [id, currentLocker]);

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
      fetchLockerById(id);
    }
    return () => {
      useShelfStore.setState({ shelves: [], total: 0 });
    };
  }, [id, fetchLockerById]);

  // Fetch children (Shelves)
  useEffect(() => {
    if (id) {
      fetchShelves({
        page: currentPage,
        limit: 5,
        lockerId: id,
        search: debouncedSearch || undefined,
      });
    }
  }, [id, currentPage, debouncedSearch, fetchShelves]);

  // Handle Shelf Actions
  const handleOpenCreateShelf = () => {
    setEditingShelf(null);
    setIsShelfModalOpen(true);
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
        setIsShelfModalOpen(false);
        setEditingShelf(null);
        messageApi.success(editingShelf ? 'ແກ້ໄຂຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນຊັ້ນວາງໃໝ່ສຳເລັດແລ້ວ!');
        fetchShelves({ page: currentPage, limit: 5, lockerId: id, search: debouncedSearch || undefined });
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteShelf = (shelfId: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຊັ້ນວາງນີ້?',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteShelf(shelfId);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນຊັ້ນວາງສຳເລັດແລ້ວ!');
          fetchShelves({ page: currentPage, limit: 5, lockerId: id, search: debouncedSearch || undefined });
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  // Handle Locker Actions
  const handleLockerSubmit = async (values: CreateLockerPayload & { status?: string }) => {
    try {
      const success = await updateLocker(id, values);
      if (success) {
        setIsLockerModalOpen(false);
        messageApi.success('ແກ້ໄຂຂໍ້ມູນຕູ້ສຳເລັດແລ້ວ!');
        fetchLockerById(id);
      } else {
        messageApi.error('ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
    }
  };

  const handleDeleteLocker = () => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຕູ້ນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        const success = await deleteLocker(id);
        if (success) {
          messageApi.success('ລຶບຂໍ້ມູນຕູ້ສຳເລັດແລ້ວ!');
          if (currentLocker?.warehouseId) {
            router.replace(`/dashboard/warehouses/${currentLocker.warehouseId}`);
          } else {
            router.replace('/dashboard/locker');
          }
        } else {
          messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
        }
      },
    });
  };

  const breadcrumbs = [
    ...(currentLocker?.warehouse ? [
      ...((currentLocker as any).warehouse?.department ? [{ label: (currentLocker as any).warehouse.department.name }] : []),
      { label: currentLocker.warehouse.name, href: `/dashboard/warehouses/${currentLocker.warehouseId}` }
    ] : [{ label: 'ຕູ້', href: '/dashboard/locker' }]),
    { label: currentLocker?.name ? String(currentLocker.name) : 'ກຳລັງໂຫຼດ...', icon: <LockerIcon size={16} /> }
  ];

  const parentInfo = currentLocker ? [
    { label: 'ຝ່າຍ', value: (currentLocker as any).warehouse?.department?.name || '-', icon: <Layers size={16} /> },
    { label: 'ພະແນກ / ສາຂາ', value: (currentLocker as any).warehouse?.division?.name || '-', icon: <Layers size={16} /> },
    { label: 'ສາງທີ່ຕັ້ງຢູ່', value: currentLocker.warehouse?.name || '-', icon: <MapPin size={16} /> },
    { label: 'ຈຳນວນຊັ້ນວາງ', value: (currentLocker as any).shelvesCount ? `${(currentLocker as any).shelvesCount} ຊັ້ນ` : '-', icon: <AlignLeft size={16} /> },
  ] : [];

  const statusBadge = currentLocker && (
    <Badge
      status={currentLocker.status === 'A' ? 'success' : 'error'}
      text={<span className="text-sm font-medium text-slate-700">{currentLocker.status === 'A' ? 'Active' : 'Inactive'}</span>}
      className="bg-white/60 px-3 py-1 rounded-xl shadow-sm border border-slate-200/50"
    />
  );

  const actionButtons = (
    <>
      <Button
        type="text"
        icon={<Edit2 size={18} className="text-blue-600" />}
        onClick={() => setIsLockerModalOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
      <Button
        type="text"
        danger
        icon={<Trash2 size={18} className="text-rose-500" />}
        onClick={handleDeleteLocker}
        className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md flex items-center justify-center transition-all duration-300"
      />
    </>
  );

  const createButton = (
    <Button
      type="primary"
      size="large"
      icon={<Plus size={18} strokeWidth={3} className="transition-transform group-hover:rotate-90 duration-300" />}
      onClick={handleOpenCreateShelf}
      className="group rounded-[16px] bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] hover:-translate-y-1 transition-all duration-300 px-6 h-[48px] font-bold text-[15px]"
    >
      ເພີ່ມຊັ້ນວາງໃໝ່
    </Button>
  );

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <DetailPageLayout
        breadcrumbs={breadcrumbs}
        icon={<LockerIcon />}
        title={currentLocker?.name || 'ກຳລັງໂຫຼດ...'}
        entityCode={currentLocker?.code}
        subtitle={currentLocker?.description || "ຂໍ້ມູນລາຍລະອຽດ ແລະ ຊັ້ນວາງເອກະສານພາຍໃຕ້ຕູ້ນີ້"}
        parentInfo={parentInfo}
        statusBadge={statusBadge}
        actionButtons={actionButtons}
        createButton={createButton}
        isLoading={isLockerLoading}
      >
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
          onDelete={handleDeleteShelf}
          onManage={(shelf) => {
            router.push(`/dashboard/shelves/${shelf.id}`);
          }}
          lockers={[]}
          filterLocker={id} // Locked to this locker
          warehouses={[]}
          hideFilters={true}
        />
      </DetailPageLayout>

      <ShelfFormModal
        isOpen={isShelfModalOpen}
        onClose={() => { setIsShelfModalOpen(false); setEditingShelf(null); }}
        onSubmit={handleShelfSubmit}
        isLoading={isShelfLoading}
        initialData={editingShelf || initialShelfData}
      />

      {currentLocker && (
        <LockerFormModal
          isOpen={isLockerModalOpen}
          onClose={() => setIsLockerModalOpen(false)}
          onSubmit={handleLockerSubmit}
          isLoading={isLockerLoading}
          initialData={currentLocker}
        />
      )}
    </>
  );
}
