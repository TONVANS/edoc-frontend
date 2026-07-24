// src/components/views/departments/DepartmentListView.tsx
'use client';

import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Department } from '@/types/prisma-mapped';
import { Building2, Edit2, Trash2, Eye } from 'lucide-react';
import { Button, Modal } from 'antd';

interface DepartmentListViewProps {
  data: Department[];
  isLoading: boolean;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
}

export default function DepartmentListView({ data, isLoading, onEdit, onDelete }: DepartmentListViewProps) {
  const columns: ColumnsType<Department> = [
    {
      title: 'ລະຫັດ',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
      render: (text) => (
        <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'ຊື່ຝ່າຍ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Building2 size={16} className="text-blue-600" />
          </div>
          <span className="font-medium text-slate-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'ເບີໂທລະສັບ',
      dataIndex: 'phone',
      key: 'phone',
      width: '20%',
      render: (text) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'ອີເມວ',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      render: (text) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'ສະຖານະ',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => {
        const isActive = status === 'A' || status === 'ACTIVE';
        return (
          <Tag color={isActive ? 'success' : 'default'} className="px-3 py-1 rounded-full border-none font-medium">
            {isActive ? 'ໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
          </Tag>
        );
      },
    },
    {
      title: 'ຈັດການ',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<Eye size={16} />}
            href={`/dashboard/departments/${record.id}`}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          />
          {onEdit && (
            <Button
              type="text"
              icon={<Edit2 size={16} />}
              onClick={() => onEdit(record)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          )}
          {onDelete && (
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => {
                Modal.confirm({
                  title: 'ຢືນຢັນການລຶບ',
                  content: `ທ່ານຕ້ອງການລຶບຝ່າຍ "${record.name}" ແທ້ຫຼືບໍ່?`,
                  okText: 'ລຶບ',
                  okType: 'danger',
                  cancelText: 'ຍົກເລີກ',
                  onOk: () => onDelete(record),
                });
              }}
              className="hover:bg-red-50"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          className: 'px-6',
        }}
        className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-slate-50/50 [&_.ant-table-thead_th]:text-slate-500 [&_.ant-table-thead_th]:font-semibold [&_.ant-table-row:hover>td]:bg-slate-50/80"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
