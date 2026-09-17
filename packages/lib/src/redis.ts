import IORedis from "ioredis";

let _redis: IORedis | undefined;

export function getRedisClient() {
  if (!_redis) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    const useTls = url.startsWith("rediss://");

    _redis = new IORedis(url, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        // Exponential backoff up to 30s instead of endless 2-second log spamming
        const delay = Math.min(times * 1000, 30000);
        return delay;
      },
      ...(useTls ? { tls: {} } : {})
    });

    let lastLoggedErrorTime = 0;
    _redis.on("error", (err) => {
      // Throttle error logs to at most once every 30 seconds to keep server logs clean
      const now = Date.now();
      if (now - lastLoggedErrorTime > 30000) {
        console.error("[DevPulse] Redis connection error:", err.message);
        lastLoggedErrorTime = now;
      }
    });
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
