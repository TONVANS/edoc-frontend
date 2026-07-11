import React from 'react';
import StorageBreadcrumb, { BreadcrumbItem } from './StorageBreadcrumb';

export interface ParentInfoItem {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

interface DetailPageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  icon: React.ReactNode;
  title: string | React.ReactNode;
  entityCode?: string;
  subtitle?: string;
  parentInfo?: ParentInfoItem[];
  actionButtons?: React.ReactNode;
  statusBadge?: React.ReactNode;
  filterSection?: React.ReactNode;
  createButton?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function DetailPageLayout({
  breadcrumbs,
  icon,
  title,
  entityCode,
  subtitle,
  parentInfo = [],
  actionButtons,
  statusBadge,
  filterSection,
  createButton,
  children,
  isLoading
}: DetailPageLayoutProps) {
  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out font-lao">
      {/* Breadcrumb */}
      <StorageBreadcrumb items={breadcrumbs} />

      {/* Detail Card (Level 1 Glass) */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 lg:p-8 rounded-[32px] shadow-glass mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-[#185C4D]/20 border-t-[#185C4D] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header: Icon, Title, Status, Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-white/90 to-white/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(24,92,77,0.08)] border border-white flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:rotate-3 duration-500 ease-out relative group">
                  <div className="absolute inset-0 bg-[#185C4D]/5 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="text-[#185C4D] [&>svg]:w-8 [&>svg]:h-8 relative z-10">
                    {icon}
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-3">
                    {entityCode && (
                      <span className="font-mono bg-white/80 text-[#185C4D] px-2.5 py-1 rounded-xl text-[14px] border border-[#185C4D]/20 shadow-sm font-bold tracking-wider">
                        {entityCode}
                      </span>
                    )}
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate">
                      {title}
                    </h1>
                  </div>
                  {subtitle && (
                    <p className="text-slate-500 font-medium text-[15px] mt-1.5 tracking-wide truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {actionButtons && (
                <div className="flex items-center gap-2 shrink-0">
                  {actionButtons}
                </div>
              )}
            </div>

            {/* Parent Info Grid */}
            {parentInfo.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {parentInfo.map((info, idx) => (
                  <div key={idx} className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-sm flex flex-col gap-1.5 transition-all duration-300 hover:bg-white/70 hover:shadow-md">
                    <div className="flex items-center gap-2 text-slate-500 text-[13px] font-medium tracking-wide">
                      {info.icon && <span className="text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{info.icon}</span>}
                      <span>{info.label}</span>
                    </div>
                    <div className="text-slate-800 font-bold text-[15px] truncate leading-relaxed">
                      {info.value || <span className="text-slate-300 italic">-</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Child Table Section (Level 2 Glass) */}
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#185C4D]/5 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        
        {/* Header and Filter */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
            {filterSection && (
              <div className="w-full flex-1">
                {filterSection}
              </div>
            )}
            
            {createButton && (
              <div className="shrink-0 w-full md:w-auto flex justify-end">
                {createButton}
              </div>
            )}
          </div>
        </div>

        {/* Table / List */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
