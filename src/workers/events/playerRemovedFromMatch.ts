import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { PlayerRemovedFromMatchEvent } from "../../types/notifications";
import { MATCH_STATUS } from "../../types/matchTypes";

export const handlePlayerRemovedFromMatch = async (job: Job<PlayerRemovedFromMatchEvent>) => {
  const { data } = job;

  const isCreator = data.deletedById === data.creatorPlayerId;

  if (isCreator) {
    // si soy el creador y me elimino a mi mismo -> no noti
    if (data.deletedById === data.deletedPlayerId) return;
    else {
      // si soy el creador y elimino a otro -> noti a jugador eliminado
      await createNotificationIntent({
        type: NotificationIntentType.PLAYER_REMOVED,
        matchId: data.matchId,
        playerId: data.deletedPlayerId,
        scheduledAt: new Date(),
        payload: data,
        dedupeKey: `PLAYER_REMOVED:${data.matchId}:${data.deletedPlayerId}`
      });
    }
  } else {
    // si no soy el creador y me elimino a mi mismo ->
    if (data.status === MATCH_STATUS.COMPLETED) {
      // - si esta en completed -> noti a jugadores (no al eliminado ni al creador)
      data.playerIds
        .filter((pid) => pid !== data.deletedPlayerId && pid !== data.creatorPlayerId)
        .forEach(async (playerId) => {
          await createNotificationIntent({
            type: NotificationIntentType.PLAYER_CANCELLED,
            matchId: data.matchId,
            playerId: playerId,
            scheduledAt: new Date(),
            payload: data,
            dedupeKey: `PLAYER_CANCELLED:${data.matchId}:${playerId}`
          });
        });
    }

    // - si esta en pending o completed -> noti a creador
    await createNotificationIntent({
      type: NotificationIntentType.PLAYER_CANCELLED_CREATOR,
      matchId: data.matchId,
      playerId: data.creatorPlayerId,
      scheduledAt: new Date(),
      payload: data,
      dedupeKey: `PLAYER_CANCELLED_CREATOR:${data.matchId}:${data.creatorPlayerId}`
    });
  }
};
