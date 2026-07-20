import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BorrowCartItem {
  id: string;
  type: 'document' | 'folder';
  name: string;
  code: string;
  folderId?: string;
  folderName?: string;
}

interface BorrowCartState {
  items: BorrowCartItem[];
  cartType: 'document' | 'folder' | null;

  addItem: (item: BorrowCartItem) => boolean;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getItemCount: () => number;
}

export const useBorrowCartStore = create<BorrowCartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartType: null,

      addItem: (item) => {
        const { items, cartType } = get();
        
        // If cart is empty, accept any type
        if (items.length === 0) {
          set({ items: [item], cartType: item.type });
          return true;
        }

        // If cart has items, enforce type match
        if (cartType !== item.type) {
          return false;
        }

        // Avoid duplicates
        if (!items.find(i => i.id === item.id)) {
          set({ items: [...items, item] });
        }
        return true;
      },

      removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter(i => i.id !== id);
        
        // Reset cart type if empty
        if (newItems.length === 0) {
          set({ items: [], cartType: null });
        } else {
          set({ items: newItems });
        }
      },

      clearCart: () => {
        set({ items: [], cartType: null });
      },

      isInCart: (id) => {
        return get().items.some(i => i.id === id);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'edoc-borrow-cart',
    }
  )
);
