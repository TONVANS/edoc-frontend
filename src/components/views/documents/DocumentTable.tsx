"use client";
import React, { useEffect } from 'react';
import {
  FileText,
  Edit2,
  Trash2,
  Search,
  Eye,
  Paperclip,
  Calendar,
  Lock,
  MoreVertical,
  QrCode,
  Tag,
  FolderOpen,
  Scale,
  ArrowRightLeft,
  Filter
} from 'lucide-react';
import { Button, Input, Select, Dropdown, Pagination, DatePicker, Popover } from 'antd';
import { Document } from '@/types/prisma-mapped';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { useLockerStore } from '@/store/useLockerStore';
import { useShelfStore } from '@/store/useShelfStore';
import dayjs from 'dayjs';
import StatusBadge from '@/components/dashboard/StatusBadge';

const { RangePicker } = DatePicker;

interface DocumentTableProps {
  data: Document[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  folderFilter: string;
  onFolderFilterChange: (folderId: string) => void;
  docTypeFilter: string;
  onDocTypeFilterChange: (docTypeId: string) => void;
  contractFilter: string;
  onContractFilterChange: (value: string) => void;
  startDateFilter?: string;
  onStartDateFilterChange?: (date: string) => void;
  endDateFilter?: string;
  onEndDateFilterChange?: (date: string) => void;
  departmentFilter?: number | undefined;
  onDepartmentFilterChange?: (id: number | undefined) => void;
  divisionFilter?: number | undefined;
  onDivisionFilterChange?: (id: number | undefined) => void;
  isLoading: boolean;
  onEdit: (doc: Document) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (doc: Document) => void;
  onViewQrCode?: (doc: Document) => void;
  onMove?: (doc: Document) => void;
  hideLocationFilters?: boolean;
}

export default function DocumentTable({
  data = [],
  total = 0,
  currentPage = 1,
  pageSize = 5,
  onPageChange,
  searchTerm = '',
  onSearchChange,
  folderFilter = '',
  onFolderFilterChange,
  docTypeFilter = '',
  onDocTypeFilterChange,
  contractFilter = '',
  onContractFilterChange,
  startDateFilter = '',
  onStartDateFilterChange = () => { },
  endDateFilter = '',
  onEndDateFilterChange = () => { },
  departmentFilter,
  onDepartmentFilterChange = () => { },
  divisionFilter,
  onDivisionFilterChange = () => { },
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onViewQrCode,
  onMove,
  hideLocationFilters = false,
}: DocumentTableProps) {
  const { folders, fetchFolders } = useFolderStore();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypeStore();
  const { departmentDropdown, fetchDropdown: fetchDepartmentDropdown } = useDepartmentStore();
  const { divisionDropdown, fetchDropdown: fetchDivisionDropdown } = useDivisionStore();

  const { addresses, fetchAddresses } = useAddressStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { lockers, fetchLockers } = useLockerStore();
  const { shelves, fetchShelves } = useShelfStore();

  const [filterAddress, setFilterAddress] = React.useState<string>('');
  const [filterWarehouse, setFilterWarehouse] = React.useState<string>('');
  const [filterLocker, setFilterLocker] = React.useState<string>('');
  const [filterShelf, setFilterShelf] = React.useState<string>('');

  // Load folders and document types for display/filter mappings
  useEffect(() => {
    fetchFolders({ limit: 1000 });
    fetchDocumentTypes({ limit: 1000 });
    fetchDepartmentDropdown();
    fetchAddresses({ limit: 1000 });
    fetchWarehouses({ limit: 1000 });
    fetchLockers({ limit: 1000 });
    fetchShelves({ limit: 1000 });
  }, [fetchFolders, fetchDocumentTypes, fetchDepartmentDropdown, fetchAddresses, fetchWarehouses, fetchLockers, fetchShelves]);

  useEffect(() => {
    fetchDivisionDropdown(departmentFilter ? { departmentId: departmentFilter } : undefined);
  }, [departmentFilter, fetchDivisionDropdown]);

  // Derived options for cascading filters
  const warehouseOptions = React.useMemo(() => {
    if (!filterAddress) return warehouses;
    return warehouses.filter(w => String(w.addressId) === filterAddress);
  }, [warehouses, filterAddress]);

  const lockerOptions = React.useMemo(() => {
    if (filterWarehouse) return lockers.filter(l => String(l.warehouseId) === filterWarehouse);
    if (filterAddress) return lockers.filter(l => warehouseOptions.some(w => String(w.id) === String(l.warehouseId)));
    return lockers;
  }, [lockers, filterWarehouse, filterAddress, warehouseOptions]);

  const shelfOptions = React.useMemo(() => {
    if (filterLocker) return shelves.filter(s => String(s.lockerId) === filterLocker);
    if (filterWarehouse || filterAddress) return shelves.filter(s => lockerOptions.some(l => String(l.id) === String(s.lockerId)));
    return shelves;
  }, [shelves, filterLocker, filterWarehouse, filterAddress, lockerOptions]);

  const folderOptions = React.useMemo(() => {
    if (filterShelf) return folders.filter(f => String(f.shelfId) === filterShelf);
    if (filterLocker || filterWarehouse || filterAddress) return folders.filter(f => shelfOptions.some(s => String(s.id) === String(f.shelfId)));
    return folders;
  }, [folders, filterShelf, filterLocker, filterWarehouse, filterAddress, shelfOptions]);

  // Handlers for cascading selects
  const handleAddressChange = (val: string) => {
    setFilterAddress(val || '');
    setFilterWarehouse('');
    setFilterLocker('');
    setFilterShelf('');
    onFolderFilterChange('');
  };

  const handleWarehouseChange = (val: string) => {
    setFilterWarehouse(val || '');
    setFilterLocker('');
    setFilterShelf('');
    onFolderFilterChange('');
    if (val) {
      const warehouse = warehouses.find(w => String(w.id) === val);
      if (warehouse && warehouse.addressId && !filterAddress) {
        setFilterAddress(String(warehouse.addressId));
      }
    }
  };

  const handleLockerChange = (val: string) => {
    setFilterLocker(val || '');
    setFilterShelf('');
    onFolderFilterChange('');
    if (val) {
      const locker = lockers.find(l => String(l.id) === val);
      if (locker && locker.warehouseId && !filterWarehouse) {
        setFilterWarehouse(String(locker.warehouseId));
        // Also auto-select address if possible
        const warehouse = warehouses.find(w => String(w.id) === String(locker.warehouseId));
        if (warehouse && warehouse.addressId && !filterAddress) {
          setFilterAddress(String(warehouse.addressId));
        }
      }
    }
  };

  const handleShelfChange = (val: string) => {
    setFilterShelf(val || '');
    onFolderFilterChange('');
    if (val) {
      const shelf = shelves.find(s => String(s.id) === val);
      if (shelf && shelf.lockerId && !filterLocker) {
        setFilterLocker(String(shelf.lockerId));
        // We could bubble up all the way, but standard cascading usually goes one up
        const locker = lockers.find(l => String(l.id) === String(shelf.lockerId));
        if (locker && locker.warehouseId && !filterWarehouse) {
          setFilterWarehouse(String(locker.warehouseId));
          const warehouse = warehouses.find(w => String(w.id) === String(locker.warehouseId));
          if (warehouse && warehouse.addressId && !filterAddress) {
            setFilterAddress(String(warehouse.addressId));
          }
        }
      }
    }
  };

  const handleFolderChange = (val: string) => {
    onFolderFilterChange(val || '');
    if (val) {
      const folder = folders.find(f => String(f.id) === val);
      if (folder && folder.shelfId && !filterShelf) {
        handleShelfChange(String(folder.shelfId));
      }
    }
  };

  // Auto-populate parent filters if folderFilter is provided externally (e.g. in Folder Detail Page)
  useEffect(() => {
    if (folderFilter && !filterShelf && folders.length > 0 && shelves.length > 0 && lockers.length > 0 && warehouses.length > 0) {
      const folder = folders.find(f => String(f.id) === String(folderFilter));
      if (folder && folder.shelfId) {
        setFilterShelf(String(folder.shelfId));
        const shelf = shelves.find(s => String(s.id) === String(folder.shelfId));
        if (shelf && shelf.lockerId) {
          setFilterLocker(String(shelf.lockerId));
          const locker = lockers.find(l => String(l.id) === String(shelf.lockerId));
          if (locker && locker.warehouseId) {
            setFilterWarehouse(String(locker.warehouseId));
            const warehouse = warehouses.find(w => String(w.id) === String(locker.warehouseId));
            if (warehouse && warehouse.addressId) {
              setFilterAddress(String(warehouse.addressId));
            }
          }
        }
      }
    }
  }, [folderFilter, folders, shelves, lockers, warehouses, filterShelf]);

  const hasAdvancedFilters = Boolean(
    (!hideLocationFilters && (filterAddress || filterWarehouse || filterLocker || filterShelf || folderFilter)) ||
    departmentFilter ||
    divisionFilter ||
    (startDateFilter && endDateFilter)
  );

  // Status mapping functions
  const getRetentionBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusBadge status="success">10ປີ ສາມາດທຳລາຍໄດ້</StatusBadge>;
      case 'DESTROYABLE':
        return <StatusBadge status="warning">10ປີ ທຳລາຍບໍ່ໄດ້</StatusBadge>;
      case 'DESTROYABLE_HOLD':
        return <StatusBadge status="danger">10ປີ ຫ້າມທຳລາຍ</StatusBadge>;
      case 'EXPIRED':
        return <StatusBadge status="danger">ໝົດອາຍຸ ເຖິງກຳນົດທຳລາຍ</StatusBadge>;
      default:
        return <StatusBadge status="warning">{status}</StatusBadge>;
    }
  };

  const getContractBadge = (isBound: boolean) => {
    return isBound ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <Scale size={10} /> ຜູກພັນສັນຍາ
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/10">
        ທົ່ວໄປ
      </span>
    );
  };

  return (
    <section className="w-full flex flex-col gap-6" aria-label="ຕາຕະລາງຂໍ້ມູນເອກະສານ">
      {/* ── Filter / Search Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 rounded-[24px] shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          {/* Search */}
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາ ເລກທີ, ຊື່ ຫຼື ລາຍລະອຽດ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="w-full sm:w-[280px] rounded-[16px] bg-white/60 border-white/80 hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D] h-[44px]"
          />

          {/* Document Type Filter */}
          <Select
            placeholder="ປະເພດເອກະສານ"
            value={docTypeFilter || undefined}
            onChange={(val) => onDocTypeFilterChange(val || '')}
            allowClear
            className="w-full sm:w-[180px] h-[44px]"
            classNames={{ popup: { root: "rounded-xl border border-white/60 shadow-glass" } }}
          >
            {documentTypes.map(t => (
              <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
            ))}
          </Select>

          {/* Contract Bound Filter */}
          <Select
            placeholder="ປະເພດສັນຍາ"
            value={contractFilter || undefined}
            onChange={(val) => onContractFilterChange(val || '')}
            allowClear
            className="w-full sm:w-[180px] h-[44px]"
            classNames={{ popup: { root: "rounded-xl border border-white/60 shadow-glass" } }}
          >
            <Select.Option value="ACTIVE">10ປີ ສາມາດທຳລາຍໄດ້</Select.Option>
            <Select.Option value="DESTROYABLE_HOLD">10ປີ ຫ້າມທຳລາຍ</Select.Option>
          </Select>

          {/* Advanced Filters Popover */}
          <Popover
            content={
              <div className="flex flex-col gap-5 w-[340px] sm:w-[420px] p-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-700 text-base">ຕົວກອງເພີ່ມເຕີມ</span>
                  {hasAdvancedFilters && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        handleAddressChange('');
                        onDepartmentFilterChange?.(undefined);
                        onDivisionFilterChange?.(undefined);
                        onStartDateFilterChange?.('');
                        onEndDateFilterChange?.('');
                      }}
                      className="text-rose-500 hover:text-rose-600 font-medium"
                    >
                      ລ້າງຕົວກອງທັງໝົດ
                    </Button>
                  )}
                </div>

                {!hideLocationFilters && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ສະຖານທີ່ເກັບຮັກສາ</span>
                    <div className="grid grid-cols-2 gap-3">
                      <Select placeholder="ສະຖານທີ່" value={filterAddress || undefined} onChange={handleAddressChange} allowClear className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                        {addresses.map(a => <Select.Option key={a.id} value={String(a.id)}>{a.name}</Select.Option>)}
                      </Select>
                      <Select placeholder="ສາງ" value={filterWarehouse || undefined} onChange={handleWarehouseChange} allowClear className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                        {warehouseOptions.map(w => <Select.Option key={w.id} value={String(w.id)}>{w.name}</Select.Option>)}
                      </Select>
                      <Select placeholder="ຕູ້" value={filterLocker || undefined} onChange={handleLockerChange} allowClear className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                        {lockerOptions.map(l => <Select.Option key={l.id} value={String(l.id)}>{l.name || l.code}</Select.Option>)}
                      </Select>
                      <Select placeholder="ຊັ້ນວາງ" value={filterShelf || undefined} onChange={handleShelfChange} allowClear className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                        {shelfOptions.map(s => <Select.Option key={s.id} value={String(s.id)}>{s.name}</Select.Option>)}
                      </Select>
                    </div>
                    <Select placeholder="ແຟ້ມເອກະສານ" value={folderFilter || undefined} onChange={handleFolderChange} allowClear className="w-full h-[40px] mt-1" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                      {folderOptions.map(f => <Select.Option key={f.id} value={String(f.id)}>{f.name || f.code}</Select.Option>)}
                    </Select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ມາຈາກພາກສ່ວນ</span>
                  <div className="grid grid-cols-2 gap-3">
                    <Select placeholder="ເລືອກຝ່າຍ" value={departmentFilter} onChange={(val) => { onDepartmentFilterChange?.(val); onDivisionFilterChange?.(undefined); }} allowClear className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                      {departmentDropdown.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
                    </Select>
                    <Select placeholder="ພະແນກ" value={divisionFilter} onChange={(val) => onDivisionFilterChange?.(val)} allowClear disabled={!departmentFilter} className="w-full h-[40px]" classNames={{ popup: { root: "rounded-xl shadow-glass" } }}>
                      {divisionDropdown.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ວັນທີເອກະສານ</span>
                  <RangePicker
                    className="w-full h-[40px] rounded-[12px]"
                    placeholder={['ເລີ່ມຕົ້ນ', 'ສິ້ນສຸດ']}
                    value={startDateFilter && endDateFilter ? [dayjs(startDateFilter), dayjs(endDateFilter)] : null}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        onStartDateFilterChange?.(dates[0].format('YYYY-MM-DD'));
                        onEndDateFilterChange?.(dates[1].format('YYYY-MM-DD'));
                      } else {
                        onStartDateFilterChange?.('');
                        onEndDateFilterChange?.('');
                      }
                    }}
                  />
                </div>
              </div>
            }
            trigger="click"
            placement="bottomLeft"
            rootClassName="[&_.ant-popover-inner]:rounded-2xl [&_.ant-popover-inner]:shadow-glass [&_.ant-popover-inner]:border [&_.ant-popover-inner]:border-white/60 [&_.ant-popover-inner]:bg-white/90 [&_.ant-popover-inner]:backdrop-blur-xl"
          >
            <Button
              type="default"
              icon={<Filter size={18} className={hasAdvancedFilters ? "text-[#185C4D]" : "text-slate-500"} />}
              className={`relative h-[44px] px-5 rounded-[16px] bg-white/60 border hover:bg-white shadow-sm transition-all duration-300 flex items-center gap-2 font-semibold ${hasAdvancedFilters
                  ? 'border-[#185C4D]/30 text-[#185C4D]'
                  : 'border-white/80 text-slate-600 focus-within:bg-white focus-within:border-[#185C4D]'
                }`}
            >
              ຕົວກອງເພີ່ມເຕີມ
              {hasAdvancedFilters && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </Button>
          </Popover>
        </div>

        {/* Total Items count badge */}
        <div className="flex items-center gap-2 text-[14px] font-bold bg-[#185C4D]/5 px-5 py-2.5 rounded-[16px] border border-[#185C4D]/10 text-[#185C4D] shrink-0">
          ທັງໝົດ <span className="text-base font-black mx-0.5">{total}</span> ລາຍການ
        </div>
      </header>

      {/* ── Table Container ── */}
      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-[32px] shadow-glass overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Custom Header Grid */}
          <div className="bg-[#185C4D] text-white grid grid-cols-12 gap-4 py-4.5 px-6 rounded-2xl shadow-md mb-5 text-[13px] font-bold tracking-wider uppercase items-center">
            <div className="col-span-2 flex items-center gap-1.5"><Tag size={14} /> ເລກທີເອກະສານ</div>
            <div className="col-span-4">ຫົວຂໍ້ & ລາຍລະອຽດ</div>
            <div className="col-span-2 flex items-center gap-1.5"><FolderOpen size={14} /> ບ່ອນເກັບ / ປະເພດ</div>
            <div className="col-span-2">ສະຖານະ / ສັນຍາ</div>
            <div className="col-span-1.5 flex items-center gap-1.5"><Calendar size={14} /> ວັນທີເອກະສານ</div>
            <div className="col-span-0.5 text-right">ຈັດການ</div>
          </div>

          {/* Table Rows or Loader */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 bg-white/20 rounded-2xl border border-white/30">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
                <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນເອກະສານ...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 bg-white/20 rounded-2xl border border-dashed border-white/40">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shadow-soft">
                <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນເອກະສານ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map(item => {
                const docTypeName = item.documentType?.name || documentTypes.find(t => t.id === item.documentTypeId)?.name || 'ບໍ່ລະບຸ';
                const folderName = item.folder?.name || folders.find(f => f.id === item.folderId)?.name || folders.find(f => f.id === item.folderId)?.code || 'ບໍ່ລະບຸ';

                return (
                  <div
                    key={item.id}
                    className="group bg-white/50 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4.5 px-6 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-glass"
                  >
                    {/* Column 1: Document Number */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/70 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm truncate max-w-full">
                        {item.docNo}
                      </span>
                    </div>

                    {/* Column 2: Title and Description */}
                    <div className="col-span-4 flex flex-col justify-center min-w-0 pr-4">
                      <span className="font-bold text-slate-800 text-[15px] truncate leading-normal" title={item.title}>
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-slate-400 text-[12px] font-medium truncate mt-0.5" title={item.description}>
                          {item.description}
                        </span>
                      )}
                    </div>

                    {/* Column 3: Folder and Type */}
                    <div className="col-span-2 flex flex-col justify-center min-w-0">
                      <span className="text-slate-700 text-[13px] font-bold truncate">
                        📂 {folderName}
                      </span>
                      <span className="text-slate-400 text-[12px] font-medium truncate mt-0.5">
                        🏷️ {docTypeName}
                      </span>
                    </div>

                    {/* Column 4: Retention and Contract Status */}
                    <div className="col-span-2 flex flex-col gap-1 items-start">
                      {getRetentionBadge(item.retentionStatus)}
                      {getContractBadge(item.isContractBound)}
                    </div>

                    {/* Column 5: Document Date */}
                    <div className="col-span-1.5 flex flex-col justify-center">
                      <span className="text-slate-600 text-[13px] font-bold">
                        {new Date(item.docDate).toLocaleDateString('lo-LA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {item.docExpire && (
                        <span className="text-rose-500/80 text-[11px] font-semibold mt-0.5">
                          ໝົດອາຍຸ: {new Date(item.docExpire).toLocaleDateString('lo-LA')}
                        </span>
                      )}
                    </div>


                    {/* Column 7: Actions */}
                    <div className="col-span-0.5 flex justify-end">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'details',
                              icon: <Eye size={16} className="text-emerald-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ເບິ່ງລາຍລະອຽດ</span>,
                              onClick: () => onViewDetails(item),
                            },
                            {
                              key: 'edit',
                              icon: <Edit2 size={16} className="text-blue-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ແກ້ໄຂຂໍ້ມູນ</span>,
                              onClick: () => onEdit(item),
                            },
                            {
                              key: 'move',
                              icon: <ArrowRightLeft size={16} className="text-[#185C4D]" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ຍ້າຍແຟ້ມ</span>,
                              onClick: () => onMove?.(item),
                            },
                            onViewQrCode ? {
                              key: 'qrcode',
                              icon: <QrCode size={16} className="text-amber-500" />,
                              label: <span className="text-slate-700 font-medium text-[13px]">ເບິ່ງ QR Code</span>,
                              onClick: () => onViewQrCode(item),
                            } : null,
                            {
                              type: 'divider',
                            },
                            {
                              key: 'delete',
                              icon: <Trash2 size={16} className="text-rose-500" />,
                              label: <span className="text-rose-500 font-semibold text-[13px]">ລຶບເອກະສານ</span>,
                              onClick: () => onDelete?.(item.id),
                            }
                          ].filter(Boolean) as any,
                          className: "min-w-[170px] p-2 rounded-2xl border border-white/60 shadow-glass bg-white/80 backdrop-blur-xl"
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#185C4D]/5 transition-all duration-300 shadow-sm border border-slate-200/30 bg-white/80 hover:border-[#185C4D]/30 group/btn"
                          icon={<MoreVertical size={18} className="text-slate-400 group-hover/btn:text-[#185C4D] transition-colors" />}
                        />
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && data.length > 0 && (
            <div className="flex justify-end mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
