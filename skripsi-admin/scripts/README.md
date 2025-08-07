# Admin User Creation Scripts

This directory contains scripts to create admin users directly in the database.

## Prerequisites

1. Make sure you have the database configured and running
2. Set up your `.env` file in the project root with the correct `DATABASE_URL`
3. Install dependencies if not already installed

## Setup

1. First, navigate to the backend directory:
```bash
cd /home/Coding/skripsi/skripsi-admin
```

2. Create a `.env` file if it doesn't exist:
```bash
# Example .env file content:
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

3. Install dependencies (if not already installed):
```bash
npm install
```

4. Generate Prisma client:
```bash
npx prisma generate
```

## Running the Scripts

### Option 1: Interactive Script
This script will prompt you for all the required information:

```bash
node scripts/create-admin.js
```

### Option 2: Quick Script with Predefined Values
1. First, edit the script to set your desired admin credentials:
```bash
nano scripts/quick-create-admin.js
# or
vim scripts/quick-create-admin.js
```

2. Change the `ADMIN_CONFIG` values at the top of the file:
```javascript
const ADMIN_CONFIG = {
  email: 'your-admin@email.com',      // Change this
  password: 'YourStrongPassword123!',  // Change this
  fullName: 'Your Name',
  noHp: '081234567890',
  nik: '1234567890123456'
};
```

3. Run the script:
```bash
node scripts/quick-create-admin.js
```

## Direct Database Access (Alternative Method)

If you prefer to use SQL directly, you can connect to the PostgreSQL database:

```bash
# Connect to the PostgreSQL Docker container
docker exec -it postgres-container psql -U your_username -d your_database

# Or if PostgreSQL is installed locally
psql -U your_username -d your_database
```

Then run this SQL (you'll need to hash the password first using bcrypt):
```sql
INSERT INTO "User" (
  email, 
  password, 
  "fullName", 
  "noHp", 
  nik, 
  "isMahasiswa", 
  "isAdmin", 
  pj, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin@example.com',
  '$2a$12$hashedPasswordHere', -- Use bcrypt to hash with 12 rounds
  'Admin Name',
  '081234567890',
  '1234567890123456',
  false,
  true,  -- This makes the user an admin
  'Admin Name',
  NOW(),
  NOW()
);
```

## Important Notes

1. **Security**: Always use strong passwords for admin accounts
2. **Unique Email**: The email must be unique in the database
3. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
4. **isAdmin Flag**: The `isAdmin` field must be set to `true` for admin privileges
5. **Change Password**: It's recommended to change the password after first login

## Troubleshooting

- **Database connection error**: Make sure your `.env` file has the correct `DATABASE_URL`
- **Email already exists**: Use a different email address
- **Module not found**: Run `npm install` to install dependencies
- **Prisma client error**: Run `npx prisma generate` to generate the Prisma client

## Verify Admin Creation

You can verify the admin user was created by:

1. Logging in through the web interface at `http://localhost:3001/login` (or your frontend URL)
2. Check the "Login as Administrator" checkbox
3. Use the email and password you set

Or check directly in the database:
```bash
# Using Prisma Studio (visual interface)
npx prisma studio

# Or query via command line
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ where: { isAdmin: true } })
  .then(admins => console.log('Admin users:', admins))
  .finally(() => prisma.$disconnect());
"
```
