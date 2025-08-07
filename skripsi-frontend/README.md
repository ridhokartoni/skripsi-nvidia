# GPU Container Management System - Frontend

A modern web application for managing GPU-enabled Docker containers, built with Next.js, React, TypeScript, and Tailwind CSS. This platform provides separate interfaces for users and administrators, similar to cloud container management platforms.

## Features

### User Portal
- **Container Management**: View and manage personal containers
- **Container Details**: Monitor stats, logs, and access information
- **SSH & Jupyter Access**: Easy access to development environments
- **Package Selection**: Browse and request container packages
- **Payment Tracking**: Monitor payment status for container services
- **Support Tickets**: Create and track support requests

### Admin Portal
- **Container Administration**: Create, start, stop, and delete containers
- **User Management**: Manage all platform users
- **Resource Allocation**: Configure CPU, RAM, and GPU resources
- **Payment Processing**: Review and approve payment requests
- **Package Management**: Create and modify container packages
- **GPU Management**: Configure available GPU resources
- **System Overview**: Monitor all containers across the platform

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Charts**: Chart.js, Recharts

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (default: http://localhost:8080)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skripsi-frontend.git
cd skripsi-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Docker Deployment

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── user/              # User portal pages
│   │   ├── containers/    # Container management
│   │   ├── payments/      # Payment history
│   │   ├── packages/      # Available packages
│   │   ├── tickets/       # Support tickets
│   │   └── profile/       # User profile
│   └── admin/             # Admin portal pages
│       ├── containers/    # All containers management
│       ├── users/         # User management
│       ├── payments/      # Payment approvals
│       ├── packages/      # Package configuration
│       ├── tickets/       # All support tickets
│       └── gpu/           # GPU management
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── containers/       # Container-related components
│   ├── payments/         # Payment components
│   └── ui/               # UI components
├── lib/                   # Utilities and API client
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── store/                 # Zustand state management
```

## Key Features Implementation

### Authentication
- JWT-based authentication with token storage
- Separate login flows for users and administrators
- Automatic token refresh and session management
- Protected routes with role-based access control

### Container Management
- Real-time container stats monitoring
- Log viewing with terminal-like interface
- SSH connection information with copy-to-clipboard
- Jupyter notebook direct access
- Password management for containers
- Container lifecycle operations (start, stop, restart, reset)

### Resource Management
- Dynamic resource allocation (CPU, RAM, GPU)
- Docker image search and selection
- Port allocation management
- User assignment for containers

### User Experience
- Responsive design for mobile and desktop
- Real-time notifications for all operations
- Loading states and error handling
- Search and filter capabilities
- Pagination for large datasets
- Modal interfaces for complex operations

## API Integration

The frontend integrates with the backend API endpoints:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/admin/login`
- **Users**: `/users/profile`, `/users/{id}`
- **Containers**: `/docker/container/{name}`, `/docker/mycontainer`
- **Payments**: `/payment/mypayment`, `/payment/{id}`
- **Packages**: `/paket`, `/paket/{id}`
- **Tickets**: `/tiket/mytiket`, `/tiket/{id}`
- **GPU**: `/gpu`, `/gpu/{id}`

## Development Guidelines

1. **Component Structure**: Use functional components with TypeScript
2. **State Management**: Use Zustand for global state, React Query for server state
3. **Styling**: Use Tailwind CSS utility classes, avoid inline styles
4. **Error Handling**: Implement proper error boundaries and fallbacks
5. **Performance**: Use Next.js Image optimization, lazy loading, and code splitting
6. **Accessibility**: Ensure ARIA labels, keyboard navigation, and screen reader support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of a thesis work (Skripsi) and is intended for educational purposes.

## Support

For support, please create an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Inspired by cloud container platforms like SumoPod
- Built for GPU-enabled research and development environments
- Designed for university thesis project requirements
