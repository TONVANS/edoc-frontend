'use client';

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Badge } from 'antd';
import { useBorrowCartStore } from '@/store/useBorrowCartStore';
import BorrowCartDrawer from '@/components/views/borrow/BorrowCartDrawer';
import { cn } from '@/lib/utils';

export default function BorrowCartFAB() {
  const { items } = useBorrowCartStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const itemCount = items.length;

  if (itemCount === 0) {
    return null;
  }

  return (
    <>
      <div 
        className={cn(
          "fixed bottom-8 right-8 z-40 transition-all duration-300",
          itemCount > 0 ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <Badge count={itemCount} offset={[-4, 4]} color="#f43f5e">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-16 h-16 bg-linear-to-r from-[#185C4D] to-[#206E5B] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#185C4D]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none outline-none group"
            aria-label="Open Borrow Cart"
          >
            <ShoppingCart size={28} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        </Badge>
      </div>

      <BorrowCartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
