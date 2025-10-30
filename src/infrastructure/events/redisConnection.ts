import IORedis, { RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export const createRedisConnection = () => {
  const connection = new IORedis(redisUrl, baseOptions);
  connection.on("error", (error) => {
    console.error("[Redis] connection error", error);
  });
  return connection;
};
