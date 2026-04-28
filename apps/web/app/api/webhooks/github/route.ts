import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@devpulse/db";
import { processGithubEventQueue } from "@devpulse/lib/src/queue";
import { githubWebhookHeadersSchema, verifyGithubHmac } from "@devpulse/lib/src/validation";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = githubWebhookHeadersSchema.safeParse({
    "x-github-event": request.headers.get("x-github-event"),
    "x-github-delivery": request.headers.get("x-github-delivery") ?? undefined,
    "x-hub-signature-256": request.headers.get("x-hub-signature-256")
  });
  if (!headers.success) {
    return NextResponse.json({ error: "Invalid headers" }, { status: 400 });
  }

  const valid = verifyGithubHmac(
    rawBody,
    headers.data["x-hub-signature-256"],
    process.env.GITHUB_WEBHOOK_SECRET!
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, any>;
  const orgSlug = payload.organization?.login ?? payload.repository?.owner?.login ?? "default";
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

  await processGithubEventQueue.add("process", {
    orgId: org.id,
    webhookEventId: event.id
  });

  return NextResponse.json({ ok: true });
}
