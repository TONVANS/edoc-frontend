// src/app/(auth)/login/page.tsx
import { Suspense } from 'react';
import LoginForm from "@/components/auth/LoginForm"
import BrandPanel from "@/components/auth/BrandPanel"

export default function LoginPage() {
  return (
    /* ── Level 1 Glass: Outer card (canvas + orbs handled by AuthLayout) ── */
    <div className="relative z-10 w-full max-w-5xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.04)] rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <Suspense fallback={
        <div className="flex flex-col p-6 sm:p-8 md:p-12 h-full justify-center bg-white/10 items-center min-h-[400px]">
          <div className="w-8.5 h-8.5 border-4 border-[#185C4D]/40 border-t-[#185C4D] rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
