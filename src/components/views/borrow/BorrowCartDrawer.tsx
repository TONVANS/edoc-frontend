'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, DatePicker } from 'antd';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { useBorrowCartStore } from '@/store/useBorrowCartStore';
import { toast } from 'sonner';
import { 
  X, ShoppingCart, ArrowRight, Building2, Globe, 
  Phone, User as UserIcon, MapPin, Calendar, FileText, Trash2, FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface BorrowCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BorrowCartDrawer({ isOpen, onClose }: BorrowCartDrawerProps) {


  const [form] = Form.useForm();
  const [borrowType, setBorrowType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  
  const { divisionDropdown, fetchDropdown: fetchDivisionDropdown } = useDivisionStore();
  const { departmentDropdown, fetchDropdown: fetchDepartmentDropdown } = useDepartmentStore();
  const { createBorrow, isLoading } = useDocumentBorrowStore();
  
  const { items, cartType, removeItem, clearCart, getItemCount } = useBorrowCartStore();

  useEffect(() => {
    if (isOpen) {
      // Don't reset fields on every open, so users don't lose data if they just close and reopen
      setTimeout(() => {
        const currentDeptId = form.getFieldValue('departmentId');
        fetchDivisionDropdown(currentDeptId ? { departmentId: currentDeptId } : undefined);
      }, 0);
      fetchDepartmentDropdown();
    }
  }, [isOpen, fetchDivisionDropdown, fetchDepartmentDropdown, form]);

  const handleFinish = async (values: any) => {
    if (items.length === 0) {
      toast.error('ບໍ່ມີລາຍການໃນກະຕ່າ');
      return;
    }

    const payload = {
      documentIds: cartType === 'document' ? items.map(i => i.id) : [],
      folderIds: cartType === 'folder' ? items.map(i => i.id) : [],
      borrower: values.borrower,
      phone: values.phone || undefined,
      purpose: values.purpose,
      note: values.note || undefined,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      ...(borrowType === 'INTERNAL' && { toDivisionId: values.toDivisionId }),
      ...(borrowType === 'EXTERNAL' && { toLocation: values.toLocation })
    };

    const success = await createBorrow(payload);
    if (success) {
      toast.success('ບັນທຶກການຢືມສຳເລັດແລ້ວ');
      clearCart();
      form.resetFields();
      onClose();
    } else {
      toast.error('ບໍ່ສາມາດບັນທຶກການຢືມໄດ້');
    }
  };

  const selectCls = cn(
    '[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-slate-50! [&_.ant-select-selector]:border-slate-200! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]! text-slate-800 font-medium'
  );
  const inputCls = "rounded-2xl bg-slate-50 border-slate-200 shadow-sm h-12 px-4 hover:bg-white focus:bg-white transition-all";

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={isOpen}
      size="large"
      closable={false}
      maskClosable={!isLoading}
      styles={{ body: { padding: 0 } }}
      destroyOnClose={false}
    >
      <div className="flex flex-col h-full bg-white relative">
        
        {/* Header */}
        <header className="relative px-8 pt-8 pb-10 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66] shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 border-none bg-transparent cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5 relative">
              <ShoppingCart className="w-7 h-7 text-white" strokeWidth={2.5} />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#1c6958]">
                  {getItemCount()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight leading-tight">
                ກະຕ່າຢືມ (Borrow Cart)
              </h2>
              <p className="text-emerald-50/80 text-[13px] mt-1 font-medium">
                {cartType === 'document' ? 'ຢືມເອກະສານ' : cartType === 'folder' ? 'ຢືມແຟ້ມເອກະສານ' : 'ຍັງບໍ່ມີລາຍການ'}
              </p>
            </div>
          </div>
        </header>

        {/* Body Area */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50/50">
          
          {/* Cart Items List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                ລາຍການໃນກະຕ່າ ({getItemCount()})
              </h3>
              {getItemCount() > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={12} /> ລ້າງກະຕ່າ
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
                <p className="text-slate-500 font-medium">ຍັງບໍ່ມີລາຍການໃນກະຕ່າ</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-55 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-3 shadow-sm group">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      item.type === 'document' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {item.type === 'document' ? <FileText size={18} /> : <FolderOpen size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{item.type === 'document' ? 'ເອກະສານ' : 'ແຟ້ມເອກະສານ'}</div>
                      <div className="font-bold text-slate-700 text-sm truncate" title={item.name}>{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{item.code}</div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-slate-200 mb-8" />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className="space-y-5"
          >
            {/* Visual Borrow Type Selector */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setBorrowType('INTERNAL')}
                className={cn(
                  "p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 cursor-pointer outline-hidden",
                  borrowType === 'INTERNAL'
                    ? "bg-[#185C4D]/10 border-[#185C4D] text-[#185C4D] shadow-md shadow-[#185C4D]/5"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-bold text-xs">ພາຍໃນອົງກອນ</span>
              </button>
              <button
                type="button"
                onClick={() => setBorrowType('EXTERNAL')}
                className={cn(
                  "p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 cursor-pointer outline-hidden",
                  borrowType === 'EXTERNAL'
                    ? "bg-[#185C4D]/10 border-[#185C4D] text-[#185C4D] shadow-md shadow-[#185C4D]/5"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <Globe className="w-5 h-5" />
                <span className="font-bold text-xs">ພາຍນອກອົງກອນ</span>
              </button>
            </div>

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

            {borrowType === 'INTERNAL' ? (
              <div className="space-y-5">
                <Form.Item
                  label={<span className="font-bold text-slate-700 flex items-center gap-1.5"><Building2 size={14} className="text-slate-400" /> ຝ່າຍ</span>}
                  name="departmentId"
                >
                  <Select
                    placeholder="ເລືອກຝ່າຍ (ເພື່ອການຄົ້ນຫາທີ່ງ່າຍຂຶ້ນ)"
                    className={selectCls}
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onChange={(value) => {
                      form.setFieldValue('toDivisionId', undefined);
                      fetchDivisionDropdown(value ? { departmentId: value } : undefined);
                    }}
                  >
                    {departmentDropdown.map(d => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

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
              </div>
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

            <Form.Item
              label={<span className="font-bold text-slate-700">ຈຸດປະສົງການຢືມ <span className="text-rose-500">*</span></span>}
              name="purpose"
              rules={[{ required: true, message: 'ກະລຸນາປ້ອນຈຸດປະສົງ!' }]}
            >
              <Input.TextArea placeholder="ປ້ອນຈຸດປະສົງ" autoSize={{ minRows: 2, maxRows: 4 }} className="rounded-2xl bg-slate-50 border-slate-200 shadow-sm p-4 hover:bg-white focus:bg-white transition-all" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">ໝາຍເຫດ</span>}
              name="note"
            >
              <Input.TextArea placeholder="ໝາຍເຫດເພີ່ມເຕີມ..." autoSize={{ minRows: 2, maxRows: 4 }} className="rounded-2xl bg-slate-50 border-slate-200 shadow-sm p-4 hover:bg-white focus:bg-white transition-all" />
            </Form.Item>
            
            {/* Hidden submit button triggered by footer */}
            <button type="submit" id="submit-borrow-form" className="hidden" />
          </Form>
        </main>

        {/* Footer */}
        <footer className="px-8 py-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
          <Button 
            onClick={onClose} 
            disabled={isLoading} 
            className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            ປິດ
          </Button>
          <Button
            type="primary"
            onClick={() => document.getElementById('submit-borrow-form')?.click()}
            loading={isLoading}
            disabled={items.length === 0}
            className="h-12 px-8 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border-none flex items-center gap-2 cursor-pointer text-white disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            ບັນທຶກການຢືມ <ArrowRight size={18} strokeWidth={2.5} />
          </Button>
        </footer>
      </div>
    </Drawer>
  );
}
