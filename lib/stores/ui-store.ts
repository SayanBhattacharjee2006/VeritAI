import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
}

interface UIState {
  sidebarCollapsed: boolean
  theme: 'dark' | 'light'
  toasts: Toast[]
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      toasts: [],
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', newTheme)
        set({ theme: newTheme })
      },
      
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
      
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9)
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          get().removeToast(id)
        }, 4000)
      },
      
      removeToast: (id) => set((state) => ({ 
        toasts: state.toasts.filter((t) => t.id !== id) 
      })),
    }),
    {
      name: 'veritai-ui',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed, 
        theme: state.theme 
      }),
    }
  )
)
