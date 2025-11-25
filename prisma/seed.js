import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedGender } from "./seeds/gender.seed.js";
import { seedMatchStatus } from "./seeds/matchStatus.seed.js";
import { seedPlayerPosition } from "./seeds/playerPosition.seed.js";
import { seedCategory } from "./seeds/category.seed.js";
import { seedQuestionType } from "./seeds/questionType.seed.js";
import { seedQuestion } from "./seeds/question.seed.js";
import { seedQuestionAnswer } from "./seeds/questionAnswer.seed.js";
import { seedApplicationStatus } from "./seeds/applicationStatus.seed.js";
import { seedMatchClub } from "./seeds/matchClub.seed.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedMatchStatus(prisma);
  await seedGender(prisma);
  await seedPlayerPosition(prisma);
  await seedCategory(prisma);
  await seedQuestionType(prisma);
  await seedQuestion(prisma);
  await seedQuestionAnswer(prisma);
  await seedApplicationStatus(prisma);
  await seedMatchClub(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
