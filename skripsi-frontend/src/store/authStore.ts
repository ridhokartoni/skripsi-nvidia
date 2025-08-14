import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { clearAllAuthData } from '@/lib/auth-utils';

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

const removeCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

interface AuthState {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      isHydrated: false,
      
      setAuth: (token, user) => {
        // Clear any existing auth data first to prevent conflicts
        clearAllAuthData();
        
        // Store the new auth data
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAdmin', user.isAdmin.toString());
          setCookie('token', token);
          setCookie('user', JSON.stringify(user));
          setCookie('isAdmin', user.isAdmin.toString());
        }
        set({
          token,
          user,
          isAdmin: user.isAdmin,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        // Use comprehensive cleanup utility
        clearAllAuthData();
        
        // Reset the store state
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
      
      setHydrated: () => {
        set({ isHydrated: true });
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
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
