import { NotificationIntentType } from "@prisma/client";
import { NotificationIntentWithRelations } from "../types/notificationTypes";
import { PlayerAddedToMatchEvent, PlayerAppliedToMatchEvent } from "../types/notifications";
import { getPlayerById } from "../utils/player";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "UTC"
});

export const buildIntentCopy = async (intent: NotificationIntentWithRelations) => {
  const match = intent.match;
  const matchDate = match?.dateTime ? new Date(match.dateTime) : undefined;
  const formattedDate = matchDate ? dateFormatter.format(matchDate) : undefined;
  const location = match?.location ? match.location : undefined;

  switch (intent.type) {
    case NotificationIntentType.PLAYER_ADDED:
      const playerAddedData = intent.payload as PlayerAddedToMatchEvent;
      const player1 = await getPlayerById(playerAddedData.addedByPlayerId);
      return {
        title: "¡Te agregaron a un partido!",
        body: `${player1?.firstName} creó un partido en ${location} para el día ${formattedDate} y te agregó.`,
        data: {
          matchId: intent.matchId,
          reason: "player-added"
        }
      };
    case NotificationIntentType.PLAYER_APPLIED:
      const playerAppliedData = intent.payload as PlayerAppliedToMatchEvent;
      const player2 = await getPlayerById(playerAppliedData.playerAppliedId);
      return {
        title: "¡Se postularon a tu partido!",
        body: `${player2?.firstName} quiere sumarse a tu partido en ${location} del día ${formattedDate} ¡Revisá su perfil!`,
        data: {
          matchId: intent.matchId,
          reason: "player-applied"
        }
      };
    case NotificationIntentType.MATCH_CANCELLED:
      return {
        title: "Partido cancelado",
        body: `El partido en ${location} del día ${formattedDate} no se va a jugar. Te avisamos si se reprograma`,
        data: {
          matchId: intent.matchId,
          reason: "match-cancelled"
        }
      };
    case NotificationIntentType.PLAYER_REMOVED:
      return {
        title: "Te eliminaron del partido",
        body: `El organizador canceló tu participación en el partido en ${location} del día ${formattedDate}`,
        data: {
          matchId: intent.matchId,
          reason: "player-removed"
        }
      };
    case NotificationIntentType.APPLICATION_REJECTED:
      return {
        title: "Solicitud rechazada",
        body: `Rechazaron tu solicitud para el partido en ${location} del día ${formattedDate} Hay más partidos esperando por vos.`,
        data: {
          matchId: intent.matchId,
          reason: "application-rejected"
        }
      };
    case NotificationIntentType.MATCH_CONFIRMED:
      return {
        title: "¡Partido confirmado!",
        body: `✅ El partido en ${location} el del día ${formattedDate} está confirmado. ¡A prepararse!`,
        data: {
          matchId: intent.matchId,
          reason: "match-confirmed"
        }
      };
    case NotificationIntentType.MATCH_REMINDER_1H:
      return {
        title: "¡Calentá que entrás!",
        body: `Falta una hora para tu partido en ${location}.`,
        data: {
          matchId: intent.matchId,
          reason: "match-reminder-1h"
        }
      };
    case NotificationIntentType.MATCH_LOAD_RESULT:
      return {
        title: "Actualizá el resultado",
        body: `📝 ¿Cómo salió el partido en ${location}? Cargá el resultado para mantener actualizado tu ranking`,
        data: {
          matchId: intent.matchId,
          reason: "match-reminder-1h"
        }
      };
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
