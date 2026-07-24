import { NextResponse, type NextRequest } from "next/server";
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
    // Keep middleware functional when Upstash REST creds are not configured.
    return false;
  }
  const count = await upstashRedis.incr(key);
  if (count === 1) {
    await upstashRedis.expire(key, 60);
  }
  return count > 120;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isWebhook = pathname.startsWith("/api/webhooks/");
  const isAuth = pathname.startsWith("/api/auth");
  const isDashboard = pathname.startsWith("/dashboard");

  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value ??
    req.cookies.get("next-auth.session-token")?.value ??
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (isDashboard && !sessionToken) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (pathname.startsWith("/api") && !isWebhook && !isAuth) {
    const identifier = req.ip ?? "anon";
    const limited = await isRateLimited(`devpulse:ratelimit:${identifier}`);
    if (limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};

