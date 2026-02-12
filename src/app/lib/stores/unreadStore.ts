// lib/stores/unreadStore.ts
import { create } from 'zustand';

interface UnreadState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  resetUnread: () => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetUnread: () => set({ unreadCount: 0 }),
}));