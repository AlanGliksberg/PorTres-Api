import prisma from "../prisma/client";

export const getGenderById = async (id: number) => {
  return await prisma.gender.findUnique({
    where: {
      id
    }
  });
};
