import React from 'react';
import { Modal, Button } from 'antd';
import { User as UserIcon, Mail, Building2, GitBranch, Users } from 'lucide-react';
import { User } from '@/types/auth'; // Adjust the import path if necessary

interface UserDetailModalProps {
  user: any | null; // Using any or specific type if needed
  open: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ user, open, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const fullName = `${user.firstNameLa} ${user.lastNameLa}`;
  const isActive = user.status === 'ACTIVE' || user.status === 'A';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      width={700}
      mask={{ closable: true }}
      cancelButtonProps={{ style: { display: 'none' } }}
      okText="ປິດ"
      className="custom-modal-padding"
      centered
    >
      <div className="flex flex-col gap-5 mt-2 font-lao">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-100 to-emerald-100 text-[#185C4D] flex items-center justify-center text-2xl font-extrabold shadow-sm ring-4 ring-white">
            {user.firstNameLa?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 m-0 leading-none mb-2">{fullName}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><UserIcon size={14} className="text-slate-400" /> {user.empCode || 'ບໍ່ມີຂໍ້ມູນ'}</span>
              {user.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {user.email}</span>}
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm tracking-wide">
              {user.role}
            </div>
            <div 
              style={{ backgroundColor: isActive ? '#E1F2E8' : '#FCE4E4', color: isActive ? '#1A7A44' : '#B83131', borderColor: isActive ? '#BEE4CE' : '#F8CACA', borderRadius: '6px' }}
              className="px-3 py-1 border text-xs font-bold shadow-sm tracking-wide"
            >
              {isActive ? 'ນຳໃຊ້ງານ' : 'ບໍ່ໄດ້ນຳໃຊ້'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {user.departmentData && (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm transition-all hover:shadow-md hover:bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3 pb-2 border-b border-indigo-100/50">
                <Building2 size={18} /> ສັງກັດ ຝ່າຍ
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-700 w-1/3">ຊື່:</span> 
                  <span className="text-right w-2/3">{user.departmentData.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-700 w-1/3">ລະຫັດ:</span> 
                  <span className="text-right w-2/3 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{user.departmentData.code}</span>
                </div>
                {user.departmentData.phone && (
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-700 w-1/3">ເບີໂທ:</span> 
                    <span className="text-right w-2/3">{user.departmentData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {user.unitData && (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm transition-all hover:shadow-md hover:bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-3 pb-2 border-b border-emerald-100/50">
                  <GitBranch size={18} /> ໜ່ວຍງານ
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">{user.unitData.name}</p>
                  <p className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md inline-block shadow-sm">{user.unitData.type}</p>
                </div>
              </div>
            )}
            
            {user.divisions && user.divisions.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm transition-all hover:shadow-md hover:bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                <div className="flex items-center gap-2 text-blue-600 font-bold mb-3 pb-2 border-b border-blue-100/50">
                  <Users size={18} /> ພະແນກ
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.divisions.map((div: any) => (
                    <span key={div.id} className="px-2.5 py-1 bg-white text-blue-700 text-xs rounded-lg border border-blue-200 shadow-sm font-medium flex items-center gap-1.5">
                      {div.name} {div.isPrimary && <span className="text-amber-500 font-bold">(ຫຼັກ)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
