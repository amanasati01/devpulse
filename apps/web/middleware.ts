import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Redis } from "@upstash/redis/cloudflare";

const upstashRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

async function isRateLimited(key: string) {
  if (!upstashRedis) {
    // Keep middleware functional in local/dev when Upstash REST creds are not configured.
    return false;
  }
  const count = await upstashRedis.incr(key);
  if (count === 1) {
    await upstashRedis.expire(key, 60);
  }
  return count > 120;
}

export default auth(async (req) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  const isWebhook = pathname.startsWith("/api/webhooks/");
  const guarded = pathname.startsWith("/dashboard") || pathname.startsWith("/api");

  if (guarded && !isWebhook && !session?.user?.orgId && !pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (pathname.startsWith("/api") && !isWebhook) {
    const identifier = session?.user?.orgId ?? req.ip ?? "anon";
    const limited = await isRateLimited(`devpulse:ratelimit:${identifier}`);
    if (limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};
