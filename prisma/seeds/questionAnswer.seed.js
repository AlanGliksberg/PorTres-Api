import { PrismaClient } from "@prisma/client";

export async function seedQuestionAnswer(prisma) {
  await Promise.all(
    [
      { code: "A1.1", label: "3 meses o menos", points: 10, question: { connect: { code: "Q1" } } },
      { code: "A1.2", label: "6 meses", points: 20, question: { connect: { code: "Q1" } } },
      { code: "A1.3", label: "1 año", points: 30, question: { connect: { code: "Q1" } } },
      { code: "A1.4", label: "2 años o más", points: 40, question: { connect: { code: "Q1" } } },
      { code: "A2.1", label: "No", points: 10, question: { connect: { code: "Q2" } } },
      { code: "A2.2", label: "Sí", points: 30, question: { connect: { code: "Q2" } } },
      { code: "A3.1", label: "Menos de 3", points: 10, question: { connect: { code: "Q3" } } },
      { code: "A3.2", label: "Entre 3 y 6", points: 20, question: { connect: { code: "Q3" } } },
      { code: "A3.3", label: "Más de 6", points: 30, question: { connect: { code: "Q3" } } },
      { code: "A4.1", label: "Principiante", points: 10, question: { connect: { code: "Q4" } } },
      { code: "A4.2", label: "Intermedio", points: 20, question: { connect: { code: "Q4" } } },
      { code: "A4.3", label: "Avanzado", points: 30, question: { connect: { code: "Q4" } } },
      { code: "A5.1", label: "Se me complica", points: 10, question: { connect: { code: "Q5" } } },
      { code: "A5.2", label: "Rebotes básicos", points: 20, question: { connect: { code: "Q5" } } },
      { code: "A5.3", label: "Uso táctico", points: 30, question: { connect: { code: "Q5" } } },
      { code: "A5.4", label: "Domino las paredes", points: 40, question: { connect: { code: "Q5" } } }
    ].map(
      async (answer) =>
        await prisma.questionAnswer.upsert({
          where: { code: answer.code },
          update: { label: answer.label, points: answer.points, question: answer.question },
          create: answer
        })
    )
  );
  console.log("QuestionAnswer records created!");
}
