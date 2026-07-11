import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface StorageBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function StorageBreadcrumb({ items }: StorageBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 mb-6 font-lao text-[14px] overflow-x-auto pb-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-[#185C4D] hover:bg-[#185C4D]/5 px-3 py-1.5 rounded-xl transition-all duration-300 flex-shrink-0">
        <Home size={16} />
        <span className="font-medium">ໜ້າຫຼັກ</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
            {isLast ? (
              <div className="flex items-center gap-1.5 text-[#185C4D] font-bold bg-[#185C4D]/10 px-3.5 py-1.5 rounded-xl border border-[#185C4D]/20 shadow-sm shrink-0">
                {item.icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
                <span className="truncate max-w-[200px] sm:max-w-[300px]">{item.label}</span>
              </div>
            ) : item.href ? (
              <Link 
                href={item.href}
                className="flex items-center gap-1.5 text-slate-600 hover:text-[#185C4D] hover:bg-[#185C4D]/5 font-medium px-3 py-1.5 rounded-xl transition-all duration-300 shrink-0"
              >
                {item.icon && <span className="text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 font-medium px-2 py-1.5 shrink-0 bg-slate-50/50 rounded-xl border border-slate-100">
                {item.icon && <span className="text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.label}</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
