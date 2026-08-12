// src/components/auth/LoginForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import LoginInputField from './LoginInputField';

const formContainerVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const formFieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sanitize callbackUrl to prevent open redirects (must start with / and not //)
  const rawCallbackUrl = searchParams.get('callbackUrl');
  let callbackUrl = (rawCallbackUrl && rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//'))
    ? rawCallbackUrl
    : '/dashboard';

  if (callbackUrl.startsWith('/login')) {
    callbackUrl = '/dashboard';
  }

  const { login, isLoading, isAuthenticated, initialize } = useAuthStore();

  const [empCode, setEmpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShow] = useState(false);
  const [saveUser, setSaveUser] = useState(false);
  const [errors, setErrors] = useState({ empCode: '', password: '' });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
      router.replace(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let isValid = true;
    const newErrors = { empCode: '', password: '' };

    if (!empCode.trim()) {
      newErrors.empCode = 'ກະລຸນາປ້ອນລະຫັດພະນັກງານ (Employee Code)';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'ກະລຸນາປ້ອນລະຫັດຜ່ານ (Password)';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        await login(empCode, password);
        toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ', {
          description: 'ກຳລັງນຳທາງໄປໜ້າຫຼັກ...',
        });
        router.refresh();
        router.replace(callbackUrl);
      } catch (error: any) {
        const backendMessage = error.response?.data?.message;
        const errorMessage = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'ID ຫຼື ລະຫັດບໍ່ຖືກຕ້ອງ ກະລຸນາກວດສອບລະຫັດອີກຄັ້ງ.';
        toast.error('ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ', {
          description: errorMessage,
        });
      }
    }
  };

  return (
    <motion.div
      variants={formContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col p-6 sm:p-8 md:p-12 h-full justify-center bg-white/10"
    >
      {/* Top bar */}
      <motion.div variants={formFieldVariants} className="flex items-center justify-between mb-8">
        <div className="ml-auto bg-white/60 backdrop-blur-lg border border-white/80 rounded-xl px-4 py-2 shadow-sm transition-transform duration-200 hover:scale-105">
          <Link href="/register" className="text-xs font-bold tracking-widest text-slate-600 uppercase hover:text-[#185C4D] transition-colors">
            Register
          </Link>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={formFieldVariants}
        className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8 tracking-tight text-center sm:text-left"
      >
        Welcome Back
      </motion.h2>

      {/* Fields */}
      <form className="flex flex-col gap-5 font-lao" onSubmit={handleLogin}>
        <motion.div variants={formFieldVariants}>
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
        </motion.div>

        <motion.div variants={formFieldVariants}>
          <LoginInputField
            id="password"
            label="Password"
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
                className="hover:text-[#185C4D] transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </motion.div>

        {/* Save + Forgot */}
        <motion.div variants={formFieldVariants} className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${saveUser
              ? 'bg-[#185C4D] border-[#185C4D]'
              : 'border-slate-300 bg-white group-hover:border-[#185C4D]'
              }`}>
              {saveUser && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={saveUser}
              onChange={(e) => setSaveUser(e.target.checked)}
            />
            <span className="text-sm text-slate-500 select-none">Save User</span>
          </label>

          <button
            type="button"
            className="text-xs font-bold text-[#185C4D] tracking-widest uppercase hover:underline focus:outline-none cursor-pointer"
          >
            Forget Password?
          </button>
        </motion.div>

        {/* Submit */}
        <motion.div variants={formFieldVariants}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 rounded-xl bg-linear-to-r from-[#185C4D] to-[#30836B] text-white font-bold text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(24,92,77,0.35)] hover:shadow-[0_6px_28px_rgba(24,92,77,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(24,92,77,0.35)] cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Login'}
          </button>
        </motion.div>
      </form>

      {/* Footer */}
      <motion.p variants={formFieldVariants} className="text-center text-xs text-slate-400 mt-8 md:mt-10">
        By logging in you agree to our{' '}
        <span className="text-[#185C4D] font-semibold cursor-pointer hover:underline">Terms of Service</span>
        {' '}&amp;{' '}
        <span className="text-[#185C4D] font-semibold cursor-pointer hover:underline">Privacy Policy</span>
      </motion.p>
    </motion.div>
  );
}
