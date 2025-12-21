import { PrismaClient } from "@prisma/client";

const MATCH_CLUBS = [
  {
    id: 1,
    name: "Rocket Padel Center",
    description: "Alejandro Magariños Cervantes 2455"
  },
  {
    id: 2,
    name: "Roma 1 / Roma 2",
    description: "Roma 554"
  },
  {
    id: 3,
    name: "Catalinas Padel",
    description: "Azopardo 1560"
  },
  {
    id: 4,
    name: "Padel Bricks",
    description: "Av. de los Constituyentes 6153"
  },
  {
    id: 5,
    name: "Kick FC Padel",
    description: "Saladillo 2051"
  },
  {
    id: 6,
    name: "Babolat Padel Center",
    description: "Av. Figueroa Alcorta 7101 (Club CASA)"
  },
  {
    id: 7,
    name: "Lasaigues Padel Caballito (Tejedor)",
    description: "Tejedor 244"
  },
  {
    id: 8,
    name: "Lasaigues Padel Sheraton",
    description: "San Martín 1225 - 1275"
  },
  {
    id: 9,
    name: "Lasaigues Padel Ferro",
    description: "Av. Avellaneda 1240 (Dentro de Ferro)"
  },
  {
    id: 10,
    name: "Lasaigues Padel El Abierto",
    description: "Galván 3920"
  },
  {
    id: 11,
    name: "Avant Club / Cabildo Club",
    description: "Avenida Cabildo 2160"
  },
  {
    id: 12,
    name: "El Predio Ciudad Padel",
    description: "Arregui 2540"
  },
  {
    id: 13,
    name: "Las Palmeras Padel y Fútbol",
    description: "E. Holmberg 3430"
  },
  {
    id: 14,
    name: "Araoz Padel (Palermo)",
    description: "Aráoz 2456"
  },
  {
    id: 15,
    name: "Araoz Padel Parque Patricios",
    description: "Av. Chiclana 3346"
  },
  {
    id: 16,
    name: "World Padel Center CABA",
    description: "Dr. Luis Beláustegui 3041"
  },
  {
    id: 17,
    name: "Delpa Padel",
    description: "José Hernández 1373"
  },
  {
    id: 18,
    name: "El Guardián Pádel Center",
    description: "Carrasco 825"
  },
  {
    id: 19,
    name: "Puro Padel Club",
    description: "Cosquín 1685"
  },
  {
    id: 20,
    name: "Club de Pádel Kristal Padel",
    description: "Maza 631"
  },
  {
    id: 21,
    name: "Club La Estación Padel",
    description: "Bacacay 2836"
  },
  {
    id: 22,
    name: "Pasaje del Sol Padel Yerbal",
    description: "Yerbal 3740"
  },
  {
    id: 23,
    name: "Paddle tennis Primo",
    description: "Chile 1566"
  },
  {
    id: 24,
    name: "Polideportivo Martín Fierro",
    description: "Oruro 1300"
  },
  {
    id: 25,
    name: "Parque Norte",
    description: "Costanera Norte"
  },
  {
    id: 26,
    name: "Megaplex",
    description: "Virrey Avilés 2705"
  },
  {
    id: 27,
    name: "Pádel Curapaligüe",
    description: "Curapaligüe 760"
  },
  {
    id: 28,
    name: "Distrito Padel",
    description: "Av. Sarmiento 4270"
  },
  {
    id: 29,
    name: "Distrito Pasco Padel",
    description: "Cochabamba 2258"
  },
  {
    id: 30,
    name: "La Normanda Padel y Gym",
    description: "Delgado 864"
  },
  {
    id: 31,
    name: "Centenario Padel Club (CPC)",
    description: "Av. Díaz Vélez 5262"
  },
  {
    id: 32,
    name: "First Padel Center",
    description: "Av. Francisco Beiró 2720"
  },
  {
    id: 33,
    name: "SB5 Sports Parque Sarmiento",
    description: "Av. Triunvirato 5960"
  },
  {
    id: 34,
    name: "Central Paddle Gym",
    description: "Valentín Gómez 3143"
  },
  {
    id: 35,
    name: "Doble 5 Padel (KDT)",
    description: "Jerónimo Salguero 3450"
  },
  {
    id: 36,
    name: "Sportium Padel Alcorta",
    description: "Recoleta 2514"
  },
  {
    id: 37,
    name: "Club Padel Ya",
    description: "Av. Rivadavia 8511"
  },
  {
    id: 38,
    name: "Avellaneda Padel Club (CABA)",
    description: "Av. Rivadavia 640"
  },
  {
    id: 39,
    name: "Quality Padel Club",
    description: "15 de Noviembre de 1889, 2365"
  },
  {
    id: 40,
    name: "El Garage Padel",
    description: "Marcos Sastre 3152"
  }
];

export async function seedMatchClub(prisma) {
  await Promise.all(
    MATCH_CLUBS.map((club) =>
      prisma.matchClub.upsert({
        where: { id: club.id },
        update: {
          name: club.name,
          description: club.description,
          enabled: club.enabled ?? true
        },
        create: club
      })
    )
  );

  console.log("MatchClub records created!");
}

