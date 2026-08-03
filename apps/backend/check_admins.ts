import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findFirst({
    where: { role_name: 'ADMIN' },
  });

  if (!adminRole) {
    console.log("No ADMIN role found in the database.");
    return;
  }

  const adminCount = await prisma.user.count({
    where: { role_id: adminRole.role_id },
  });
  
  const admins = await prisma.user.findMany({
    where: { role_id: adminRole.role_id },
    select: { email: true, username: true, name: true }
  });

  console.log(`Total ADMIN accounts: ${adminCount}`);
  console.log("Admin accounts:", admins);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
