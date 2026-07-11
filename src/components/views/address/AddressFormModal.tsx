// src/components/views/address/AddressFormModal.tsx
'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, Select } from 'antd';
import { Address, CreateAddressPayload } from '@/types/prisma-mapped';
import {
  Building2,
  GitBranch,
  MapPin,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import api from '@/lib/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAddressPayload & { status?: string }) => void;
  isLoading: boolean;
  initialData?: Address | null;
}

interface FormValues {
  code: string;
  name: string;
  details?: string;
  isActive?: boolean;
  departmentId: number;
  divisionId?: number;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: AddressFormModalProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          code: initialData.code,
          name: initialData.name,
          details: initialData.details,
          isActive: initialData.status === 'A' || initialData.status === 'ACTIVE',
          departmentId: initialData.departmentId,
          divisionId: initialData.divisionId || undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [isOpen, initialData, form]);

  const handleFinish = (values: FormValues) => {
    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      details: values.details?.trim() || '',
      departmentId: values.departmentId,
      divisionId: values.divisionId || null,
      status: values.isActive !== false ? 'A' : 'I', // Default to 'A' if undefined
    } as any;
    
    onSubmit(payload);
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12';

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
          {/* Glass Patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-40 z-20 active:scale-90"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <MapPin className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData ? 'ແກ້ໄຂຂໍ້ມູນສະຖານທີ່' : 'ເພີ່ມຂໍ້ມູນສະຖານທີ່ໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[340px]">
                ລະບຸປະເພດສະຖານທີ່ ແລະ ລາຍລະອຽດທີ່ຕັ້ງ ເພື່ອການຈັດການເອກະສານທີ່ເປັນລະບົບ
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
            className="space-y-10"
          >
            {/* ── Address fields ──────────────────── */}
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-bold text-slate-800 tracking-wide uppercase">
                    ຂໍ້ມູນລາຍລະອຽດທີ່ຕັ້ງ
                  </h3>
                </div>
                <div className="h-px bg-slate-100 flex-1 ml-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <Form.Item
                  label={
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                      <Hash size={14} className="text-slate-400" /> ລະຫັດ <span className="text-rose-500">*</span>
                    </span>
                  }
                  name="code"
                  rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດ!' }]}
                  className="mb-0"
                >
                  <Input placeholder="ເຊັ່ນ: 001" className={inputCls} />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                      <MapPin size={14} className="text-slate-400" /> ຊື່ສະຖານທີ່ <span className="text-rose-500">*</span>
                    </span>
                  }
                  name="name"
                  rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ສະຖານທີ່!' }]}
                  className="mb-0"
                >
                  <Input placeholder="ເຊັ່ນ: ຈຳປາສັກ" className={inputCls} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                <Form.Item
                  label={
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                      <Building2 size={14} className="text-slate-400" /> ຝ່າຍ <span className="text-rose-500">*</span>
                    </span>
                  }
                  name="departmentId"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກຝ່າຍ!' }]}
                  className="mb-0"
                >
                  <AddressDepartmentSelect />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                      <GitBranch size={14} className="text-slate-400" /> ພະແນກ/ສາຂາ <span className="text-slate-400 font-medium ml-1">(Optional)</span>
                    </span>
                  }
                  name="divisionId"
                  className="mb-0"
                >
                  <AddressDivisionSelect form={form} />
                </Form.Item>
              </div>

              <Form.Item
                label={
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                    <FileText size={14} className="text-slate-400" /> ລາຍລະອຽດເພີ່ມເຕີມ <span className="text-slate-400 font-medium ml-1">(Optional)</span>
                  </span>
                }
                name="details"
                className="mb-0"
              >
                <Input.TextArea
                  placeholder="ລະບຸທີ່ຢູ່ເຕັມ, ຂໍ້ມູນຕິດຕໍ່ ຫຼື ໝາຍເຫດ..."
                  rows={4}
                  className={cn(inputCls, 'h-auto py-4 resize-none leading-relaxed')}
                />
              </Form.Item>



              {initialData && (
                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  label={
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1">
                      <Sparkles size={14} className="text-slate-400" /> ສະຖານະ (Active)
                    </span>
                  }
                  className="mb-0"
                >
                  <Switch checkedChildren="ເປີດນຳໃຊ້" unCheckedChildren="ປິດນຳໃຊ້" />
                </Form.Item>
              )}
            </section>

            {/* ── Footer ──────────────────────────────────── */}
            <footer className="flex items-center justify-between pt-8 border-t border-slate-100 animate-in fade-in duration-500 delay-200">
              <p className="text-xs font-medium text-slate-400">
                ກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງກ່ອນບັນທຶກ
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-12 px-8 rounded-2xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white hover:text-slate-800 hover:border-slate-200 transition-all duration-300"
                >
                  ຍົກເລີກ
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="h-12 px-10 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] hover:from-[#13493d] hover:to-[#185C4D] font-black shadow-[0_10px_30px_rgba(24,92,77,0.2)] hover:shadow-[0_15px_40px_rgba(24,92,77,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 border-none flex items-center justify-center gap-2"
                >
                  ບັນທຶກຂໍ້ມູນ
                  {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
                </Button>
              </div>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}

function AddressDepartmentSelect(props: any) {
  const { departments, fetchAll, isLoading } = useDepartmentStore();
  
  useEffect(() => {
    if (departments.length === 0) fetchAll();
  }, [departments.length, fetchAll]);

  return (
    <Select
      {...props}
      showSearch
      loading={isLoading}
      placeholder="ເລືອກຝ່າຍ"
      optionFilterProp="label"
      options={departments.map(d => ({ label: d.name, value: d.id }))}
      className="[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md [&_.ant-select-selector]:border-white/60! hover:[&_.ant-select-selector]:bg-white/60! focus-within:[&_.ant-select-selector]:bg-white! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]!"
    />
  );
}

function AddressDivisionSelect({ form, ...props }: any) {
  const departmentId = Form.useWatch('departmentId', form);
  const [divisions, setDivisions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (departmentId) {
      const fetchDivisions = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/divisions/dropdown?departmentId=${departmentId}`);
          setDivisions(Array.isArray(res.data) ? res.data : res.data?.data || []);
        } catch (error) {
          console.error('Failed to fetch divisions', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDivisions();
    } else {
      setDivisions([]);
      form.setFieldsValue({ divisionId: undefined });
    }
  }, [departmentId, form]);

  return (
    <Select
      {...props}
      showSearch
      allowClear
      loading={isLoading}
      disabled={!departmentId}
      placeholder={departmentId ? "ເລືອກພະແນກ/ສາຂາ" : "ກະລຸນາເລືອກຝ່າຍກ່ອນ"}
      optionFilterProp="label"
      options={divisions.map(d => ({ label: d.name, value: d.id }))}
      className="[&_.ant-select-selector]:rounded-2xl! [&_.ant-select-selector]:bg-white/40! [&_.ant-select-selector]:backdrop-blur-md [&_.ant-select-selector]:border-white/60! hover:[&_.ant-select-selector]:bg-white/60! focus-within:[&_.ant-select-selector]:bg-white! [&_.ant-select-selector]:shadow-sm! [&_.ant-select-selector]:h-12! [&_.ant-select-selection-item]:leading-[46px]! [&_.ant-select-selection-placeholder]:leading-[46px]!"
    />
  );
}

