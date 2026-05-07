import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default event settings
  await prisma.eventSettings.upsert({
    where: { id: 1 },
    create: { id: 1, capacity: 150, editingEnabled: true },
    update: {},
  });

  console.log("✅ Default settings seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
