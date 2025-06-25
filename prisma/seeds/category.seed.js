import { PrismaClient } from "@prisma/client";

export async function seedCategory(prisma) {
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
      description: `Suma ${i + 7}`,
      initialPoints: 0,
      gender: { connect: { code: "X" } }
    }))
  );

  await Promise.all(
    categories.map(
      async (category) =>
        await prisma.category.upsert({
          where: { code: category.code },
          update: {
            description: category.description,
            initialPoints: category.initialPoints,
            gender: category.gender
          },
          create: category
        })
    )
  );
  console.log("Category records created!");
}
