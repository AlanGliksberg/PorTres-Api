import { NotificationIntentType } from "@prisma/client";
import { NotificationIntentWithRelations } from "../types/notificationTypes";
import { PlayerAppliedToMatchEvent } from "../types/notifications";
import { getPlayerById } from "../utils/player";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short"
});

export const buildIntentCopy = async (intent: NotificationIntentWithRelations) => {
  const match = intent.match;
  const matchDate = match?.dateTime ? new Date(match.dateTime) : undefined;
  const formattedDate = matchDate ? dateFormatter.format(matchDate) : undefined;
  const location = match?.location ? match.location : undefined;

  switch (intent.type) {
    case NotificationIntentType.PLAYER_ADDED:
      return {
        title: "¡Te agregaron a un partido!",
        body: formattedDate
          ? `El partido es el ${formattedDate}${location ? ` en ${location}` : ""}. Preparate!`
          : "Revisá tus partidos, te sumaron a un nuevo encuentro.",
        data: {
          matchId: intent.matchId,
          reason: "player-added"
        }
      };
    case NotificationIntentType.PLAYER_APPLIED:
      const data = intent.payload as PlayerAppliedToMatchEvent;
      const player = await getPlayerById(data.playerAppliedId);
      return {
        title: "¡Se postularon a tu partido!",
        body: `${player?.firstName} quiere sumarse a tu partido en ${location} del día ${formattedDate} ¡Revisá su perfil!`,
        data: {
          matchId: intent.matchId,
          reason: "player-applied"
        }
      };
    // case NotificationIntentType.MATCH_REMINDER_1H:
    //   return {
    //     title: "Tu partido comienza en 1 hora",
    //     body: location
    //       ? `Nos vemos en ${location}. Recordá estar a tiempo.`
    //       : "Recordatorio: tu partido empieza en 1 hora.",
    //     data: {
    //       matchId: intent.matchId,
    //       reason: "match-reminder-1h"
    //     }
    //   };
    // case NotificationIntentType.MATCH_POST_1H:
    //   return {
    //     title: "¿Cómo te fue en el partido?",
    //     body: "Contanos cómo resultó el encuentro y mantené tu perfil actualizado.",
    //     data: {
    //       matchId: intent.matchId,
    //       reason: "match-post-1h"
    //     }
    //   };
    default:
      return {
        title: "PorTres",
        body: "Tienes novedades en PorTres.",
        data: {
          matchId: intent.matchId,
          reason: "generic"
        }
      };
  }
};
