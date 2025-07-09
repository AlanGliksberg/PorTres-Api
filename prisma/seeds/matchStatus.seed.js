import { PrismaClient } from "@prisma/client";

export async function seedMatchStatus(prisma) {
  await Promise.all(
    [
      { code: "PENDING", label: "Pendiente", description: "Pendiente" },
      { code: "CLOSED", label: "Cerrado", description: "Cerrado" },
      { code: "COMPLETED", label: "Confirmado", description: "Confirmado" },
      { code: "CANCELLED", label: "Cancelado", description: "Cancelado" }
    ].map((status) =>
      prisma.matchStatus.upsert({
        where: { code: status.code },
        update: status,
        create: status
      })
    )
  );
  console.log("MatchStatus records created!");
}
