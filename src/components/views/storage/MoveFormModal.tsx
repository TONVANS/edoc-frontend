// src/components/views/storage/MoveFormModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Select, Spin } from 'antd';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useLockerStore } from '@/store/useLockerStore';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowRightLeft,
  Warehouse as WarehouseIcon,
  Layout as LockerIcon,
  FolderOpen as ShelfIcon,
  Folder as FolderIcon,
  FileText as DocumentIcon,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Locker, Folder, Document, Warehouse, Shelf } from '@/types/prisma-mapped';

interface MoveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'locker' | 'folder' | 'document';
  item: any; // Can be Locker, Folder, or Document
}

interface FormValues {
  warehouseId?: string;
  lockerId?: string;
  shelfId?: string;
  folderId?: string;
}

export default function MoveFormModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  item,
}: MoveFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lists for dropdown options
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);
  const [lockersList, setLockersList] = useState<Locker[]>([]);
  const [shelvesList, setShelvesList] = useState<Shelf[]>([]);
  const [foldersList, setFoldersList] = useState<Folder[]>([]);

  // Loading states for options
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingLockers, setLoadingLockers] = useState(false);
  const [loadingShelves, setLoadingShelves] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Store actions
  const { updateLocker } = useLockerStore();
  const { updateFolder } = useFolderStore();
  const { updateDocument } = useDocumentStore();

  // Reset and load initial data (warehouses)
  useEffect(() => {
    if (isOpen && item) {
      form.resetFields();
      setLockersList([]);
      setShelvesList([]);
      setFoldersList([]);
      loadWarehouses();
    }
  }, [isOpen, item, form]);

  const loadWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const response = await api.get('/warehouses');
      const resData = response.data.data;
      const data = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      setWarehousesList(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຄັງສິນຄ້າໄດ້');
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleWarehouseChange = async (warehouseId: string) => {
    // Reset subsequent fields
    form.setFieldsValue({ lockerId: undefined, shelfId: undefined, folderId: undefined });
    setLockersList([]);
    setShelvesList([]);
    setFoldersList([]);

    if (!warehouseId || type === 'locker') return;

    setLoadingLockers(true);
    try {
      const response = await api.get(`/lockers/warehouse/${warehouseId}`);
      const resData = response.data.data;
      const data = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      setLockersList(data);
    } catch (error) {
      console.error('Failed to load lockers:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລັອກເກີໄດ້');
    } finally {
      setLoadingLockers(false);
    }
  };

  const handleLockerChange = async (lockerId: string) => {
    form.setFieldsValue({ shelfId: undefined, folderId: undefined });
    setShelvesList([]);
    setFoldersList([]);

    if (!lockerId || type === 'locker') return;

    setLoadingShelves(true);
    try {
      const response = await api.get(`/shelves/locker/${lockerId}`);
      const resData = response.data.data;
      const data = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      setShelvesList(data);
    } catch (error) {
      console.error('Failed to load shelves:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຊັ້ນວາງໄດ້');
    } finally {
      setLoadingShelves(false);
    }
  };

  const handleShelfChange = async (shelfId: string) => {
    form.setFieldsValue({ folderId: undefined });
    setFoldersList([]);

    if (!shelfId || type !== 'document') return;

    setLoadingFolders(true);
    try {
      const response = await api.get('/folders', { params: { shelfId } });
      const resData = response.data.data;
      const data = Array.isArray(resData) ? resData : (resData as any)?.data || [];
      setFoldersList(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
      toast.error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນແຟ້ມເອກະສານໄດ້');
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleFinish = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let success = false;

      if (type === 'locker') {
        if (!values.warehouseId) return;
        // Move locker to warehouse
        success = await updateLocker(item.id, { warehouseId: values.warehouseId });
      } else if (type === 'folder') {
        if (!values.shelfId) return;
        // Move folder to shelf
        success = await updateFolder(item.id, { shelfId: values.shelfId });
      } else if (type === 'document') {
        if (!values.folderId) return;
        // Move document to folder
        success = await updateDocument(item.id, { folderId: values.folderId });
      }

      if (success) {
        toast.success('ຍ້າຍຕຳແໜ່ງສຳເລັດຮຽບຮ້ອຍ!');
        onSuccess();
        onClose();
      } else {
        toast.error('ບໍ່ສາມາດຍ້າຍຕຳແໜ່ງໄດ້ ເກີດຂໍ້ຜິດພາດໃນລະບົບ');
      }
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການຍ້າຍຕຳແໜ່ງ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCls = cn(
    '[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md! [&_.ant-select-selector]:border-white/60! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]! text-slate-800 font-medium'
  );

  const getHeaderIcon = () => {
    switch (type) {
      case 'locker':
        return <LockerIcon className="w-8 h-8 text-white" strokeWidth={2.5} />;
      case 'folder':
        return <FolderIcon className="w-8 h-8 text-white" strokeWidth={2.5} />;
      case 'document':
        return <DocumentIcon className="w-8 h-8 text-white" strokeWidth={2.5} />;
    }
  };

  const getHeaderTitle = () => {
    switch (type) {
      case 'locker':
        return `ຍ້າຍລັອກເກີ: ${item?.code || ''}`;
      case 'folder':
        return `ຍ້າຍແຟ້ມ: ${item?.name || item?.code || ''}`;
      case 'document':
        return `ຍ້າຍເອກະສານ: ${item?.title || item?.docNo || ''}`;
    }
  };

  const getHeaderSubtitle = () => {
    switch (type) {
      case 'locker':
        return 'ເລືອກສາງປາຍທາງທີ່ຕ້ອງການຍ້າຍລັອກເກີນີ້ໄປໄວ້';
      case 'folder':
        return 'ເລືອກຊັ້ນວາງປາຍທາງໂດຍການກັ່ນຕອງໄປເທື່ອລະຂັ້ນຕອນ';
      case 'document':
        return 'ເລືອກແຟ້ມເອກະສານປາຍທາງໂດຍການກັ່ນຕອງໄປເທື່ອລະຂັ້ນຕອນ';
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={600}
      centered
      title={null}
      closable={false}
      mask={{ closable: !isSubmitting }}
      className={cn(
        '[&_.ant-modal-content]:p-0',
        '[&_.ant-modal-content]:bg-transparent',
        '[&_.ant-modal-content]:shadow-none',
        '[&_.ant-modal-content]:rounded-[32px]'
      )}
      wrapClassName="backdrop-blur-md"
    >
      <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col">
        
        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 border-none bg-transparent cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5 relative">
              {getHeaderIcon()}
              <ArrowRightLeft className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight leading-tight">
                {getHeaderTitle()}
              </h2>
              <p className="text-emerald-50/80 text-[13px] mt-1.5 font-medium max-w-[340px]">
                {getHeaderSubtitle()}
              </p>
            </div>
          </div>
        </header>

        {/* ══ BODY ════════════════════════════════════════════ */}
        <main className="px-10 py-8 -mt-8 bg-white/80 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className="space-y-5"
          >
            {/* Step 1: Warehouse */}
            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><WarehouseIcon size={14} className="text-[#185C4D]" /> ເລືອກສາງ (Warehouse) <span className="text-rose-500">*</span></span>}
              name="warehouseId"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກສາງ!' }]}
            >
              <Select
                placeholder="ເລືອກສາງປາຍທາງ"
                className={selectCls}
                loading={loadingWarehouses}
                onChange={handleWarehouseChange}
                options={warehousesList.map(w => ({ value: w.id, label: w.name }))}
                disabled={isSubmitting}
              />
            </Form.Item>

            {/* Step 2: Locker (For Folder and Document) */}
            {(type === 'folder' || type === 'document') && (
              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><LockerIcon size={14} className="text-[#185C4D]" /> ເລືອກລັອກເກີ (Locker) <span className="text-rose-500">*</span></span>}
                name="lockerId"
                rules={[{ required: true, message: 'ກະລຸນາເລືອກລັອກເກີ!' }]}
              >
                <Select
                  placeholder={form.getFieldValue('warehouseId') ? "ເລືອກລັອກເກີປາຍທາງ" : "ກະລຸນາເລືອກສາງກ່ອນ"}
                  className={selectCls}
                  loading={loadingLockers}
                  onChange={handleLockerChange}
                  options={lockersList.map(l => ({ value: l.id, label: l.name || l.code }))}
                  disabled={!form.getFieldValue('warehouseId') || isSubmitting}
                />
              </Form.Item>
            )}

            {/* Step 3: Shelf (For Folder and Document) */}
            {(type === 'folder' || type === 'document') && (
              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><ShelfIcon size={14} className="text-[#185C4D]" /> ເລືອກຊັ້ນວາງ (Shelf) <span className="text-rose-500">*</span></span>}
                name="shelfId"
                rules={[{ required: type === 'folder', message: 'ກະລຸນາເລືອກຊັ້ນວາງ!' }]}
              >
                <Select
                  placeholder={form.getFieldValue('lockerId') ? "ເລືອກຊັ້ນວາງປາຍທາງ" : "ກະລຸນາເລືອກລັອກເກີກ່ອນ"}
                  className={selectCls}
                  loading={loadingShelves}
                  onChange={handleShelfChange}
                  options={shelvesList.map(s => ({ value: s.id, label: s.name || s.code }))}
                  disabled={!form.getFieldValue('lockerId') || isSubmitting}
                />
              </Form.Item>
            )}

            {/* Step 4: Folder (For Document Only) */}
            {type === 'document' && (
              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><FolderIcon size={14} className="text-[#185C4D]" /> ເລືອກແຟ້ມ (Folder) <span className="text-rose-500">*</span></span>}
                name="folderId"
                rules={[{ required: true, message: 'ກະລຸນາເລືອກແຟ້ມເອກະສານ!' }]}
              >
                <Select
                  placeholder={form.getFieldValue('shelfId') ? "ເລືອກແຟ້ມປາຍທາງ" : "ກະລຸນາເລືອກຊັ້ນວາງກ່ອນ"}
                  className={selectCls}
                  loading={loadingFolders}
                  options={foldersList.map(f => ({ value: f.id, label: f.name || f.code }))}
                  disabled={!form.getFieldValue('shelfId') || isSubmitting}
                />
              </Form.Item>
            )}

            {/* Actions Footer */}
            <footer className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Button 
                onClick={onClose} 
                disabled={isSubmitting} 
                className="h-12 px-8 rounded-2xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all cursor-pointer"
              >
                ຍົກເລີກ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="h-12 px-10 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none flex items-center gap-2 cursor-pointer text-white"
              >
                ຢືນຢັນການຍ້າຍ <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}
