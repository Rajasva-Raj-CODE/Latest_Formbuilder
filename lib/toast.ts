import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    
    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({ 
        toasts: state.toasts.filter(t => t.id !== id) 
      }))
    }, toast.duration || 5000)
  },
  removeToast: (id) => {
    set((state) => ({ 
      toasts: state.toasts.filter(t => t.id !== id) 
    }))
  },
  clearToasts: () => set({ toasts: [] })
}))

// Convenience functions
export const toast = {
  success: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'success' })
  },
  error: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'error' })
  },
  warning: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'warning' })
  },
  info: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'info' })
  },
  default: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'default' })
  }
} 