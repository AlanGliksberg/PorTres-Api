import { Job } from "bullmq";
import { ResultCreatedEvent } from "../../types/notifications";
import { acceptMatchResult, getMatchById } from "../../modules/match/match.service";

export const handleResultAutoAccepted = async (job: Job<ResultCreatedEvent>) => {
  const { data } = job;
  const match = await getMatchById(data.matchId);

  // Si ya hay un ganador es porque ya se acepto el resultado
  if (match?.winnerTeamNumber) return;

  await acceptMatchResult(match!, null, false);
};
