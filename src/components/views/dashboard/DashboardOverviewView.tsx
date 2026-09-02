// src/components/views/dashboard/DashboardOverviewView.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  FileText, HardDrive, Clock, Activity, Layers, Warehouse, Package, Inbox,
  AlertTriangle, CheckCircle2, RefreshCw, TrendingUp, PieChart as PieChartIcon,
  Building2, ArrowUpRight, ShieldCheck, Search, Filter,
  Sparkles, Plus, QrCode, ArrowRight, Database, ChevronRight, X, Loader2
} from 'lucide-react';
import { Button, Progress, Select, Spin } from 'antd';

import { useDashboardStore } from '@/store/useDashboardStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
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

// Lao Month Translation Map
const LAO_MONTHS: Record<string, string> = {
  '01': 'ມັງກອນ',
  '02': 'ກຸມພາ',
  '03': 'ມີນາ',
  '04': 'ເມສາ',
  '05': 'ພຶດສະພາ',
  '06': 'ມິຖຸນາ',
  '07': 'ກໍລະກົດ',
  '08': 'ສິງຫາ',
  '09': 'ກັນຍາ',
  '10': 'ຕຸລາ',
  '11': 'ພະຈິກ',
  '12': 'ທັນວາ',
};

function formatMonthLao(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const [year, month] = parts;
  return `${LAO_MONTHS[month] || month} ${year}`;
}

const PALETTE = [
  '#185C4D',
  '#D4AF37',
  '#25705A',
  '#30836B',
  '#3B82F6',
  '#8B5CF6',
  '#E5A93B',
  '#06B6D4',
  '#EC4899',
  '#F97316',
];

/** Custom Glass Tooltip for Charts */
const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-white/80 p-3.5 rounded-2xl shadow-xl font-lao min-w-[150px]">
        <p className="font-bold text-[#1C1C1E] text-xs mb-1.5 pb-1 border-b border-slate-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-xs py-0.5">
            <span className="text-[#737373] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-bold text-[#1C1C1E]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
  const {
    stats,
    isLoading,
    isInitialLoaded,
    error,
    fetchStats,
    lastFetchedAt,
    selectedDepartmentId,
  } = useDashboardStore();
  const { departmentDropdown, fetchDropdown } = useDepartmentStore();

  const [distTab, setDistTab] = useState<'department' | 'division'>('department');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    fetchStats();
    fetchDropdown();
  }, [fetchStats, fetchDropdown]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('lo-LA', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Department Dropdown Options
  const departmentOptions = useMemo(() => {
    const baseOptions = [{ value: 'ALL', label: 'ທຸກຝ່າຍ (All Departments)' }];
    if (departmentDropdown && departmentDropdown.length > 0) {
      const mapped = departmentDropdown.map((d: any) => ({
        value: String(d.value || d.id),
        label: d.label || d.name,
      }));
      return [...baseOptions, ...mapped];
    }
    // Fallback from live stats
    if (stats.documentsByDepartment && stats.documentsByDepartment.length > 0) {
      const mapped = stats.documentsByDepartment.map((d) => ({
        value: String(d.departmentId),
        label: `[${d.departmentCode}] ${d.departmentName}`,
      }));
      return [...baseOptions, ...mapped];
    }
    return baseOptions;
  }, [departmentDropdown, stats.documentsByDepartment]);

  // Selected Department Label
  const selectedDepartmentName = useMemo(() => {
    if (!selectedDepartmentId || selectedDepartmentId === 'ALL') return null;
    const found = departmentOptions.find((d) => String(d.value) === String(selectedDepartmentId));
    if (found) return found.label;
    const fromStats = stats.documentsByDepartment.find((d) => String(d.departmentId) === String(selectedDepartmentId));
    return fromStats ? fromStats.departmentName : `ຝ່າຍ ID: ${selectedDepartmentId}`;
  }, [selectedDepartmentId, departmentOptions, stats.documentsByDepartment]);

  const handleDepartmentChange = (val: string) => {
    const newDeptId = val === 'ALL' ? null : val;
    fetchStats({ departmentId: newDeptId });
  };

  // Retention compliance percentage calculated dynamically from live stats
  const retentionTotal = useMemo(() => {
    return (stats.retentionStatus?.activeCount || 0) +
      (stats.retentionStatus?.expiredCount || 0) +
      (stats.retentionStatus?.contractBoundCount || 0);
  }, [stats.retentionStatus]);

  const activeRetentionRate = useMemo(() => {
    if (retentionTotal === 0) return 100;
    return Math.round(((stats.retentionStatus?.activeCount || 0) / retentionTotal) * 100);
  }, [retentionTotal, stats.retentionStatus]);

  // Format monthly growth for Recharts
  const chartMonthlyData = useMemo(() => {
    return (stats.monthlyGrowth || []).map((item) => ({
      rawMonth: item.month,
      month: formatMonthLao(item.month),
      'ຈຳນວນເອກະສານ': item.count,
    }));
  }, [stats.monthlyGrowth]);

  // Peak monthly documents
  const peakMonthlyCount = useMemo(() => {
    if (!stats.monthlyGrowth || stats.monthlyGrowth.length === 0) return 0;
    return Math.max(...stats.monthlyGrowth.map((m) => m.count), 0);
  }, [stats.monthlyGrowth]);

  // Documents by Document Type with dynamic percentage
  const docTypeChartData = useMemo(() => {
    const total = stats.summary?.documents || 0;
    const denominator = total > 0 ? total : 1;
    return (stats.documentsByDocumentType || []).map((dt, idx) => ({
      id: dt.documentTypeId,
      name: dt.documentTypeName || dt.documentTypeCode,
      value: dt.documentCount,
      percentage: total > 0 ? ((dt.documentCount / denominator) * 100).toFixed(1) : '0',
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [stats.documentsByDocumentType, stats.summary?.documents]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    const list = [...(stats.documentsByDepartment || [])].sort((a, b) => b.documentCount - a.documentCount);
    if (!searchQuery.trim()) return list;
    return list.filter((dept) =>
      dept.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.departmentCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stats.documentsByDepartment, searchQuery]);

  // Filtered Divisions
  const filteredDivisions = useMemo(() => {
    const list = [...(stats.documentsByDivision || [])].sort((a, b) => b.documentCount - a.documentCount);
    if (!searchQuery.trim()) return list;
    return list.filter((div) =>
      div.divisionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.divisionCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stats.documentsByDivision, searchQuery]);

  // Slideshow items dynamically generated from real response data
  const slideshowItems: SlideItem[] = useMemo(() => {
    const slides: SlideItem[] = [];

    // Alert Slide 1: Borrow Alerts
    if ((stats.borrowAlerts?.overdueCount || 0) > 0 || (stats.borrowAlerts?.upcomingDueCount || 0) > 0) {
      slides.push({
        id: 'slide-borrow-alert',
        title: `ແຈ້ງເຕືອນການຢືມ: ${stats.borrowAlerts.overdueCount} ກາຍກຳນົດ, ${stats.borrowAlerts.upcomingDueCount} ໃກ້ຮອດກຳນົດ`,
        subtitle: 'ກວດສອບລາຍການເອກະສານທີ່ກາຍກຳນົດສົ່ງຄືນ ເພື່ອຕິດຕາມສະຖານະຢ່າງວ່ອງໄວ.',
        badge: 'ການຢືມ-ຄືນເອກະສານ',
        badgeBg: 'bg-[#B83131]/15 text-[#B83131]',
        icon: <AlertTriangle className="text-[#B83131]" size={24} />,
        actionText: 'ກວດສອບການຢືມ',
        onAction: () => router.push('/dashboard/tracking'),
      });
    } else {
      slides.push({
        id: 'slide-tracking-good',
        title: 'ລະບົບຕິດຕາມການຢືມ-ຄືນເອກະສານຢູ່ໃນສະຖານະປົກກະຕິ',
        subtitle: `ປະຈຸບັນມີເອກະສານກຳລັງຢືມ ${stats.summary?.borrows?.active || 0} ລາຍການ, ສົ່ງຄືນແລ້ວ ${stats.summary?.borrows?.returned || 0} ລາຍການ, ບໍ່ມີລາຍການກາຍກຳນົດ.`,
        badge: 'ສະຖານະປົກກະຕິ',
        badgeBg: 'bg-emerald-500/15 text-emerald-700',
        icon: <ShieldCheck className="text-emerald-600" size={24} />,
        actionText: 'ເບິ່ງປະຫວັດການຢືມ',
        onAction: () => router.push('/dashboard/tracking'),
      });
    }

    // Slide 2: Storage Status
    const usagePercent = stats.storageCapacity?.usagePercentage || 0;
    slides.push({
      id: 'slide-storage',
      title: `ຄວາມຈຸສາງເກັບຮັກສາ: ໃຊ້ໄປແລ້ວ ${stats.storageCapacity?.usedCapacity || 0} ຈາກທັງໝົດ ${(stats.storageCapacity?.totalCapacity || 0).toLocaleString()} ໜ່ວຍ (${usagePercent}%)`,
      subtitle: `ລະບົບຮອງຮັບ ${stats.summary?.warehouses || 0} ສາງຫຼັກ, ${stats.summary?.lockers || 0} ຕູ້ເກັບ, ${stats.summary?.shelves || 0} ຊັ້ນວາງ ແລະ ${stats.summary?.folders || 0} ແຟ້ມ Kono.`,
      badge: 'ພື້ນທີ່ຈັດເກັບສາງ',
      badgeBg: 'bg-[#185C4D]/15 text-[#185C4D]',
      icon: <HardDrive className="text-[#185C4D]" size={24} />,
      actionText: 'ຈັດການສາງ & ຕູ້ເກັບ',
      onAction: () => router.push('/dashboard/warehouses'),
    });

    // Slide 3: Retention & Compliance
    slides.push({
      id: 'slide-retention',
      title: `ເອກະສານທັງໝົດ ${stats.summary?.documents || 0} ສະບັບ (${activeRetentionRate}% ຢູ່ໃນກຳນົດອາຍຸການເກັບຮັກສາ)`,
      subtitle: `ມີ ${stats.retentionStatus?.activeCount || 0} ເອກະສານມີຜົນບັງຄັບໃຊ້, ${stats.retentionStatus?.expiredCount || 0} ເອກະສານໝົດອາຍຸ, ${stats.retentionStatus?.contractBoundCount || 0} ເອກະສານຜູກພັນສັນຍາ.`,
      badge: 'ອາຍຸການເກັບຮັກສາ (Retention)',
      badgeBg: 'bg-[#D4AF37]/20 text-[#9B7016]',
      icon: <FileText className="text-[#9B7016]" size={24} />,
      actionText: 'ຄົ້ນຫາເອກະສານ',
      onAction: () => router.push('/dashboard/documents'),
    });

    return slides;
  }, [stats, activeRetentionRate, router]);

  return (
    <div className="w-full flex flex-col gap-6 font-lao pb-10">
      {/* ── Top Header & Live Status Bar ── */}
      <SlideIn direction="down" duration={0.4}>
        <div className="flex flex-col gap-4 bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[28px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-[#185C4D] uppercase tracking-wider">
                  EDL E-Document Live Intelligence
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1C1E] tracking-tight mt-1">
                ພາບລວມລະບົບ E-Document
              </h1>
              <p className="text-[#737373] text-xs sm:text-sm mt-0.5">
                ລະບົບຕິດຕາມເອກະສານ, ຄວາມຈຸສາງເກັບຮັກສາ ແລະ ສະຖິຕິການເຄື່ອນໄຫວແບບ Real-Time ຈາກເຊີບເວີ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
              {/* Live Clock & Sync indicator */}
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/80 shadow-xs text-xs text-[#1C1C1E]">
                <Clock size={14} className="text-[#185C4D]" />
                <span className="font-medium">{currentTime || '00:00:00'}</span>
                {lastFetchedAt && (
                  <span className="text-[10px] text-[#737373] hidden sm:inline border-l border-slate-200 pl-2">
                    ຊິງຄ໌ລ່າສຸດ {lastFetchedAt.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Refresh Button */}
              <Button
                type="default"
                icon={<RefreshCw size={15} className={isLoading ? 'animate-spin text-[#185C4D]' : 'text-[#185C4D]'} />}
                onClick={() => fetchStats()}
                loading={isLoading}
                className="!h-10 !rounded-xl !bg-white/80 !border-white/90 hover:!bg-white !text-[#185C4D] !font-medium !shadow-xs"
              >
                <span className="hidden sm:inline">ອັບເດດຂໍ້ມູນ</span>
              </Button>

              {/* Create Doc Quick Button */}
              <button
                onClick={() => router.push('/dashboard/documents')}
                className="cursor-pointer font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-[#185C4D] hover:bg-[#124539] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#185C4D]/25 flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>ເພີ່ມເອກະສານ</span>
              </button>
            </div>
          </div>

          {/* Department Filter Bar */}
          <div className="pt-3 border-t border-slate-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-lg bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 flex-1">
                <span className="text-xs font-bold text-[#1C1C1E] whitespace-nowrap">ກັ່ນຕອງຕາມຝ່າຍ:</span>
                <Select
                  value={selectedDepartmentId ? String(selectedDepartmentId) : 'ALL'}
                  onChange={handleDepartmentChange}
                  options={departmentOptions}
                  loading={isLoading}
                  placeholder="ເລືອກຝ່າຍທີ່ຕ້ອງການສະແດງ..."
                  className="w-full sm:w-72"
                  popupMatchSelectWidth={false}
                  showSearch
                  optionFilterProp="label"
                  style={{ height: 36 }}
                />
              </div>
            </div>

            {selectedDepartmentId && selectedDepartmentId !== 'ALL' && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 self-stretch sm:self-auto justify-between">
                <span className="truncate max-w-[260px]">
                  ກຳລັງສະແດງສະເພາະ: <strong>{selectedDepartmentName}</strong>
                </span>
                <button
                  onClick={() => handleDepartmentChange('ALL')}
                  className="cursor-pointer text-emerald-800 hover:text-rose-700 transition-colors p-0.5 rounded-md hover:bg-emerald-100"
                  title="ລ້າງຕົວກອງ"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </SlideIn>

      {/* ── Dynamic Announcement & Alert Slideshow Banner ── */}
      <SlideIn direction="up" delay={0.08} duration={0.5}>
        <SlideshowBanner slides={slideshowItems} autoPlayInterval={7000} />
      </SlideIn>

      {/* ── 4 Primary Metric KPI Cards ── */}
      <StaggerContainer staggerDelay={0.08} delayChildren={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Documents */}
        <StaggerItem>
          <div
            onClick={() => router.push('/dashboard/documents')}
            className="group relative bg-white/40 backdrop-blur-2xl border border-white/70 p-5 rounded-[26px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] cursor-pointer transition-all duration-300 hover:bg-white/70 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner">
                <FileText size={22} />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1">
                <Sparkles size={11} /> ໃຊ້ງານຢູ່
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#737373]">
                {selectedDepartmentId ? 'ເອກະສານຂອງຝ່າຍນີ້' : 'ເອກະສານທັງໝົດໃນລະບົບ'}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
                  {stats.summary?.documents || 0}
                </span>
                <span className="text-xs font-medium text-[#737373]">ສະບັບ</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#737373]">
              <span>{stats.summary?.documentTypes || 0} ໝວດປະເພດ</span>
              <span className="text-[#185C4D] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                ເບິ່ງທັງໝົດ <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 2: Storage Capacity */}
        <StaggerItem>
          <div
            onClick={() => router.push('/dashboard/warehouses')}
            className="group relative bg-white/40 backdrop-blur-2xl border border-white/70 p-5 rounded-[26px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] cursor-pointer transition-all duration-300 hover:bg-white/70 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-[#25705A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner">
                <HardDrive size={22} />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/50">
                {stats.storageCapacity?.usagePercentage || 0}% ນຳໃຊ້
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#737373]">ຄວາມຈຸພື້ນທີ່ຈັດເກັບສາງ</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
                  {stats.storageCapacity?.usedCapacity || 0}
                </span>
                <span className="text-xs font-medium text-[#737373]">
                  / {(stats.storageCapacity?.totalCapacity || 0).toLocaleString()} ໜ່ວຍ
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <Progress
                percent={stats.storageCapacity?.usagePercentage || 0}
                strokeColor="#185C4D"
                railColor="#E2D3B8"
                size={['100%', 6]}
                showInfo={false}
              />
              <div className="flex items-center justify-between text-[11px] text-[#737373] mt-1.5">
                <span>
                  ຍັງວ່າງ {Math.max((stats.storageCapacity?.totalCapacity || 0) - (stats.storageCapacity?.usedCapacity || 0), 0).toLocaleString()}
                </span>
                <span className="text-[#185C4D] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  ຈັດການສາງ <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 3: Borrows & Tracking */}
        <StaggerItem>
          <div
            onClick={() => router.push('/dashboard/tracking')}
            className="group relative bg-white/40 backdrop-blur-2xl border border-white/70 p-5 rounded-[26px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] cursor-pointer transition-all duration-300 hover:bg-white/70 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner">
                <Activity size={22} />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                (stats.borrowAlerts?.overdueCount || 0) > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200/50'
                  : 'bg-amber-50 text-amber-800 border-amber-200/50'
              }`}>
                {(stats.borrowAlerts?.overdueCount || 0) > 0 ? `${stats.borrowAlerts.overdueCount} ກາຍກຳນົດ` : 'ປົກກະຕິ'}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#737373]">ການຢືມເອກະສານ (Active)</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
                  {stats.summary?.borrows?.active || 0}
                </span>
                <span className="text-xs font-medium text-[#737373]">
                  / ທັງໝົດ {stats.summary?.borrows?.total || 0}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#737373]">
              <span>ສົ່ງຄືນແລ້ວ {stats.summary?.borrows?.returned || 0}</span>
              <span className="text-[#185C4D] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                ຕິດຕາມ <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </StaggerItem>

        {/* KPI 4: Physical Archive Hierarchy */}
        <StaggerItem>
          <div
            onClick={() => router.push('/dashboard/shelves')}
            className="group relative bg-white/40 backdrop-blur-2xl border border-white/70 p-5 rounded-[26px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] cursor-pointer transition-all duration-300 hover:bg-white/70 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner">
                <Layers size={22} />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                ໂຄງສ້າງສາງ
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#737373]">ຊັ້ນວາງ & ຕູ້ເກັບມ້ຽນ</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
                  {stats.summary?.shelves || 0}
                </span>
                <span className="text-xs font-medium text-[#737373]">ຊັ້ນວາງ</span>
              </div>
            </div>

            {/* 4 Mini Pills */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px]">
              <span className="bg-slate-100/70 px-2 py-0.5 rounded-md text-[#1C1C1E] font-medium">
                {stats.summary?.warehouses || 0} ສາງ
              </span>
              <span className="bg-slate-100/70 px-2 py-0.5 rounded-md text-[#1C1C1E] font-medium">
                {stats.summary?.lockers || 0} ຕູ້ເກັບ
              </span>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Main Analytics Row 1: Monthly Growth Trend & Storage Structure Deep Dive ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Monthly Growth Area Chart */}
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C1C1E]">
                  ສະຖິຕິການເພີ່ມຂຶ້ນຂອງເອກະສານ (Monthly Inflow)
                </h2>
                <p className="text-xs text-[#737373]">
                  ການບັນທຶກເອກະສານເຂົ້າສູ່ລະບົບແຕ່ລະເດືອນ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#185C4D]/10 text-[#185C4D]">
                Peak: {peakMonthlyCount} ສະບັບ
              </span>
            </div>
          </div>

          <ChartBox height={260}>
            {chartMonthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartMonthlyData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#185C4D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#185C4D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<GlassTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ຈຳນວນເອກະສານ"
                    stroke="#185C4D"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorGrowth)"
                    dot={{ r: 4, fill: '#185C4D', strokeWidth: 0 }}
                    activeDot={{ r: 7, stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#737373]">
                ບໍ່ມີຂໍ້ມູນການເຕີບໂຕລາຍເດືອນ
              </div>
            )}
          </ChartBox>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-[#737373]">
            <span>ສະຫຼຸບ 6 ເດືອນຫຼ້າສຸດ</span>
            <span className="font-bold text-[#185C4D]">
              ລວມທັງໝົດ {stats.summary?.documents || 0} ສະບັບ
            </span>
          </div>
        </div>

        {/* Right (5 cols): Physical Storage Structure & Capacity */}
        <div className="lg:col-span-5 bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#25705A] flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C1C1E]">
                  ໂຄງສ້າງ ແລະ ຄວາມຈຸສາງເກັບ
                </h2>
                <p className="text-xs text-[#737373]">
                  Physical Storage Hierarchy & Capacity
                </p>
              </div>
            </div>
          </div>

          {/* Storage Capacity Bar Highlight */}
          <div className="bg-gradient-to-r from-[#185C4D]/10 via-[#25705A]/10 to-teal-500/10 border border-[#185C4D]/20 p-4 rounded-2xl mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#185C4D]">ອັດຕາການນຳໃຊ້ພື້ນທີ່ (Usage Rate)</span>
              <span className="font-extrabold text-[#1C1C1E]">{stats.storageCapacity?.usagePercentage || 0}%</span>
            </div>
            <Progress
              percent={stats.storageCapacity?.usagePercentage || 0}
              strokeColor={{ '0%': '#185C4D', '100%': '#30836B' }}
              railColor="rgba(255,255,255,0.8)"
              size={['100%', 10]}
              showInfo={false}
            />
            <div className="flex items-center justify-between text-[11px] text-[#737373] mt-2">
              <span>ໃຊ້ແລ້ວ: <strong className="text-[#1C1C1E]">{stats.storageCapacity?.usedCapacity || 0}</strong></span>
              <span>ຄວາມຈຸທັງໝົດ: <strong className="text-[#1C1C1E]">{(stats.storageCapacity?.totalCapacity || 0).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* 4 Interactive Hierarchy Links */}
          <div className="grid grid-cols-2 gap-3">
            {/* Warehouses */}
            <div
              onClick={() => router.push('/dashboard/warehouses')}
              className="p-3 rounded-2xl bg-white/60 border border-white hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#737373]">
                <span className="flex items-center gap-1">
                  <Warehouse size={14} className="text-[#185C4D]" /> ສາງເກັບ
                </span>
                <ChevronRight size={14} className="text-[#737373] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xl font-bold text-[#1C1C1E] mt-1">{stats.summary?.warehouses || 0} <span className="text-xs font-normal text-[#737373]">ແຫ່ງ</span></p>
            </div>

            {/* Lockers */}
            <div
              onClick={() => router.push('/dashboard/locker')}
              className="p-3 rounded-2xl bg-white/60 border border-white hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#737373]">
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-[#25705A]" /> ຕູ້ເກັບ (Locker)
                </span>
                <ChevronRight size={14} className="text-[#737373] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xl font-bold text-[#1C1C1E] mt-1">{stats.summary?.lockers || 0} <span className="text-xs font-normal text-[#737373]">ຕູ້</span></p>
            </div>

            {/* Shelves */}
            <div
              onClick={() => router.push('/dashboard/shelves')}
              className="p-3 rounded-2xl bg-white/60 border border-white hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#737373]">
                <span className="flex items-center gap-1">
                  <Layers size={14} className="text-indigo-600" /> ຊັ້ນວາງ (Shelf)
                </span>
                <ChevronRight size={14} className="text-[#737373] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xl font-bold text-[#1C1C1E] mt-1">{stats.summary?.shelves || 0} <span className="text-xs font-normal text-[#737373]">ຊັ້ນ</span></p>
            </div>

            {/* Folders */}
            <div
              onClick={() => router.push('/dashboard/folder')}
              className="p-3 rounded-2xl bg-white/60 border border-white hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#737373]">
                <span className="flex items-center gap-1">
                  <Inbox size={14} className="text-amber-600" /> ແຟ້ມ (Kono)
                </span>
                <ChevronRight size={14} className="text-[#737373] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xl font-bold text-[#1C1C1E] mt-1">{stats.summary?.folders || 0} <span className="text-xs font-normal text-[#737373]">ແຟ້ມ</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Analytics Row 2: Department & Division Distribution ── */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1C1C1E]">
                ການແຈກຢາຍເອກະສານຕາມໂຄງຮ່າງການຈັດຕັ້ງ
              </h2>
              <p className="text-xs text-[#737373]">
                Documents Distribution by Department & Division
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ຄົ້ນຫາຊື່ຝ່າຍ ຫຼື ພະແນກ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/80 border border-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#185C4D]/30 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Segmented Tab */}
            <div className="flex bg-white/70 p-1 rounded-xl border border-white/90 shadow-xs">
              <button
                onClick={() => setDistTab('department')}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  distTab === 'department'
                    ? 'bg-[#185C4D] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#1C1C1E]'
                }`}
              >
                ຕາມຝ່າຍ ({(stats.documentsByDepartment || []).length})
              </button>
              <button
                onClick={() => setDistTab('division')}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  distTab === 'division'
                    ? 'bg-[#185C4D] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#1C1C1E]'
                }`}
              >
                ຕາມພະແນກ ({(stats.documentsByDivision || []).length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content: Department View */}
        {distTab === 'department' ? (
          <div className="flex flex-col gap-3">
            {filteredDepartments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373]">
                {searchQuery ? `ບໍ່ພົບຂໍ້ມູນຝ່າຍທີ່ກົງກັບ "${searchQuery}"` : 'ບໍ່ມີຂໍ້ມູນເອກະສານຂອງຝ່າຍ'}
              </div>
            ) : (
              (showAllDepts ? filteredDepartments : filteredDepartments.slice(0, 7)).map((dept, index) => {
                const totalDocs = stats.summary?.documents || 0;
                const denominator = totalDocs > 0 ? totalDocs : 1;
                const percent = totalDocs > 0 ? ((dept.documentCount / denominator) * 100).toFixed(1) : '0';
                const isTop = dept.documentCount > 0;
                const isSelected = selectedDepartmentId && String(selectedDepartmentId) === String(dept.departmentId);

                return (
                  <div
                    key={dept.departmentId}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-[#185C4D] shadow-md ring-2 ring-[#185C4D]/20'
                        : isTop
                        ? 'bg-white/70 border-white shadow-xs hover:bg-white hover:shadow-md'
                        : 'bg-white/30 border-white/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0 && isTop
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : index === 1 && isTop
                          ? 'bg-slate-300 text-slate-800'
                          : index === 2 && isTop
                          ? 'bg-amber-700/20 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#1C1C1E] truncate">
                            {dept.departmentName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-80 shrink-0">
                      <div className="flex-1 hidden sm:block">
                        <Progress
                          percent={parseFloat(percent)}
                          strokeColor={isTop ? '#185C4D' : '#CBD5E1'}
                          railColor="rgba(0,0,0,0.05)"
                          size={['100%', 6]}
                          showInfo={false}
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <span className="text-xs font-extrabold text-[#1C1C1E] min-w-[70px] text-right">
                          {dept.documentCount} <span className="text-[10px] font-normal text-[#737373]">ສະບັບ</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#185C4D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 min-w-[50px] text-center">
                          {percent}%
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDepartmentChange(isSelected ? 'ALL' : String(dept.departmentId));
                          }}
                          className={`cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-[#185C4D]/10 text-[#185C4D] hover:bg-[#185C4D] hover:text-white'
                          }`}
                        >
                          {isSelected ? 'ຍົກເລີກ' : 'ກັ່ນຕອງ'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {filteredDepartments.length > 7 && (
              <button
                onClick={() => setShowAllDepts(!showAllDepts)}
                className="cursor-pointer mt-2 py-2.5 px-4 rounded-xl bg-white/60 hover:bg-white text-xs font-semibold text-[#185C4D] border border-white transition-all text-center self-center shadow-xs"
              >
                {showAllDepts ? 'ສະແດງໜ້ອຍລົງ' : `ສະແດງທັງໝົດອີກ ${filteredDepartments.length - 7} ຝ່າຍ`}
              </button>
            )}
          </div>
        ) : (
          /* Tab Content: Division View */
          <div className="flex flex-col gap-3">
            {filteredDivisions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373]">
                {searchQuery ? `ບໍ່ພົບຂໍ້ມູນພະແນກທີ່ກົງກັບ "${searchQuery}"` : 'ບໍ່ມີຂໍ້ມູນເອກະສານຂອງພະແນກ'}
              </div>
            ) : (
              filteredDivisions.map((div, index) => {
                const totalDocs = stats.summary?.documents || 0;
                const denominator = totalDocs > 0 ? totalDocs : 1;
                const percent = totalDocs > 0 ? ((div.documentCount / denominator) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={div.divisionId}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-white shadow-xs hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#1C1C1E] truncate">
                            {div.divisionName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-64 shrink-0">
                      <div className="flex-1 hidden sm:block">
                        <Progress
                          percent={parseFloat(percent)}
                          strokeColor="#30836B"
                          railColor="rgba(0,0,0,0.05)"
                          size={['100%', 6]}
                          showInfo={false}
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <span className="text-xs font-extrabold text-[#1C1C1E] min-w-[70px] text-right">
                          {div.documentCount} <span className="text-[10px] font-normal text-[#737373]">ສະບັບ</span>
                        </span>
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 min-w-[50px] text-center">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Main Analytics Row 3: Document Types Distribution & Retention Lifecycle ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 cols): Document Types Donut Chart */}
        <div className="lg:col-span-6 bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <PieChartIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C1C1E]">
                  ການແຈກຢາຍຕາມປະເພດເອກະສານ
                </h2>
                <p className="text-xs text-[#737373]">
                  Document Types Breakdown ({stats.summary?.documentTypes || 0} ໝວດປະເພດ)
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/document-types')}
              className="cursor-pointer text-xs font-semibold text-[#185C4D] hover:underline flex items-center gap-0.5"
            >
              ຈັດການປະເພດ <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-auto py-2">
            <ChartBox height={200} className="relative flex items-center justify-center">
              {docTypeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={docTypeChartData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {docTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<GlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#737373]">
                  ບໍ່ມີຂໍ້ມູນປະເພດເອກະສານ
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[#1C1C1E] leading-none">
                  {stats.summary?.documents || 0}
                </span>
                <span className="text-[10px] font-medium text-[#737373] mt-0.5">ເອກະສານລວມ</span>
              </div>
            </ChartBox>

            {/* Document Types Legend List */}
            <div className="flex flex-col gap-2.5">
              {docTypeChartData.length === 0 ? (
                <p className="text-xs text-[#737373] text-center py-4">ບໍ່ພົບປະເພດເອກະສານ</p>
              ) : (
                docTypeChartData.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl bg-white/60 border border-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-[#1C1C1E] truncate max-w-[130px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-[#1C1C1E]">{item.value} ສະບັບ</span>
                      <span className="text-[10px] font-bold text-[#737373] bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 text-[11px] text-[#737373] flex justify-between items-center">
            <span>ໝວດປະເພດທັງໝົດໃນລະບົບ</span>
            <span className="font-bold text-[#185C4D]">{stats.summary?.documentTypes || 0} ໝວດປະເພດ</span>
          </div>
        </div>

        {/* Right (6 cols): Retention Lifecycle & Borrow Alerts */}
        <div className="lg:col-span-6 bg-white/40 backdrop-blur-2xl border border-white/70 p-5 sm:p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C1C1E]">
                  ສະຖານະອາຍຸການເກັບຮັກສາ ແລະ ຄວາມສ່ຽງ
                </h2>
                <p className="text-xs text-[#737373]">
                  Retention Lifecycle, Compliance & Borrowing Risk
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/document-expired')}
              className="cursor-pointer text-xs font-semibold text-[#185C4D] hover:underline flex items-center gap-0.5"
            >
              ເອກະສານໝົດອາຍຸ <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Retention 3 Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {/* Active */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase">ເກັບຮັກສາ</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
                {stats.retentionStatus?.activeCount || 0}
              </span>
              <span className="text-[10px] text-emerald-600 mt-0.5">{activeRetentionRate}% ປົກກະຕິ</span>
            </div>

            {/* Contract Bound */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-semibold text-blue-700 uppercase">ຫ້າມທຳລາຍ</span>
              <span className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">
                {stats.retentionStatus?.contractBoundCount || 0}
              </span>
              <span className="text-[10px] text-blue-600 mt-0.5">Hold Contract</span>
            </div>

            {/* Expired */}
            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-semibold text-rose-700 uppercase">ໝົດອາຍຸ / ລໍທຳລາຍ</span>
              <span className="text-xl sm:text-2xl font-black text-rose-900 mt-0.5">
                {stats.retentionStatus?.expiredCount || 0}
              </span>
              <span className="text-[10px] text-rose-600 mt-0.5">Ready to Dispose</span>
            </div>
          </div>

          {/* Borrowing Risk Alert Pill Card */}
          <div className="bg-white/70 border border-white p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                (stats.borrowAlerts?.overdueCount || 0) > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {(stats.borrowAlerts?.overdueCount || 0) > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1C1E]">
                  {(stats.borrowAlerts?.overdueCount || 0) > 0
                    ? `ພົບເອກະສານກາຍກຳນົດ ${stats.borrowAlerts.overdueCount} ລາຍການ!`
                    : 'ບໍ່ມີເອກະສານກາຍກຳນົດສົ່ງຄືນ'}
                </p>
                <p className="text-[11px] text-[#737373]">
                  ໃກ້ຮອດກຳນົດສົ່ງຄືນ: {stats.borrowAlerts?.upcomingDueCount || 0} ລາຍການ
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/tracking')}
              className="cursor-pointer text-xs font-bold text-[#185C4D] bg-[#185C4D]/10 hover:bg-[#185C4D] hover:text-white px-3 py-1.5 rounded-xl transition-all"
            >
              ກວດສອບ
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-[#737373] flex justify-between items-center">
            <span>ລະດັບຄວາມປອດໄພ & ຄວາມຖືກຕ້ອງ</span>
            <span className="font-bold text-emerald-700">{activeRetentionRate}% ຖືກຕ້ອງຕາມນະໂຍບາຍ</span>
          </div>
        </div>
      </div>

      {/* ── Quick Action Shortcuts Grid ── */}
      <SlideIn direction="up" delay={0.2} duration={0.4}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => router.push('/dashboard/documents')}
            className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1C1E]">ຈັດການເອກະສານ</p>
              <p className="text-[10px] text-[#737373]">All Documents</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/dashboard/scan')}
            className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#25705A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1C1E]">ສະແກນ QR Code</p>
              <p className="text-[10px] text-[#737373]">Fast Scanner</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/dashboard/warehouses')}
            className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Warehouse size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1C1E]">ຈັດການສາງ & ຕູ້</p>
              <p className="text-[10px] text-[#737373]">Physical Storage</p>
            </div>
          </div>

          <div
            onClick={() => router.push('/dashboard/tracking')}
            className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1C1E]">ຕິດຕາມການຢືມ</p>
              <p className="text-[10px] text-[#737373]">Tracking & Logs</p>
            </div>
          </div>
        </div>
      </SlideIn>
    </div>
  );
}