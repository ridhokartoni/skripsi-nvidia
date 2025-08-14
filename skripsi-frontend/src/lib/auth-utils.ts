/**
 * Utility functions for authentication management
 */

/**
 * Completely clears all authentication data from browser storage
 * This includes localStorage, sessionStorage, and cookies
 */
export function clearAllAuthData() {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  const localStorageKeys = ['token', 'user', 'isAdmin', 'refreshToken'];
  localStorageKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear sessionStorage (in case any auth data is stored there)
  const sessionStorageKeys = ['token', 'user', 'isAdmin', 'refreshToken'];
  sessionStorageKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });

  // Clear all auth-related cookies
  const cookieNames = ['token', 'user', 'isAdmin', 'refreshToken'];
  cookieNames.forEach(name => {
    // Clear cookie for current path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear cookie for current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    // Clear cookie for parent domain (if subdomain)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });

  // Clear any axios default headers that might have been set
  if (typeof window !== 'undefined' && (window as any).axios) {
    delete (window as any).axios.defaults.headers.common['Authorization'];
  }
}

/**
 * Gets the authentication token from available sources
 * Checks localStorage first, then cookies as fallback
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try localStorage first
  let token = localStorage.getItem('token');
  
  // If not in localStorage, try cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  return token;
}

/**
 * Validates if a token is present and not obviously expired
 * Note: This is a basic check, actual validation should be done server-side
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  // Basic JWT structure check (three parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Try to decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has an expiration and if it's expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    }
    
    // If no expiration field, assume it's valid (let server decide)
    return true;
  } catch (error) {
    // If we can't decode the token, it's invalid
    return false;
  }
}

/**
 * Ensures authentication data consistency across storage mechanisms
 */
export function syncAuthData(token: string | null, user: any | null) {
  if (typeof window === 'undefined') return;

  if (token && user) {
    // Sync to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.isAdmin !== undefined) {
      localStorage.setItem('isAdmin', user.isAdmin.toString());
    }
  } else {
    // Clear everything if no token or user
    clearAllAuthData();
  }
}
