import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";

export const getApplicationById = async (applicationId: string, include?: Prisma.ApplicationInclude) => {
  return await prisma.application.findUnique({
    where: {
      id: applicationId
    },
    include
  });
};
