import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserDetails = {
  uid: string;
  name: string;
  phone: string;
  dob: string;
  role: 'user' | 'admin';
  packs: number;
  cards: string[];
  premiumPacks?: number;
  freePacks?: number;
};

interface AppState {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userDetails: null,
      setUserDetails: (userDetails) => set({ userDetails }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'apae-user-storage',
      partialize: (state) => ({ userDetails: state.userDetails }),
    }
  )
);
