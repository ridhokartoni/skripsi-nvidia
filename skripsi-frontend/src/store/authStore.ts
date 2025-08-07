import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({
          token,
          user,
          isAdmin: user.isAdmin,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({
          token: null,
          user: null,
          isAdmin: false,
          isAuthenticated: false,
        });
      },
      
      updateUser: (user) => {
        set({
          user,
          isAdmin: user.isAdmin,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
