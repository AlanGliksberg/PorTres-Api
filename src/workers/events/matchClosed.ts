import { Job } from "bullmq";
import { MatchClosedEvent } from "../../types/notifications";
import prisma from "../../prisma/client";
import { MATCH_STATUS } from "../../types/matchTypes";

export const handleMatchClosed = async (job: Job<MatchClosedEvent>) => {
  const { data } = job;
  await prisma.match.update({
    where: { id: data.matchId },
    data: { status: { connect: { code: MATCH_STATUS.CLOSED } } }
  });
};
