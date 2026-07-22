// src/components/views/storage/WarehouseFormModal.tsx
'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, Select } from 'antd';
import { Warehouse, CreateWarehousePayload } from '@/types/prisma-mapped';

import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import {
  Building2,
  GitBranch,
  Warehouse as WarehouseIcon,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateWarehousePayload & { status?: string }) => void;
  isLoading: boolean;
  initialData?: Warehouse | null;
}

interface FormValues {
  departmentId: number;
  divisionId?: number;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function WarehouseFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: WarehouseFormModalProps) {


  const [form] = Form.useForm<FormValues>();

  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();

  const [filterDept, setFilterDept] = React.useState<number | undefined>();
  const [filterDiv, setFilterDiv] = React.useState<number | undefined>();

  useEffect(() => {
    if (isOpen) {
      fetchDeptDropdown();
      
      if (initialData) {
        const deptId = initialData.departmentId || undefined;
        const divId = initialData.divisionId || undefined;
        if (deptId) fetchDivDropdown({ departmentId: deptId });

        setTimeout(() => {
          form.setFieldsValue({
            departmentId: deptId,
            divisionId: divId,
            code: initialData.code,
            name: initialData.name,
            description: initialData.description || undefined,
            isActive: initialData.status === 'A' || initialData.status === 'ACTIVE',
          });
        }, 0);
      } else {
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue({ isActive: true });
        }, 0);
      }
    }
  }, [isOpen, initialData, form, fetchDeptDropdown, fetchDivDropdown]);

  const handleDeptChange = (val: number) => {
    form.setFieldsValue({ divisionId: undefined });
    if (val) {
      fetchDivDropdown({ departmentId: val });
    }
  };

  const handleFinish = (values: FormValues) => {
    const isEditing = !!initialData;
    const payload: any = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
      departmentId: values.departmentId,
      divisionId: values.divisionId,
    };
    
    if (isEditing) {
      payload.status = values.isActive ? 'A' : 'I';
    }
    
    onSubmit(payload);
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12';

  const selectCls = cn(
    '[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md! [&_.ant-select-selector]:border-white/60! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]! text-slate-800 font-medium'
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={650}
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
        
        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <WarehouseIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData ? 'ແກ້ໄຂຂໍ້ມູນສາງ' : 'ເພີ່ມຂໍ້ມູນສາງໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[340px]">
                ລະບຸລາຍລະອຽດຂອງສາງເກັບມ້ຽນເອກະສານ ແລະ ທີ່ຕັ້ງຂອງສາງ
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
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <Form.Item name="departmentId" label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Building2 size={14} className="text-[#185C4D]" /> ເລືອກຝ່າຍ (Department)</span>}>
                <Select
                  placeholder="ເລືອກຝ່າຍ (ຖ້າມີ)"
                  className={selectCls}
                  allowClear
                  options={departmentDropdown.map(d => ({ value: d.id, label: d.name }))}
                  onChange={handleDeptChange}
                />
              </Form.Item>

              <Form.Item name="divisionId" label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><GitBranch size={14} className="text-[#185C4D]" /> ເລືອກພະແນກ (Division)</span>}>
                <Select
                  placeholder="ເລືອກພະແນກ (ຖ້າມີ)"
                  className={selectCls}
                  allowClear
                  options={divisionDropdown.map(d => ({ value: d.id, label: d.name }))}
                />
              </Form.Item>



              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Hash size={14} className="text-slate-400" /> ລະຫັດສາງ <span className="text-rose-500">*</span></span>}
                name="code"
                rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດສາງ!' }]}
              >
                <Input placeholder="ເຊັ່ນ: WH-001" className={inputCls} />
              </Form.Item>

              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><WarehouseIcon size={14} className="text-slate-400" /> ຊື່ສາງ <span className="text-rose-500">*</span></span>}
                name="name"
                rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ສາງ!' }]}
                className="sm:col-span-2"
              >
                <Input placeholder="ເຊັ່ນ: ສາງເກັບມ້ຽນຫຼັກ" className={inputCls} />
              </Form.Item>

              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><FileText size={14} className="text-slate-400" /> ລາຍລະອຽດ <span className="text-slate-400 font-medium ml-1">(Optional)</span></span>}
                name="description"
                className="sm:col-span-2"
              >
                <Input.TextArea placeholder="ໝາຍເຫດ ຫຼື ລາຍລະອຽດເພີ່ມເຕີມ..." rows={3} className={cn(inputCls, 'h-auto py-3 resize-none')} />
              </Form.Item>

              {initialData && (
                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Sparkles size={14} className="text-slate-400" /> ສະຖານະການນຳໃຊ້</span>}
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              )}
            </div>

            <footer className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Button onClick={onClose} disabled={isLoading} className="h-12 px-8 rounded-2xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all">ຍົກເລີກ</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="h-12 px-10 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none flex items-center gap-2"
              >
                ບັນທຶກຂໍ້ມູນ <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}
