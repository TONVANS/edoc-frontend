import { Folder, Inbox, Archive } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { StatItem } from '@/types/dashboard';

const ICONS = {
  folder:  <Folder  size={24} strokeWidth={1.5} />,
  inbox:   <Inbox   size={24} strokeWidth={1.5} />,
  archive: <Archive size={24} strokeWidth={1.5} />,
};

export default function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="group flex flex-col justify-between bg-white/40 backdrop-blur-2xl border border-white/60 p-5 sm:p-6 rounded-[28px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] transition-all duration-300 cursor-pointer hover:bg-white/55 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)]">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] flex items-center justify-center ${stat.iconBg} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
          {ICONS[stat.iconName]}
        </div>
        <StatusBadge status={stat.badge.status}>{stat.badge.text}</StatusBadge>
      </div>
      <div>
        <p className="text-[12px] font-medium mb-1" style={{ color: '#737373' }}>{stat.label}</p>
        <p className="text-[32px] sm:text-[36px] font-bold tracking-tight leading-none" style={{ color: '#1C1C1E' }}>{stat.value}</p>
      </div>
    </div>
  );
}