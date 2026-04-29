import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@devpulse/db";
import { getProcessGithubEventQueue } from "@devpulse/lib/src/queue";
import { githubWebhookHeadersSchema, verifyGithubHmac } from "@devpulse/lib/src/validation";

export async function POST(request: NextRequest) {
  console.log("[DevPulse] Webhook received:", request.method, request.url);

  const rawBody = await request.text();
  const headers = githubWebhookHeadersSchema.safeParse({
    "x-github-event": request.headers.get("x-github-event"),
    "x-github-delivery": request.headers.get("x-github-delivery") ?? undefined,
    "x-hub-signature-256": request.headers.get("x-hub-signature-256")
  });
  if (!headers.success) {
    console.warn("[DevPulse] Webhook rejected: invalid headers", headers.error.flatten());
    return NextResponse.json({ error: "Invalid headers" }, { status: 400 });
  }

  const valid = verifyGithubHmac(
    rawBody,
    headers.data["x-hub-signature-256"],
    process.env.GITHUB_WEBHOOK_SECRET!
  );
  if (!valid) {
    console.warn("[DevPulse] Webhook rejected: invalid HMAC signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, any>;
  const orgSlug = payload.organization?.login ?? payload.repository?.owner?.login ?? "default";
  console.log("[DevPulse] Processing event:", headers.data["x-github-event"], "org:", orgSlug);

  const org = await prisma.organization.upsert({
    where: { slug: orgSlug.toLowerCase() },
    update: {},
    create: { slug: orgSlug.toLowerCase(), name: orgSlug }
  });

  const event = await prisma.webhookEvent.create({
    data: {
      orgId: org.id,
      source: "github",
      eventType: headers.data["x-github-event"],
      payload,
      deliveryId: headers.data["x-github-delivery"]
    }
  });

  // Queue the event for async processing — fire-and-forget so Redis failures
  // don't prevent the 200 response that GitHub expects.
  try {
    await getProcessGithubEventQueue().add("process", {
      orgId: org.id,
      webhookEventId: event.id
    });
    console.log("[DevPulse] Queued event for processing:", event.id);
  } catch (err) {
    console.error("[DevPulse] Failed to enqueue event (Redis issue):", err);
    // The event is already persisted in the DB — the worker can pick it up later
    // or we can implement a recovery sweep.
  }

  return NextResponse.json({ ok: true });
}
