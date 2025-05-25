import prisma from "../prisma/client";

export const getGenderById = async (id: string) => {
  return await prisma.gender.findUnique({
    where: {
      id
    }
  });
};
