// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm"
import BrandPanel from "@/components/auth/BrandPanel"

export default function LoginPage() {
  return (
    /* ── Level 1 Glass: Outer card (canvas + orbs handled by AuthLayout) ── */
    <div className="relative z-10 w-full max-w-5xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.04)] rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <LoginForm />
    </div>
  );
}
