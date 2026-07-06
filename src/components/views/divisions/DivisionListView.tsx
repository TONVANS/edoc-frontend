// src/components/views/divisions/DivisionListView.tsx
'use client';

import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Division } from '@/types/prisma-mapped';
import { GitBranch } from 'lucide-react';

interface DivisionListViewProps {
  data: Division[];
  isLoading: boolean;
}

export default function DivisionListView({ data, isLoading }: DivisionListViewProps) {
  const columns: ColumnsType<Division> = [
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
      title: 'ຊື່ພະແນກຍ່ອຍ/ສາຂາ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <GitBranch size={16} className="text-[#185C4D]" />
          </div>
          <span className="font-medium text-slate-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'ຊື່ຫຍໍ້',
      dataIndex: 'shortName',
      key: 'shortName',
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
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] overflow-hidden">
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
