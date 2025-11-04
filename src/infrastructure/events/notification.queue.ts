import { Queue } from "bullmq";
import { createRedisConnection } from "./redisConnection";
import { NotificationJobData } from "../../types/notifications";
import { NotificationJobType } from "../../types/notificationTypes";

const queueConnection = createRedisConnection();
export const notificationQueue = new Queue<NotificationJobData>(NotificationJobType.NOTIFICATION_QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3_000
    },
    removeOnComplete: 1_000,
    removeOnFail: false
  }
});
