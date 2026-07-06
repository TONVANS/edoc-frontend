"use client";
import React, { useState } from 'react';
import { Tree, Progress, Button, Badge } from 'antd';
import { Folder, Inbox, MapPin, Archive, Search, MoreHorizontal, Plus } from 'lucide-react';
import type { TreeDataNode } from 'antd';

const mockStorageData: TreeDataNode[] = [
  {
    title: (
      <div className="flex items-center justify-between w-full pr-4">
        <span className="font-semibold text-[#1C1C1E]">HQ - Vientiane (Main)</span>
        <Badge count="90%" color="#1A7A44" />
      </div>
    ),
    key: 'hq',
    icon: <MapPin size={16} className="text-[#185C4D]" />,
    children: [
      {
        title: (
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-medium text-[#1C1C1E]">Warehouse A (Finance)</span>
            <span className="text-xs text-[#737373]">4/5 Cabinets</span>
          </div>
        ),
        key: 'hq-wh-a',
        icon: <Archive size={16} className="text-[#737373]" />,
        children: [
          {
            title: (
              <div className="flex flex-col w-full pr-4 gap-1 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1C1C1E]">Cabinet 1 (2024 Vouchers)</span>
                  <span className="text-xs font-semibold text-[#B83131]">95% Full</span>
                </div>
                <Progress percent={95} size="small" status="exception" strokeColor="#B83131" />
              </div>
            ),
            key: 'hq-wh-a-cab1',
            icon: <Folder size={16} className="text-[#B83131]" />,
            children: [
              { title: 'Shelf 1 (Jan - Mar)', key: 'hq-wh-a-cab1-s1', icon: <Inbox size={16} className="text-[#737373]" /> },
              { title: 'Shelf 2 (Apr - Jun)', key: 'hq-wh-a-cab1-s2', icon: <Inbox size={16} className="text-[#737373]" /> },
            ]
          },
          {
            title: (
              <div className="flex flex-col w-full pr-4 gap-1 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1C1C1E]">Cabinet 2 (2023 Vouchers)</span>
                  <span className="text-xs font-semibold text-[#1A7A44]">40% Full</span>
                </div>
                <Progress percent={40} size="small" strokeColor="#1A7A44" />
              </div>
            ),
            key: 'hq-wh-a-cab2',
            icon: <Folder size={16} className="text-[#1A7A44]" />,
          }
        ]
      }
    ]
  },
  {
    title: (
      <div className="flex items-center justify-between w-full pr-4">
        <span className="font-semibold text-[#1C1C1E]">Branch - Luang Prabang</span>
        <Badge count="20%" color="#1A7A44" />
      </div>
    ),
    key: 'lpq',
    icon: <MapPin size={16} className="text-[#185C4D]" />,
    children: [
      {
        title: (
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-medium text-[#1C1C1E]">Warehouse B (General)</span>
            <span className="text-xs text-[#737373]">1/10 Cabinets</span>
          </div>
        ),
        key: 'lpq-wh-b',
        icon: <Archive size={16} className="text-[#737373]" />,
      }
    ]
  }
];

export default function StorageTreeView() {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['hq', 'hq-wh-a', 'hq-wh-a-cab1']);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Storage Locations</h1>
          <p className="text-[#737373] text-sm mt-1">Hierarchical view of warehouses, cabinets, and shelves capacity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="primary" icon={<Plus size={16} />} className="shadow-soft hover:-translate-y-0.5 transition-transform">
            Add Location
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Tree View */}
        <div className="lg:col-span-2">
          {/* LEVEL 1 GLASS: Main Container */}
          <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] h-full min-h-[600px]">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Organization Structure</h2>
              <Button icon={<Search size={16} />} type="text" className="text-[#737373]" />
            </div>

            {/* Level 2 Glass background for the tree */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/80 p-4 rounded-2xl shadow-sm">
              <Tree
                showIcon
                defaultExpandAll
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                treeData={mockStorageData}
                draggable
                blockNode
                className="bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Detail View */}
        <div className="lg:col-span-1">
          {/* LEVEL 1 GLASS */}
          <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] h-full sticky top-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1C1C1E] mb-1">Cabinet 1 (2024)</h2>
                <p className="text-sm text-[#737373] flex items-center gap-1">
                  <MapPin size={12} /> HQ - Vientiane / Warehouse A
                </p>
              </div>
              <Button type="text" icon={<MoreHorizontal size={18} className="text-[#737373]" />} />
            </div>

            {/* Level 2 Glass Cards for details */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/80 p-4 rounded-2xl shadow-sm mb-4">
              <p className="text-sm font-semibold text-[#1C1C1E] mb-2">Capacity Utilization</p>
              <div className="flex items-end justify-between mb-1">
                <span className="text-2xl font-bold text-[#B83131]">95%</span>
                <span className="text-xs font-medium text-[#737373] mb-1">475/500 Konos</span>
              </div>
              <Progress percent={95} showInfo={false} status="exception" strokeColor="#B83131" />
              <p className="text-xs text-[#B83131] mt-2">Warning: Approaching maximum capacity</p>
            </div>

            <div className="bg-white/60 backdrop-blur-lg border border-white/80 p-4 rounded-2xl shadow-sm">
              <p className="text-sm font-semibold text-[#1C1C1E] mb-3">Recent Activity</p>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#E1F2E8] flex items-center justify-center shrink-0">
                    <Plus size={14} className="text-[#1A7A44]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1C1E]">Added 5 new Konos</p>
                    <p className="text-xs text-[#737373]">By Admin User • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#FDF0D5] flex items-center justify-center shrink-0">
                    <Archive size={14} className="text-[#9B7016]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1C1E]">Moved Shelf 2</p>
                    <p className="text-xs text-[#737373]">By Somchai • Yesterday</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
