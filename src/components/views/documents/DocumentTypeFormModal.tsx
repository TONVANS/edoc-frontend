// src/components/views/documents/DocumentTypeFormModal.tsx
'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch } from 'antd';
import { DocumentType, CreateDocumentTypePayload } from '@/types/prisma-mapped';
import {
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Hash,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDocumentTypePayload) => void;
  isLoading: boolean;
  initialData?: DocumentType | null;
}

interface FormValues {
  code?: string;
  name: string;
  description?: string;
}

export default function DocumentTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: DocumentTypeFormModalProps) {


  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          form.setFieldsValue({
            code: initialData.code || undefined,
            name: initialData.name,
            description: initialData.description || undefined,
          });
        } else {
          form.resetFields();
        }
      }, 0);
    }
  }, [isOpen, initialData, form]);

  const handleFinish = (values: FormValues) => {
    const payload = {
      code: values.code?.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
    };
    
    onSubmit(payload);
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12';

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
              <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData ? 'ແກ້ໄຂປະເພດເອກະສານ' : 'ເພີ່ມປະເພດເອກະສານໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[340px]">
                ລະບຸລາຍລະອຽດຂອງປະເພດເອກະສານສຳລັບການຈັດໝວດໝູ່
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
              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Hash size={14} className="text-slate-400" /> ລະຫັດປະເພດ (ຖ້າມີ)</span>}
                name="code"
              >
                <Input placeholder="ເຊັ່ນ: DT-01" className={inputCls} />
              </Form.Item>

              <Form.Item
                label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Type size={14} className="text-slate-400" /> ຊື່ປະເພດເອກະສານ <span className="text-rose-500">*</span></span>}
                name="name"
                rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່!' }]}
              >
                <Input placeholder="ຕົວຢ່າງ: ເອກະສານພາຍໃນ" className={inputCls} />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><FileText size={14} className="text-slate-400" /> ລາຍລະອຽດ <span className="text-slate-400 font-medium ml-1">(Optional)</span></span>}
              name="description"
            >
              <Input.TextArea placeholder="ໝາຍເຫດ ຫຼື ລາຍລະອຽດເພີ່ມເຕີມ..." rows={3} className={cn(inputCls, 'h-auto py-3 resize-none')} />
            </Form.Item>

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
