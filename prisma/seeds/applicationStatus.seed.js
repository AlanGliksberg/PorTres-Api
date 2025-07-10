import { PrismaClient } from "@prisma/client";

export async function seedApplicationStatus(prisma) {
  await Promise.all(
    [
      { code: "PENDING", label: "Pendiente", description: "Esperando confiramción del creador" },
      { code: "ACCEPTED", label: "Aceptado", description: "¡Fuiste aceptado en el partido!" },
      { code: "REJECTED", label: "Rechazado", description: "Tu postulación fue rechazada" }
    ].map((status) =>
      prisma.applicationStatus.upsert({
        where: { code: status.code },
        update: status,
        create: status
      })
    )
  );
  console.log("ApplicationStatus records created!");
}
