import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Insertar los registros en MatchStatus, incluyendo el campo description
    await prisma.matchStatus.createMany({
        data: [
            { name: 'WAITING', description: 'The match is waiting for players.' },
            { name: 'INCOMPLETE', description: 'The match has not been completed.' },
            { name: 'CONFIRMED', description: 'The match has been confirmed with players.' }
        ],
    });

    console.log('MatchStatus records created!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
