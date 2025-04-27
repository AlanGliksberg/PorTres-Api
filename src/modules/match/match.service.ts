import { MatchStatus, User } from '@prisma/client';
import prisma from '../../prisma/client';
import { MatchDTO } from '../../types/matchTypes';
import { MATCH_STATUS } from '../../constants/matchStatus';
import { createTeam } from '../../utils/match';
import { getPlayerByUserId } from '../../utils/player';

export const createMatch = async (user: User, data: MatchDTO) => {
  const { date, time, location, category, pointsDeviation, teams } = data;

  const matchStatus: MatchStatus | null = await prisma.matchStatus.findUnique({
    where: {
      name: teams?.team1?.length + teams?.team2?.length === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING
    }
  });

  if (!matchStatus) throw new Error("no match status");

  const player = await getPlayerByUserId(user.id);
  const asd = {
    date: new Date(date),
    time,
    location,
    category,
    pointsDeviation,
    statusId: matchStatus.id,
    creatorPlayerId: player!.id,
    teams: {
      create: [
        await createTeam(1, teams?.team1),
        await createTeam(2, teams?.team2),
      ]
    }
  }
  console.log("asd", JSON.stringify(asd))

  const match = await prisma.match.create({
    data: asd
  });

  return match;
};

export const getMatches = () => {
  return prisma.match.findMany();
};
