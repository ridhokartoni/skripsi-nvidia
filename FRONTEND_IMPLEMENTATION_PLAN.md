# Frontend Implementation Plan

## Current Status ✅

### Completed Pages:
1. **Authentication**
   - `/login` - Login page (fixed authentication flow)
   - `/register` - Registration page

2. **Admin Pages**
   - `/admin/containers` - Container management
   - `/admin/users` - User management (NEW)
   - `/admin/gpu` - GPU management (NEW)
   - `/admin/packages` - Package management (NEW)

3. **User Pages**
   - `/user/containers` - User's containers

## Remaining Pages to Implement 🚧

### Admin Pages:

#### 1. `/admin/payments` - Payment Management
**Features:**
- View all payments with status filters
- Approve/reject payments
- Delete payments
- Export payment reports

**API Endpoints:**
- GET `/payment` - Get all payments
- PATCH `/payment/:id` - Update payment status
- DELETE `/payment/:id` - Delete payment

#### 2. `/admin/tickets` - Ticket Management
**Features:**
- View all support tickets
- Update ticket status (open/in-progress/closed)
- Filter by status
- Respond to tickets

**API Endpoints:**
- GET `/tiket/all` - Get all tickets
- PATCH `/tiket/:id` - Update ticket status

### User Pages:

#### 1. `/user/packages` - Available Packages
**Features:**
- View available packages
- Compare packages
- Select package for purchase

**API Endpoints:**
- GET `/paket` - Get all packages
- GET `/paket/generate-harga/:id` - Generate price

#### 2. `/user/payments` - My Payments
**Features:**
- View payment history
- Create new payment
- Upload payment proof
- Check payment status

**API Endpoints:**
- GET `/payment/mypayments` - Get user's payments
- POST `/payment` - Create payment

#### 3. `/user/tickets` - Support Tickets
**Features:**
- View my tickets
- Create new ticket for container issues
- Update ticket with additional information
- View ticket responses

**API Endpoints:**
- GET `/tiket` - Get user's tickets
- POST `/tiket/:containerName` - Create ticket
- PATCH `/tiket/:id` - Update ticket

#### 4. `/user/profile` - User Profile
**Features:**
- View profile information
- Edit profile details
- Change password
- View container quota

**API Endpoints:**
- GET `/users/profile` - Get profile
- PATCH `/users/:id` - Update profile

### Shared Components Needed:

#### 1. **DashboardLayout** Component Updates
- Add navigation items for new pages
- Update sidebar with proper icons
- Add notification badge for tickets/payments

#### 2. **Status Badges** Component
```tsx
// For displaying payment/ticket status
<StatusBadge status="pending|approved|rejected|open|closed" />
```

#### 3. **DataTable** Component
```tsx
// Reusable table component with sorting, filtering, pagination
<DataTable columns={columns} data={data} />
```

#### 4. **Modal** Component
```tsx
// Reusable modal for forms and confirmations
<Modal isOpen={isOpen} onClose={onClose} title={title}>
  {children}
</Modal>
```

## API Integration Fixes Needed:

### 1. Fix API endpoints in `lib/api.ts`:
- Update base URL to match backend (currently pointing to wrong port)
- Add missing API functions for tickets
- Add user profile update endpoints

### 2. Add proper TypeScript interfaces:
```typescript
interface Payment {
  id: number;
  userId: number;
  paketId: number;
  tujuanPenelitian: string;
  harga: number;
  status: number; // 0: pending, 1: approved, 2: rejected
  createdAt: string;
  user?: User;
  paket?: Paket;
}

interface Ticket {
  id: number;
  containerId: number;
  deskripsi: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  container?: Container;
}
```

## Navigation Structure:

### Admin Navigation:
```
Dashboard
├── Containers
├── Users
├── Packages
├── Payments
├── Tickets
├── GPU Resources
└── Settings
```

### User Navigation:
```
Dashboard
├── My Containers
├── Packages
├── Payments
├── Support Tickets
├── Profile
└── Settings
```

## Priority Implementation Order:

1. **High Priority** (Core functionality):
   - User payments page (for purchasing packages)
   - Admin payments page (for approving payments)
   - User profile page

2. **Medium Priority** (Support features):
   - User tickets page
   - Admin tickets page
   - User packages page

3. **Low Priority** (Nice to have):
   - Settings pages
   - Dashboard overview pages
   - Analytics/reporting pages

## Development Steps:

1. Fix API base URL in `.env.local` and `lib/api.ts`
2. Create shared components (Modal, DataTable, StatusBadge)
3. Update DashboardLayout with all navigation items
4. Implement high-priority pages
5. Implement medium-priority pages
6. Add finishing touches (loading states, error handling, tooltips)
7. Test all CRUD operations
8. Add proper error boundaries

## Testing Checklist:

- [ ] Authentication flow (login/logout/register)
- [ ] Admin can manage users
- [ ] Admin can manage packages
- [ ] Admin can manage payments
- [ ] Users can view packages
- [ ] Users can create payments
- [ ] Users can manage their containers
- [ ] Users can create support tickets
- [ ] All CRUD operations work correctly
- [ ] Proper error handling for failed API calls
- [ ] Responsive design on mobile devices
