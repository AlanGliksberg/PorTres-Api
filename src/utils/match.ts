import { Match, Prisma } from "@prisma/client";
import { GetMatchesRequest, MATCH_STATUS, MatchFilters } from "../types/matchTypes";
import { GENDER, PlayerDTO } from "../types/playerTypes";
import { convertStringIntoArray, parsePagesFilters } from "./common";
import { createOrGetPlayers } from "./player";

export const createTeam = async (teamNumber: 1 | 2, players: PlayerDTO[] | undefined, allowedGender: GENDER) => {
  return {
    teamNumber,
    players: { connect: await createOrGetPlayers(players, allowedGender) }
  };
};

export const parseMatchFilters = (filters: GetMatchesRequest): MatchFilters => {
  const { page, pageSize, gender, status } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  let matchGenders = convertStringIntoArray<GENDER>(gender);
  let matchStatus = convertStringIntoArray<MATCH_STATUS>(status);

  return {
    genders: matchGenders,
    status: matchStatus,
    page: pageNumber,
    pageSize: pageSizeNumber
  };
};

export const getDBFilter = (filters: MatchFilters) => {
  const where: Prisma.MatchWhereInput = {};
  const { genders, status } = filters;
  if (genders && genders.length > 0) where.gender = { in: genders };
  if (status && status.length > 0) where.status = { name: { in: status } };
  return where;
};

export const parseMatches = (matches: Match[]) => {
  return matches.map((m) => {
    const date = m.dateTime.toISOString();
    return {
      ...m,
      date: date.split("T")[0],
      time: date.split("T")[1].substring(0, 5)
    };
  });
};
