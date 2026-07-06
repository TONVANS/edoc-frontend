// src/components/auth/RegisterForm.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import LoginInputField from './LoginInputField';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [empCode, setEmpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShow] = useState(false);
  const [errors, setErrors] = useState({ empCode: '', password: '', confirmPassword: '' });

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let isValid = true;
    const newErrors = { empCode: '', password: '', confirmPassword: '' };

    if (!empCode.trim()) {
      newErrors.empCode = 'ກະລຸນາປ້ອນລະຫັດພະນັກງານ (Employee Code)';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'ກະລຸນາປ້ອນລະຫັດຜ່ານ (Password)';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'ກະລຸນາຍືນຍັນລະຫັດຜ່ານ (Confirm Password)';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'ລະຫັດຜ່ານບໍ່ກົງກັນ';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsLoading(true);
      try {
        await api.post('/auth/register', { empCode, password });
        toast.success('ລົງທະບຽນສຳເລັດ', {
          description: 'ກະລຸນາລໍຖ້າຜູ້ດູແລລະບົບອະນຸມັດບັນຊີຂອງທ່ານ.',
        });
        router.push('/login');
      } catch (error: any) {
        const backendMessage = error.response?.data?.message;
        const errorMessage = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'ລົງທະບຽນບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.';
        toast.error('ລົງທະບຽນບໍ່ສຳເລັດ', {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col p-6 sm:p-8 md:p-12 h-full justify-center bg-white/10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="ml-auto bg-white/60 backdrop-blur-lg border border-white/80 rounded-xl px-4 py-2 shadow-sm">
          <Link href="/login" className="text-xs font-bold tracking-widest text-slate-600 uppercase hover:text-[#185C4D] transition-colors">
            Login
          </Link>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8 tracking-tight text-center sm:text-left">
        Create an Account
      </h2>

      {/* Fields */}
      <form className="flex flex-col gap-5" onSubmit={handleRegister}>
        <LoginInputField
          id="empCode"
          label="ລະຫັດພະນັກງານ"
          type="text"
          placeholder="ປ້ອນລະຫັດພະນັກງານ"
          value={empCode}
          onChange={(v) => {
            setEmpCode(v);
            setErrors(prev => ({ ...prev, empCode: '' }));
          }}
          error={errors.empCode}
        />

        <LoginInputField
          id="password"
          label="ລະຫັດຜ່ານ"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors(prev => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          suffix={
            <button
              type="button"
              onClick={() => setShow(!showPassword)}
              className="hover:text-[#185C4D] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <LoginInputField
          id="confirmPassword"
          label="ຢືນຢັນລະຫັດຜ່ານ"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3.5 rounded-xl bg-linear-to-r from-[#185C4D] to-[#30836B] text-white font-bold text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(24,92,77,0.35)] hover:shadow-[0_6px_28px_rgba(24,92,77,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(24,92,77,0.35)]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Registering...
            </span>
          ) : 'Register'}
        </button>
      </form>
    </div>
  );
}
