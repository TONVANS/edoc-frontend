"use client";
import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserCircle, Mail, Phone, Building2, MapPin, GitBranch, Briefcase, Shield, Key, CheckCircle, XCircle } from 'lucide-react';
import { Button } from 'antd';
import ChangePasswordModal from '@/components/views/profile/ChangePasswordModal';

export default function ProfileView() {
  const { user } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">ຂໍ້ມູນສ່ວນຕົວ</h1>
          <p className="text-[#737373] text-sm mt-1">ລາຍລະອຽດບັນຊີ ແລະ ການຕັ້ງຄ່າຄວາມປອດໄພ.</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] relative overflow-hidden">
        {/* Background Decorative element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-linear-to-br from-[#185C4D]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 min-w-[200px]">
            <div className="w-32 h-32 rounded-[32px] bg-linear-to-br from-[#185C4D] to-[#114236] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-[#185C4D]/20">
              {user.firstNameLa?.charAt(0)}{user.lastNameLa?.charAt(0)}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-[#1C1C1E]">{user.firstNameLa} {user.lastNameLa}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#185C4D]/10 text-[#185C4D] rounded-xl text-xs font-bold mt-2">
                <Shield size={12} />
                {user.role}
              </div>
            </div>
            <Button 
              type="primary"
              icon={<Key size={16} />}
              onClick={() => setIsPasswordModalOpen(true)}
              className="mt-2 h-10 px-6 rounded-xl bg-slate-800 hover:bg-slate-900 border-none shadow-md font-medium"
            >
              ປ່ຽນລະຫັດຜ່ານ
            </Button>
          </div>

          {/* Info Section */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><UserCircle size={14}/> ລະຫັດພະນັກງານ</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{user.empCode || '—'}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><UserCircle size={14}/> ເພດ</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{user.gender || '—'}</p>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2 pt-2 pb-2">
              <div className="h-px w-full bg-slate-200/50" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14}/> ສາຂາ (Branch)</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{/* user.branch?.name || */ '—'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><Building2 size={14}/> ຝ່າຍ (Department)</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{user.departmentData?.name || '—'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><GitBranch size={14}/> ພະແນກຍ່ອຍ (Division)</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{user.divisions?.[0]?.name || '—'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={14}/> ໜ່ວຍງານ (Unit)</span>
              <p className="text-[#1C1C1E] font-medium text-[15px]">{user.unitData?.name || '—'}</p>
            </div>
            
            <div className="flex flex-col gap-1 sm:col-span-2 pt-2 pb-2">
              <div className="h-px w-full bg-slate-200/50" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider flex items-center gap-1.5"><Shield size={14}/> ສະຖານະ</span>
              <div className="flex items-center gap-2 mt-1">
                {user.status === 'ACTIVE' || user.status === 'A' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                    <CheckCircle size={14} /> ເປີດນຳໃຊ້
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold border border-rose-100">
                    <XCircle size={14} /> ຖືກລະງັບ
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}
