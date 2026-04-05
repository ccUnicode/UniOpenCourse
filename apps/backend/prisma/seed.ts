import * as dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

dotenv.config();
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { role_name: 'ADMIN' },
    update: {},
    create: { role_name: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { role_name: 'USER' },
    update: {},
    create: { role_name: 'USER' },
  });

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await prisma.user.create({
      data: {
        email: 'admin@test.com',
        username: 'admin123',
        name: 'Franz',
        last_name: 'Nuñez',
        password: hashedPassword,
        role_id: adminRole.role_id,
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seed ejecutado correctamente 🌱');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
