import { PrismaClient } from "@prisma/client";

export async function seedApplicationStatus(prisma) {
  await Promise.all(
    [
      { code: "PENDING", label: "Esperando", description: "Tu postulación está pendiente" },
      { code: "ACCEPTED", label: "Aceptada", description: "¡Tu postulación fue aceptada!" },
      { code: "REJECTED", label: "Rechazada", description: "Tu postulación fue rechazada" }
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
