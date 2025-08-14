# GPU Container Platform - Use Case Diagram Description

## Overview
This document describes the use case diagram for the GPU Container Platform, which provides GPU-enabled containers for research and development purposes. The system has two main actors: **User** (regular users) and **Admin** (administrators).

## Actors

### 1. User (Regular User)
- Students, researchers, or developers who need GPU resources
- Can browse packages, request containers, and manage their own resources
- Has limited access to their own data and containers

### 2. Admin (Administrator)
- System administrators who manage the entire platform
- Has full access to all users, containers, payments, and system settings
- Responsible for approving payments and creating containers

## Main Use Cases by Module

### Authentication Module
**Both User and Admin:**
- **Login**: Authenticate into the system with email/password
- **View Profile**: View and update personal information

**User only:**
- **Register Account**: Create a new user account with personal details (name, email, phone, NIK/NIM)

### Package Management Module
**User:**
- **Browse Available Packages**: View all GPU packages with specifications (CPU, RAM, GPU, duration, price)
- **View Package Details**: See detailed information about a specific package
- **Compare Packages**: View comparison table of all packages

**Admin:**
- **Manage Packages**: Create, update, or delete GPU packages

### Payment Processing Module
**User:**
- **Create Payment Request**: Submit a payment request for a selected package with research purpose
- **View My Payments**: See all personal payment history
- **View Payment Status**: Track payment status (pending/approved/rejected)

**Admin:**
- **Review All Payments**: View all user payment requests
- **Approve Payment**: Approve a pending payment request
- **Reject Payment**: Reject a payment request with reason

### Container Management Module
**User:**
- **View My Containers**: See list of personal containers
- **View Container Details**: View detailed container information (specs, status, ports)
- **Access Container SSH**: Get SSH credentials and connect to container
- **Restart Container**: Restart a running container
- **Reset Container**: Reset container to initial state

**Admin:**
- **View All Containers**: See all containers across the platform
- **Create Container**: Create a new container for a user (usually after payment approval)
- **Start Container**: Start a stopped container
- **Stop Container**: Stop a running container
- **Delete Container**: Remove a container permanently

### User Management Module (Admin Only)
- **View All Users**: See list of all registered users
- **Edit User Details**: Modify user information
- **Delete User**: Remove a user from the system
- **Filter Users by Role**: Filter users by role (admin/student/regular)

### Dashboard & Monitoring
**User:**
- **View User Dashboard**: See personal statistics (active containers, pending payments)

**Admin:**
- **View Admin Dashboard**: See platform-wide statistics
- **Monitor System Status**: Check system health and container status
- **View Platform Statistics**: View metrics (total users, revenue, containers)
- **Monitor GPU Usage**: Track GPU resource utilization

### Settings Module (Admin Only)
- **Manage Settings**: Configure system settings and parameters

## Application Flow (Without Ticketing)

### User Flow:
1. **Registration & Authentication**
   - User registers with personal details
   - User logs in to access the platform

2. **Package Selection & Payment**
   - User browses available GPU packages
   - User compares packages and selects one
   - User submits payment request with research purpose
   - User tracks payment status

3. **Container Usage**
   - After admin approves payment, container is created
   - User views their containers in dashboard
   - User accesses container via SSH
   - User can restart/reset container as needed

### Admin Flow:
1. **Authentication**
   - Admin logs in with admin credentials

2. **Payment Management**
   - Admin reviews pending payments
   - Admin approves/rejects payments
   - Upon approval, admin creates container for user

3. **System Management**
   - Admin monitors all containers
   - Admin manages users (view, edit, delete)
   - Admin views platform statistics
   - Admin manages GPU packages
   - Admin monitors system health

## Key Relationships

### Include Relationships:
- Creating payment request **includes** browsing packages
- Admin dashboard **includes** viewing statistics
- User dashboard **includes** viewing containers and payments

### Extend Relationships:
- Container details **may extend to** SSH access

### Trigger Relationships:
- Payment approval **triggers** container creation

## Business Rules (Based on Code Analysis)

1. **Authentication**: 
   - Users must be authenticated to access the platform
   - Admin flag determines access level

2. **Packages**:
   - Each package defines CPU cores, RAM (GB), GPU count, duration (days), and price

3. **Payments**:
   - Users must provide research purpose when requesting payment
   - Payments have three states: pending (0), approved (1), rejected (2)
   - Price is generated based on selected package

4. **Containers**:
   - Containers are Docker-based with GPU support
   - Each container has SSH access with root privileges
   - Containers include pre-installed Jupyter Notebook
   - Container names follow pattern: user{userId}-{timestamp}

5. **User Roles**:
   - Regular users can only manage their own resources
   - Admins have full platform access
   - Special flag for students (isMahasiswa)

## Security Considerations
- JWT token-based authentication
- Role-based access control (RBAC)
- Middleware protection for routes
- Separate admin and user dashboards
- Container isolation per user
