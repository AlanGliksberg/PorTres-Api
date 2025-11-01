import { NotificationIntentStatus, NotificationIntentType } from "@prisma/client";
import prisma from "../../prisma/client";
import { notificationQueue } from "../../infrastructure/events/notification.queue";
import { NotificationIntentWithRelations, NotificationJobType } from "../../types/notificationTypes";
import { getMatchStatusById } from "../../utils/match";
import { MATCH_STATUS } from "../../types/matchTypes";

type CreateIntentParams = {
  type: NotificationIntentType;
  matchId: number;
  playerId?: number;
  scheduledAt: Date;
  payload?: any;
  dedupeKey?: string;
};

const buildDedupeKey = (params: CreateIntentParams) => {
  if (params.dedupeKey) return params.dedupeKey;
  const parts = [params.type, params.matchId.toString()];
  if (params.playerId) parts.push(params.playerId.toString());
  parts.push(params.scheduledAt.toISOString());
  return parts.join("_");
};

export const createNotificationIntent = async (params: CreateIntentParams) => {
  const scheduledAt = params.scheduledAt;
  const dedupeKey = buildDedupeKey(params);

  const intent = await prisma.notificationIntent.upsert({
    where: { dedupeKey },
    update: {
      status: NotificationIntentStatus.PENDING,
      scheduledAt,
      payload: params.payload,
      error: null,
      executedAt: null
    },
    create: {
      type: params.type,
      matchId: params.matchId,
      playerId: params.playerId,
      scheduledAt,
      payload: params.payload,
      dedupeKey
    }
  });

  const delay = Math.max(0, intent.scheduledAt.getTime() - Date.now());
  const jobId = `notification-intent_${intent.id}_${intent.scheduledAt.getTime()}`;

  await notificationQueue.add(
    NotificationJobType.PROCESS_NOTIFICATION_INTENT_JOB,
    { intentId: intent.id },
    {
      jobId,
      delay
    }
  );

  if (delay > 0 && intent.status !== NotificationIntentStatus.SCHEDULED) {
    await prisma.notificationIntent.update({
      where: { id: intent.id },
      data: { status: NotificationIntentStatus.SCHEDULED }
    });
  }

  return intent;
};

export const markIntentProcessing = async (intentId: number) => {
  return await prisma.notificationIntent.update({
    where: { id: intentId },
    data: { status: NotificationIntentStatus.PROCESSING }
  });
};

export const markIntentCompleted = async (intentId: number, warningMessage?: string) => {
  return await prisma.notificationIntent.update({
    where: { id: intentId },
    data: {
      status: NotificationIntentStatus.COMPLETED,
      executedAt: new Date(),
      error: warningMessage ?? null
    }
  });
};

export const markIntentFailed = async (intentId: number, error: Error | string) => {
  return await prisma.notificationIntent.update({
    where: { id: intentId },
    data: {
      status: NotificationIntentStatus.FAILED,
      error: typeof error === "string" ? error : error.message,
      executedAt: new Date()
    }
  });
};

export const cancelIntent = async (intentId: number) => {
  const intent = await prisma.notificationIntent.findUnique({ where: { id: intentId } });
  if (!intent) return;

  await prisma.notificationIntent.update({
    where: { id: intent.id },
    data: { status: NotificationIntentStatus.CANCELLED }
  });
};

export const hasToSendNotification = async (intent: NotificationIntentWithRelations) => {
  switch (intent.type) {
    case NotificationIntentType.MATCH_REMINDER_1H:
      // Solo mandar recordatorio si el partido sigue confirmado
      return (await getMatchStatusById(intent.match.statusId))?.code === MATCH_STATUS.COMPLETED;
    case NotificationIntentType.MATCH_LOAD_RESULT:
      return !intent.match.resultLoadedByTeam;
    default:
      return true;
  }
};
