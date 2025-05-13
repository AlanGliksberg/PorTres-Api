import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";

export const creatUser = async (data: Prisma.UserCreateInput) => {
  const user = await prisma.user.create({
    data,
    include: {
      player: true
    }
  });

  return user;
};
