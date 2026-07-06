// src/app/(site)/dashboard/branches/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import { useAddressStore } from '@/store/useAddressStore';
import { Address, CreateAddressPayload } from '@/types/prisma-mapped';

// ດຶງ Component ທີ່ເຮົາສ້າງມານຳໃຊ້
import AddressTable from '@/components/views/address/AddressTable';
import AddressFormModal from '@/components/views/address/AddressFormModal';


export default function AddressPage() {
  const { addresses, total, isLoading, fetchAddresses, createAddress, updateAddress, deleteAddress } = useAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ໃຊ້ສຳລັບສະແດງ Popup ແຈ້ງເຕືອນ (Success / Error)
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
    fetchAddresses({
      page: currentPage,
      limit: 5,
      search: debouncedSearch || undefined,
    });
  }, [fetchAddresses, currentPage, debouncedSearch]);

  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  // ປ່ຽນຈາກ (values: any) ເປັນ Type ທີ່ຖືກຕ້ອງ ເພື່ອຄວາມປອດໄພ
  const handleSubmit = async (values: CreateAddressPayload & { status?: string }) => {
    try {
      let success = false;
      if (editingAddress) {
        success = await updateAddress(editingAddress.id, values);
      } else {
        success = await createAddress(values);
      }

      if (success) {
        handleCloseModal();
        messageApi.success({
          content: editingAddress ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ!' : 'ເພີ່ມຂໍ້ມູນສະຖານທີ່ໃໝ່ສຳເລັດແລ້ວ!',
          style: { marginTop: '20px' },
        });
        fetchAddresses({
          page: currentPage,
          limit: 5,
          search: debouncedSearch || undefined,
        });
      } else {
        messageApi.error('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້ ກະລຸນາກວດສອບຂໍ້ມູນອີກຄັ້ງ.');
      }
    } catch (error) {
      messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.');
    }
  };

  const handleDelete = (id: string | number) => {
    modal.confirm({
      title: 'ຢືນຢັນການລຶບຂໍ້ມູນ',
      content: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນສະຖານທີ່ນີ້? ຂໍ້ມູນທີ່ລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້.',
      okText: 'ລຶບຂໍ້ມູນ',
      okType: 'danger',
      cancelText: 'ຍົກເລີກ',
      centered: true,
      onOk: async () => {
        try {
          const success = await deleteAddress(id);
          if (success) {
            messageApi.success('ລຶບຂໍ້ມູນສຳເລັດແລ້ວ!');
            fetchAddresses({
              page: currentPage,
              limit: 5,
              search: debouncedSearch || undefined,
            });
          } else {
            messageApi.error('ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້.');
          }
        } catch (error) {
          messageApi.error('ເກີດຂໍ້ຜິດພາດໃນລະບົບ.');
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-full animate-in fade-in duration-500">
      {/* Container ສຳລັບແຈ້ງເຕືອນຂອງ Antd */}
      {contextHolder}
      {modalContextHolder}

      {/* ── ຫົວຂໍ້ໜ້າ (Header Section) ── */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 font-lao">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-center shrink-0">
            <Building2 className="text-[#185C4D] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight ">ການຈັດການຂໍ້ມູນສະຖານທີ່</h1>
            <p className="text-slate-500 text-sm mt-0.5">ຈັດການຂໍ້ມູນທີ່ຕັ້ງ, ສາຂາ ແລະ ລາຍລະອຽດຕ່າງໆຂອງອົງກອນ</p>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<Plus size={18} strokeWidth={2.5} />}
          onClick={handleOpenCreateModal}
          className="rounded-xl bg-[#185C4D] hover:bg-[#0f3d31] border-none shadow-sm hover:shadow-md transition-all px-6 font-medium h-[44px]"
        >
          ເພີ່ມສະຖານທີ່ໃໝ່
        </Button>
      </div>

      {/* ── ພື້ນທີ່ຕາຕະລາງ (Table Area) ── */}
      <AddressTable
        data={addresses}
        total={total}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        searchName={searchName}
        onSearchChange={setSearchName}
        isLoading={isLoading}
        onEdit={(address) => {
          setEditingAddress(address);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* ── Modal ຟອມເພີ່ມຂໍ້ມູນ ── */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={editingAddress}
      />

    </div>
  );
}