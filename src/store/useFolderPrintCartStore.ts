import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FolderPrintItem {
  id: string | number;
  name: string;
  code: string;
  qrCode?: string;
  locationRef?: string;
  departmentName?: string;
  shelfInfo?: string;
}

interface FolderPrintCartState {
  items: FolderPrintItem[];
  addItem: (item: FolderPrintItem) => boolean;
  addItems: (items: FolderPrintItem[]) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;
  isInCart: (id: string | number) => boolean;
  toggleItem: (item: FolderPrintItem) => boolean;
  getItemCount: () => number;
}

export const useFolderPrintCartStore = create<FolderPrintCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => String(i.id) === String(item.id));
        if (!exists) {
          set({ items: [...items, item] });
          return true;
        }
        return false;
      },

      addItems: (newItems) => {
        const { items } = get();
        const existingIds = new Set(items.map((i) => String(i.id)));
        const itemsToAdd = newItems.filter((i) => !existingIds.has(String(i.id)));
        if (itemsToAdd.length > 0) {
          set({ items: [...items, ...itemsToAdd] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => String(i.id) !== String(id)) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      isInCart: (id) => {
        return get().items.some((i) => String(i.id) === String(id));
      },

      toggleItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => String(i.id) === String(item.id));
        if (exists) {
          set({ items: items.filter((i) => String(i.id) !== String(item.id)) });
          return false; // Removed
        } else {
          set({ items: [...items, item] });
          return true; // Added
        }
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'edoc-folder-print-cart',
    }
  )
);
