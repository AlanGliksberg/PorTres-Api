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
  const tables = ["Application", "Match", "User", "Team", "Set", "Player", "Question", "ExpoPushToken", "NotificationIntent", "PlayerRankingChange"];

  // Construir la instrucción TRUNCATE
  const tableNames = tables.map((t) => `public."${t}"`);
  const truncateSql = `TRUNCATE TABLE ${tableNames.join(", ")} CASCADE;`;

  await prisma.$executeRawUnsafe(truncateSql);
  console.log("✅ Tablas truncadas: " + tables.join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Error en pclean:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
