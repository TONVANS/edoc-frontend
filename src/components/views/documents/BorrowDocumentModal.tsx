'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker } from 'antd';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { Document } from '@/types/prisma-mapped';
import { toast } from 'sonner';
import { X, BookOpen, ArrowRight, Building2, Globe, Phone, User as UserIcon, MapPin, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface BorrowDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess: () => void;
}

export default function BorrowDocumentModal({
  isOpen,
  onClose,
  document,
  onSuccess,
}: BorrowDocumentModalProps) {


  const [form] = Form.useForm();
  const [borrowType, setBorrowType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  
  const { divisionDropdown, fetchDropdown: fetchDivisionDropdown } = useDivisionStore();
  const { createBorrow, isLoading } = useDocumentBorrowStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        form.resetFields();
      }, 0);
      setBorrowType('INTERNAL');
      fetchDivisionDropdown();
    }
  }, [isOpen, form, fetchDivisionDropdown]);

  const handleFinish = async (values: any) => {
    if (!document) return;

    const payload = {
      documentIds: [document.id],
      folderIds: document.folderId ? [document.folderId] : [],
      borrower: values.borrower,
      phone: values.phone || undefined,
      purpose: values.purpose,
      note: values.note || undefined,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      // Only include toDivisionId if it's an internal borrow, and toLocation if it's an external borrow
      ...(borrowType === 'INTERNAL' && { toDivisionId: values.toDivisionId }),
      ...(borrowType === 'EXTERNAL' && { toLocation: values.toLocation })
    };

    const success = await createBorrow(payload);
    if (success) {
      toast.success('ບັນທຶກການຢືມເອກະສານສຳເລັດແລ້ວ');
      onSuccess();
      onClose();
    } else {
      toast.error('ບໍ່ສາມາດບັນທຶກການຢືມເອກະສານໄດ້');
    }
  };

  const selectCls = cn(
    '[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md! [&_.ant-select-selector]:border-white/60! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]! text-slate-800 font-medium'
  );
  const inputCls = "rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm h-12 px-4 hover:bg-white focus:bg-white transition-all";

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={620}
      centered
      title={null}
      closable={false}
      mask={{ closable: !isLoading }}
      className={cn(
        '[&_.ant-modal-content]:p-0',
        '[&_.ant-modal-content]:bg-transparent',
        '[&_.ant-modal-content]:shadow-none',
        '[&_.ant-modal-content]:rounded-[32px]'
      )}
      wrapClassName="backdrop-blur-md"
    >
      <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col">
        
        {/* Header */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 border-none bg-transparent cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5 relative">
              <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight leading-tight">
                ຢືມເອກະສານ
              </h2>
              <p className="text-emerald-50/80 text-[13px] mt-1.5 font-medium max-w-[340px] truncate" title={document?.title}>
                {document?.title || document?.docNo || ''}
              </p>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="px-10 py-8 -mt-8 bg-white/80 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10">
          
          {/* Document Preview Card */}
          {document && (
            <div className="bg-white/60 border border-white/80 rounded-2xl p-4 mb-6 shadow-xs flex items-start gap-3">
              <div className="p-2.5 bg-[#185C4D]/10 rounded-xl text-[#185C4D]">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[#185C4D] font-bold uppercase tracking-wider">ເອກະສານທີ່ຈະຢືມ</div>
                <div className="font-bold text-slate-700 text-sm truncate mt-0.5" title={document.title}>
                  {document.title}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                  <span className="bg-[#185C4D]/5 text-[#185C4D] px-2 py-0.5 rounded font-mono font-bold">No: {document.docNo}</span>
                  {document.folderId && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ແຟ້ມເກັບມ້ຽນ
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className="space-y-5"
          >
            {/* Visual Borrow Type Selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setBorrowType('INTERNAL')}
                className={cn(
                  "p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 cursor-pointer outline-hidden",
                  borrowType === 'INTERNAL'
                    ? "bg-[#185C4D]/10 border-[#185C4D] text-[#185C4D] shadow-md shadow-[#185C4D]/5"
                    : "bg-white/40 border-white/60 text-slate-500 hover:bg-white/60 hover:text-slate-700"
                )}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-bold text-xs">ພາຍໃນອົງກອນ (Internal)</span>
              </button>
              <button
                type="button"
                onClick={() => setBorrowType('EXTERNAL')}
                className={cn(
                  "p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 cursor-pointer outline-hidden",
                  borrowType === 'EXTERNAL'
                    ? "bg-[#185C4D]/10 border-[#185C4D] text-[#185C4D] shadow-md shadow-[#185C4D]/5"
                    : "bg-white/40 border-white/60 text-slate-500 hover:bg-white/60 hover:text-slate-700"
                )}
              >
                <Globe className="w-5 h-5" />
                <span className="font-bold text-xs">ພາຍນອກອົງກອນ (External)</span>
              </button>
            </div>

            {/* Borrower & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><UserIcon size={14} className="text-slate-400" /> ຊື່ຜູ້ຢືມ <span className="text-rose-500">*</span></span>}
                name="borrower"
                rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ຜູ້ຢືມ!' }]}
              >
                <Input placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ" className={inputCls} />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> ເບີໂທລະສັບ</span>}
                name="phone"
              >
                <Input placeholder="ປ້ອນເບີໂທລະສັບຕິດຕໍ່" className={inputCls} />
              </Form.Item>
            </div>

            {/* Destination & Due Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {borrowType === 'INTERNAL' ? (
                <Form.Item
                  label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><Building2 size={14} className="text-slate-400" /> ພະແນກ <span className="text-rose-500">*</span></span>}
                  name="toDivisionId"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກພະແນກ!' }]}
                >
                  <Select
                    placeholder="ເລືອກພະແນກ"
                    className={selectCls}
                    showSearch
                    optionFilterProp="children"
                  >
                    {divisionDropdown.map(d => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> ພາກສ່ວນທີ່ນຳໄປໃຊ້ <span className="text-rose-500">*</span></span>}
                  name="toLocation"
                  rules={[{ required: true, message: 'ກະລຸນາປ້ອນພາກສ່ວນທີ່ນຳໄປໃຊ້!' }]}
                >
                  <Input placeholder="ປ້ອນຊື່ພາກສ່ວນທີ່ນຳໄປໃຊ້" className={inputCls} />
                </Form.Item>
              )}

              <Form.Item
                label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> ກຳນົດສົ່ງຄືນ (Due Date)</span>}
                name="dueDate"
              >
                <DatePicker
                  placeholder="ເລືອກກຳນົດສົ່ງຄືນ"
                  className={cn(inputCls, "w-full flex items-center [&_input]:text-slate-800 [&_input]:font-medium")}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-bold text-slate-700">ຈຸດປະສົງການຢືມ <span className="text-rose-500">*</span></span>}
              name="purpose"
              rules={[{ required: true, message: 'ກະລຸນາປ້ອນຈຸດປະສົງ!' }]}
            >
              <Input.TextArea placeholder="ປ້ອນຈຸດປະສົງ" autoSize={{ minRows: 2, maxRows: 4 }} className="rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm p-4 hover:bg-white focus:bg-white transition-all" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">ໝາຍເຫດ</span>}
              name="note"
            >
              <Input.TextArea placeholder="ໝາຍເຫດເພີ່ມເຕີມ..." autoSize={{ minRows: 2, maxRows: 4 }} className="rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm p-4 hover:bg-white focus:bg-white transition-all" />
            </Form.Item>

            <footer className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Button 
                onClick={onClose} 
                disabled={isLoading} 
                className="h-12 px-8 rounded-2xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all cursor-pointer"
              >
                ຍົກເລີກ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="h-12 px-10 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none flex items-center gap-2 cursor-pointer text-white"
              >
                ບັນທຶກການຢືມ <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}
