import { ApplicationStatus, Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { ApplicationWithRelations } from "../types/application";

export const getApplicationById = async (
  applicationId: string,
  include?: Prisma.ApplicationInclude
): Promise<ApplicationWithRelations> => {
  return await prisma.application.findUnique({
    where: {
      id: applicationId
    },
    include
  });
};

export const changeApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
  return await prisma.application.update({
    where: {
      id: applicationId
    },
    data: {
      status: newStatus
    }
  });
};
