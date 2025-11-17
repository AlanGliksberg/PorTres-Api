import { PrismaClient } from "@prisma/client";

export async function seedQuestion(prisma) {
  await Promise.all(
    [
      { label: "¿Cuántos partidos jugaste en los últimos 12 meses? 🥎", code: "Q1", type: { connect: { code: "RADIO" } } },
      {
        label: "¿Cuál es tu frecuencia actual de juego? 📅",
        code: "Q2",
        type: { connect: { code: "RADIO" } }
      },
      { label: "¿Tenés antecedentes de jugar al tenis? 🎾", code: "Q3", type: { connect: { code: "RADIO" } } },
      { label: "¿Cómo estás con los golpes básicos? 🌶", code: "Q4", type: { connect: { code: "RADIO" } } },
      { label: "¿Cómo te llevás con las paredes? 🧱", code: "Q5", type: { connect: { code: "RADIO" } } }
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
