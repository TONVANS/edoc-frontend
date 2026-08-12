import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeleteCartState {
  items: string[];

  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  setItems: (ids: string[]) => void;
}

export const useDeleteCartStore = create<DeleteCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (id) => {
        const { items } = get();
        if (!items.includes(id)) {
          set({ items: [...items, id] });
        }
      },

      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(i => i !== id) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      isInCart: (id) => {
        return get().items.includes(id);
      },

      setItems: (ids) => {
        set({ items: ids });
      }
    }),
    {
      name: 'edoc-delete-cart',
    }
  )
);
