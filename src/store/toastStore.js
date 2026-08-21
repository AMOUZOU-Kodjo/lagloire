import { create } from "zustand";

let nextId = 1;

export const useToastStore = create((set) => ({
  toasts: [],

  show: ({ message, type = "info", title, duration = 4000 }) => {
    const id = `toast-${nextId++}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type, title }] }));
    if (duration > 0) {
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, duration);
    }
    return id;
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));