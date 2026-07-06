import React from 'react';

export default function AddressStatusBadge({ status }: { status: string }) {
  // ສົມມຸດວ່າ 'A' = Active (ສີຂຽວ), ອື່ນໆ = Inactive (ສີແດງ/ເຫຼືອງ)
  const isActive = status === 'A';

  if (isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E1F2E8] text-[#1A7A44] border border-[#BEE4CE]">
        <span className="w-2 h-2 rounded-full bg-[#1A7A44] mr-2"></span>
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FCE4E4] text-[#B83131] border border-[#F8CACA]">
      <span className="w-2 h-2 rounded-full bg-[#B83131] mr-2"></span>
      Inactive
    </span>
  );
}