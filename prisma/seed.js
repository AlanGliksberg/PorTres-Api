import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await Promise.all(
        [
            { name: 'PENDING', description: 'The match is waiting for players.' },
            { name: 'CLOSED', description: 'The match has been confirmed with players.' },
            { name: 'COMPLETED', description: 'The match has finished and results were loaded.' }
        ].map(status =>
            prisma.matchStatus.upsert({
                where: { name: status.name },
                update: {},
                create: status
            })
        )
    );

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
