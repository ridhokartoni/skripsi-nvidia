# Authentication & Session Persistence Fix

## Issues Identified

1. **Cookie not being set properly in middleware**: The middleware checks for cookies but the login only sets localStorage
2. **Race condition**: Authentication state might not be fully synced when navigating
3. **Missing auth protection**: Container pages don't properly check authentication before rendering

## Solutions to Implement

### 1. Fix the Middleware Cookie Check

The middleware is checking for cookies but the auth store is not properly syncing cookies on login.

**File: `/src/middleware.ts`**
```typescript
// Current issue: Only checking cookies, but cookies might not be set immediately
const token = request.cookies.get('token')?.value;
```

### 2. Update Auth Store to Properly Set Cookies

**File: `/src/store/authStore.ts`**
The setCookie function needs proper configuration:

```typescript
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    // Add httpOnly: false and secure based on environment
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};
```

### 3. Fix Login Page Redirect Logic

**File: `/src/app/login/page.tsx`**
Add a delay or ensure state is fully synced before navigation:

```typescript
// After successful login
await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
router.push(redirectPath);
```

### 4. Add Auth Guard to Container Pages

**File: `/src/app/admin/containers/page.tsx`**
Add proper auth check at the beginning:

```typescript
const { user, isReady, isLoading } = useAuthProtected({ requireAdmin: true });

if (!isReady || isLoading) {
  return <LoadingSpinner />;
}

if (!user) {
  router.push('/login');
  return null;
}
```

## Implementation Steps
