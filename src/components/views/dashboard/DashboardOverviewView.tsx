// src/components/views/dashboard/DashboardOverviewView.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { AlertTriangle, Clock, HardDrive, Activity, Users, ArrowRight, PieChart as PieChartIcon, ShieldCheck, FileCheck } from 'lucide-react';
import { Button } from 'antd';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useDocumentBorrowStore } from '@/store/useDocumentBorrowStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';

import SlideshowBanner, { SlideItem } from '@/components/ui/animations/SlideshowBanner';
import SlideIn from '@/components/ui/animations/SlideIn';
import { StaggerContainer, StaggerItem } from '@/components/ui/animations/StaggerContainer';

// Suppress Recharts width warning
if (typeof window !== 'undefined') {
  const _consoleWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('width(-1) and height(-1)')
    ) {
      return;
    }
    _consoleWarn(...args);
  };
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/80 p-3 rounded-xl shadow-lg">
        <p className="font-bold text-[#1C1C1E] text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const storageData = [
  { name: 'HQ Warehouse A', capacity: 500, used: 450 },
  { name: 'HQ Warehouse B', capacity: 300, used: 150 },
  { name: 'LPQ Branch', capacity: 200, used: 180 },
  { name: 'SVN Branch', capacity: 200, used: 45 },
];

const retentionData = [
  { name: 'Retained', value: 8500, color: '#185C4D' },
  { name: 'Expiring Soon', value: 450, color: '#9B7016' },
  { name: 'Ready to Destroy', value: 120, color: '#1A7A44' },
];

const trackingData = [
  { name: 'Mon', borrowed: 45, returned: 30, overdue: 5 },
  { name: 'Tue', borrowed: 52, returned: 40, overdue: 8 },
  { name: 'Wed', borrowed: 38, returned: 45, overdue: 6 },
  { name: 'Thu', borrowed: 65, returned: 35, overdue: 12 },
  { name: 'Fri', borrowed: 48, returned: 50, overdue: 4 },
];

const entryData = [
  { name: 'Week 1', docs: 120 },
  { name: 'Week 2', docs: 150 },
  { name: 'Week 3', docs: 180 },
  { name: 'Week 4', docs: 140 },
];

const docTypeDistributionMock = [
  { name: 'ບົດບັນທຶກ', value: 400, color: '#185C4D' },
  { name: 'ແຈ້ງການ', value: 300, color: '#D4AF37' },
  { name: 'ຂໍ້ຕົກລົງ', value: 300, color: '#1A7A44' },
  { name: 'ໜັງສືສະເໜີ', value: 200, color: '#25705a' },
];

/** Waits for the client to mount before rendering charts to avoid hydration errors & layout shifts. */
function ChartBox({
  height,
  className = '',
  children,
}: {
  height: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ height }} className={`w-full ${className}`} />;
  }

  return (
    <div style={{ height }} className={`w-full min-w-0 ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardOverviewView() {
  const router = useRouter();

  const { total: totalDocs, fetchDocuments } = useDocumentStore();
  const { total: totalBorrows, fetchBorrows } = useDocumentBorrowStore();
  const { total: totalWarehouses, fetchWarehouses } = useWarehouseStore();
  const { total: totalDocTypes, fetchDocumentTypes } = useDocumentTypeStore();

  useEffect(() => {
    fetchDocuments({ limit: 1 });
    fetchBorrows({ limit: 1 });
    fetchWarehouses({ limit: 1 });
    fetchDocumentTypes({ limit: 1 });
  }, [fetchDocuments, fetchBorrows, fetchWarehouses, fetchDocumentTypes]);

  // Slideshow items for high-priority updates & announcements
  const slideshowItems: SlideItem[] = [
    {
      id: 'slideshow-overdue',
      title: `${totalBorrows > 0 ? totalBorrows : 3} Pending Document Approvals & Tracking`,
      subtitle: 'System detected document borrow requests requiring review.',
      badge: 'High Priority Alert',
      badgeBg: 'bg-[#B83131]/15 text-[#B83131]',
      icon: <AlertTriangle className="text-[#B83131]" size={24} />,
      actionText: 'Review Tracking',
      onAction: () => router.push('/dashboard/tracking'),
    },
    {
      id: 'slideshow-storage',
      title: `Warehouse Storage Optimization Active (${totalWarehouses} Warehouses)`,
      subtitle: 'LPQ Branch and HQ Warehouse A reaching 90% storage capacity limit.',
      badge: 'Storage Notice',
      badgeBg: 'bg-[#185C4D]/15 text-[#185C4D]',
      icon: <HardDrive className="text-[#185C4D]" size={24} />,
      actionText: 'View Storage',
      onAction: () => router.push('/dashboard/warehouses'),
    },
    {
      id: 'slideshow-[#185C4D]',
      title: 'EDL E-Document Management Dashboard',
      subtitle: 'Real-time document tracking, automated retention schedule, and physical archive management.',
      badge: 'System Status: Active',
      badgeBg: 'bg-emerald-500/15 text-emerald-700',
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      actionText: 'Browse Documents',
      onAction: () => router.push('/dashboard/documents'),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-lao">
      {/* Header */}
      <SlideIn direction="down" duration={0.4}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Dashboard Overview</h1>
            <p className="text-[#737373] text-sm mt-1">
              System metrics, storage capacity, and document tracking statistics.
            </p>
          </div>
        </div>
      </SlideIn>

      {/* Buttery Smooth Slideshow Banner */}
      <SlideIn direction="up" delay={0.1} duration={0.5}>
        <SlideshowBanner slides={slideshowItems} autoPlayInterval={6000} />
      </SlideIn>

      {/* Grid of Main Dashboard Metrics */}
      <StaggerContainer staggerDelay={0.1} delayChildren={0.2} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Storage Utilization */}
        <StaggerItem>
          <div
            className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col cursor-pointer transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 hover:shadow-md group"
            onClick={() => router.push('/dashboard/warehouses')}
          >
            <div className="flex items-center gap-2 mb-6">
              <HardDrive size={20} className="text-[#185C4D] group-hover:scale-110 transition-transform" />
              <h2 className="text-base font-bold text-[#1C1C1E]">Storage Utilization</h2>
            </div>
            <ChartBox height={250}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={storageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="capacity" name="Max Capacity" fill="#E2D3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="used" name="Currently Used" fill="#185C4D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </StaggerItem>

        {/* 2. Tracking & Overdue */}
        <StaggerItem>
          <div
            className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col cursor-pointer transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 hover:shadow-md group"
            onClick={() => router.push('/dashboard/tracking')}
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity size={20} className="text-[#185C4D] group-hover:scale-110 transition-transform" />
              <h2 className="text-base font-bold text-[#1C1C1E]">Tracking & Overdue</h2>
            </div>
            <ChartBox height={250}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={trackingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#185C4D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#185C4D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="borrowed" name="Borrowed" stroke="#185C4D" fillOpacity={1} fill="url(#colorBorrowed)" />
                  <Area type="monotone" dataKey="returned" name="Returned" stroke="#1A7A44" fill="none" />
                  <Area type="monotone" dataKey="overdue" name="Overdue" stroke="#B83131" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Bottom Row */}
      <StaggerContainer staggerDelay={0.08} delayChildren={0.3} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 3. Document Statuses */}
        <StaggerItem>
          <div
            className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col items-center cursor-pointer transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 hover:shadow-md group"
            onClick={() => router.push('/dashboard/documents')}
          >
            <div className="flex items-center gap-2 mb-2 self-start w-full">
              <Clock size={18} className="text-[#185C4D] group-hover:scale-110 transition-transform" />
              <h2 className="text-sm font-bold text-[#1C1C1E]">Retention Status</h2>
            </div>
            <ChartBox height={180} className="relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={retentionData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {retentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[#1C1C1E]">{totalDocs}</span>
                <span className="text-[10px] text-[#737373]">Total Docs</span>
              </div>
            </ChartBox>
            <div className="flex flex-col gap-1 w-full mt-2">
              {retentionData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[#737373]">{d.name}</span>
                  </div>
                  <span className="font-bold text-[#1C1C1E]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* 4. Document Types */}
        <StaggerItem>
          <div
            className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col items-center cursor-pointer transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 hover:shadow-md group"
            onClick={() => router.push('/dashboard/document-types')}
          >
            <div className="flex items-center gap-2 mb-2 self-start w-full">
              <PieChartIcon size={18} className="text-[#185C4D] group-hover:scale-110 transition-transform" />
              <h2 className="text-sm font-bold text-[#1C1C1E]">Document Types Distribution</h2>
            </div>
            <ChartBox height={180} className="relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={docTypeDistributionMock} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {docTypeDistributionMock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[#1C1C1E]">{totalDocTypes}</span>
                <span className="text-[10px] text-[#737373]">Categories</span>
              </div>
            </ChartBox>
            <div className="flex flex-col gap-1 w-full mt-2">
              {docTypeDistributionMock.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[#737373]">{d.name}</span>
                  </div>
                  <span className="font-bold text-[#1C1C1E]">{d.value} Docs</span>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* 5. Data Entry Performance */}
        <StaggerItem>
          <div
            className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col cursor-pointer transition-all duration-300 hover:bg-white/60 hover:-translate-y-1 hover:shadow-md group"
            onClick={() => router.push('/dashboard/users')}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#185C4D] group-hover:scale-110 transition-transform" />
              <h2 className="text-sm font-bold text-[#1C1C1E]">Data Entry (Monthly)</h2>
            </div>
            <ChartBox height={160}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={entryData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="docs" name="New Docs" stroke="#185C4D" strokeWidth={3} dot={{ r: 4, fill: '#185C4D', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
            <div className="mt-4 pt-4 border-t border-white/40 w-full flex justify-between items-center">
              <span className="text-xs text-[#737373]">Total this month</span>
              <span className="text-sm font-bold text-[#185C4D]">590 Documents</span>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}