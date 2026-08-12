'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from 'antd';
import { useDeleteCartStore } from '@/store/useDeleteCartStore';
import DeleteCartDrawer from '@/components/views/document-expired/DeleteCartDrawer';
import { cn } from '@/lib/utils';

export default function DeleteCartFAB() {
  const { items } = useDeleteCartStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const itemCount = items.length;

  if (itemCount === 0) {
    return null;
  }

  return (
    <>
      <div 
        className={cn(
          "fixed bottom-48 right-8 z-40 transition-all duration-300", 
          itemCount > 0 ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <Badge count={itemCount} offset={[-4, 4]} color="#f43f5e">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-16 h-16 bg-linear-to-r from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none outline-none group"
            title="ກະຕ່າລຶບເອກະສານ"
          >
            <Trash2 size={28} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        </Badge>
      </div>

      <DeleteCartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
