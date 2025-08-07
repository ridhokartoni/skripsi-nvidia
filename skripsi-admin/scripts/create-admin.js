const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('=== Create Admin User ===\n');
    
    // Get user input
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const fullName = await question('Enter full name: ');
    const noHp = await question('Enter phone number: ');
    const nik = await question('Enter NIK: ');
    
    // Hash the password with bcrypt (salt rounds: 12, same as in the backend)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        fullName: fullName,
        noHp: noHp,
        nik: nik,
        isMahasiswa: false,
        isAdmin: true,  // Set as admin
        pj: fullName    // Set PJ (person in charge) as the full name
      }
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('User details:');
    console.log(`- ID: ${newAdmin.id}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Full Name: ${newAdmin.fullName}`);
    console.log(`- Is Admin: ${newAdmin.isAdmin}`);
    console.log(`- Created At: ${newAdmin.createdAt}`);
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code === 'P2002') {
      console.error('The email address is already in use.');
    }
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the function
createAdminUser();
