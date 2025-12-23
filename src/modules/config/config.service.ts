import prisma from "../../prisma/client";

export const getLatestConfig = () => {
  return prisma.appConfig.findFirst();
};
