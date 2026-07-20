"use client";
import { useState, useEffect } from 'react';
import { Button, Input, Select, Dropdown, Pagination } from 'antd';
import { Search, Plus, Shield, UserCog, MoreVertical, Key, CheckCircle, Edit, GitBranch, Eye } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import CreateUserModal from './CreateUserModal';
import UserDetailModal from './UserDetailModal';
import UserActionModals from './UserActionModals';

export default function UserListView() {
  const { users, total, fetchUsers, isLoading } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'updateRole' | 'updateDivisions' | 'resetPassword' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers({
      page,
      limit,
      status: statusFilter,
      search: debouncedSearch
    });
  }, [fetchUsers, page, limit, statusFilter, debouncedSearch]);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">ຄຸ້ມຄອງຜູ້ໃຊ້</h1>
          <p className="text-[#737373] text-sm mt-1">ຄຸ້ມຄອງຂໍ້ມູນຜູ້ໃຊ້, ສິດທິການນຳໃຊ້ ແລະ ສະຖານະ.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="primary" 
            icon={<Plus size={16} />} 
            className="shadow-soft hover:-translate-y-0.5 transition-transform"
            onClick={() => setIsCreateModalVisible(true)}
          >
            ເພີ່ມຜູ້ໃຊ້
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-lg border border-white/60 p-4 rounded-2xl shadow-soft flex flex-wrap gap-4 items-center">
        <Input 
          placeholder="ຄົ້ນຫາດ້ວຍຊື່, ລະຫັດພະນັກງານ..." 
          prefix={<Search size={16} className="text-[#737373]" />}
          className="max-w-xs rounded-xl bg-white/70 hover:bg-white focus:bg-white border-white/80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          placeholder="ສິດທິ" 
          value={roleFilter}
          onChange={setRoleFilter}
          className="w-40 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          options={[
            { value: 'ALL', label: 'ສິດທິທັງໝົດ' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
            { value: 'HQ_ADMIN', label: 'HQ Admin' },
            { value: 'BRANCH_ADMIN', label: 'Branch Admin' },
            { value: 'USER', label: 'User' },
          ]}
        />
        <Select 
          placeholder="ສະຖານະ" 
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
          className="w-32 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          options={[
            { value: 'ALL', label: 'ສະຖານະທັງໝົດ' },
            { value: 'A', label: 'ນຳໃຊ້ງານ' },
            { value: 'P', label: 'ລໍຖ້າອະນຸມັດ' },
          ]}
        />
      </div>

      {/* Layer 1 Glass Container */}
      <div className="w-full bg-[rgba(255,255,255,0.7)] backdrop-blur-lg border border-white/60 p-6 rounded-2xl shadow-soft overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="bg-linear-to-r from-[#185C4D] to-[#398270] text-white grid grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-3">ຊື່ພະນັກງານ</div>
            <div className="col-span-2">ລະຫັດພະນັກງານ</div>
            <div className="col-span-3">ພະແນກ / ຝ່າຍ</div>
            <div className="col-span-2">ສິດທິ</div>
            <div className="col-span-1 text-center">ສະຖານະ</div>
            <div className="col-span-1 text-right">ຈັດການ</div>
          </div>
          
          {/* Rows Layer 2 Glass */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-[rgba(255,255,255,0.7)] backdrop-blur-lg border border-white/50 rounded-2xl shadow-soft">
              <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {users.filter(u => {
                const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
                return matchesRole;
              }).map(user => {
                const fullName = `${user.firstNameLa} ${user.lastNameLa}`;
                const isActive = user.status === 'A';
                const isPending = user.status === 'P';
                return (
                  <div 
                    key={user.id} 
                    className={`bg-white border-0 grid grid-cols-12 gap-4 items-center py-4 px-6 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isPending ? 'opacity-60' : ''}`}
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#185C4D] font-bold shadow-sm">
                        {user.firstNameLa?.charAt(0) || 'U'}
                      </div>
                      <span className="font-semibold text-[#1C1C1E] truncate">{fullName}</span>
                    </div>
                    <div className="col-span-2 text-[#737373] font-medium">{user.empCode}</div>
                    <div className="col-span-3 flex flex-col">
                      <span className="text-sm text-[#1C1C1E]">{user.departmentData?.name || '—'}</span>
                      <span className="text-xs text-[#737373]">{user.divisions?.[0]?.name || '—'}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      {user.role === 'SUPER_ADMIN' ? <Shield size={14} className="text-[#B83131]" /> : <UserCog size={14} className="text-[#737373]" />}
                      <span className="text-sm font-medium text-[#1C1C1E]">{user.role}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <div 
                        style={{ 
                          backgroundColor: isActive ? '#E1F2E8' : isPending ? '#FFF3CD' : '#FCE4E4', 
                          color: isActive ? '#1A7A44' : isPending ? '#856404' : '#B83131', 
                          borderColor: isActive ? '#BEE4CE' : isPending ? '#FFEEBA' : '#F8CACA',
                          borderRadius: '6px' 
                        }} 
                        className="px-2 py-1 text-xs font-medium border inline-block"
                      >
                        {isActive ? 'ນຳໃຊ້ງານ' : isPending ? 'ລໍຖ້າອະນຸມັດ' : 'ບໍ່ໄດ້ນຳໃຊ້'}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end font-lao" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'detail',
                              icon: <Eye size={16} className="text-indigo-500" />,
                              label: <span className="font-medium text-indigo-500">ລາຍລະອຽດ</span>,
                              onClick: () => {
                                setSelectedUser(user);
                                setIsDetailModalVisible(true);
                              }
                            },
                            isPending ? {
                              key: 'approve',
                              icon: <CheckCircle size={16} className="text-[#1A7A44]" />,
                              label: <span className="font-medium text-[#1A7A44]">ອະນຸມັດຜູ້ໃຊ້</span>,
                              onClick: () => {
                                setSelectedUser(user);
                                setModalAction('approve');
                              }
                            } : null,
                            {
                              key: 'update-role',
                              icon: <Edit size={16} className="text-[#185C4D]" />,
                              label: <span className="font-medium text-[#185C4D]">ປ່ຽນສິດທິຜູ້ໃຊ້</span>,
                              onClick: () => {
                                setSelectedUser(user);
                                setModalAction('updateRole');
                              }
                            },
                            {
                              key: 'update-divisions',
                              icon: <GitBranch size={16} className="text-[#3B82F6]" />,
                              label: <span className="font-medium text-[#3B82F6] font-lao">ສິດເຂົ້າເຖິງ ພະແນກ/ສາຂາ</span>,
                              onClick: () => {
                                setSelectedUser(user);
                                setModalAction('updateDivisions');
                              }
                            },
                            {
                              key: 'reset-password',
                              icon: <Key size={16} className="text-[#9B7016]" />,
                              label: <span className="font-medium text-[#9B7016]">ຣີເຊັດລະຫັດຜ່ານ</span>,
                              onClick: () => {
                                setSelectedUser(user);
                                setModalAction('resetPassword');
                              }
                            }
                          ].filter(Boolean) as any[]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button type="text" icon={<MoreVertical size={18} className="text-slate-400" />} className="hover:bg-slate-100 rounded-lg" />
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            }}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
          />
        </div>
      )}

      <CreateUserModal 
        open={isCreateModalVisible} 
        onClose={() => setIsCreateModalVisible(false)} 
      />
      <UserDetailModal
        user={selectedUser}
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
      />
      <UserActionModals
        user={selectedUser}
        action={modalAction}
        onClose={() => setModalAction(null)}
      />
    </div>
  );
}
