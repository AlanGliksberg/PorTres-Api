import { PrismaClient } from "@prisma/client";

export async function seedGender(prisma) {
  await Promise.all(
    [
      { code: "C", name: "Caballero", pluralName: "Caballeros", order: 2 },
      { code: "D", name: "Dama", pluralName: "Damas", order: 1 },
      { code: "X", name: "Mixto", pluralName: "Mixto", order: 3 }
    ].map((gender) =>
      prisma.gender.upsert({
        where: { code: gender.code },
        update: gender,
        create: gender
      })
    )
  );
  console.log("Gender records created!");
}
