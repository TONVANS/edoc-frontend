"use client";
import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { Key, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const changePassword = useUserStore((state) => state.changePassword);

  const handleFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("ລະຫັດຜ່ານໃໝ່ບໍ່ກົງກັນ!");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await changePassword(values.oldPassword, values.newPassword);
      if (success) {
        message.success("ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!");
        form.resetFields();
        onClose();
      } else {
        message.error("ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້. ກະລຸນາກວດສອບລະຫັດຜ່ານເດີມ.");
      }
    } catch (error) {
      message.error("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12 w-full';

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnHidden
      width={480}
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
        
        {/* HEADER */}
        <header className="relative px-8 pt-8 pb-12 overflow-hidden bg-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight leading-tight">
                ປ່ຽນລະຫັດຜ່ານ
              </h2>
              <p className="text-slate-300 text-[13px] mt-1 font-medium">
                ກຳນົດລະຫັດຜ່ານໃໝ່ເພື່ອຄວາມປອດໄພ
              </p>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="px-8 py-8 -mt-6 bg-white/80 backdrop-blur-2xl rounded-t-[24px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className="space-y-5"
          >
            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><Key size={14} className="text-slate-400" /> ລະຫັດຜ່ານປັດຈຸບັນ</span>}
              name="oldPassword"
              rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດຜ່ານປັດຈຸບັນ!' }]}
            >
              <Input.Password placeholder="ປ້ອນລະຫັດຜ່ານເດີມ" className={inputCls} />
            </Form.Item>

            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><ShieldCheck size={14} className="text-slate-400" /> ລະຫັດຜ່ານໃໝ່</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່!' },
                { min: 6, message: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ!' }
              ]}
            >
              <Input.Password placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່" className={inputCls} />
            </Form.Item>
            
            <Form.Item
              label={<span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 ml-1"><ShieldCheck size={14} className="text-slate-400" /> ຢືນຢັນລະຫັດຜ່ານໃໝ່</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'ກະລຸນາຢືນຢັນລະຫັດຜ່ານໃໝ່!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('ລະຫັດຜ່ານໃໝ່ບໍ່ກົງກັນ!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ" className={inputCls} />
            </Form.Item>

            <footer className="flex items-center justify-end gap-3 pt-4">
              <Button onClick={() => { form.resetFields(); onClose(); }} disabled={isLoading} className="h-11 px-6 rounded-xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all">ຍົກເລີກ</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="h-11 px-8 rounded-xl bg-slate-800 hover:bg-slate-900 font-bold shadow-lg transition-all border-none flex items-center gap-2"
              >
                ປ່ຽນລະຫັດຜ່ານ <ArrowRight size={16} strokeWidth={2.5} />
              </Button>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}
