import { PrismaClient } from "@prisma/client";

export async function seedCategory(prisma) {
  const categories = [];
  categories.push(
    ...[...Array(9)].map((x, i) => {
      let maxPoints = 1000 - (i + 1) * 100;
      if (i === 0) maxPoints *= 10;
      return {
        code: `C${i + 1}`,
        description: `C${i + 1}`,
        initialPoints: 950 - (i + 1) * 100,
        minPoints: 900 - (i + 1) * 100,
        maxPoints: maxPoints,
        order: i + 1,
        gender: { connect: { code: "C" } }
      };
    })
  );
  categories.push(
    ...[...Array(9)].map((x, i) => {
      let maxPoints = 1000 - (i + 1) * 100;
      if (i === 0) maxPoints *= 10;
      return {
        code: `D${i + 1}`,
        description: `D${i + 1}`,
        initialPoints: 950 - (i + 1) * 100,
        minPoints: 900 - (i + 1) * 100,
        maxPoints: maxPoints,
        order: i + 11,
        gender: { connect: { code: "D" } }
      };
    })
  );
  categories.push(
    ...[...Array(9)].map((x, i) => ({
      code: `M${i + 7}`,
      description: `Suma ${i + 7}`,
      initialPoints: 0,
      minPoints: 0,
      maxPoints: 0,
      order: i + 21,
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
            minPoints: category.minPoints,
            maxPoints: category.maxPoints,
            order: category.order,
            gender: category.gender
          },
          create: category
        })
    )
  );
  console.log("Category records created!");
}
