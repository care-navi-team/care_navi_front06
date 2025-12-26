import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setSession: (session) =>
    set({
      session,
      isAuthenticated: session !== null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () =>
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
