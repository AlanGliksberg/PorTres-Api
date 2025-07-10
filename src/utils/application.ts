import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { APPLICATION_STATUS, ApplicationWithRelations } from "../types/application";

export const getApplicationById = async (
  applicationId: number,
  include?: Prisma.ApplicationInclude
): Promise<ApplicationWithRelations> => {
  return await prisma.application.findUnique({
    where: {
      id: applicationId
    },
    include
  });
};

export const changeApplicationStatus = async (applicationId: number, newStatus: APPLICATION_STATUS) => {
  return await prisma.application.update({
    where: {
      id: applicationId
    },
    data: {
      status: {
        connect: { code: newStatus }
      }
    }
  });
};
