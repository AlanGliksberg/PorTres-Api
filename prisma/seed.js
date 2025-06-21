import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    ...[
      { name: "PENDING", description: "Pendiente" },
      { name: "CLOSED", description: "Cerrado" },
      { name: "COMPLETED", description: "Confirmado" },
      { name: "CANCELLED", description: "Cancelado" }
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
    ),
    ...[
      { code: "R", description: "Revés", order: 1 },
      { code: "D", description: "Derecha", order: 2 },
      { code: "X", description: "Indistinto", order: 3 }
    ].map((position) =>
      prisma.playerPosition.upsert({
        where: { code: position.code },
        update: {},
        create: position
      })
    )
  ]);
  console.log("MatchStatus records created!");
  console.log("Gender records created!");
  console.log("PlayerPosition records created!");

  const categories = [];
  categories.push(
    ...[...Array(9)].map((x, i) => ({
      code: `C${i + 1}`,
      description: `C${i + 1}`,
      initialPoints: 1000 - (i + 1) * 100,
      gender: { connect: { code: "C" } }
    }))
  );
  categories.push(
    ...[...Array(9)].map((x, i) => ({
      code: `D${i + 1}`,
      description: `D${i + 1}`,
      initialPoints: 1000 - (i + 1) * 100,
      gender: { connect: { code: "D" } }
    }))
  );
  categories.push(
    ...[...Array(9)].map((x, i) => ({
      code: `M${i + 7}`,
      description: `Mixto +${i + 7}`,
      initialPoints: 0,
      gender: { connect: { code: "X" } }
    }))
  );

  categories.map(
    async (category) =>
      await prisma.category.upsert({
        where: { code: category.code },
        update: {},
        create: category
      })
  );
  console.log("Category records created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
