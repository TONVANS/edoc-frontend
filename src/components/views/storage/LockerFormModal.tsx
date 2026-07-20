// src/components/views/storage/LockerFormModal.tsx
'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, Select } from 'antd';
import { Locker, CreateLockerPayload } from '@/types/prisma-mapped';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import {
  Layout as LockerIcon,
  Warehouse as WarehouseIcon,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  FileText,
  Building2,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouseStore } from '@/store/useWarehouseStore';

interface LockerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateLockerPayload & { status?: string }) => void;
  isLoading: boolean;
  initialData?: Locker | null;
}

interface FormValues {
  warehouseId: string;
  code: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export default function LockerFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: LockerFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();
  const { warehouseDropdown, fetchWarehouseDropdown } = useWarehouseStore();

  const [filterDeptId, setFilterDeptId] = React.useState<number | undefined>();
  const [filterDivId, setFilterDivId] = React.useState<number | undefined>();

  useEffect(() => {
    if (isOpen) {
      fetchDeptDropdown();
      const isEditing = initialData && 'id' in initialData;

      if (isEditing) {
        const deptId = (initialData as any)?.warehouse?.departmentId;
        const divId = (initialData as any)?.warehouse?.divisionId;
        
        setFilterDeptId(deptId);
        setFilterDivId(divId);
        
        if (deptId) fetchDivDropdown({ departmentId: deptId });
        fetchWarehouseDropdown({ departmentId: deptId, divisionId: divId });

        form.setFieldsValue({
          warehouseId: initialData.warehouseId || undefined,
          code: initialData.code,
          name: initialData.name || undefined,
          description: initialData.description || undefined,
          isActive: initialData.status === 'A' || initialData.status === 'ACTIVE',
        });
      } else {
        setFilterDeptId(undefined);
        setFilterDivId(undefined);
        fetchWarehouseDropdown();
        form.resetFields();
        form.setFieldsValue({ 
          isActive: true,
          warehouseId: (initialData as any)?.warehouseId || undefined 
        });
      }
    }
  }, [isOpen, initialData, form, fetchDeptDropdown, fetchDivDropdown, fetchWarehouseDropdown]);

  const handleDeptChange = (val: number) => {
    setFilterDeptId(val);
    setFilterDivId(undefined);
    form.setFieldsValue({ warehouseId: undefined });
    fetchDivDropdown({ departmentId: val });
    fetchWarehouseDropdown({ departmentId: val });
  };

  const handleDivChange = (val: number) => {
    setFilterDivId(val);
    form.setFieldsValue({ warehouseId: undefined });
    fetchWarehouseDropdown({ departmentId: filterDeptId, divisionId: val });
  };

  const handleFinish = (values: FormValues) => {
    const isEditing = initialData && 'id' in initialData;
    const payload: any = {
      code: values.code.trim(),
      name: values.name?.trim(),
      description: values.description?.trim(),
      warehouseId: values.warehouseId,
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
      width={600}
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
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <LockerIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData && 'id' in initialData ? 'ແກ້ໄຂຂໍ້ມູນລັອກເກີ' : 'ເພີ່ມຂໍ້ມູນລັອກເກີໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[340px]">
                ລະບຸລະຫັດລັອກເກີ ແລະ ເລືອກສາງທີ່ຕັ້ງ ເພື່ອການຈັດການພື້ນທີ່ເກັບມ້ຽນ
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
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Form.Item label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Building2 size={14} className="text-[#185C4D]" /> ເລືອກຝ່າຍ (Department)</span>}>
                <Select
                  placeholder="ເລືອກຝ່າຍ (ຖ້າມີ)"
                  className={selectCls}
                  allowClear
                  loading={departmentDropdown.length === 0}
                  options={departmentDropdown.map(d => ({ value: d.id, label: d.name }))}
                  value={filterDeptId}
                  onChange={handleDeptChange}
                />
              </Form.Item>

              <Form.Item label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><GitBranch size={14} className="text-[#185C4D]" /> ເລືອກພະແນກ (Division)</span>}>
                <Select
                  placeholder="ເລືອກພະແນກ (ຖ້າມີ)"
                  className={selectCls}
                  allowClear
                  loading={divisionDropdown.length === 0 && !!filterDeptId}
                  options={divisionDropdown.map(d => ({ value: d.id, label: d.name }))}
                  value={filterDivId}
                  onChange={handleDivChange}
                  disabled={!filterDeptId}
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><WarehouseIcon size={14} className="text-[#185C4D]" /> ເລືອກສາງ (Warehouse) <span className="text-rose-500">*</span></span>}
              name="warehouseId"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກສາງ!' }]}
            >
              <Select
                placeholder="ເລືອກສາງທີ່ລັອກເກີຕັ້ງຢູ່"
                className={selectCls}
                loading={warehouseDropdown.length === 0}
                options={warehouseDropdown.map(w => ({ value: w.id, label: w.name }))}
                disabled={warehouseDropdown.length === 0 && !!filterDivId}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Hash size={14} className="text-slate-400" /> ລະຫັດລັອກເກີ <span className="text-rose-500">*</span></span>}
                name="code"
                rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດລັອກເກີ!' }]}
              >
                <Input placeholder="ເຊັ່ນ: L-001" className={inputCls} />
              </Form.Item>

              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><LockerIcon size={14} className="text-slate-400" /> ຊື່ລັອກເກີ</span>}
                name="name"
              >
                <Input placeholder="ເຊັ່ນ: ລັອກເກີ A1" className={inputCls} />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><FileText size={14} className="text-slate-400" /> ລາຍລະອຽດເພີ່ມເຕີມ</span>}
              name="description"
            >
              <Input.TextArea placeholder="ໝາຍເຫດ ຫຼື ລາຍລະອຽດຂອງລັອກເກີ..." rows={3} className={cn(inputCls, 'h-auto py-3 resize-none')} />
            </Form.Item>

            {initialData && 'id' in initialData && (
              <Form.Item
                name="isActive"
                valuePropName="checked"
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Sparkles size={14} className="text-slate-400" /> ສະຖານະການນຳໃຊ້</span>}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            )}

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
