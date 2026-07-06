import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'danger' | 'warning' | 'success';

interface StatusBadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const styles = {
    danger: 'bg-[#FCE4E4] text-[#B83131] border-[#F8CACA]',
    warning: 'bg-[#FDF0D5] text-[#9B7016] border-[#FBE1A9]',
    success: 'bg-[#E1F2E8] text-[#1A7A44] border-[#BEE4CE]',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-md text-xs font-medium border inline-flex items-center',
        styles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
