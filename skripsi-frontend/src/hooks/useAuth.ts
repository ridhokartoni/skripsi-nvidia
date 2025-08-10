'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface UseAuthOptions {
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, isAdmin } = useAuthStore();
  
  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      const loginUrl = options.redirectTo || '/login';
      // Preserve the current path for redirect after login
      if (pathname && pathname !== '/login') {
        router.push(`${loginUrl}?from=${encodeURIComponent(pathname)}`);
      } else {
        router.push(loginUrl);
      }
      return;
    }
    
    // Check admin requirement
    if (options.requireAdmin && !isAdmin) {
      router.push('/user');
      return;
    }
    
    // Check non-admin trying to access admin routes
    if (!options.requireAdmin && isAdmin && pathname?.startsWith('/user')) {
      // Admin can still access user routes if they want
      // But you could redirect them to admin dashboard if preferred
      // router.push('/admin');
    }
  }, [isHydrated, isAuthenticated, user, isAdmin, router, pathname, options.requireAdmin, options.redirectTo]);
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: !isHydrated,
  };
}

// Hook for pages that should wait for auth to be ready
export function useAuthProtected(options: UseAuthOptions = {}) {
  const { isLoading, ...auth } = useAuth(options);
  
  return {
    ...auth,
    isLoading,
    isReady: !isLoading && auth.isAuthenticated,
  };
}
