import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Plan = 'free' | 'pro' | 'premium'

interface AuthState {
  plan: Plan
  dailyChecksUsed: number
  maxDailyChecks: number
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  } | null
  isAuthenticated: boolean
  
  setPlan: (plan: Plan) => void
  incrementChecks: () => void
  resetDailyChecks: () => void
  setUser: (user: AuthState['user']) => void
  login: (user: AuthState['user']) => void
  logout: () => void
}

const getPlanLimits = (plan: Plan): number => {
  switch (plan) {
    case 'free': return 5
    case 'pro': return 50
    case 'premium': return 999999
    default: return 5
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      dailyChecksUsed: 0,
      maxDailyChecks: 5,
      user: null,
      isAuthenticated: false,
      
      setPlan: (plan) => set({ 
        plan, 
        maxDailyChecks: getPlanLimits(plan) 
      }),
      
      incrementChecks: () => set((state) => ({ 
        dailyChecksUsed: state.dailyChecksUsed + 1 
      })),
      
      resetDailyChecks: () => set({ dailyChecksUsed: 0 }),
      
      setUser: (user) => set({ user }),
      
      login: (user) => set({ 
        user, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        plan: 'free',
        dailyChecksUsed: 0,
        maxDailyChecks: 5,
      }),
    }),
    {
      name: 'veritai-auth',
    }
  )
)
