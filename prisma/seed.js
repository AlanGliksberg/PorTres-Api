import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    ...[
      { name: "PENDING", description: "Pendiente" },
      { name: "CLOSED", description: "Cerrado" },
      { name: "COMPLETED", description: "Confirmado" }
    ].map((status) =>
      prisma.matchStatus.upsert({
        where: { name: status.name },
        update: {},
        create: status
      })
    ),
    ...[
      { code: "C", name: "Caballero", pluralName: "Caballeros" },
      { code: "D", name: "Dama", pluralName: "Damas" },
      { code: "X", name: "Mixto", pluralName: "Mixto" }
    ].map((gender) =>
      prisma.gender.upsert({
        where: { code: gender.code },
        update: {},
        create: gender
      })
    )
  ]);
  console.log("MatchStatus records created!");
  console.log("Gender records created!");

  const levels = [];
  levels.push(
    ...[...Array(9)].map((x, i) => ({
      code: `C${i + 1}`,
      description: `C${i + 1}`,
      Gender: { connect: { code: "C" } }
    }))
  );
  levels.push(
    ...[...Array(9)].map((x, i) => ({
      code: `D${i + 1}`,
      description: `D${i + 1}`,
      Gender: { connect: { code: "D" } }
    }))
  );
  levels.push(
    ...[...Array(9)].map((x, i) => ({
      code: `M${i + 7}`,
      description: `Suma ${i + 7}`,
      Gender: { connect: { code: "X" } }
    }))
  );

  levels.map(
    async (level) =>
      await prisma.level.upsert({
        where: { code: level.code },
        update: {},
        create: level
      })
  );
  console.log("Level records created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
