// src/app/(auth)/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm"
import BrandPanel from "@/components/auth/BrandPanel"

export default function RegisterPage() {
  return (
    <div className="relative z-10 w-full max-w-5xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.04)] rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_1.1fr]">
      <BrandPanel />
      <RegisterForm />
    </div>
  );
}
