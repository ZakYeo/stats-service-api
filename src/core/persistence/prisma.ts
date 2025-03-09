import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Prevent multiple instances in AWS Lambda
if (!global.prismaGlobal) {
  global.prismaGlobal = new PrismaClient();
}

prisma = global.prismaGlobal;

// Ensure Prisma disconnects when Lambda shuts down
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});

export default prisma;
