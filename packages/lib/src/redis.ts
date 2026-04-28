import IORedis from "ioredis";

let _redis: IORedis | undefined;

export function getRedisClient() {
  if (!_redis) {
    _redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  }
  return _redis;
}

export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const redis = getRedisClient();
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await loader();
  await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  return data;
}

export function orgScopedKey(orgId: string, resource: string) {
  return `devpulse:${orgId}:${resource}`;
}
