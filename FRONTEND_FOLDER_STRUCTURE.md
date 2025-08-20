# Frontend Folder Structure Documentation

## Overview
This is a Next.js 13+ application using the App Router pattern with TypeScript. The structure follows modern React best practices and separation of concerns principles.

```
src/
├── app/          # Next.js App Router (Pages & Routes)
├── components/   # Reusable UI Components
├── hooks/        # Custom React Hooks
├── lib/          # Utility Functions & External Libraries
├── store/        # State Management (Zustand)
├── types/        # TypeScript Type Definitions
└── middleware.ts # Next.js Middleware for Auth & Routing
```

## Detailed Folder Explanations

### 📁 **app/** - Application Routes & Pages
**Purpose**: Contains all the pages and routes of your application using Next.js 13+ App Router

**Why this design?**
- Next.js App Router uses file-based routing where folder structure = URL structure
- Each folder represents a route segment
- Special files like `page.tsx`, `layout.tsx`, `loading.tsx` have specific roles

**Structure Example:**
```
app/
├── login/
│   └── page.tsx         # /login route
├── register/
│   └── page.tsx         # /register route
├── admin/
│   ├── layout.tsx       # Admin layout wrapper
│   ├── page.tsx         # /admin dashboard
│   ├── containers/
│   │   └── page.tsx     # /admin/containers
│   ├── users/
│   │   └── page.tsx     # /admin/users
│   └── payments/
│       └── page.tsx     # /admin/payments
└── user/
    ├── layout.tsx       # User layout wrapper
    ├── page.tsx         # /user dashboard
    └── profile/
        └── page.tsx     # /user/profile
```

**Benefits:**
- Intuitive routing - URL matches folder structure
- Code splitting automatic per route
- Nested layouts for shared UI
- Parallel and intercepting routes support

---

### 🧩 **components/** - Reusable UI Components
**Purpose**: Houses all reusable React components that can be used across different pages

**Why this design?**
- **DRY Principle**: Don't Repeat Yourself - write once, use everywhere
- **Maintainability**: Changes in one place affect all usages
- **Consistency**: Ensures UI consistency across the app

**Typical Structure:**
```
components/
├── layout/
│   ├── DashboardLayout.tsx    # Main dashboard wrapper
│   ├── Header.tsx              # App header
│   └── Sidebar.tsx             # Navigation sidebar
├── containers/
│   ├── ContainerCard.tsx       # Container display card
│   ├── CreateContainerModal.tsx # Modal for creating containers
│   └── SSHModal.tsx            # SSH connection modal
├── ui/
│   ├── Button.tsx              # Reusable button
│   ├── Modal.tsx               # Base modal component
│   └── LoadingSpinner.tsx     # Loading indicator
└── common/
    ├── ErrorBoundary.tsx       # Error handling wrapper
    └── ProtectedRoute.tsx      # Auth protection wrapper
```

**Benefits:**
- Component reusability
- Easier testing (isolated components)
- Better organization and discoverability
- Promotes component-driven development

---

### 🪝 **hooks/** - Custom React Hooks
**Purpose**: Contains custom React hooks for shared logic and state management

**Why this design?**
- **Logic Reusability**: Extract and share component logic
- **Separation of Concerns**: Separate business logic from UI
- **Cleaner Components**: Keep components focused on rendering

**Common Hooks:**
```
hooks/
├── useAuth.ts          # Authentication state and methods
├── useDebounce.ts      # Debounce values (search, input)
├── useLocalStorage.ts  # LocalStorage with React state
├── useFetch.ts         # Data fetching logic
└── useWebSocket.ts     # WebSocket connections
```

**Example - useAuth Hook:**
```typescript
// Encapsulates all authentication logic
export function useAuth() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return { user, isAuthenticated, login, logout };
}
```

**Benefits:**
- Reusable stateful logic
- Testable in isolation
- Follows React's composition model
- Reduces component complexity

---

### 📚 **lib/** - Libraries & Utilities
**Purpose**: Contains utility functions, API clients, constants, and third-party library configurations

**Why this design?**
- **Centralized Configuration**: All API endpoints, configs in one place
- **Abstraction**: Hide implementation details of external services
- **Type Safety**: Typed API clients and utilities

**Typical Structure:**
```
lib/
├── api.ts              # API client and endpoints
├── utils.ts            # Utility functions
├── constants.ts        # App-wide constants
├── validators.ts       # Form validation schemas
└── config.ts           # Configuration settings
```

**Example - API Client:**
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  // Centralized error handling
  async request(url, options) {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers
      }
    });
    
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }
};

export const userApi = {
  getProfile: () => api.request('/users/profile'),
  updateProfile: (data) => api.request('/users/profile', { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  })
};
```

**Benefits:**
- Single source of truth for configurations
- Easy to mock for testing
- Consistent error handling
- Type-safe API calls

---

### 🗄️ **store/** - State Management
**Purpose**: Global state management using Zustand (or Redux/MobX)

**Why this design?**
- **Global State**: Share state across components without prop drilling
- **Persistence**: Save state to localStorage/sessionStorage
- **Performance**: Optimize re-renders with selective subscriptions

**Structure:**
```
store/
├── authStore.ts        # Authentication state
├── uiStore.ts          # UI state (modals, sidebars)
├── containerStore.ts   # Container management state
└── index.ts            # Store exports
```

**Example - Auth Store:**
```typescript
// store/authStore.ts
export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    
    setAuth: (token, user) => set({ 
      token, 
      user, 
      isAuthenticated: true 
    }),
    
    logout: () => set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    })
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => localStorage)
  }
));
```

**Benefits:**
- Centralized state management
- DevTools support for debugging
- Middleware support (persistence, logging)
- Minimal boilerplate compared to Redux

---

### 📝 **types/** - TypeScript Definitions
**Purpose**: Contains all TypeScript type definitions, interfaces, and enums

**Why this design?**
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE support and autocomplete
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Single source of truth for data shapes

**Structure:**
```
types/
├── index.ts            # Main type exports
├── user.ts             # User-related types
├── container.ts        # Container types
├── api.ts              # API response types
└── forms.ts            # Form input types
```

**Example Types:**
```typescript
// types/user.ts
export interface User {
  id: number;
  email: string;
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
}

// types/container.ts
export interface Container {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  specs: {
    cpu: number;
    ram: number;
    gpu: number;
  };
  owner: User;
}
```

**Benefits:**
- Prevents runtime errors
- Makes refactoring safer
- Improves code readability
- Enables better IDE tooling

---

### 🔐 **middleware.ts** - Next.js Middleware
**Purpose**: Runs before every request to handle auth, redirects, and request processing

**Why at root level?**
- Next.js convention - must be at src root or project root
- Intercepts all requests before they reach pages
- Handles cross-cutting concerns

**Common Uses:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // Redirect unauthenticated users
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
```

**Benefits:**
- Centralized auth checking
- Performance (runs on Edge Runtime)
- Request/Response manipulation
- A/B testing and feature flags

---

## Why This Architecture?

### 1. **Scalability**
- Easy to add new features without breaking existing ones
- Clear boundaries between different parts of the app
- Supports team collaboration (different teams can work on different folders)

### 2. **Maintainability**
- Easy to find and fix bugs
- Clear separation of concerns
- Consistent patterns throughout the app

### 3. **Developer Experience**
- Intuitive structure for new developers
- TypeScript provides excellent IDE support
- Hot Module Replacement works smoothly

### 4. **Performance**
- Code splitting by route (app folder)
- Lazy loading of components
- Optimized bundle sizes

### 5. **Testing**
- Components can be tested in isolation
- Hooks can be tested separately
- Clear boundaries make mocking easier

## Best Practices

1. **Keep components small and focused** - Single Responsibility Principle
2. **Use TypeScript strictly** - Avoid `any` types
3. **Centralize API calls** - All API logic in lib/api.ts
4. **Extract repeated logic to hooks** - If used in 2+ places
5. **Co-locate related files** - Keep related components together
6. **Use barrel exports** - index.ts files for cleaner imports
7. **Implement error boundaries** - Graceful error handling
8. **Write tests alongside code** - __tests__ folders or .test.ts files

## Example: Adding a New Feature

Let's say you want to add a "Reports" feature:

1. **Create the page**: `app/admin/reports/page.tsx`
2. **Add types**: `types/report.ts`
3. **Create API client**: Add to `lib/api.ts`
4. **Build components**: `components/reports/ReportCard.tsx`
5. **Add custom hook**: `hooks/useReports.ts`
6. **Update navigation**: Add link in `components/layout/Sidebar.tsx`

This structure ensures every part of your new feature has a proper home!

## Conclusion

This folder structure is designed for:
- **Clarity**: Know exactly where to find/put code
- **Scalability**: Grows well with your application
- **Maintainability**: Easy to update and refactor
- **Team Collaboration**: Clear boundaries and responsibilities
- **Modern Best Practices**: Follows React and Next.js conventions

The structure promotes clean code, separation of concerns, and makes the codebase predictable and enjoyable to work with!
