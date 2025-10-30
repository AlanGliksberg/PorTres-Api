import "dotenv/config";
import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../infrastructure/events/redisConnection";
import prisma from "../prisma/client";
import {
  createNotificationIntent,
  markIntentCompleted,
  markIntentFailed,
  markIntentProcessing
} from "../modules/notifications/intent.service";
import { NotificationIntentStatus } from "@prisma/client";
import { preparePlayerTokens, pruneInvalidTokens, sendExpoMessages } from "../modules/notifications/expo.service";
import { PlayerAddedToMatchEvent, ProcessNotificationIntentJobData, NotificationJobData } from "../types/notifications";
import { DispatchResult, NotificationIntentWithRelations, NotificationJobType } from "../types/notificationTypes";
import { buildIntentCopy } from "./messages";
import { handlePlayerAddedToMatch } from "./events/playerAddedToMatch";

const dispatchIntent = async (intent: NotificationIntentWithRelations): Promise<DispatchResult> => {
  if (!intent.player) {
    const warning = `[Notifications] Intent ${intent.id} sin jugador asociado, se marca como completado.`;
    console.warn(warning);
    return { delivered: 0, failed: 0, warning };
  }

  const preparedTokens = preparePlayerTokens(intent.player.expoPushTokens);
  if (preparedTokens.length === 0) {
    const warning = `[Notifications] Intent ${intent.id} sin tokens Expo válidos para playerId=${intent.playerId}`;
    console.warn(warning);
    return { delivered: 0, failed: 0, warning };
  }

  const { title, body, data } = buildIntentCopy(intent);
  const messages = preparedTokens.map(({ token }) => ({
    to: token,
    sound: "default" as const,
    priority: "high" as const,
    title,
    body,
    data: {
      ...data,
      intentId: intent.id,
      type: intent.type,
      scheduledAt: intent.scheduledAt.toISOString()
    }
  }));

  const tickets = await sendExpoMessages(messages);
  await pruneInvalidTokens(preparedTokens, tickets);

  const delivered = tickets.filter((ticket) => ticket.status === "ok").length;
  const failed = tickets.length - delivered;

  if (delivered === 0) {
    const firstError = tickets.find((ticket) => ticket.status === "error");
    throw new Error(firstError?.message || "Expo push failed");
  }

  if (failed > 0) {
    const warning = `[Notifications] Intent ${intent.id} entregó ${delivered}/${tickets.length}. Tokens inválidos o con error: ${failed}`;
    console.warn(warning);
    return { delivered, failed, warning };
  }

  console.log(`[Notifications] Intent ${intent.id} enviado a ${delivered} token(s)`);
  return { delivered, failed };
};

const handleNotificationIntentJob = async (job: Job<ProcessNotificationIntentJobData>) => {
  const { intentId } = job.data;
  const intent = await prisma.notificationIntent.findUnique({
    where: { id: intentId },
    include: {
      player: {
        include: { expoPushTokens: true }
      },
      match: true
    }
  });

  if (!intent) {
    console.warn(`[Notifications] Intent ${intentId} no encontrado | jobId=${job.id}`);
    return;
  }

  if (intent.status === NotificationIntentStatus.CANCELLED || intent.status === NotificationIntentStatus.COMPLETED) {
    console.log(`[Notifications] Intent ${intent.id} en estado ${intent.status}, se omite`);
    return;
  }

  if (intent.scheduledAt.getTime() > Date.now() + 5_000) {
    console.log(
      `[Notifications] Intent ${intent.id} ejecutado antes de tiempo, se reprograma. scheduledAt=${intent.scheduledAt.toISOString()}`
    );
    await createNotificationIntent({
      type: intent.type,
      matchId: intent.matchId,
      playerId: intent.playerId ?? undefined,
      scheduledAt: intent.scheduledAt,
      payload: intent.payload as Record<string, unknown> | undefined,
      dedupeKey: intent.dedupeKey || undefined
    });
    return;
  }

  await markIntentProcessing(intent.id);

  try {
    const result = await dispatchIntent(intent);
    await markIntentCompleted(intent.id, result.warning);
  } catch (error: any) {
    await markIntentFailed(intent.id, error);
    throw error;
  }
};

const worker = new Worker<NotificationJobData, any, NotificationJobType>(
  NotificationJobType.NOTIFICATION_QUEUE_NAME,
  async (job) => {
    switch (job.name) {
      case NotificationJobType.PLAYER_ADDED_TO_MATCH_JOB:
        await handlePlayerAddedToMatch(job as Job<PlayerAddedToMatchEvent>);
        break;
      case NotificationJobType.PROCESS_NOTIFICATION_INTENT_JOB:
        await handleNotificationIntentJob(job as Job<ProcessNotificationIntentJobData>);
        break;
      default:
        console.warn(`[Notifications] Job desconocido recibido: ${job.name}`);
    }
  },
  {
    connection: createRedisConnection()
  }
);

worker.on("ready", () => console.log("[Notifications] Worker listo"));
worker.on("completed", (job) => {
  console.log(`[Notifications] Job completado ${job.id}`);
});
worker.on("failed", (job, error) => {
  console.error(`[Notifications] Job fallido ${job?.id}`, error);
});
