import { PrismaClient } from "@prisma/client";

export async function seedPlayerPosition(prisma) {
  await Promise.all(
    [
      { code: "R", description: "Revés", order: 1 },
      { code: "D", description: "Derecha", order: 2 },
      { code: "X", description: "Indistinto", order: 3 }
    ].map((position) =>
      prisma.playerPosition.upsert({
        where: { code: position.code },
        update: {
          description: position.description,
          order: position.order
        },
        create: position
      })
    )
  );
  console.log("PlayerPosition records created!");
}
