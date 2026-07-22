// src/components/views/storage/ShelfFormModal.tsx
'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, Select, InputNumber } from 'antd';
import { Shelf, CreateShelfPayload } from '@/types/prisma-mapped';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import {
  Layers as ShelfIcon,
  Layout as LockerIcon,
  Warehouse as WarehouseIcon,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  FileText,
  Binary,
  Building2,
  GitBranch,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLockerStore } from '@/store/useLockerStore';

interface ShelfFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateShelfPayload & { status?: string }) => void;
  isLoading: boolean;
  initialData?: Shelf | null;
}

interface FormValues {
  lockerId: string;
  shelves: {
    name: string;
    maxQty: number;
    description?: string;
  }[];
  isActive?: boolean;
}

export default function ShelfFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: ShelfFormModalProps) {


  const [form] = Form.useForm<FormValues>();
  const { departmentDropdown, fetchDropdown: fetchDeptDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivDropdown } = useDivisionStore();
  const { warehouseDropdown, fetchWarehouseDropdown } = useWarehouseStore();
  const { lockerDropdown, fetchLockerDropdown } = useLockerStore();

  const [filterDeptId, setFilterDeptId] = React.useState<number | undefined>();
  const [filterDivId, setFilterDivId] = React.useState<number | undefined>();
  const [filterWarehouseId, setFilterWarehouseId] = React.useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      fetchDeptDropdown();
      const isEditing = initialData && 'id' in initialData;
      const locker = (initialData as any)?.locker;
      
      if (isEditing || locker) {
        const warehouseId = locker?.warehouseId;
        const deptId = locker?.warehouse?.departmentId;
        const divId = locker?.warehouse?.divisionId;

        setFilterDeptId(deptId);
        setFilterDivId(divId);
        setFilterWarehouseId(warehouseId);

        if (deptId) fetchDivDropdown({ departmentId: deptId });
        fetchWarehouseDropdown({ departmentId: deptId, divisionId: divId });

        if (warehouseId) fetchLockerDropdown({ warehouseId });
        else fetchLockerDropdown();

        setTimeout(() => {
          if (!isEditing) form.resetFields();
          form.setFieldsValue({
            lockerId: (initialData as any)?.lockerId,
            shelves: isEditing ? [
              {
                name: (initialData as any)?.name,
                maxQty: (initialData as any)?.maxQty,
                description: (initialData as any)?.description || undefined,
              }
            ] : [{ maxQty: 30 }],
            isActive: isEditing ? (initialData as any)?.status === 'A' || (initialData as any)?.status === 'ACTIVE' : true,
          });
        }, 0);
      } else {
        setFilterDeptId(undefined);
        setFilterDivId(undefined);
        setFilterWarehouseId(undefined);
        fetchWarehouseDropdown();
        fetchLockerDropdown();
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue({ 
            isActive: true, 
            lockerId: (initialData as any)?.lockerId || undefined,
            shelves: [{ maxQty: 30 }]
          });
        }, 0);
      }
    }
  }, [isOpen, initialData, form, fetchDeptDropdown, fetchDivDropdown, fetchWarehouseDropdown, fetchLockerDropdown]);

  const handleDeptChange = (val: number) => {
    setFilterDeptId(val);
    setFilterDivId(undefined);
    setFilterWarehouseId(undefined);
    form.setFieldsValue({ lockerId: undefined });
    fetchDivDropdown({ departmentId: val });
    fetchWarehouseDropdown({ departmentId: val });
    fetchLockerDropdown();
  };

  const handleDivChange = (val: number) => {
    setFilterDivId(val);
    setFilterWarehouseId(undefined);
    form.setFieldsValue({ lockerId: undefined });
    fetchWarehouseDropdown({ departmentId: filterDeptId, divisionId: val });
    fetchLockerDropdown();
  };

  const handleWarehouseChange = (val: string) => {
    setFilterWarehouseId(val);
    form.setFieldsValue({ lockerId: undefined });
    fetchLockerDropdown({ warehouseId: val });
  };

  const handleFinish = (values: FormValues) => {
    const isEditing = initialData && 'id' in initialData;
    
    if (isEditing) {
      const shelf = values.shelves?.[0];
      const payload: any = {
        name: shelf?.name?.trim(),
        description: shelf?.description?.trim(),
        lockerId: values.lockerId,
        maxQty: Number(shelf?.maxQty),
        status: values.isActive ? 'A' : 'I'
      };
      onSubmit(payload);
    } else {
      const payload: any = {
        shelves: (values.shelves || []).map(s => ({
          name: s.name?.trim(),
          description: s.description?.trim(),
          maxQty: Number(s.maxQty),
          lockerId: values.lockerId
        }))
      };
      onSubmit(payload);
    }
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12 w-full';

  const selectCls = cn(
    '[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md! [&_.ant-select-selector]:border-white/60! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]! text-slate-800 font-medium w-full'
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}

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
              <ShelfIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData && 'id' in initialData ? 'ແກ້ໄຂຂໍ້ມູນຊັ້ນວາງ' : 'ເພີ່ມຂໍ້ມູນຊັ້ນວາງໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[340px]">
                ລະບຸຊື່ຊັ້ນວາງ ແລະ ກຳນົດຈຳນວນຄວາມຈຸແຟ້ມສູງສຸດ
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
            {/* 📍 SECTION 1: Location Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-[#185C4D]/10 to-[#185C4D]/5 flex items-center justify-center border border-[#185C4D]/10 shadow-sm">
                  <WarehouseIcon size={18} className="text-[#185C4D]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 leading-tight tracking-tight">ສະຖານທີ່ຕັ້ງຊັ້ນວາງ</h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-0.5">ກຳນົດພື້ນທີ່ ແລະ ຕູ້ (Locker) ສຳລັບຊັ້ນວາງນີ້</p>
                </div>
              </div>
              
              <div className="p-6 bg-[#f8faf9] rounded-[24px] border border-slate-200/60 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[40px] opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                <div className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Form.Item className="mb-0" label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Building2 size={14} className="text-[#185C4D]" /> ເລືອກຝ່າຍ (Department)</span>}>
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

                    <Form.Item className="mb-0" label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><GitBranch size={14} className="text-[#185C4D]" /> ເລືອກພະແນກ (Division)</span>}>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Form.Item className="mb-0" label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><WarehouseIcon size={14} className="text-[#185C4D]" /> ເລືອກສາງ (Warehouse)</span>}>
                      <Select
                        placeholder="ເລືອກສາງທີ່ລັອກເກີຕັ້ງຢູ່ (ຖ້າມີ)"
                        className={selectCls}
                        allowClear
                        loading={warehouseDropdown.length === 0}
                        options={warehouseDropdown.map(w => ({ value: w.id, label: w.name }))}
                        value={filterWarehouseId}
                        onChange={handleWarehouseChange}
                        disabled={warehouseDropdown.length === 0 && !!filterDivId}
                      />
                    </Form.Item>

                    <Form.Item
                      className="mb-0"
                      label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><LockerIcon size={14} className="text-[#185C4D]" /> ເລືອກຕູ້ (Locker) <span className="text-rose-500">*</span></span>}
                      name="lockerId"
                      rules={[{ required: true, message: 'ກະລຸນາເລືອກຕູ້!' }]}
                    >
                      <Select
                        placeholder="ເລືອກຕູ້ທີ່ຊັ້ນວາງຕັ້ງຢູ່"
                        className={selectCls}
                        loading={lockerDropdown.length === 0}
                        options={lockerDropdown.map(l => ({ value: l.id, label: l.name || l.code }))}
                        disabled={lockerDropdown.length === 0 && !!filterWarehouseId}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            {/* 📚 SECTION 2: Shelf Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-[#185C4D]/10 to-[#185C4D]/5 flex items-center justify-center border border-[#185C4D]/10 shadow-sm">
                  <ShelfIcon size={18} className="text-[#185C4D]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 leading-tight tracking-tight">ລາຍລະອຽດຊັ້ນວາງ</h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-0.5">ກຳນົດຊື່ຊັ້ນວາງ, ຄວາມຈຸ ແລະ ຂໍ້ມູນເພີ່ມເຕີມອື່ນໆ</p>
                </div>
              </div>

              <Form.List name="shelves">
                {(fields, { add, remove }) => {
                  const isEditing = initialData && 'id' in initialData;
                  return (
                    <div className="space-y-5">
                      {fields.map((field, index) => {
                        const { key, ...restField } = field;
                        return (
                        <div key={key} className="p-6 bg-white/60 backdrop-blur-xl rounded-[24px] border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(24,92,77,0.06)] hover:border-white">
                          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100/80">
                            <h4 className="text-[14px] font-black text-[#185C4D] flex items-center gap-2.5 bg-[#185C4D]/5 px-3 py-1.5 rounded-lg">
                              <ShelfIcon size={16} />
                              ຂໍ້ມູນຊັ້ນວາງ {fields.length > 1 ? `#${index + 1}` : ''}
                            </h4>
                            {fields.length > 1 && !isEditing && (
                              <Button
                                type="text"
                                danger
                                icon={<Trash2 size={16} />}
                                onClick={() => remove(field.name)}
                                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                              />
                            )}
                          </div>

                          <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-5">
                              <Form.Item
                                {...restField}
                                className="mb-0"
                                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">ຊື່ຊັ້ນວາງ <span className="text-rose-500">*</span></span>}
                                name={[field.name, 'name']}
                                rules={[
                                  { required: true, message: 'ກະລຸນາປ້ອນຊື່ຊັ້ນວາງ!' },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (!value) return Promise.resolve();
                                      const shelves = getFieldValue('shelves') || [];
                                      const duplicateCount = shelves.filter((s: any) => s?.name?.trim() === value.trim()).length;
                                      if (duplicateCount > 1) {
                                        return Promise.reject(new Error('ຊື່ຊັ້ນວາງຫ້າມຊ້ຳກັນ!'));
                                      }
                                      return Promise.resolve();
                                    },
                                  }),
                                ]}
                              >
                                <Input placeholder="ເຊັ່ນ: ຊັ້ນວາງທີ 1" className={inputCls} />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                className="mb-0"
                                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Binary size={14} className="text-[#185C4D]" /> ຄວາມຈຸສູງສຸດ <span className="text-rose-500">*</span></span>}
                                name={[field.name, 'maxQty']}
                                rules={[{ required: true, message: 'ກະລຸນາປ້ອນຈຳນວນແຟ້ມສູງສຸດ!' }]}
                              >
                                <InputNumber min={1} placeholder="30" className={cn(inputCls, 'flex items-center')} />
                              </Form.Item>
                            </div>

                            <Form.Item
                              {...restField}
                              className="mb-0"
                              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><FileText size={14} className="text-[#185C4D]" /> ລາຍລະອຽດເພີ່ມເຕີມ</span>}
                              name={[field.name, 'description']}
                            >
                              <Input.TextArea placeholder="ໝາຍເຫດ ຫຼື ລາຍລະອຽດຂອງຊັ້ນວາງ..." rows={2} className={cn(inputCls, 'h-auto py-3 resize-none')} />
                            </Form.Item>
                          </div>
                        </div>
                      )})}
                      
                      {!isEditing && (
                        <Button
                          type="dashed"
                          onClick={() => add({ maxQty: 30 })}
                          block
                          icon={<Plus size={18} strokeWidth={2.5} />}
                          className="h-14 rounded-[24px] border-2 border-dashed border-[#185C4D]/30 text-[#185C4D] hover:text-[#185C4D] hover:border-[#185C4D] hover:bg-[#185C4D]/5 transition-all duration-300 font-bold flex items-center justify-center gap-2 mt-4 shadow-sm"
                        >
                          ເພີ່ມຊັ້ນວາງໃໝ່
                        </Button>
                      )}
                    </div>
                  );
                }}
              </Form.List>
            </div>

            {initialData && 'id' in initialData && (
              <div className="pt-2">
                <Form.Item
                  className="mb-0 p-5 bg-white/60 backdrop-blur-xl rounded-[24px] border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  name="isActive"
                  valuePropName="checked"
                  label={<span className="flex items-center gap-1.5 text-[14px] font-black text-slate-700 ml-1"><Sparkles size={16} className="text-[#185C4D]" /> ສະຖານະການນຳໃຊ້ (Status)</span>}
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="ml-auto" />
                </Form.Item>
              </div>
            )}

            <footer className="flex items-center justify-end gap-4 pt-8 border-t border-slate-200/60 mt-8">
              <Button onClick={onClose} disabled={isLoading} className="h-12 px-8 rounded-[20px] border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm">
                ຍົກເລີກ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="h-12 px-10 rounded-[20px] bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-[0_8px_20px_rgba(24,92,77,0.25)] hover:shadow-[0_12px_28px_rgba(24,92,77,0.35)] transition-all hover:-translate-y-0.5 border-none flex items-center gap-2"
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
