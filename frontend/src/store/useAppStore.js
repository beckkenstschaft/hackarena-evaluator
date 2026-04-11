import { create } from 'zustand';

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  darkMode: true,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  hackathons: [],
  currentHackathon: null,
  setHackathons: (hackathons) => set({ hackathons }),
  setCurrentHackathon: (hackathon) => set({ currentHackathon: hackathon }),
  
  rounds: [],
  currentRound: null,
  setRounds: (rounds) => set({ rounds }),
  setCurrentRound: (round) => set({ currentRound: round }),
  
  toasts: [],
  addToast: (toast) => set((state) => ({ 
    toasts: [...state.toasts, { id: Date.now(), ...toast }] 
  })),
  removeToast: (id) => set((state) => ({ 
    toasts: state.toasts.filter(t => t.id !== id) 
  }))
}));