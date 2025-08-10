const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: adminPassword,
      fullName: 'Test Administrator',
      noHp: '08123456789',
      isAdmin: true,
      isMahasiswa: false,
      nik: '1234567890123456',
      pj: 'Admin'
    }
  });
  console.log('Created admin user:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      password: userPassword,
      fullName: 'Test User',
      noHp: '08234567890',
      isAdmin: false,
      isMahasiswa: true,
      nik: '1234567890123457',
      pj: null
    }
  });
  console.log('Created regular user:', user.email);

  // Create the user you were trying to login with
  const ridhoPassword = await bcrypt.hash('ridho123', 10);
  const ridho = await prisma.user.upsert({
    where: { email: 'ridhokartoni@gmail.com' },
    update: {},
    create: {
      email: 'ridhokartoni@gmail.com',
      password: ridhoPassword,
      fullName: 'Ridho Kartoni',
      noHp: '081234567890',
      isAdmin: true,
      isMahasiswa: false,
      nik: '1234567890123458',
      pj: 'Ridho'
    }
  });
  console.log('Created user:', ridho.email);

  // Create another student user for testing
  const studentPassword = await bcrypt.hash('student123', 10);
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@gmail.com' },
    update: {},
    create: {
      email: 'student2@gmail.com',
      password: studentPassword,
      fullName: 'Budi Santoso',
      noHp: '08345678901',
      isAdmin: false,
      isMahasiswa: true,
      nik: '1234567890123459',
      pj: null
    }
  });
  console.log('Created student user:', student2.email);

  // Create some sample packages
  const packages = await Promise.all([
    prisma.paket.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Basic Package',
        CPU: 2,
        RAM: 4,
        GPU: 1,
        harga: 100000,
        durasi: 30
      }
    }),
    prisma.paket.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Standard Package',
        CPU: 4,
        RAM: 8,
        GPU: 2,
        harga: 200000,
        durasi: 30
      }
    }),
    prisma.paket.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Premium Package',
        CPU: 8,
        RAM: 16,
        GPU: 4,
        harga: 400000,
        durasi: 30
      }
    })
  ]);
  console.log('Created', packages.length, 'packages');

  // Create GPUs
  try {
    const gpus = await Promise.all([
      prisma.gPU.upsert({
        where: { deviceId: 0 },
        update: {},
        create: {
          name: 'NVIDIA Tesla T4',
          deviceId: 0
        }
      }),
      prisma.gPU.upsert({
        where: { deviceId: 1 },
        update: {},
        create: {
          name: 'NVIDIA Tesla T4',
          deviceId: 1
        }
      })
    ]);
    console.log('Created', gpus.length, 'GPUs');
  } catch (error) {
    console.log('GPUs might already exist or there was an error:', error.message);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
