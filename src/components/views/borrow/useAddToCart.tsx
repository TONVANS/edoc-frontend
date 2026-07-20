'use client';

import { useBorrowCartStore, BorrowCartItem } from '@/store/useBorrowCartStore';
import { Modal } from 'antd';
import { toast } from 'sonner';

export function useAddToCart() {
  const { addItem, cartType, clearCart } = useBorrowCartStore();
  const [modal, contextHolder] = Modal.useModal();

  const handleAddToCart = (item: BorrowCartItem) => {
    // Try to add item
    const success = addItem(item);
    
    if (success) {
      toast.success('ເພີ່ມລາຍການລົງໃນກະຕ່າແລ້ວ');
    } else {
      // Type conflict
      const currentTypeName = cartType === 'document' ? 'ເອກະສານ' : 'ແຟ້ມເອກະສານ';
      const newTypeName = item.type === 'document' ? 'ເອກະສານ' : 'ແຟ້ມເອກະສານ';
      
      modal.confirm({
        title: 'ບໍ່ສາມາດເພີ່ມລາຍການໄດ້',
        content: `ກະຕ່າຂອງທ່ານມີ ${currentTypeName} ຢູ່ແລ້ວ. ທ່ານບໍ່ສາມາດຢືມ ${currentTypeName} ແລະ ${newTypeName} ພ້ອມກັນໄດ້. ທ່ານຕ້ອງການລ້າງກະຕ່າແລ້ວເພີ່ມ ${newTypeName} ນີ້ແທນບໍ່?`,
        okText: 'ລ້າງກະຕ່າ ແລະ ເພີ່ມໃໝ່',
        cancelText: 'ຍົກເລີກ',
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => {
          clearCart();
          addItem(item);
          toast.success('ເພີ່ມລາຍການລົງໃນກະຕ່າແລ້ວ');
        }
      });
    }
  };

  return { handleAddToCart, contextHolder };
}
