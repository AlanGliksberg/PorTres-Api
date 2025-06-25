import { PrismaClient } from "@prisma/client";

export async function seedGender(prisma) {
  await Promise.all(
    [
      { code: "C", name: "Caballero", pluralName: "Caballeros" },
      { code: "D", name: "Dama", pluralName: "Damas" },
      { code: "X", name: "Mixto", pluralName: "Mixto" }
    ].map((gender) =>
      prisma.gender.upsert({
        where: { code: gender.code },
        update: {
          name: gender.name,
          pluralName: gender.pluralName
        },
        create: gender
      })
    )
  );
  console.log("Gender records created!");
}
