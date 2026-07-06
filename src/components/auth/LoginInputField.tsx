// src/components/auth/LoginInputField.tsx
'use client';
interface LoginInputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: React.ReactNode;
  error?: string; // เพิ่ม property error ใน Interface เพื่อแก้ไข TypeScript Error
}

export default function LoginInputField({ id, label, type = 'text', placeholder, value, onChange, suffix, error }: LoginInputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {/* แสดงข้อความ Error ด้านขวาของ Label */}
        {error && <span className="text-xs text-red-500 font-medium animate-pulse">{error}</span>}
      </div>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // เปลี่ยนสีขอบเป็นสีแดงหากมี Error
          className={`w-full bg-white/60 backdrop-blur-lg border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/30' : 'border-white/80 focus:border-[#185C4D]/50 focus:ring-[#185C4D]/30'} rounded-xl px-4 py-3 pr-11 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}