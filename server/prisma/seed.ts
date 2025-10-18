import { PrismaClient } from '@prisma/client';
import { categories } from './data';

const prisma = new PrismaClient();

(async () => {
  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
