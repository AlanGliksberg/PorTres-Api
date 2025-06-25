import { PrismaClient } from "@prisma/client";

export async function seedMatchStatus(prisma) {
  await Promise.all(
    [
      { name: "PENDING", description: "Pendiente" },
      { name: "CLOSED", description: "Cerrado" },
      { name: "COMPLETED", description: "Confirmado" },
      { name: "CANCELLED", description: "Cancelado" }
    ].map((status) =>
      prisma.matchStatus.upsert({
        where: { name: status.name },
        update: { description: status.description },
        create: status
      })
    )
  );
  console.log("MatchStatus records created!");
}
