import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, App } from 'antd';
import { AlertCircle, Key, Edit, GitBranch, CheckCircle, Shield, UserCog } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useDivisionStore } from '@/store/useDivisionStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';

interface UserActionModalsProps {
  user: any | null;
  action: 'approve' | 'updateRole' | 'updateDivisions' | 'resetPassword' | null;
  onClose: () => void;
}

export default function UserActionModals({ user, action, onClose }: UserActionModalsProps) {
  const { message } = App.useApp();
  const { updateRole, approveUser, updateDivisions, resetPassword } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  // States for specific modals
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<number[]>([]);
  const departmentOptions = useDepartmentStore((state) => state.departmentDropdown);
  const fetchDepartments = useDepartmentStore((state) => state.fetchDropdown);
  const divisionOptions = useDivisionStore((state) => state.divisionDropdown);
  const fetchDivisions = useDivisionStore((state) => state.fetchDropdown);

  useEffect(() => {
    if (user) {
      if (action === 'updateRole' || action === 'approve') {
        setSelectedRole(user.role || 'USER');
      }
      if (action === 'updateDivisions' || action === 'approve') {
        setSelectedDivisions(user.divisions?.map((d: any) => d.id) || []);
        const deptId = user.departmentData?.id || user.department || null;
        setSelectedDepartment(deptId);
        fetchDepartments();
      }
    }
  }, [user, action, fetchDepartments]);

  useEffect(() => {
    if (action === 'updateDivisions' || action === 'approve') {
      if (selectedDepartment) {
        fetchDivisions({ departmentId: selectedDepartment });
      } else {
        fetchDivisions();
      }
    }
  }, [selectedDepartment, action, fetchDivisions]);

  const handleDepartmentChange = (val: number) => {
    setSelectedDepartment(val);
    setSelectedDivisions([]);
  };

  if (!user) return null;

  const fullName = `${user.firstNameLa} ${user.lastNameLa}`;

  const handleApprove = async () => {
    setLoading(true);
    const success = await approveUser(user.id, { 
      role: selectedRole || 'USER', 
      divisionIds: selectedDivisions
    });
    setLoading(false);
    if (success) {
      message.success('ອະນຸມັດຜູ້ໃຊ້ສຳເລັດແລ້ວ');
      onClose();
    } else {
      message.error('ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ໄດ້');
    }
  };

  const handleUpdateRole = async () => {
    setLoading(true);
    const success = await updateRole(user.id, selectedRole);
    setLoading(false);
    if (success) {
      message.success('ປ່ຽນສິດທິສຳເລັດແລ້ວ');
      onClose();
    } else {
      message.error('ບໍ່ສາມາດປ່ຽນສິດທິໄດ້');
    }
  };

  const handleUpdateDivisions = async () => {
    setLoading(true);
    const success = await updateDivisions(user.id, selectedDivisions);
    setLoading(false);
    if (success) {
      message.success('ອັບເດດສິດເຂົ້າເຖິງສຳເລັດແລ້ວ');
      onClose();
    } else {
      message.error('ອັບເດດສິດເຂົ້າເຖິງບໍ່ສຳເລັດ');
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    const success = await resetPassword(user.id);
    setLoading(false);
    if (success) {
      message.success('ຣີເຊັດລະຫັດຜ່ານສຳເລັດແລ້ວ');
      onClose();
    } else {
      message.error('ຣີເຊັດລະຫັດຜ່ານບໍ່ສຳເລັດ');
    }
  };

  return (
    <>
      {/* Approve Modal */}
      <Modal
        open={action === 'approve'}
        onCancel={onClose}
        footer={null}
        width={480}
        centered
        className="font-lao"
        mask={{ closable: true }}
      >
        <div className="flex flex-col items-center text-center pt-4 pb-2">
          <div className="w-16 h-16 bg-[#E1F2E8] text-[#1A7A44] rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ຢືນຢັນອະນຸມັດຜູ້ໃຊ້?</h2>
          <p className="text-slate-500 mb-6">
            ທ່ານຕ້ອງການອະນຸມັດໃຫ້ <span className="font-bold text-slate-700">{fullName}</span> ເຂົ້າສູ່ລະບົບແທ້ຫຼືບໍ່?
          </p>

          <div className="w-full flex flex-col gap-4 text-left mb-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-700">ກຳນົດສິດທິ:</label>
              <Select
                className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[44px]! [&_.ant-select-selection-item]:leading-[42px]!"
                value={selectedRole}
                onChange={setSelectedRole}
                options={[
                  { value: 'SUPER_ADMIN', label: <div className="flex items-center gap-2"><Shield size={14} className="text-[#B83131]"/> Super Admin</div> },
                  { value: 'HQ_ADMIN', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#3B82F6]"/> HQ Admin</div> },
                  { value: 'BRANCH_ADMIN', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#10B981]"/> Branch Admin</div> },
                  { value: 'USER', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#737373]"/> User</div> },
                ]}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-700">ກຳນົດຝ່າຍ (Department):</label>
              <Select
                className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[44px]! [&_.ant-select-selection-item]:leading-[42px]!"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                options={departmentOptions.map(opt => ({ value: opt.id as number, label: opt.name }))}
                placeholder="ເລືອກຝ່າຍ..."
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-700">ກຳນົດພະແນກ/ສາຂາ (Division):</label>
              <Select
                mode="multiple"
                className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:min-h-[44px]!"
                value={selectedDivisions}
                onChange={setSelectedDivisions}
                options={divisionOptions.map(opt => ({ value: opt.id as number, label: opt.name }))}
                placeholder="ຄົ້ນຫາ ແລະ ເລືອກພະແນກ/ສາຂາ..."
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                disabled={!selectedDepartment}
              />
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button className="flex-1 h-11 rounded-xl text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="primary" className="flex-1 h-11 rounded-xl bg-[#1A7A44] hover:bg-[#125a31] border-none" onClick={handleApprove} loading={loading}>
              ຢືນຢັນອະນຸມັດ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Role Modal */}
      <Modal
        open={action === 'updateRole'}
        onCancel={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-[#185C4D]">
            <Edit size={20} />
            <span>ປ່ຽນສິດທິຜູ້ໃຊ້</span>
          </div>
        }
        footer={null}
        width={480}
        centered
        className="font-lao"
        mask={{ closable: true }}
      >
        <div className="py-4">
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#185C4D] font-bold shadow-sm border border-slate-100">
              {user.firstNameLa?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-0.5">ຜູ້ໃຊ້</p>
              <p className="font-bold text-slate-800">{fullName}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mb-8">
            <label className="font-medium text-slate-700">ເລືອກສິດທິໃໝ່:</label>
            <Select
              className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[44px]! [&_.ant-select-selection-item]:leading-[42px]!"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { value: 'SUPER_ADMIN', label: <div className="flex items-center gap-2"><Shield size={14} className="text-[#B83131]"/> Super Admin</div> },
                { value: 'HQ_ADMIN', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#3B82F6]"/> HQ Admin</div> },
                { value: 'BRANCH_ADMIN', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#10B981]"/> Branch Admin</div> },
                { value: 'USER', label: <div className="flex items-center gap-2"><UserCog size={14} className="text-[#737373]"/> User</div> },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button className="h-10 px-6 rounded-xl text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="primary" className="h-10 px-6 rounded-xl bg-[#185C4D] hover:bg-[#114237] border-none shadow-soft" onClick={handleUpdateRole} loading={loading}>
              ບັນທຶກການປ່ຽນແປງ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Divisions Modal */}
      <Modal
        open={action === 'updateDivisions'}
        onCancel={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-[#3B82F6]">
            <GitBranch size={20} />
            <span>ສິດເຂົ້າເຖິງ ພະແນກ/ສາຂາ</span>
          </div>
        }
        footer={null}
        width={500}
        centered
        className="font-lao"
        mask={{ closable: true }}
      >
        <div className="py-4">
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-100">
              {user.firstNameLa?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm text-blue-600/70 mb-0.5">ຜູ້ໃຊ້</p>
              <p className="font-bold text-slate-800">{fullName}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-700">ເລືອກຝ່າຍ (Department):</label>
              <Select
                className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-[44px]! [&_.ant-select-selection-item]:leading-[42px]!"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                options={departmentOptions.map(opt => ({ value: opt.id as number, label: opt.name }))}
                placeholder="ເລືອກຝ່າຍ..."
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-700">ເລືອກພະແນກ/ສາຂາ ທີ່ສາມາດເຂົ້າເຖິງໄດ້ (Division):</label>
              <Select
                mode="multiple"
                className="w-full [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:min-h-[44px]!"
                value={selectedDivisions}
                onChange={setSelectedDivisions}
                options={divisionOptions.map(opt => ({ value: opt.id as number, label: opt.name }))}
                placeholder="ຄົ້ນຫາ ແລະ ເລືອກພະແນກ/ສາຂາ..."
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                disabled={!selectedDepartment}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button className="h-10 px-6 rounded-xl text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="primary" className="h-10 px-6 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] border-none shadow-soft" onClick={handleUpdateDivisions} loading={loading}>
              ບັນທຶກສິດເຂົ້າເຖິງ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={action === 'resetPassword'}
        onCancel={onClose}
        footer={null}
        width={400}
        centered
        className="font-lao"
        mask={{ closable: true }}
      >
        <div className="flex flex-col items-center text-center pt-4 pb-2">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-100">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ຢືນຢັນການຣີເຊັດລະຫັດຜ່ານ?</h2>
          <p className="text-slate-500 mb-6">
            ທ່ານຕ້ອງການຣີເຊັດລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ <span className="font-bold text-slate-700">{fullName}</span> ເປັນ <span className="font-bold text-green-700">EDL1234</span> ແທ້ຫຼືບໍ່?
          </p>
          <div className="flex gap-3 w-full">
            <Button className="flex-1 h-11 rounded-xl text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button type="primary" danger className="flex-1 h-11 rounded-xl font-medium shadow-soft" onClick={handleResetPassword} loading={loading}>
              ຢືນຢັນຣີເຊັດ
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
