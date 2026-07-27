import React, { useMemo, useState } from 'react';
import {
  Folder as FolderIcon,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  QrCode,
  FileUp,
  MoreVertical,
  ChevronRight,
  ArrowRightLeft,
  ShoppingCart,
  Printer,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Select, Tooltip, Dropdown, Pagination, Checkbox, message } from 'antd';
import { Folder } from '@/types/prisma-mapped';
import { useBorrowCartStore } from '@/store/useBorrowCartStore';
import { useAddToCart } from '@/components/views/borrow/useAddToCart';
import { useShelfStore } from '@/store/useShelfStore';
import { useFolderPrintCartStore } from '@/store/useFolderPrintCartStore';
import FolderPrintCartDrawer from '@/components/views/storage/FolderPrintCartDrawer';

interface FolderTableProps {
  data: Folder[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchName: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  onEdit: (folder: Folder) => void;
  onDelete?: (id: string | number) => void;
  onUploadDocument?: (folder: Folder) => void;
  onMove?: (folder: Folder) => void;
  onPrint?: (folder: Folder) => void;
  departmentOptions?: { value: string; label: string }[];
  filterDepartment?: string;
  onFilterDepartmentChange?: (departmentId: string) => void;
  divisionOptions?: { value: string; label: string }[];
  filterDivision?: string;
  onFilterDivisionChange?: (divisionId: string) => void;
  warehouseOptions?: { value: string; label: string }[];
  filterWarehouse?: string;
  onFilterWarehouseChange?: (warehouseId: string) => void;
  lockerOptions?: { value: string; label: string }[];
  filterLocker?: string;
  onFilterLockerChange?: (lockerId: string) => void;
  shelves?: { id: string; name: string; code: string }[];
  filterShelf?: string;
  onFilterShelfChange?: (shelfId: string) => void;
  onManage?: (folder: Folder) => void;
  hideFilters?: boolean;
}

export default function FolderTable({
  data = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  searchName = '',
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
  onUploadDocument,
  onMove,
  onPrint,
  departmentOptions = [],
  filterDepartment,
  onFilterDepartmentChange,
  divisionOptions = [],
  filterDivision,
  onFilterDivisionChange,
  warehouseOptions = [],
  filterWarehouse,
  onFilterWarehouseChange,
  lockerOptions = [],
  filterLocker,
  onFilterLockerChange,
  shelves = [],
  filterShelf,
  onFilterShelfChange,
  onManage,
  hideFilters = false,
}: FolderTableProps) {
  const { shelfDropdown, fetchShelfDropdown } = useShelfStore();
  const { isInCart: isInBorrowCart } = useBorrowCartStore();
  const { handleAddToCart, contextHolder } = useAddToCart();

  // Folder Print Cart Store
  const {
    items: printCartItems,
    addItem: addToPrintCart,
    addItems: addMultipleToPrintCart,
    toggleItem: togglePrintCart,
    isInCart: isInPrintCart,
  } = useFolderPrintCartStore();

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isPrintCartDrawerOpen, setIsPrintCartDrawerOpen] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  React.useEffect(() => {
    fetchShelfDropdown({
      lockerId: filterLocker && filterLocker !== 'all' ? filterLocker : undefined,
      warehouseId: filterWarehouse && filterWarehouse !== 'all' ? filterWarehouse : undefined,
    });
  }, [fetchShelfDropdown, filterLocker, filterWarehouse]);

  const shelfOptions = useMemo(
    () => [
      { value: 'all', label: 'ທັງໝົດ (ຊັ້ນ)' },
      ...shelfDropdown.map((s) => ({ value: String(s.id), label: s.name || s.code || '' })),
    ],
    [shelfDropdown]
  );

  // Helper to construct FolderPrintItem payload from a Folder item
  const buildFolderPrintItem = (item: Folder) => {
    const itemAny = item as any;
    const shelfInfo = itemAny.shelf
      ? [
          itemAny.shelf?.locker?.warehouse?.name,
          itemAny.shelf?.locker?.name ? `ຕູ້ ${itemAny.shelf.locker.name}` : null,
          itemAny.shelf?.name ? `ຊັ້ນ ${itemAny.shelf.name}` : null,
        ]
          .filter(Boolean)
          .join(' > ')
      : item.locationRef || '';

    return {
      id: item.id,
      name: item.name,
      code: item.code,
      qrCode: item.qrCode || item.code,
      locationRef: item.locationRef || shelfInfo || '-',
      departmentName: itemAny.shelf?.locker?.warehouse?.department?.name || 'ຝ່າຍບັນຊີ',
      shelfInfo,
    };
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleBatchAddToPrintCart = () => {
    const selectedFolders = data.filter((item) => selectedIds.includes(item.id));
    const itemsToAdd = selectedFolders.map(buildFolderPrintItem);
    addMultipleToPrintCart(itemsToAdd);
    messageApi.success(`ເພີ່ມ ${itemsToAdd.length} ແຟ້ມໃສ່ກະຕ່າພິມ Tag ແລ້ວ!`);
    setSelectedIds([]);
  };

  const handleBatchPrintNow = () => {
    const selectedFolders = data.filter((item) => selectedIds.includes(item.id));
    const itemsToAdd = selectedFolders.map(buildFolderPrintItem);
    addMultipleToPrintCart(itemsToAdd);
    setSelectedIds([]);
    setIsPrintCartDrawerOpen(true);
  };

  return (
    <section className="w-full flex flex-col gap-6 font-lao" aria-label="ຕາຕະລາງຂໍ້ມູນແຟ້ມ">
      {contextHolder}
      {messageContextHolder}

      <header className="flex flex-col gap-5 bg-white/40 backdrop-blur-xl p-5 rounded-3xl shadow-glass border border-white/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດແຟ້ມ..."
            value={searchName}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
            allowClear
            className="flex-1 min-w-70 max-w-125 rounded-3xl bg-white/70 border-white hover:bg-white focus-within:bg-white shadow-sm transition-all duration-300 focus-within:border-[#185C4D]/30 focus-within:shadow-md h-12"
          />

          <div className="flex items-center gap-3">
            {/* Tag Print Cart Header Trigger */}
            <Button
              onClick={() => setIsPrintCartDrawerOpen(true)}
              className={`h-12 px-5 rounded-2xl border font-bold flex items-center gap-2.5 transition-all duration-300 shadow-sm ${
                printCartItems.length > 0
                  ? 'bg-[#185C4D] text-white border-[#185C4D] hover:bg-[#0f3d31]! hover:text-white!'
                  : 'bg-white/70 border-white text-slate-700 hover:bg-white hover:border-[#185C4D]/30'
              }`}
            >
              <Printer size={18} className={printCartItems.length > 0 ? 'text-teal-200' : 'text-[#185C4D]'} />
              <span>ກະຕ່າພິມ Tag</span>
              {printCartItems.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white text-[#185C4D] text-xs font-black rounded-full shadow-xs">
                  {printCartItems.length}
                </span>
              )}
            </Button>

            <div className="flex items-center gap-3 text-[14px] font-medium bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white shadow-sm shrink-0 hover:bg-white transition-colors duration-300">
              <div className="flex items-center gap-2 text-slate-500">
                <FolderIcon size={16} className="text-[#185C4D]" />
                <span>ລາຍການແຟ້ມທັງໝົດ</span>
              </div>
              <div className="h-5 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#185C4D] leading-none">{total}</span>
                <span className="text-slate-500 text-[13px]">ແຟ້ມ</span>
              </div>
            </div>
          </div>
        </div>

        {!hideFilters && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#185C4D]/10 to-[#185C4D]/5 flex items-center justify-center shrink-0 border border-[#185C4D]/10">
                <SlidersHorizontal size={14} className="text-[#185C4D]" />
              </div>
              <span className="text-[14px] font-bold text-slate-700">ຕົວກອງຂໍ້ມູນ</span>
              <div className="h-px flex-1 bg-linear-to-r from-slate-200/80 via-slate-200/40 to-transparent ml-2"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <Select
                value={filterDepartment || 'all'}
                onChange={onFilterDepartmentChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ຝ່າຍ)' }, ...departmentOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
              />
              <Select
                value={filterDivision || 'all'}
                onChange={onFilterDivisionChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ພະແນກ)' }, ...divisionOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                disabled={divisionOptions.length === 0 && !!filterDepartment && filterDepartment !== 'all'}
              />
              <Select
                value={filterWarehouse || 'all'}
                onChange={onFilterWarehouseChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ສາງ)' }, ...warehouseOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                disabled={warehouseOptions.length === 0 && !!filterDivision && filterDivision !== 'all'}
              />
              <Select
                value={filterLocker || 'all'}
                onChange={onFilterLockerChange}
                options={[{ value: 'all', label: 'ທັງໝົດ (ຕູ້)' }, ...lockerOptions]}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                disabled={lockerOptions.length === 0 && !!filterWarehouse && filterWarehouse !== 'all'}
              />
              <Select
                value={filterShelf || 'all'}
                onChange={onFilterShelfChange}
                options={shelfOptions}
                size="large"
                className="w-full [&_.ant-select-selector]:rounded-2xl! shadow-xs [&_.ant-select-selector]:h-11! [&_.ant-select-selection-item]:leading-10.5! [&_.ant-select-selector]:bg-white/70! [&_.ant-select-selector]:border-white! hover:[&_.ant-select-selector]:border-[#185C4D]/30!"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onSearch={(val) => {
                  fetchShelfDropdown({
                    lockerId: filterLocker && filterLocker !== 'all' ? filterLocker : undefined,
                    warehouseId: filterWarehouse && filterWarehouse !== 'all' ? filterWarehouse : undefined,
                    search: val || undefined,
                  });
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Floating Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 bg-slate-900/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-500/30">
              {selectedIds.length}
            </span>
            <span className="font-bold text-sm">ແຟ້ມທີ່ເລືອກ</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleBatchAddToPrintCart}
              icon={<Printer size={16} />}
              className="rounded-xl h-10 bg-teal-600 hover:bg-teal-500 text-white border-none font-bold text-xs shadow-md"
            >
              ເພີ່ມໃສ່ກະຕ່າພິມ Tag ({selectedIds.length})
            </Button>
            <Button
              type="primary"
              onClick={handleBatchPrintNow}
              icon={<Sparkles size={16} />}
              className="rounded-xl h-10 bg-linear-to-r from-[#185C4D] to-[#25705a] hover:from-[#0f3d31] hover:to-[#185C4D] border-none font-bold text-xs shadow-md"
            >
              ພິມ Tag ທີ່ເລືອກທັນທີ
            </Button>
            <Button
              type="text"
              onClick={() => setSelectedIds([])}
              className="rounded-xl h-10 text-slate-400 hover:text-white hover:bg-white/10 font-medium text-xs"
            >
              ຍົກເລີກ
            </Button>
          </div>
        </div>
      )}

      <div className="w-full bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-3xl shadow-glass overflow-x-auto">
        <div className="min-w-260">
          {/* Table Header */}
          <div className="bg-table-header text-white grid grid-cols-12 gap-4 py-5 px-8 rounded-2xl shadow-md mb-5 text-[14px] font-bold tracking-wider uppercase items-center">
            <div className="col-span-1 flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="[&_.ant-checkbox-inner]:border-white/60 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-teal-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-teal-500"
              />
              <span>ເລືອກ</span>
            </div>
            <div className="col-span-2">ລະຫັດແຟ້ມ</div>
            <div className="col-span-3">ຊື່ແຟ້ມເກັບເອກະສານ</div>
            <div className="col-span-2 text-center">QR Code</div>
            <div className="col-span-3">ບ່ອນອ້າງອີງ / ສະຖານທີ່</div>
            <div className="col-span-1 text-center">ຈັດການ</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white/20 rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
                <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/20 rounded-2xl border border-dashed border-white/40">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shadow-soft">
                <FolderIcon className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-400 font-bold text-lg">ບໍ່ພົບຂໍ້ມູນແຟ້ມໃນລະບົບ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const inPrintCart = isInPrintCart(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group bg-white/50 backdrop-blur-lg border grid grid-cols-12 gap-4 items-center py-5 px-8 rounded-[22px] shadow-sm transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-glass cursor-pointer ${
                      isSelected
                        ? 'border-[#185C4D] bg-teal-50/40'
                        : 'border-white/80'
                    }`}
                    onClick={() => onManage?.(item)}
                  >
                    <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="[&_.ant-checkbox-inner]:border-slate-300 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[#185C4D] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[#185C4D]"
                      />
                    </div>

                    <div className="col-span-2">
                      <span className="inline-flex items-center font-mono font-bold text-[13px] text-slate-600 bg-white/60 border border-slate-200/50 px-3 py-1.5 rounded-xl shadow-sm">
                        {item.code}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500/10 to-amber-600/10 flex items-center justify-center shrink-0 border border-orange-200/30 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <FolderIcon className="text-orange-600 w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-bold text-slate-800 text-[15px] truncate">{item.name}</span>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-inner">
                        <QrCode className="w-4 h-4 text-[#185C4D]" strokeWidth={2.5} />
                        <span className="text-slate-700 text-[13px] font-mono font-bold">{item.qrCode}</span>
                      </div>
                    </div>

                    <div className="col-span-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 text-[14px] font-medium line-clamp-1 leading-relaxed italic">
                          {item.locationRef || '—'}
                        </span>
                        {(item as any).shelf && (
                          <div className="flex items-center flex-wrap text-xs text-slate-400 gap-1 mt-0.5">
                            {(item as any).shelf?.locker?.warehouse?.name && (
                              <span>
                                {(item as any).shelf.locker.warehouse.name}{' '}
                                <ChevronRight size={10} className="inline" />
                              </span>
                            )}
                            {(item as any).shelf?.locker?.name && (
                              <span>
                                ຕູ້ {(item as any).shelf.locker.name}{' '}
                                <ChevronRight size={10} className="inline" />
                              </span>
                            )}
                            {(item as any).shelf?.name && (
                              <span className="text-slate-600 font-semibold">
                                ຊັ້ນ {(item as any).shelf.name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Print Cart Quick Action Icon */}
                      <Tooltip title={inPrintCart ? 'ຢູ່ໃນກະຕ່າພິມ Tag ແລ້ວ (ກົດເພື່ອລຶບออก)' : 'ເພີ່ມໃສ່ກະຕ່າພິມ Tag'}>
                        <Button
                          type="text"
                          onClick={() => {
                            const added = togglePrintCart(buildFolderPrintItem(item));
                            if (added) {
                              messageApi.success('ເພີ່ມໃສ່ກະຕ່າພິມ Tag ແລ້ວ!');
                            } else {
                              messageApi.info('ລຶບອອກຈາກກະຕ່າພິມ Tag ແລ້ວ');
                            }
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            inPrintCart
                              ? 'bg-teal-500 text-white shadow-xs hover:bg-teal-600!'
                              : 'bg-white/80 text-slate-400 border border-slate-200/40 hover:text-teal-600 hover:bg-teal-50'
                          }`}
                          icon={<Printer size={17} />}
                        />
                      </Tooltip>

                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'manage',
                              icon: <ChevronRight size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ຈັດການເອກະສານ</span>,
                              onClick: () => onManage?.(item),
                            },
                            {
                              key: 'upload',
                              icon: <FileUp size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ອັບໂຫຼດເອກະສານ</span>,
                              onClick: () => onUploadDocument?.(item),
                            },
                            {
                              key: 'move',
                              icon: <ArrowRightLeft size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ຍ້າຍຊັ້ນວາງ</span>,
                              onClick: () => onMove?.(item),
                            },
                            {
                              key: 'borrow',
                              icon: <ShoppingCart size={18} className="text-purple-500" />,
                              label: isInBorrowCart(item.id) ? (
                                <span className="text-emerald-600 font-bold text-[15px]">ຢູ່ໃນກະຕ່າແລ້ວ ✓</span>
                              ) : (
                                <span className="text-purple-600 font-bold text-[15px]">ເພີ່ມໃສ່ກະຕ່າຢືມ</span>
                              ),
                              onClick: () =>
                                handleAddToCart({
                                  id: item.id,
                                  type: 'folder',
                                  name: item.name,
                                  code: item.code,
                                }),
                            },
                            {
                              key: 'printCart',
                              icon: <Printer size={18} className="text-teal-600" />,
                              label: inPrintCart ? (
                                <span className="text-teal-700 font-bold text-[15px]">ຢູ່ໃນກະຕ່າພິມ Tag ແລ້ວ ✓</span>
                              ) : (
                                <span className="text-teal-600 font-bold text-[15px]">ເພີ່ມໃສ່ກະຕ່າພິມ Tag</span>
                              ),
                              onClick: () => {
                                addToPrintCart(buildFolderPrintItem(item));
                                messageApi.success('ເພີ່ມໃສ່ກະຕ່າພິມ Tag ແລ້ວ!');
                              },
                            },
                            {
                              key: 'printSingle',
                              icon: <QrCode size={18} className="text-[#185C4D]" />,
                              label: <span className="text-[#185C4D] font-bold text-[15px]">ພິມ Tag ທັນທີ</span>,
                              onClick: () => {
                                addToPrintCart(buildFolderPrintItem(item));
                                setIsPrintCartDrawerOpen(true);
                              },
                            },
                            {
                              type: 'divider',
                              className: 'my-1.5 border-slate-100',
                            },
                            {
                              key: 'edit',
                              icon: <Edit2 size={18} className="text-blue-500" />,
                              label: <span className="text-slate-700 font-medium text-[14px]">ແກ້ໄຂຂໍ້ມູນ</span>,
                              onClick: () => onEdit(item),
                            },
                            {
                              key: 'delete',
                              icon: <Trash2 size={18} className="text-rose-500" />,
                              label: <span className="text-rose-500 font-medium text-[14px]">ລຶບຂໍ້ມູນ</span>,
                              onClick: () => onDelete?.(item.id),
                            },
                          ],
                          className:
                            'min-w-[200px] p-2 rounded-2xl border border-white/60 shadow-glass bg-white/80 backdrop-blur-xl',
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#185C4D]/5 transition-all duration-300 shadow-sm border border-slate-200/30 bg-white/80 hover:border-[#185C4D]/30 group/btn"
                          icon={
                            <MoreVertical
                              size={18}
                              className="text-slate-400 group-hover/btn:text-[#185C4D] transition-colors"
                            />
                          }
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
                pageSize={5}
                total={total}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tag Print Cart Drawer Component */}
      <FolderPrintCartDrawer
        isOpen={isPrintCartDrawerOpen}
        onClose={() => setIsPrintCartDrawerOpen(false)}
      />
    </section>
  );
}
