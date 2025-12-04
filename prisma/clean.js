import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Tablas específicas a truncar
  const tables = [
    "Application",
    "ApplicationStatus",
    "Category",
    "Gender",
    "Match",
    "MatchClub",
    "MatchStatus",
    "NotificationIntent",
    "Player",
    "PlayerPosition",
    "PlayerRankingChange",
    "Question",
    "QuestionAnswer",
    "QuestionType",
    "Set",
    "Team",
    "ExpoPushToken",
  ];

  // Construir la instrucción TRUNCATE
  const tableNames = tables.map((t) => `public."${t}"`);
  const truncateSql = `TRUNCATE TABLE ${tableNames.join(", ")} CASCADE;`;

  await prisma.$executeRawUnsafe(truncateSql);
  console.log("✅ Tablas truncadas: " + tables.join(", "));

  // Borrar usuarios que no son de Apple
  const deleteNonAppleUsersSql =
    'DELETE FROM public."User" WHERE "socialPlatform" IS NULL OR "socialPlatform" <> \'APPLE\'';
  await prisma.$executeRawUnsafe(deleteNonAppleUsersSql);
  console.log("✅ Usuarios no Apple eliminados");
}

main()
  .catch((e) => {
    console.error("❌ Error en pclean:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
