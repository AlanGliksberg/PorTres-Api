export async function seedQuestionAnswer(prisma) {
  const answers = [
    { code: "A1.1", label: "0-5", points: 10, question: { connect: { code: "Q1" } } },
    { code: "A1.2", label: "6-20", points: 20, question: { connect: { code: "Q1" } } },
    { code: "A1.3", label: "21-50", points: 30, question: { connect: { code: "Q1" } } },
    { code: "A1.4", label: "51+", points: 40, question: { connect: { code: "Q1" } } },
    { code: "A2.1", label: "1 vez al mes o menos", points: 10, question: { connect: { code: "Q2" } } },
    { code: "A2.2", label: "2 o 3 veces al mes", points: 20, question: { connect: { code: "Q2" } } },
    { code: "A2.3", label: "1 vez por semana", points: 30, question: { connect: { code: "Q2" } } },
    { code: "A2.4", label: "2 o más veces por semana", points: 40, question: { connect: { code: "Q2" } } },
    { code: "A3.1", label: "No", points: 10, question: { connect: { code: "Q3" } } },
    { code: "A3.2", label: "Recreativo/club", points: 20, question: { connect: { code: "Q3" } } },
    { code: "A3.3", label: "Competitivo/Interclubes/Federado", points: 40, question: { connect: { code: "Q3" } } },
    {
      code: "A4.1",
      label: "Estoy aprendiendo, me cuesta controlar dirección y ritmo",
      points: 0,
      question: { connect: { code: "Q4" } }
    },
    { code: "A4.2", label: "Mantengo peloteos pudiendo agregar alguna variación simple (dirección/profundidad)", points: 15, question: { connect: { code: "Q4" } } },
    { code: "A4.3", label: "Puedo pelotear y alternar entre golpes ofensivos y defensivos, usando el globo como recurso", points: 30, question: { connect: { code: "Q4" } } },
    { code: "A5.1", label: "Las evito o pierdo el control ", points: 0, question: { connect: { code: "Q5" } } },
    { code: "A5.2", label: "Salida de una pared básica con control", points: 15, question: { connect: { code: "Q5" } } },
    { code: "A5.3", label: "Uso paredes a propósito, incluso doble pared básica", points: 30, question: { connect: { code: "Q5" } } }
  ];

  const codes = answers.map((answer) => answer.code);

  // Remove legacy answers (e.g. A5.4) so the DB mirrors the current seed list.
  await prisma.questionAnswer.deleteMany({
    where: { code: { notIn: codes } }
  });

  await Promise.all(
    answers.map(
      async (answer) =>
        await prisma.questionAnswer.upsert({
          where: { code: answer.code },
          update: answer,
          create: answer
        })
    )
  );
  console.log("QuestionAnswer records created!");
}
