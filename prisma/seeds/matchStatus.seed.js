import { PrismaClient } from "@prisma/client";

export async function seedMatchStatus(prisma) {
  await Promise.all(
    [
      { code: "PENDING", label: "Pendiente", description: "Todavía faltan jugadores, estate atento las notificaciones" },
      { code: "CLOSED", label: "Finalizado", description: "Ya jugaste tu partido" },
      { code: "COMPLETED", label: "Confirmado", description: "Ya son 4, ¡Se juega!" },
      { code: "CANCELLED", label: "Cancelado", description: "Este partido fue cancelado" }
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
