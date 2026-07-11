import React, { useState } from 'react';
import { Modal, Form, Input, Button, App } from 'antd';
import { User, Lock } from 'lucide-react';
import api from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      message.success('ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ'); // User created successfully
      form.resetFields();
      onClose();
      fetchUsers();
    } catch (error) {
      // Errors are mostly handled by the global interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New User"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ empCode: 'ADMIN000' }}
        className="mt-4"
      >
        <Form.Item
          name="empCode"
          label="Employee Code"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດພະນັກງານ!' }]}
        >
          <Input 
            prefix={<User size={16} className="text-gray-400" />} 
            placeholder="e.g. ADMIN000" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດຜ່ານ!' }]}
        >
          <Input.Password 
            prefix={<Lock size={16} className="text-gray-400" />} 
            placeholder="Enter password" 
            size="large"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="bg-[#185C4D]">
            ສ້າງຜູ້ໃຊ້
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
