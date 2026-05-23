import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis: Redis = new Proxy({} as Redis, {
  get(_, prop) {
    const client = (globalForRedis.redis ??= new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }));
    return Reflect.get(client, prop);
  },
});
