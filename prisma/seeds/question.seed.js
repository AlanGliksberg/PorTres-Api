import { PrismaClient } from "@prisma/client";

export async function seedQuestion(prisma) {
  await Promise.all(
    [
      { label: "¿Hace cuánto tiempo jugás al pádel?", code: "Q1", type: { connect: { code: "SELECT" } } },
      {
        label: "¿Jugaste anteriormente deportes con paleta o raqueta?",
        code: "Q2",
        type: { connect: { code: "RADIO" } }
      },
      { label: "¿Cuántos partidos jugás al mes?", code: "Q3", type: { connect: { code: "RADIO" } } },
      { label: "¿Cómo describís tu nivel de drive y revés?", code: "Q4", type: { connect: { code: "RADIO" } } },
      { label: "¿Cómo usás las paredes en tu juego?", code: "Q5", type: { connect: { code: "RADIO" } } }
    ].map(async (question) => {
      await prisma.question.upsert({
        where: { code: question.code },
        update: question,
        create: question
      });
    })
  );
  console.log("Question records created!");
}
