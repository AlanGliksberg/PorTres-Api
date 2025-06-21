// scripts/pclean.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Tablas específicas a truncar
  const tables = ["Application", "Match", "User", "Team", "Set", "Player", "Question"];

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
