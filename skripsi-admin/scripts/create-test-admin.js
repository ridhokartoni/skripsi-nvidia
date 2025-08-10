require('dotenv').config();


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test admin credentials
const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'Admin123!',  // Simple test password
  fullName: 'Test Administrator',
  noHp: '081234567890',
  nik: '1234567890123456'
};

async function createTestAdmin() {
  try {
    console.log('🔄 Creating test admin user...\n');

    // Hash the password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(TEST_ADMIN.password, 12);

    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: TEST_ADMIN.email,
        password: hashedPassword,
        fullName: TEST_ADMIN.fullName,
        noHp: TEST_ADMIN.noHp,
        nik: TEST_ADMIN.nik,
        isMahasiswa: false,
        isAdmin: true,  // Set as admin
        pj: TEST_ADMIN.fullName
      }
    });

    console.log('✅ Test admin user created successfully!\n');
    console.log('=====================================');
    console.log('📧 Login Credentials:');
    console.log('=====================================');
    console.log(`Email:    ${TEST_ADMIN.email}`);
    console.log(`Password: ${TEST_ADMIN.password}`);
    console.log('=====================================\n');
    console.log('User Details:');
    console.log(`- ID: ${newAdmin.id}`);
    console.log(`- Full Name: ${newAdmin.fullName}`);
    console.log(`- Is Admin: ${newAdmin.isAdmin}`);
    console.log(`- Created At: ${newAdmin.createdAt}`);
    console.log('\n📝 To login:');
    console.log('1. Go to http://localhost:3001/login (or your frontend URL)');
    console.log('2. Check the "Login as Administrator" checkbox');
    console.log('3. Use the email and password shown above\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: An admin with email "admin@test.com" already exists!');
      console.error('\nTrying to fetch existing admin details...\n');

      // Try to fetch the existing admin
      const existingAdmin = await prisma.user.findUnique({
        where: { email: TEST_ADMIN.email }
      });

      if (existingAdmin) {
        console.log('📧 Existing admin found:');
        console.log(`- Email: ${existingAdmin.email}`);
        console.log(`- Full Name: ${existingAdmin.fullName}`);
        console.log(`- Is Admin: ${existingAdmin.isAdmin}`);
        console.log('\nUse the password you set when creating this user.');
        console.log('If you forgot the password, you can update it by running:');
        console.log('node scripts/reset-admin-password.js');
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestAdmin();
