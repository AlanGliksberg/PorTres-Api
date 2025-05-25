import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    [
      { name: "PENDING", description: "Pendiente" },
      { name: "CLOSED", description: "Cerrado" },
      { name: "COMPLETED", description: "Confirmado" }
    ].map((status) =>
      prisma.matchStatus.upsert({
        where: { name: status.name },
        update: {},
        create: status
      })
    )
  );

  console.log("MatchStatus records created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
