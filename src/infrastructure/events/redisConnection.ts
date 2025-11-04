import IORedis, { RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export const createRedisConnection = () => {
  const connection = new IORedis(redisUrl, baseOptions);
  let shuttingDown = false;

  connection.on("error", (error) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error("[Redis] connection error - stopping application", error);

    // Exit on next tick to allow logs to flush and avoid repeated error loops.
    setImmediate(() => process.exit(1));
  });

  return connection;
};
