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
        update: { description: status.description },
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
        update: {
          name: gender.name,
          pluralName: gender.pluralName
        },
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
        update: {
          description: position.description,
          order: position.order
        },
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
      description: `Suma ${i + 7}`,
      initialPoints: 0,
      gender: { connect: { code: "X" } }
    }))
  );

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
  );
  console.log("Category records created!");

  [{ code: "SELECT" }, { code: "RADIO" }].map(
    async (type) => await prisma.questionType.upsert({ where: { code: type.code }, update: {}, create: type })
  );
  console.log("QuestionType records created!");

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
      update: { label: question.label, type: question.type },
      create: question
    });
  });
  console.log("Question records created!");

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
  );

  console.log("QuestionAnswer records created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
