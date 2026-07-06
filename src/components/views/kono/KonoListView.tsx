"use client";
import React, { useState } from 'react';
import { Button, Input, Select, Badge, Tooltip } from 'antd';
import { Search, Filter, QrCode, Lock, Plus, Inbox } from 'lucide-react';
import KonoCard from '@/components/kono/KonoCard';

const mockKonos = [
  { id: '1', name: 'KONO-2024-001', location: 'HQ / WH-A / Cab-1 / Shelf-1', status: 'Available', docCount: 45, maxCount: 50, isLocked: false },
  { id: '2', name: 'KONO-2024-002', location: 'HQ / WH-A / Cab-1 / Shelf-1', status: 'In Use', docCount: 20, maxCount: 50, isLocked: true, lockedBy: 'Sarah Jenkins' },
  { id: '3', name: 'KONO-2023-089', location: 'HQ / WH-A / Cab-2 / Shelf-3', status: 'Full', docCount: 50, maxCount: 50, isLocked: false },
  { id: '4', name: 'KONO-2024-003', location: 'LPQ / WH-B / Cab-1 / Shelf-1', status: 'Available', docCount: 5, maxCount: 50, isLocked: false },
  { id: '5', name: 'KONO-2023-090', location: 'HQ / WH-A / Cab-2 / Shelf-4', status: 'In Use', docCount: 48, maxCount: 50, isLocked: true, lockedBy: 'John Doe' },
];

export default function KonoListView() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Kono Management</h1>
          <p className="text-[#737373] text-sm mt-1">Manage physical document boxes (Konos) and generate QR codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<QrCode size={16} />} className="rounded-xl bg-white/60 border-white/80 shadow-soft text-[#1C1C1E]">
            Bulk Print QR
          </Button>
          <Button type="primary" icon={<Plus size={16} />} className="shadow-soft hover:-translate-y-0.5 transition-transform">
            Create Kono
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar - Level 1 Glass */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-wrap gap-4 items-center">
        <Input 
          placeholder="Search Kono ID or Location..." 
          prefix={<Search size={16} className="text-[#737373]" />}
          className="max-w-xs rounded-xl bg-white/70 hover:bg-white focus:bg-white border-white/80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          placeholder="Location" 
          className="w-40"
          options={[
            { value: 'hq', label: 'HQ - Vientiane' },
            { value: 'lpq', label: 'Luang Prabang' },
          ]}
        />
        <Select 
          placeholder="Status" 
          className="w-32"
          options={[
            { value: 'available', label: 'Available' },
            { value: 'in_use', label: 'In Use' },
            { value: 'full', label: 'Full' },
          ]}
        />
        <Button icon={<Filter size={16} />} className="ml-auto rounded-xl bg-white/60 border-white/80 text-[#1C1C1E]">
          More Filters
        </Button>
      </div>

      {/* Kono Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockKonos.filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase())).map(kono => (
          /* Level 1 Glass Wrapper for Card */
          <div key={kono.id} className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-[24px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] transition-all duration-300 hover:bg-white/60 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/60 rounded-xl text-[#185C4D]">
                  <Inbox size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1C1E]">{kono.name}</h3>
                  <p className="text-xs text-[#737373] truncate w-32" title={kono.location}>{kono.location}</p>
                </div>
              </div>
              {kono.isLocked && (
                <Tooltip title={`Locked: In use by ${kono.lockedBy}`}>
                  <div className="w-8 h-8 rounded-full bg-[#FDF0D5] flex items-center justify-center">
                    <Lock size={14} className="text-[#9B7016]" />
                  </div>
                </Tooltip>
              )}
            </div>
            
            {/* Inner Details - Level 2 Glass */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/80 p-3 rounded-2xl shadow-sm mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#737373]">Capacity</span>
                <span className="text-xs font-bold text-[#1C1C1E]">{kono.docCount} / {kono.maxCount} Docs</span>
              </div>
              <div className="w-full bg-[#E2D3B8]/30 rounded-full h-1.5 mb-3">
                <div 
                  className={`h-1.5 rounded-full ${kono.status === 'Full' ? 'bg-[#B83131]' : 'bg-[#185C4D]'}`} 
                  style={{ width: `${(kono.docCount / kono.maxCount) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <Badge 
                  status={kono.status === 'Available' ? 'success' : kono.status === 'In Use' ? 'warning' : 'error'} 
                  text={<span className="text-xs font-medium text-[#1C1C1E]">{kono.status}</span>} 
                />
                <Button type="link" size="small" icon={<QrCode size={14} />} className="text-[#185C4D] p-0 font-medium text-xs">Print</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
