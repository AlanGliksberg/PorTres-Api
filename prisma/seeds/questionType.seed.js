import { PrismaClient } from "@prisma/client";

export async function seedQuestionType(prisma) {
  await Promise.all(
    [{ code: "SELECT" }, { code: "RADIO" }].map(
      async (type) => await prisma.questionType.upsert({ where: { code: type.code }, update: {}, create: type })
    )
  );
  console.log("QuestionType records created!");
}
