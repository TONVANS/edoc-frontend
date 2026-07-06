import { StatusType } from '@/types/dashboard';

const cls: Record<StatusType, string> = {
  success: 'bg-[#E1F2E8] text-[#1A7A44] border-[#BEE4CE]',
  warning: 'bg-[#FDF0D5] text-[#9B7016] border-[#FBE1A9]',
  danger:  'bg-[#FCE4E4] text-[#B83131] border-[#F8CACA]',
};

export default function StatusBadge({
  status,
  children,
}: {
  status: StatusType;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide whitespace-nowrap ${cls[status]}`}>
      {children}
    </span>
  );
}