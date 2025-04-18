import prisma from '../../prisma/client';

export const createMatch = (data: any) => {
  return prisma.match.create({
    data
  });
};

export const getMatches = () => {
  return prisma.match.findMany();
};
