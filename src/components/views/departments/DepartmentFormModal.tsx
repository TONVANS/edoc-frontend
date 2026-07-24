import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/prisma-mapped';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDepartmentPayload | UpdateDepartmentPayload) => void;
  initialData?: Department | null;
  isLoading?: boolean;
}

export default function DepartmentFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DepartmentFormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          code: initialData.code,
          name: initialData.name,
          phone: initialData.phone,
          email: initialData.email,
          status: initialData.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'A' });
      }
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={initialData ? 'ແກ້ໄຂຂໍ້ມູນຝ່າຍ' : 'ເພີ່ມຂໍ້ມູນຝ່າຍ'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item
          name="code"
          label="ລະຫັດຝ່າຍ"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດຝ່າຍ' }]}
        >
          <Input placeholder="DEPT-001" />
        </Form.Item>

        <Form.Item
          name="name"
          label="ຊື່ຝ່າຍ"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ຝ່າຍ' }]}
        >
          <Input placeholder="ປ້ອນຊື່ຝ່າຍ" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="ເບີໂທລະສັບ"
        >
          <Input placeholder="ເບີໂທລະສັບ" />
        </Form.Item>

        <Form.Item
          name="email"
          label="ອີເມວ"
          rules={[{ type: 'email', message: 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ' }]}
        >
          <Input placeholder="example@edl.com.la" />
        </Form.Item>

        <Form.Item
          name="status"
          label="ສະຖານະ"
          rules={[{ required: true, message: 'ກະລຸນາເລືອກສະຖານະ' }]}
        >
          <Select>
            <Select.Option value="A">ໃຊ້ງານ</Select.Option>
            <Select.Option value="I">ປິດໃຊ້ງານ</Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} disabled={isLoading}>
            ຍົກເລີກ
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading} className="bg-[#185C4D]">
            ບັນທຶກ
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
