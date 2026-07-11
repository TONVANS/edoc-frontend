"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Badge, Dropdown, App } from 'antd';
import { Search, Filter, Plus, Users, Shield, UserCog, MoreVertical, Key, AlertCircle, CheckCircle, Edit, GitBranch } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useUserStore } from '@/store/useUserStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import CreateUserModal from './CreateUserModal';

export default function UserListView() {
  const { modal, message } = App.useApp();
  const { users, fetchUsers, resetPassword, updateRole, approveUser, updateDivisions, isLoading } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">User Management</h1>
          <p className="text-[#737373] text-sm mt-1">Manage system users, roles, and employee statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="primary" 
            icon={<Plus size={16} />} 
            className="shadow-soft hover:-translate-y-0.5 transition-transform"
            onClick={() => setIsCreateModalVisible(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-wrap gap-4 items-center">
        <Input 
          placeholder="Search by Name, Emp ID..." 
          prefix={<Search size={16} className="text-[#737373]" />}
          className="max-w-xs rounded-xl bg-white/70 hover:bg-white focus:bg-white border-white/80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          placeholder="Role" 
          value={roleFilter}
          onChange={setRoleFilter}
          className="w-40 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
            { value: 'HQ_ADMIN', label: 'HQ Admin' },
            { value: 'BRANCH_ADMIN', label: 'Branch Admin' },
            { value: 'USER', label: 'User' },
          ]}
        />
        <Select 
          placeholder="Status" 
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-32 [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[40px]! [&_.ant-select-selection-item]:leading-[38px]!"
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'SUSPENDED', label: 'Suspended' },
          ]}
        />
      </div>

      {/* Layer 1 Glass Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="bg-table-header text-white grid grid-cols-12 gap-4 py-4 px-6 rounded-2xl shadow-sm mb-4 text-sm font-medium tracking-wide">
            <div className="col-span-3">Employee Name</div>
            <div className="col-span-2">Emp ID</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          
          {/* Rows Layer 2 Glass */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)]">
              <span className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {users.filter(u => {
                const searchStr = searchTerm.toLowerCase();
                const matchesSearch = (u.firstNameLa + ' ' + u.lastNameLa).toLowerCase().includes(searchStr) || 
                                      (u.empCode || '').toLowerCase().includes(searchStr);
                const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
                const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter || (statusFilter === 'ACTIVE' && u.status === 'A') || (statusFilter === 'INACTIVE' && u.status === 'I');
                
                return matchesSearch && matchesRole && matchesStatus;
              }).map(user => {
                const fullName = `${user.firstNameLa} ${user.lastNameLa}`;
                const isActive = user.status === 'ACTIVE' || user.status === 'A';
                return (
                  <div 
                    key={user.id} 
                    className={`bg-white/60 backdrop-blur-lg border border-white/80 grid grid-cols-12 gap-4 items-center py-4 px-6 rounded-2xl shadow-sm transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-sm cursor-pointer ${!isActive ? 'opacity-60' : ''}`}
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
                      <StatusBadge status={isActive ? 'success' : 'danger'}>
                        {isActive ? 'ACTIVE' : user.status}
                      </StatusBadge>
                    </div>
                    <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        menu={{
                          items: [
                            !isActive ? {
                              key: 'approve',
                              icon: <CheckCircle size={16} className="text-[#1A7A44]" />,
                              label: <span className="font-medium text-[#1A7A44]">ອະນຸມັດຜູ້ໃຊ້</span>,
                              onClick: () => {
                                modal.confirm({
                                  title: 'ຢືນຢັນອະນຸມັດຜູ້ໃຊ້?',
                                  content: `ທ່ານຕ້ອງການອະນຸມັດຜູ້ໃຊ້ ${fullName} ເຂົ້າສູ່ລະບົບແທ້ຫຼືບໍ່?`,
                                  okText: 'ຢືນຢັນ',
                                  cancelText: 'ຍົກເລີກ',
                                  onOk: async () => {
                                    const success = await approveUser(user.id, { role: 'USER' });
                                    if (success) message.success('ອະນຸມັດຜູ້ໃຊ້ສຳເລັດແລ້ວ');
                                    else message.error('ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ໄດ້');
                                  }
                                });
                              }
                            } : null,
                            {
                              key: 'update-role',
                              icon: <Edit size={16} className="text-[#185C4D]" />,
                              label: <span className="font-medium text-[#185C4D]">ປ່ຽນສິດທິຜູ້ໃຊ້</span>,
                              onClick: () => {
                                const infoModal = modal.info({
                                  title: 'ປ່ຽນສິດທິຜູ້ໃຊ້ (Role)',
                                  content: (
                                    <div className="mt-4">
                                      <p className="mb-2">ເລືອກສິດທິໃໝ່ສຳລັບ {fullName}:</p>
                                      <Select
                                        className="w-full"
                                        defaultValue={user.role}
                                        options={[
                                          { value: 'SUPER_ADMIN', label: 'Super Admin' },
                                          { value: 'HQ_ADMIN', label: 'HQ Admin' },
                                          { value: 'BRANCH_ADMIN', label: 'Branch Admin' },
                                          { value: 'USER', label: 'User' },
                                        ]}
                                        onChange={async (val) => {
                                          infoModal.destroy();
                                          const success = await updateRole(user.id, val);
                                          if (success) message.success('ປ່ຽນສິດທິສຳເລັດແລ້ວ');
                                          else message.error('ບໍ່ສາມາດປ່ຽນສິດທິໄດ້');
                                        }}
                                      />
                                    </div>
                                  ),
                                  footer: null,
                                  closable: true,
                                });
                              }
                            },
                            {
                              key: 'update-divisions',
                              icon: <GitBranch size={16} className="text-[#3B82F6]" />,
                              label: <span className="font-medium text-[#3B82F6]">ສິດເຂົ້າເຖິງ ພະແນກ/ສາຂາ</span>,
                              onClick: async () => {
                                await useDivisionStore.getState().fetchDropdown();
                                const options = useDivisionStore.getState().divisionDropdown;
                                let selectedDivisions = user.divisions?.map(d => d.id) || [];
                                
                                modal.confirm({
                                  title: 'ສິດເຂົ້າເຖິງ ພະແນກ/ສາຂາ',
                                  content: (
                                    <div className="mt-4">
                                      <p className="mb-2">ເລືອກພະແນກ/ສາຂາ ສຳລັບ {fullName}:</p>
                                      <Select
                                        mode="multiple"
                                        className="w-full"
                                        defaultValue={selectedDivisions}
                                        options={options.map(opt => ({ value: opt.id as number, label: opt.name }))}
                                        onChange={(vals) => {
                                          selectedDivisions = vals;
                                        }}
                                        placeholder="ເລືອກພະແນກ/ສາຂາ"
                                        filterOption={(input, option) =>
                                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                      />
                                    </div>
                                  ),
                                  okText: 'ບັນທຶກ',
                                  cancelText: 'ຍົກເລີກ',
                                  onOk: async () => {
                                    const success = await updateDivisions(user.id, selectedDivisions);
                                    if (success) message.success('ອັບເດດສິດເຂົ້າເຖິງສຳເລັດແລ້ວ');
                                    else message.error('ອັບເດດສິດເຂົ້າເຖິງບໍ່ສຳເລັດ');
                                  },
                                });
                              }
                            },
                            {
                              key: 'reset-password',
                              icon: <Key size={16} className="text-[#9B7016]" />,
                              label: <span className="font-medium text-[#9B7016]">ຣີເຊັດລະຫັດຜ່ານ</span>,
                              onClick: () => {
                                modal.confirm({
                                  title: 'ຢືນຢັນການຣີເຊັດລະຫັດຜ່ານ?',
                                  icon: <AlertCircle className="text-amber-500" />,
                                  content: `ທ່ານຕ້ອງການຣີເຊັດລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ ${fullName} ແທ້ຫຼືບໍ່?`,
                                  okText: 'ຢືນຢັນ',
                                  okType: 'danger',
                                  cancelText: 'ຍົກເລີກ',
                                  onOk: async () => {
                                    const success = await resetPassword(user.id);
                                    if (success) message.success('ຣີເຊັດລະຫັດຜ່ານສຳເລັດແລ້ວ');
                                    else message.error('ຣີເຊັດລະຫັດຜ່ານບໍ່ສຳເລັດ');
                                  }
                                });
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

      <CreateUserModal 
        open={isCreateModalVisible} 
        onClose={() => setIsCreateModalVisible(false)} 
      />
    </div>
  );
}
