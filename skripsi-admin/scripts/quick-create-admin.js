const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ⚠️ CHANGE THESE VALUES BEFORE RUNNING THE SCRIPT
const ADMIN_CONFIG = {
  email: 'admin@example.com',      // Change this
  password: 'AdminPassword123!',    // Change this - use a strong password
  fullName: 'System Administrator',
  noHp: '081234567890',
  nik: '1234567890123456'
};

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Hash the password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12);
    
    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: ADMIN_CONFIG.email,
        password: hashedPassword,
        fullName: ADMIN_CONFIG.fullName,
        noHp: ADMIN_CONFIG.noHp,
        nik: ADMIN_CONFIG.nik,
        isMahasiswa: false,
        isAdmin: true,  // Set as admin
        pj: ADMIN_CONFIG.fullName
      }
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('=====================================');
    console.log('User Details:');
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Full Name: ${newAdmin.fullName}`);
    console.log(`Is Admin: ${newAdmin.isAdmin}`);
    console.log('=====================================');
    console.log('\n🔐 Login credentials:');
    console.log(`Email: ${ADMIN_CONFIG.email}`);
    console.log(`Password: ${ADMIN_CONFIG.password}`);
    console.log('\n⚠️  IMPORTANT: Save these credentials securely and change the password after first login!');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code === 'P2002') {
      console.error('The email address is already in use. Please use a different email.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();
