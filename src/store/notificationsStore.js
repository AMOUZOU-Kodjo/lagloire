import { create } from "zustand";

export const useNotificationsStore = create((set) => ({
  items: [],
  unreadCount: 0,

  setNotifications: (items, unreadCount) => set({ items, unreadCount }),

  pushRealtime: (notification) =>
    set((state) => ({
      items: [notification, ...state.items],
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  markOneRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
