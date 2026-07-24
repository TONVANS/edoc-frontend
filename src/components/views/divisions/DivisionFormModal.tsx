import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { Division, CreateDivisionPayload, UpdateDivisionPayload } from '@/types/prisma-mapped';
import { useDepartmentStore } from '@/store/useDepartmentStore';

interface DivisionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDivisionPayload | UpdateDivisionPayload) => void;
  initialData?: Division | null;
  isLoading?: boolean;
}

export default function DivisionFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DivisionFormModalProps) {
  const [form] = Form.useForm();
  const { departmentDropdown, fetchDropdown } = useDepartmentStore();

  useEffect(() => {
    if (open) {
      fetchDropdown();
    }
  }, [open, fetchDropdown]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          code: initialData.code,
          name: initialData.name,
          shortName: initialData.shortName,
          departmentId: initialData.departmentId,
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
      title={initialData ? 'ແກ້ໄຂຂໍ້ມູນພະແນກ' : 'ເພີ່ມຂໍ້ມູນພະແນກ'}
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
          label="ລະຫັດພະແນກ"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນລະຫັດພະແນກ' }]}
        >
          <Input placeholder="DIV-001" />
        </Form.Item>

        <Form.Item
          name="name"
          label="ຊື່ພະແນກ"
          rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ພະແນກ' }]}
        >
          <Input placeholder="ປ້ອນຊື່ພະແນກ" />
        </Form.Item>

        <Form.Item
          name="shortName"
          label="ຊື່ຫຍໍ້"
        >
          <Input placeholder="ຊື່ຫຍໍ້" />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="ຝ່າຍ"
          rules={[{ required: true, message: 'ກະລຸນາເລືອກຝ່າຍ' }]}
        >
          <Select
            placeholder="ເລືອກຝ່າຍ"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            options={departmentDropdown.map((dept) => ({
              label: dept.name,
              value: dept.id,
            }))}
          />
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
