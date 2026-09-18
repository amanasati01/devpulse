import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const workerUrl = process.env.WORKER_URL || process.env.NEXT_PUBLIC_WORKER_URL || "https://devpulse-worker.onrender.com";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(workerUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      return NextResponse.json({
        status: "online",
        url: workerUrl,
        response: text.trim(),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      {
        status: "unhealthy",
        url: workerUrl,
        statusCode: res.status,
        timestamp: new Date().toISOString()
      },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "offline",
        url: workerUrl,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
