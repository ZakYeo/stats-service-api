import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.users.createMany({
    data: [
      { user_id: "e8df5aae-870e-46d7-a62b-57b8c6a129a2" },
      { user_id: "d3b07384-d9a1-4e21-bd7f-662b933ad1af" },
      { user_id: "123e4567-e89b-12d3-a456-426614174000" },
    ],
    skipDuplicates: true
  });

  await prisma.courses.createMany({
    data: [
      { course_id: "c0a80102-0000-0000-0000-000000000001" },
      { course_id: "c0a80102-0000-0000-0000-000000000002" },
      { course_id: "7baaeaa2-07c3-49b6-a57e-59b07d86e137" },
    ],
    skipDuplicates: true
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());